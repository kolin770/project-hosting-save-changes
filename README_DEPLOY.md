Lev‑Tech Contact API - Deployment

This document explains how to deploy the contact API (Turnstile verification + Zoho SMTP) for lev-tech.

Files included:
- server.js           - Express contact API (already in repo)
- package.json        - Node dependencies and scripts
- .env.example        - Example environment variables (do NOT commit secrets)
- deploy/levtech-contact.service - systemd unit example for Ubuntu

Quickdeploy (Ubuntu VPS)
1. Copy files to server (/var/www/levtech/contact)
2. Create .env from .env.example and fill values (TURNSTILE_SECRET, ZOHO_USER, ZOHO_PASS)
3. Install dependencies:
   - npm install
4. Start locally for testing:
   - NODE_ENV=production npm run start
   - Check http://localhost:3000/healthz

Systemd (recommended for production)
1. Copy deploy/levtech-contact.service to /etc/systemd/system/levtech-contact.service
2. Update WorkingDirectory and EnvironmentFile paths inside the unit file
3. sudo systemctl daemon-reload
4. sudo systemctl enable levtech-contact
5. sudo systemctl start levtech-contact
6. Check logs: sudo journalctl -u levtech-contact -f

Reverse proxy & SSL (nginx)
- Configure nginx to proxy https://api.lev-tech.net -> http://127.0.0.1:3000
- Use certbot/Let's Encrypt for TLS certificates

Zoho SMTP notes
- If your Zoho account has 2FA, generate an App Password for SMTP and use it as ZOHO_PASS.
- Configure SPF/DKIM for lev-tech.net to improve email deliverability (see Zoho docs).

Security
- Keep .env out of git. Use server environment variables or secrets storage.
- Rate limiting is enabled in server.js (10 req/min per IP). Tune according to traffic.
- Monitor logs and set alerts for failed Turnstile verifications or SMTP errors.

CI/CD
- You can add a GitHub Actions workflow to build and deploy to your server or create a Docker image.

If you want, I can also prepare a Dockerfile + docker-compose manifest for easy deployment.
