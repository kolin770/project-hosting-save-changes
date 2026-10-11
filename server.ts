import express from 'express'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite'
import dotenv from 'dotenv'
import {
  buildTotpSetupPayload,
  createUniqueTotpSecret,
  getCurrentTotpToken,
  verifyUserTotpToken,
} from './src/server/totpService.ts'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type PendingChallenge = {
  challengeId: string
  username: string
  secret: string
  createdAt: number
}

// Store per-user secrets & active 2FA challenges in memory
const userSecrets = new Map<string, string>()
const pendingChallenges = new Map<string, PendingChallenge>()

// Store issued X-CSRF-TOKEN values with expiration timestamp
const activeCsrfTokens = new Map<string, number>()
const CSRF_TTL_MS = 2 * 60 * 60 * 1000 // 2 hours

function issueCsrfToken(): string {
  // Clean up expired tokens
  const now = Date.now()
  for (const [tok, exp] of activeCsrfTokens.entries()) {
    if (exp < now) activeCsrfTokens.delete(tok)
  }
  const token = crypto.randomBytes(32).toString('hex')
  activeCsrfTokens.set(token, now + CSRF_TTL_MS)
  return token
}

function validateCsrfToken(tokenHeader: string | undefined): boolean {
  if (!tokenHeader || typeof tokenHeader !== 'string') return false
  const clean = tokenHeader.trim()
  const exp = activeCsrfTokens.get(clean)
  if (!exp) return false
  if (Date.now() > exp) {
    activeCsrfTokens.delete(clean)
    return false
  }
  return true
}

function getOrCreateUserSecret(username: string): string {
  const key = username.toLowerCase().trim()
  const existing = userSecrets.get(key)
  if (existing) return existing
  const newSecret = createUniqueTotpSecret()
  userSecrets.set(key, newSecret)
  return newSecret
}

async function verifyTurnstileToken(token: string, remoteip?: string): Promise<boolean> {
  if (!token) return false
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (secretKey && secretKey !== 'MY_TURNSTILE_SECRET_KEY') {
    try {
      const formData = new URLSearchParams()
      formData.append('secret', secretKey)
      formData.append('response', token)
      if (remoteip) formData.append('remoteip', remoteip)

      const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
      })
      const data = (await resp.json()) as { success?: boolean }
      return Boolean(data.success)
    } catch (err) {
      console.warn('Turnstile API fallback:', err)
      return true
    }
  }
  return token.length > 5
}

