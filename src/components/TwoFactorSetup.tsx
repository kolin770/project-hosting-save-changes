import { useCallback, useEffect, useState } from 'react'
import {
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  QrCode,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import type { AuthenticatedUser, TwoFactorChallenge } from '@/components/ClientAuth'
import {
  computeBrowserTotpCode,
  createBrowserTotpSetup,
  generateBrowserTotpSecret,
  isJsonApiResponse,
  verifyBrowserTotpCode,
} from '@/utils/serverlessFallback'

interface SetupResponse {
  challengeId: string
  username: string
  secret: string
  otpauthUrl: string
  qrCodeDataUrl: string
  issuer: string
  remainingSeconds: number
}

export interface TwoFactorSetupProps {
  username?: string
  initialChallenge?: TwoFactorChallenge | null
  onVerifiedSuccess?: (user: AuthenticatedUser) => void
}

/**
 * React functional component (.tsx) for setting up & verifying Google Authenticator 2FA.
 * - Fetches the base64 QR code Data URL (`qrCodeDataUrl`) and `TOTP_SECRET` from `/api/2fa/setup`
 * - Displays the QR image and Base32 secret key to the user
 * - Provides an input field for the 6-digit verification code
 * - Sends the 6-digit token to `/api/2fa/verify` and renders clean Tailwind CSS success/error states
 */
export function TwoFactorSetup({
  username = 'client@lev-tech.co.il',
  initialChallenge = null,
  onVerifiedSuccess,
}: TwoFactorSetupProps) {
  const [setupData, setSetupData] = useState<SetupResponse | null>(() =>
    initialChallenge
      ? {
          challengeId: initialChallenge.challengeId,
          username: initialChallenge.username,
          secret: initialChallenge.totpSetup.secret,
          otpauthUrl: initialChallenge.totpSetup.otpauthUrl,
          qrCodeDataUrl: initialChallenge.totpSetup.qrCodeDataUrl || '',
          issuer: initialChallenge.totpSetup.issuer,
          remainingSeconds: initialChallenge.totpSetup.remainingSeconds,
        }
      : null,
  )
  const [loadingSetup, setLoadingSetup] = useState<boolean>(!initialChallenge?.totpSetup.qrCodeDataUrl)
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [verifying, setVerifying] = useState<boolean>(false)
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false)
  const [remainingSec, setRemainingSec] = useState<number>(30)
  const [fetchingLiveCode, setFetchingLiveCode] = useState<boolean>(false)

  const fetchQrSetup = useCallback(
    async (regenerate = false) => {
      setLoadingSetup(true)
      setError(null)
      setVerifiedSuccess(false)
      try {
        const resp = await fetch('/api/2fa/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: initialChallenge?.username || username,
            regenerate,
          }),
        })
        if (!isJsonApiResponse(resp)) {
          const targetUser = initialChallenge?.username || username
          const nextSecret = regenerate ? generateBrowserTotpSecret(16) : undefined
          const localSetup = await createBrowserTotpSetup(targetUser, nextSecret)
          setSetupData({
            challengeId: `local_${Date.now()}`,
            username: targetUser,
            ...localSetup,
          })
          return
        }
        const data = (await resp.json()) as SetupResponse & { error?: string }
        if (!resp.ok) {
          setError(data.error || 'שגיאה בטעינת קוד ה-QR מהשרת')
        } else {
          setSetupData(data)
        }
      } catch {
        const targetUser = initialChallenge?.username || username
        const localSetup = await createBrowserTotpSetup(targetUser)
        setSetupData({
          challengeId: `local_${Date.now()}`,
          username: targetUser,
          ...localSetup,
        })
      } finally {
        setLoadingSetup(false)
      }
    },
    [initialChallenge?.username, username],
  )

  useEffect(() => {
    if (!setupData || !setupData.qrCodeDataUrl) {
      fetchQrSetup(false)
    }
  }, [fetchQrSetup, setupData])

  // Live 30s TOTP period countdown
  useEffect(() => {
    const updateClock = () => {
      setRemainingSec(30 - (Math.floor(Date.now() / 1000) % 30))
    }
    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = verificationCode.replace(/\D/g, '')
    if (cleanCode.length !== 6) {
      setError('נא להזין קוד אימות תקין בן 6 ספרות')
      return
    }

    setVerifying(true)
    setError(null)
    try {
      const resp = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: setupData?.challengeId,
          secret: setupData?.secret,
          username: setupData?.username || username,
          token: cleanCode,
        }),
      })
      if (!isJsonApiResponse(resp) && setupData?.secret) {
        const valid = await verifyBrowserTotpCode(cleanCode, setupData.secret)
        if (!valid) {
          setError('קוד האימות שגוי או שפג תוקפו. אנא נסה שנית.')
          setVerifiedSuccess(false)
        } else {
          setVerifiedSuccess(true)
          setError(null)
          onVerifiedSuccess?.({
            username: setupData.username || username,
            displayName: (setupData.username || username).split('@')[0],
            plan: 'אחסון NVMe פרימיום Pro',
            activeServices: 3,
            activeDomains: 4,
            openTickets: 0,
          })
        }
        return
      }
      const data = await resp.json()
      if (!resp.ok || !data.verified) {
        setError(data.error || 'קוד האימות שגוי או שפג תוקפו. אנא נסה שנית.')
        setVerifiedSuccess(false)
      } else {
        setVerifiedSuccess(true)
        setError(null)
        if (onVerifiedSuccess && data.user) {
          setTimeout(() => {
            onVerifiedSuccess(data.user as AuthenticatedUser)
          }, 600)
        }
      }
    } catch {
      setError('שגיאת תקשורת מול שרת האימות הדו-שלבי')
    } finally {
      setVerifying(false)
    }
  }

  const handleCopySecret = () => {
    if (!setupData?.secret) return
    navigator.clipboard.writeText(setupData.secret)
    setCopiedSecret(true)
    setTimeout(() => setCopiedSecret(false), 2000)
  }

  const handleFetchLiveToken = async () => {
    if (!setupData) return
    setFetchingLiveCode(true)
    setError(null)
    try {
      const resp = await fetch(
        `/api/auth/2fa/current-code?challengeId=${encodeURIComponent(setupData.challengeId)}&username=${encodeURIComponent(setupData.username)}`,
      )
      if (!isJsonApiResponse(resp)) {
        const code = await computeBrowserTotpCode(setupData.secret)
        setVerificationCode(code)
        return
      }
      const data = (await resp.json()) as { code?: string }
      if (data.code) {
        setVerificationCode(data.code)
      }
    } catch {
      const code = await computeBrowserTotpCode(setupData.secret)
      setVerificationCode(code)
    } finally {
      setFetchingLiveCode(false)
    }
  }

  return (
    <div
      dir="rtl"
      className="rounded-3xl border border-white/15 bg-slate-950/90 p-6 text-white shadow-2xl backdrop-blur-xl sm:p-7"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300 shadow-lg shadow-cyan-500/15">
            <Smartphone className="h-6 w-6" />
          </span>
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              אימות דו-שלבי (TOTP · otplib + qrcode)
            </span>
            <h3 className="text-lg font-extrabold text-white sm:text-xl">
              הגדרה ואימות Google Authenticator
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchQrSetup(true)}
          disabled={loadingSetup}
          title="יצירת מפתח סודי חדש"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingSetup ? 'animate-spin' : ''}`} />
          <span>מפתח חדש</span>
        </button>
      </div>

      {/* Step 1: Scan Base64 QR Code */}
      <div className="mt-5 grid grid-cols-1 items-center gap-6 md:grid-cols-[auto_1fr]">
        <div className="mx-auto flex flex-col items-center">
          <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-2xl border-2 border-cyan-400/30 bg-white p-2.5 shadow-xl shadow-cyan-500/10">
            {loadingSetup ? (
              <div className="flex flex-col items-center gap-2 text-slate-600">
                <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
                <span className="text-xs font-semibold">מייצר QR...</span>
              </div>
            ) : setupData?.qrCodeDataUrl ? (
              <img
                src={setupData.qrCodeDataUrl}
                alt="Google Authenticator TOTP QR Code"
                className="h-full w-full object-contain"
              />
            ) : (
              <QrCode className="h-12 w-12 text-slate-400" />
            )}
          </div>
          <span className="mt-2 text-[11px] text-slate-400">
            סרוק באפליקציית Google Authenticator
          </span>
        </div>

        <div className="space-y-3.5">
          <div>
            <h4 className="text-sm font-bold text-white">
              1. סרוק את ברקוד ה-QR או הזן מפתח סודי
            </h4>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              פתח את אפליקציית <strong className="text-white">Google Authenticator</strong> בנייד,
              לחץ על <strong className="text-cyan-300">+</strong> ובחר בסריקת ברקוד QR.
            </p>
          </div>

          {setupData?.secret && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <KeyRound className="h-3 w-3 text-cyan-300" />
                  מפתח TOTP_SECRET ייחודי (Base32):
                </span>
                <span>חשבון: {setupData.username}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <code
                  dir="ltr"
                  className="truncate rounded-lg bg-slate-950 px-3 py-1.5 font-mono text-xs font-bold tracking-wider text-cyan-300 select-all"
                >
                  {setupData.secret}
                </code>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10"
                >
                  {copiedSecret ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>הועתק</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>העתק</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 30s TOTP Countdown Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>זמן התחלפות הקוד הבא:</span>
              <span className="font-mono font-bold text-cyan-300 tabular-nums">
                {remainingSec} שניות
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-l from-cyan-400 to-blue-500 transition-all duration-700"
                style={{ width: `${(remainingSec / 30) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Enter 6-Digit Verification Code */}
      <form onSubmit={handleVerifySubmit} className="mt-6 border-t border-white/10 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="totp-code-input" className="text-sm font-bold text-white">
            2. הזן את קוד האימות בן 6 הספרות מהאפליקציה:
          </label>
          <button
            type="button"
            onClick={handleFetchLiveToken}
            disabled={fetchingLiveCode || !setupData}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-cyan-300 transition-colors hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${fetchingLiveCode ? 'animate-spin' : ''}`} />
            <span>מילוי קוד חי מהשרת (לבדיקה)</span>
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="totp-code-input"
            type="text"
            inputMode="numeric"
            dir="ltr"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="flex-1 rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-center font-mono text-2xl font-extrabold tracking-[0.45em] text-white placeholder-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none tabular-nums"
          />

          <button
            type="submit"
            disabled={verifying || verificationCode.replace(/\D/g, '').length !== 6}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/30 transition-all hover:-translate-y-0.5 hover:shadow-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>מאמת קוד...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>אמת והפעל 2FA</span>
              </>
            )}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-200">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success State */}
        {verifiedSuccess && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/35 bg-emerald-500/15 px-4 py-3 text-xs font-bold text-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <span>
              האימות הדו-שלבי (Google Authenticator) אומת והופעל בהצלחה! מעביר לאזור הלקוחות...
            </span>
          </div>
        )}
      </form>
    </div>
  )
}

export default TwoFactorSetup
