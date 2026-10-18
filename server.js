import express from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const upload = multer(); // for multipart/form-data

// support JSON bodies
app.use(express.json());

// Rate limiting - basic protection
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/contact', limiter);

// Nodemailer transport using Zoho SMTP
const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_HOST || 'smtp.zoho.com',
  port: Number(process.env.ZOHO_PORT || 465),
  secure: true,
  auth: {
    user: process.env.ZOHO_USER,
    pass: process.env.ZOHO_PASS,
  },
});

// helper: extract fields from either JSON or form-data
async function extractFields(req) {
  if (req.is('multipart/form-data')) {
    // multer already parsed it in route
    return req.body;
  }
  // JSON or urlencoded
  return req.body;
}

// Contact endpoint - accepts application/json or multipart/form-data
app.post('/api/contact', upload.none(), async (req, res) => {
  try {
    const data = await extractFields(req);

    const honeypot = (data.website || '').toString();
    if (honeypot && honeypot.trim().length > 0) {
      return res.status(400).json({ error: 'Bot detected' });
    }

    const name = (data.name || '').toString().trim().slice(0, 200);
    const email = (data.email || '').toString().trim().slice(0, 254);
    const subject = (data.subject || '').toString().trim().slice(0, 250);
    const message = (data.message || '').toString().trim().slice(0, 5000);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Turnstile token may be in cf-turnstile-response (widget) or token
    const token = (data['cf-turnstile-response'] || data.token || '').toString();
    if (!token) return res.status(400).json({ error: 'Missing Turnstile token' });

    // Verify Turnstile with Cloudflare
    const verifyResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(process.env.TURNSTILE_SECRET || '')}&response=${encodeURIComponent(token)}`,
    });
    const verifyJson = await verifyResp.json();
    if (!verifyJson.success) {
      return res.status(403).json({ error: 'Turnstile verification failed', details: verifyJson['error-codes'] || [] });
    }

    // Compose email
    const mailOptions = {
      from: process.env.MAIL_FROM || 'no-reply@lev-tech.net',
      to: process.env.MAIL_TO || 'info@lev-tech.net',
      subject: `[צור קשר] ${subject}`,
      text:
        `שם: ${name}\n` +
        `מייל: ${email}\n` +
        `נשלח מכתובת IP: ${req.ip}\n\n` +
        `--- הודעה ---\n${message}\n",
    };

    // send email
    await transporter.sendMail(mailOptions);

    return res.json({ message: 'הפנייה נשלחה בהצלחה' });
  } catch (err) {
    console.error('Contact API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/healthz', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Contact server listening on ${PORT}`));
