import { generate, generateSecret, generateURI, verify } from 'otplib'
import QRCode from 'qrcode'

export interface TotpSetupPayload {
  secret: string
  otpauthUrl: string
  qrCodeDataUrl: string
  issuer: string
  accountLabel: string
  remainingSeconds: number
}

const DEFAULT_ISSUER = 'Lev-Tech Hosting'

/**
 * 1. Generates a unique Base32-encoded TOTP secret using otplib (compatible with Google Authenticator).
 */
export function createUniqueTotpSecret(): string {
  return generateSecret()
}

/**
 * 2. Generates an otpauth:// URI using otplib and renders it as a base64 QR code Data URL using qrcode.
 */
export async function buildTotpSetupPayload(
  accountLabel: string,
  existingSecret?: string,
  issuer: string = DEFAULT_ISSUER,
): Promise<TotpSetupPayload> {
  const secret = existingSecret || createUniqueTotpSecret()
  const otpauthUrl = generateURI({
    strategy: 'totp',
    issuer,
    label: accountLabel,
    secret,
    algorithm: 'sha1',
    digits: 6,
    period: 30,
  })

  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
    width: 240,
    margin: 2,
    color: {
      dark: '#071530',
      light: '#FFFFFF',
    },
  })

  const remainingSeconds = 30 - (Math.floor(Date.now() / 1000) % 30)

  return {
    secret,
    otpauthUrl,
    qrCodeDataUrl,
    issuer,
    accountLabel,
    remainingSeconds,
  }
}

/**
 * 3. Validates a 6-digit token entered by the user against the TOTP secret using otplib.
 */
export async function verifyUserTotpToken(
  token: string,
  secret: string,
): Promise<boolean> {
  const cleanToken = token.replace(/\s+/g, '')
  if (!/^\d{6}$/.test(cleanToken)) {
    return false
  }

  try {
    const result = await verify({
      strategy: 'totp',
      secret,
      token: cleanToken,
      epochTolerance: 30, // Allow ±1 step (30s) clock drift
    })
    return Boolean(result && result.valid)
  } catch {
    return false
  }
}

/**
 * Helper to generate the current live 6-digit TOTP token for testing/demo verification.
 */
export async function getCurrentTotpToken(secret: string): Promise<string> {
  return generate({
    strategy: 'totp',
    secret,
  })
}