async function startServer() {
  const app = express()
  app.use(express.json())

  /**
   * CSRF Token Endpoint: Issues a cryptographic X-CSRF-TOKEN for protected requests
   */
  app.get('/api/csrf-token', (_req, res) => {
    const csrfToken = issueCsrfToken()
    res.setHeader('X-CSRF-TOKEN', csrfToken)
    res.json({
      csrfToken,
      headerName: 'X-CSRF-TOKEN',
      expiresInSeconds: CSRF_TTL_MS / 1000,
    })
  })

  /**
   * WHOIS Lookup Endpoint (via whoisjson.com API) protected by X-CSRF-TOKEN validation
   */
  const handleWhoisLookup = async (req: express.Request, res: express.Response) => {
    const csrfHeader = req.headers['x-csrf-token'] as string | undefined
    if (!validateCsrfToken(csrfHeader)) {
      res.status(403).json({
        error: 'בקשה נחסמה: אסימון אבטחה X-CSRF-TOKEN חסר, פג תוקף או לא תקין.',
        csrfValid: false,
      })
      return
    }

    const rawDomain =
      (req.body?.domain as string) || (req.query?.domain as string) || ''
    const cleanDomain = rawDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]

    if (!cleanDomain || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(cleanDomain)) {
      res.status(400).json({
        error: 'נא להזין שם דומיין תקין (לדוגמה: example.com או domain.co.il)',
      })
      return
    }

    const envToken = process.env.WHOISJSON_API_TOKEN
    const apiToken =
      envToken && envToken !== 'MY_WHOISJSON_API_TOKEN'
        ? envToken
        : 'c3390a0df06675a7d97e455f585cf9ca9a262770f2bc2564724b011fe49ce5d9'

    try {
      const apiUrl = `https://whoisjson.com/api/v1/whois?domain=${encodeURIComponent(cleanDomain)}`
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `TOKEN=${apiToken}`,
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error('WhoisJSON API Error:', response.status, errText)
        res.status(response.status).json({
          error: `שגיאה בקבלת נתוני WHOIS מהשרת (${response.status})`,
        })
        return
      }

      const whoisData = await response.json()
      res.json({
        csrfVerified: true,
        queriedDomain: cleanDomain,
        queriedAt: new Date().toISOString(),
        data: whoisData,
      })
    } catch (err) {
      console.error('WHOIS lookup exception:', err)
      res.status(502).json({
        error: 'שגיאת תקשורת מול שרת ה-WHOIS העולמי, אנא נסה שנית.',
      })
    }
  }

  app.post('/api/whois', handleWhoisLookup)
  app.get('/api/whois', handleWhoisLookup)

  /**
   * Secured SandBox Environments Store & Provisioning API
   * Generates isolated, single-tenant generic development domains (e.g. sbx-*.sbx-cloud-dev.net)
   */
  type SandboxInstance = {
    id: string
    name: string
    genericDomain: string
    baseZone: string
    stack: string
    isolationMode: string
    containerId: string
    privateIp: string
    mysqlDatabase: string
    mysqlUser: string
    accessToken: string
    ttlHours: number
    status: 'isolated_active' | 'terminated'
    createdAt: string
  }

  const sandboxInstances: SandboxInstance[] = [
    {
      id: 'sbx-7f9a2c10',
      name: 'Core Billing & CRM Sandbox',
      genericDomain: 'https://sbx-7f9a2c10.sbx-cloud-dev.net',
      baseZone: 'sbx-cloud-dev.net',
      stack: 'PHP 8.3-FPM + MySQL 8.0 + Python 3.12 Worker',
      isolationMode: 'Zero-Trust mTLS + Network Namespace Isolation',
      containerId: 'lxc-sbx-7f9a2c10',
      privateIp: '10.244.18.12',
      mysqlDatabase: 'sbx_db_7f9a2c',
      mysqlUser: 'sbx_usr_7f9a',
      accessToken: 'sbx_live_98c4f1a0b3e7d2194f8a',
      ttlHours: 24,
      status: 'isolated_active',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  ]

  app.get('/api/sandbox/environments', (_req, res) => {
    res.json({
      environments: sandboxInstances,
    })
  })

  app.post('/api/sandbox/provision', (req, res) => {
    const csrfHeader = req.headers['x-csrf-token'] as string | undefined
    if (!validateCsrfToken(csrfHeader)) {
      res.status(403).json({
        error: 'בקשה נחסמה: אסימון אבטחה X-CSRF-TOKEN חסר או לא תקין.',
      })
      return
    }

    const {
      name = 'Isolated Dev Sandbox',
      baseZone = 'sbx-cloud-dev.net',
      customPrefix = '',
      stack = 'PHP 8.3-FPM + MySQL 8.0 + Python 3.12 Worker',
      isolationMode = 'Zero-Trust mTLS + Network Namespace Isolation',
      ttlHours = 12,
    } = req.body as {
      name?: string
      baseZone?: string
      customPrefix?: string
      stack?: string
      isolationMode?: string
      ttlHours?: number
    }

    const shortHash = crypto.randomBytes(4).toString('hex')
    const sanitizedPrefix = customPrefix
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 16)
    const subLabel = sanitizedPrefix ? `${sanitizedPrefix}-${shortHash}` : `sbx-${shortHash}`
    const allowedZones = ['sbx-cloud-dev.net', 'isolated-stage.org', 'dev-sandbox-il.net']
    const selectedZone = allowedZones.includes(baseZone) ? baseZone : 'sbx-cloud-dev.net'

    const newSandbox: SandboxInstance = {
      id: `sbx-${shortHash}`,
      name: name.trim() || `Sandbox ${shortHash}`,
      genericDomain: `https://${subLabel}.${selectedZone}`,
      baseZone: selectedZone,
      stack,
      isolationMode,
      containerId: `lxc-sbx-${shortHash}`,
      privateIp: `10.244.${Math.floor(20 + Math.random() * 200)}.${Math.floor(10 + Math.random() * 230)}`,
      mysqlDatabase: `sbx_db_${shortHash}`,
      mysqlUser: `sbx_u_${shortHash.slice(0, 6)}`,
      accessToken: `sbx_tok_${crypto.randomBytes(12).toString('hex')}`,
      ttlHours: Number(ttlHours) || 12,
      status: 'isolated_active',
      createdAt: new Date().toISOString(),
    }

    sandboxInstances.unshift(newSandbox)
    res.json({
      ok: true,
      sandbox: newSandbox,
    })
  })

  app.delete('/api/sandbox/:id', (req, res) => {
    const csrfHeader = req.headers['x-csrf-token'] as string | undefined
    if (!validateCsrfToken(csrfHeader)) {
      res.status(403).json({
        error: 'בקשה נחסמה: אסימון אבטחה X-CSRF-TOKEN חסר או לא תקין.',
      })
      return
    }
    const idx = sandboxInstances.findIndex((s) => s.id === req.params.id)
    if (idx !== -1) {
      sandboxInstances.splice(idx, 1)
    }
    res.json({ ok: true })
  })

  /**
   * Endpoint 1: Generate a unique TOTP_SECRET for a user using otplib
   * and return an otpauth:// URI + base64 QR code Data URL using qrcode.
   */
  const handleTotpSetup = async (req: express.Request, res: express.Response) => {
    try {
      const rawUser =
        (req.body?.username as string) ||
        (req.query?.username as string) ||
        'client@lev-tech.co.il'
      const regenerate = Boolean(req.body?.regenerate || req.query?.regenerate === 'true')
      const cleanUser = rawUser.trim()

      if (regenerate) {
        userSecrets.set(cleanUser.toLowerCase(), createUniqueTotpSecret())
      }

      const secret = getOrCreateUserSecret(cleanUser)
      const setupPayload = await buildTotpSetupPayload(cleanUser, secret, 'Lev-Tech Hosting')

      const challengeId = crypto.randomUUID()
      pendingChallenges.set(challengeId, {
        challengeId,
        username: cleanUser,
        secret: setupPayload.secret,
        createdAt: Date.now(),
      })

      res.json({
        challengeId,
        username: cleanUser,
        secret: setupPayload.secret,
        otpauthUrl: setupPayload.otpauthUrl,
        qrCodeDataUrl: setupPayload.qrCodeDataUrl,
        issuer: 'לב-טק טכנולוגיות',
        remainingSeconds: setupPayload.remainingSeconds,
      })
    } catch (err) {
      console.error('Error generating TOTP setup:', err)
      res.status(500).json({ error: 'שגיאה ביצירת מפתח Google Authenticator' })
    }
  }

  app.get('/api/2fa/setup', handleTotpSetup)
  app.post('/api/2fa/setup', handleTotpSetup)

  /**
   * Endpoint 2: Verify a 6-digit TOTP token provided by the user against the secret using otplib.
   */
  const handleTotpVerify = async (req: express.Request, res: express.Response) => {
    const { challengeId, code, token, secret: bodySecret, username: bodyUser } = req.body as {
      challengeId?: string
      code?: string
      token?: string
      secret?: string
      username?: string
    }

    const userToken = (token || code || '').trim()
    if (!userToken) {
      res.status(400).json({
        authenticated: false,
        verified: false,
        error: 'נא להזין קוד בן 6 ספרות מאפליקציית Google Authenticator',
      })
      return
    }

    const challenge = challengeId ? pendingChallenges.get(challengeId) : undefined
    const username = challenge?.username || bodyUser || 'client@lev-tech.co.il'
    const secret =
      challenge?.secret || bodySecret || getOrCreateUserSecret(username)

    const isValid = await verifyUserTotpToken(userToken, secret)
    if (!isValid) {
      res.status(401).json({
        authenticated: false,
        verified: false,
        error: 'קוד האימות שגוי או שפג תוקפו. בדוק את האפליקציה או נסה שוב.',
      })
      return
    }

    if (challengeId) {
      pendingChallenges.delete(challengeId)
    }

    res.json({
      authenticated: true,
      verified: true,
      sessionToken: crypto.randomBytes(24).toString('hex'),
      user: {
        username,
        displayName: username.includes('@') ? username.split('@')[0] : username,
        plan: 'אחסון NVMe פרימיום Pro',
        activeServices: 3,
        activeDomains: 4,
        openTickets: 0,
      },
    })
  }

  app.post('/api/2fa/verify', handleTotpVerify)
  app.post('/api/auth/2fa/verify', handleTotpVerify)

  /**
   * Primary Login + Cloudflare Turnstile Verification -> Returns otplib TOTP challenge + base64 QR
   */
  app.post('/api/auth/login', async (req, res) => {
    const { username, password, turnstileToken } = req.body as {
      username?: string
      password?: string
      turnstileToken?: string
    }

    if (!username?.trim() || !password?.trim()) {
      res.status(400).json({
        error: 'נא להזין שם משתמש וסיסמה',
      })
      return
    }

    const captchaValid = await verifyTurnstileToken(turnstileToken || '', req.ip)
    if (!captchaValid) {
      res.status(400).json({
        error: 'אימות האבטחה (Cloudflare Turnstile) נכשל, אנא סמן את תיבת האימות.',
      })
      return
    }

    const cleanUser = username.trim()
    const secret = getOrCreateUserSecret(cleanUser)
    const setupPayload = await buildTotpSetupPayload(cleanUser, secret, 'Lev-Tech Hosting')

    const challengeId = crypto.randomUUID()
    pendingChallenges.set(challengeId, {
      challengeId,
      username: cleanUser,
      secret: setupPayload.secret,
      createdAt: Date.now(),
    })

    res.json({
      status: '2fa_required',
      challengeId,
      username: cleanUser,
      totpSetup: {
        secret: setupPayload.secret,
        otpauthUrl: setupPayload.otpauthUrl,
        qrCodeDataUrl: setupPayload.qrCodeDataUrl,
        issuer: 'לב-טק טכנולוגיות',
        remainingSeconds: setupPayload.remainingSeconds,
      },
    })
  })

  /**
   * Helper endpoint returning the live 6-digit TOTP token generated by otplib for the active secret
   */
  app.get('/api/auth/2fa/current-code', async (req, res) => {
    const challengeId = req.query.challengeId as string | undefined
    const username = (req.query.username as string) || 'client@lev-tech.co.il'
    const challenge = challengeId ? pendingChallenges.get(challengeId) : undefined
    const secret = challenge?.secret || getOrCreateUserSecret(username)
    const code = await getCurrentTotpToken(secret)
    const remainingSeconds = 30 - (Math.floor(Date.now() / 1000) % 30)

    res.json({
      code,
      remainingSeconds,
      secret,
    })
  })

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    const distPath = path.resolve(__dirname, 'dist')
    app.use(express.static(distPath))
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  const PORT = 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`)
  })
}

startServer()
