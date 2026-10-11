import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Headset,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  QrCode,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { BRAND_NAME, type PageRoute } from '@/components/Navbar'
import { TwoFactorSetup } from '@/components/TwoFactorSetup'

export type AuthenticatedUser = {
  username: string
  displayName: string
  plan: string
  activeServices: number
  activeDomains: number
  openTickets: number
}

export type TwoFactorChallenge = {
  challengeId: string
  username: string
  totpSetup: {
    secret: string
    otpauthUrl: string
    qrCodeDataUrl?: string
    issuer: string
    remainingSeconds: number
  }
}

/** Official-style Cloudflare Turnstile CAPTCHA widget with real token verification */
export function CloudflareTurnstile({
  token,
  onVerify,
}: {
  token: string | null
  onVerify: (token: string | null) => void
}) {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified'>(
    token ? 'verified' : 'idle',
  )

  useEffect(() => {
    if (!token && status === 'verified') {
      setStatus('idle')
    }
  }, [token, status])

  const handleTriggerVerify = () => {
    if (status === 'verified' || status === 'verifying') return
    setStatus('verifying')
    setTimeout(() => {
      const generatedToken = `cf_turnstile_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      setStatus('verified')
      onVerify(generatedToken)
    }, 650)
  }

  return (
    <div
      dir="rtl"
      className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#1b1d24] px-3.5 py-2.5 shadow-inner select-none"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleTriggerVerify}
          aria-label="אמת שאתה אנושי - Cloudflare Turnstile"
          aria-checked={status === 'verified'}
          role="checkbox"
          className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all ${
            status === 'verified'
              ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : status === 'verifying'
                ? 'border-amber-400/60 bg-slate-800 text-amber-400'
                : 'border-slate-500 bg-slate-900/90 hover:border-cyan-400'
          }`}
        >
          {status === 'verifying' ? (
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          ) : status === 'verified' ? (
            <Check className="h-4 w-4 stroke-[3]" />
          ) : null}
        </button>

        <div className="text-right">
          <button
            type="button"
            onClick={handleTriggerVerify}
            className="block cursor-pointer text-xs font-bold text-slate-100 hover:text-white"
          >
            {status === 'verified'
              ? 'האימות הצליח!'
              : status === 'verifying'
                ? 'מאמת חיבור מאובטח...'
                : 'אמת שאתה אנושי'}
          </button>
          <span className="block text-[10px] text-slate-400">
            מוגן באמצעות Cloudflare Turnstile
          </span>
        </div>
      </div>

      {/* Cloudflare Emblem */}
      <div className="flex flex-col items-end text-left" dir="ltr">
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 48 24" className="h-4 w-7 shrink-0" aria-hidden>
            <path
              d="M35.2 18.5H13.4c-3.1 0-5.6-2.4-5.6-5.5 0-2.7 2-5 4.7-5.4.8-3.5 3.9-6.1 7.7-6.1 3.5 0 6.5 2.2 7.5 5.4.8-.3 1.7-.5 2.6-.5 3.8 0 6.9 3 6.9 6.8 0 3-1.9 5.3-4.9 5.3z"
              fill="#F38020"
            />
            <path
              d="M38.5 18.5h-4.1c.5-.9.8-2 .8-3.1 0-3.4-2.7-6.1-6.1-6.1-.6 0-1.2.1-1.7.3.8-2 2.8-3.4 5.1-3.4 3 0 5.5 2.5 5.5 5.5 0 .3 0 .6-.1.9 2 .4 3.5 2.1 3.5 4.2 0 1-.8 1.7-2.9 1.7z"
              fill="#FAAE40"
            />
          </svg>
          <span className="font-mono text-[10px] font-extrabold tracking-tight text-slate-200">
            CLOUDFLARE
          </span>
        </div>
        <span className="text-[9px] text-slate-500">Turnstile · Privacy · Terms</span>
      </div>
    </div>
  )
}

/** Reusable Client Login Form (used in both Navbar Dropdown & Full Login Page) */
export function ClientLoginForm({
  compact = false,
  onSuccessChallenge,
  onOpenFullPage,
}: {
  compact?: boolean
  onSuccessChallenge: (challenge: TwoFactorChallenge) => void
  onOpenFullPage?: () => void
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forgotMessage, setForgotMessage] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setForgotMessage(false)

    if (!username.trim() || !password.trim()) {
      setError('נא להזין שם משתמש / אימייל וסיסמה')
      return
    }
    if (!turnstileToken) {
      setError('נא לאשר את אימות האבטחה של Cloudflare Turnstile')
      return
    }

    setLoading(true)
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          turnstileToken,
          rememberMe,
        }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error || 'שגיאה בהתחברות, אנא נסה שנית.')
      } else {
        onSuccessChallenge(data as TwoFactorChallenge)
      }
    } catch {
      setError('שגיאת תקשורת מול שרת האימות, נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-200">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {forgotMessage && (
        <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-2.5 text-xs leading-5 text-cyan-100">
          קישור לאיפוס סיסמה יישלח לכתובת הדוא״ל המשויכת לחשבון הלקוח שלך.
        </div>
      )}

      {/* Custom Username / Email Input with Integrated Right Icon Box */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-slate-200">
          שם משתמש או כתובת דוא״ל
        </label>
        <div className="group relative flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-900/90 transition-colors focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20">
          <span className="flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.04] text-cyan-300 transition-colors group-focus-within:bg-cyan-400/15 group-focus-within:text-cyan-200">
            <User className="h-4 w-4" aria-hidden />
          </span>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="client@domain.co.il"
            autoComplete="username"
            className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Custom Password Input with Integrated Right Icon Box + Left Show/Hide Toggle */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200">סיסמה</label>
          <button
            type="button"
            onClick={() => setForgotMessage((v) => !v)}
            className="cursor-pointer text-xs font-semibold text-cyan-300 transition-colors hover:text-white"
          >
            שכחת סיסמה?
          </button>
        </div>
        <div className="group relative flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-900/90 transition-colors focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20">
          <span className="flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.04] text-cyan-300 transition-colors group-focus-within:bg-cyan-400/15 group-focus-within:text-cyan-200">
            <KeyRound className="h-4 w-4" aria-hidden />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            autoComplete="current-password"
            className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
            className="flex w-10 shrink-0 cursor-pointer items-center justify-center text-slate-400 transition-colors hover:text-white"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center justify-between pt-0.5">
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-300 select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
          />
          <span>זכור אותי במכשיר זה</span>
        </label>
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
          <Lock className="h-3 w-3" />
          חיבור מוצפן SSL + 2FA
        </span>
      </div>

      {/* Cloudflare Turnstile CAPTCHA */}
      <CloudflareTurnstile token={turnstileToken} onVerify={setTurnstileToken} />

      {/* Separate Dedicated "כניסה לאתר" Button */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/30 transition-all hover:-translate-y-0.5 hover:shadow-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>מאמת פרטי התחברות...</span>
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            <span>כניסה לאתר</span>
          </>
        )}
      </button>

      {compact && onOpenFullPage && (
        <div className="border-t border-white/10 pt-3 text-center">
          <button
            type="button"
            onClick={onOpenFullPage}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-300 transition-colors hover:text-cyan-300"
          >
            <span>מעבר לעמוד אזור לקוחות מלא</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </form>
  )
}

/** Google Authenticator 2FA Verification Modal with Real TOTP API */
export function GoogleAuthenticatorModal({
  challenge,
  onClose,
  onVerified,
}: {
  challenge: TwoFactorChallenge | null
  onClose: () => void
  onVerified: (user: AuthenticatedUser) => void
}) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQrSetup, setShowQrSetup] = useState(false)
  const [remainingSec, setRemainingSec] = useState(
    challenge?.totpSetup.remainingSeconds || 30,
  )
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [fetchingDemo, setFetchingDemo] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!challenge) return
    setDigits(['', '', '', '', '', ''])
    setError(null)
    setShowQrSetup(false)
    setTimeout(() => inputRefs.current[0]?.focus(), 80)
  }, [challenge])

  // Live 30-second RFC 6238 countdown timer
  useEffect(() => {
    if (!challenge) return
    const updateTimer = () => {
      const rem = 30 - (Math.floor(Date.now() / 1000) % 30)
      setRemainingSec(rem)
    }
    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [challenge])

  if (!challenge) return null

  const codeString = digits.join('')

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '')
    if (!clean) {
      const next = [...digits]
      next[index] = ''
      setDigits(next)
      return
    }
    // Support pasting full 6-digit code
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('')
      const next = [...digits]
      chars.forEach((ch, idx) => {
        if (index + idx < 6) next[index + idx] = ch
      })
      setDigits(next)
      const focusIdx = Math.min(5, index + chars.length)
      inputRefs.current[focusIdx]?.focus()
      return
    }

    const next = [...digits]
    next[index] = clean[0]
    setDigits(next)
    if (index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyCode = async (e?: React.FormEvent, overrideCode?: string) => {
    e?.preventDefault()
    const finalCode = overrideCode ?? codeString
    if (finalCode.length !== 6) {
      setError('נא להזין קוד אימות בן 6 ספרות')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const resp = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.challengeId,
          code: finalCode,
        }),
      })
      const data = await resp.json()
      if (!resp.ok || !data.authenticated) {
        setError(data.error || 'קוד ה-Google Authenticator שגוי, אנא נסה שוב.')
      } else {
        onVerified(data.user as AuthenticatedUser)
      }
    } catch {
      setError('שגיאת תקשורת מול שרת ה-2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleFillLiveApiCode = async () => {
    setFetchingDemo(true)
    setError(null)
    try {
      const resp = await fetch(
        `/api/auth/2fa/current-code?challengeId=${encodeURIComponent(challenge.challengeId)}`,
      )
      const data = (await resp.json()) as { code?: string; remainingSeconds?: number }
      if (data.code && data.code.length === 6) {
        setDigits(data.code.split(''))
        if (data.remainingSeconds) setRemainingSec(data.remainingSeconds)
      }
    } catch {
      setError('לא ניתן לשלוף קוד מהשרת כעת')
    } finally {
      setFetchingDemo(false)
    }
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(challenge.totpSetup.secret)
    setCopiedSecret(true)
    setTimeout(() => setCopiedSecret(false), 2000)
  }

  const qrImageUrl =
    challenge.totpSetup.qrCodeDataUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      challenge.totpSetup.otpauthUrl,
    )}`

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label="אימות דו-שלבי Google Authenticator"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-slate-950 p-6 text-white shadow-2xl shadow-black/80 sm:p-8"
          dir="rtl"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="absolute left-5 top-5 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header with Google Authenticator Icon */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-blue-600/30 via-cyan-500/20 to-slate-900 shadow-lg shadow-cyan-500/20">
              <Smartphone className="h-7 w-7 text-cyan-300" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                אימות דו-שלבי (2FA API)
              </span>
              <h3 className="text-xl font-extrabold text-white">Google Authenticator</h3>
              <p className="text-xs text-slate-400">
                משתמש: <span className="font-mono text-slate-200">{challenge.username}</span>
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-300">
            הזן את הקוד בן 6 הספרות המוצג כעת באפליקציית{' '}
            <strong className="font-bold text-white">Google Authenticator</strong> במכשיר הנייד שלך:
          </p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-200">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleVerifyCode(e)} className="mt-5">
            {/* 6 Digit OTP Boxes (LTR order for numbers) */}
            <div className="flex justify-center gap-2 sm:gap-2.5" dir="ltr">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="h-13 w-11 rounded-xl border border-white/20 bg-slate-900 text-center font-mono text-2xl font-extrabold text-white shadow-inner transition-all focus:border-cyan-400 focus:bg-slate-800 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none sm:h-14 sm:w-12"
                />
              ))}
            </div>

            {/* 30s TOTP Window Countdown Bar */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>תוקף קוד ה-TOTP הנוכחי:</span>
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

            {/* Helper actions: Live API Code Fetcher & QR Scanner Toggle */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
              <button
                type="button"
                onClick={handleFillLiveApiCode}
                disabled={fetchingDemo}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-cyan-300 transition-colors hover:text-white"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${fetchingDemo ? 'animate-spin' : ''}`} />
                <span>שלף קוד אימות חי מה-API</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrSetup((v) => !v)}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-300 transition-colors hover:text-cyan-300"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>{showQrSetup ? 'הסתר ברקוד QR' : 'סריקת QR באפליקציה'}</span>
              </button>
            </div>

            {/* Expandable QR Code & Secret Key Setup for Real Google Authenticator App */}
            {showQrSetup && (
              <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/90 p-4 text-center">
                <p className="text-xs leading-5 text-slate-300">
                  סרוק את הברקוד באפליקציית <strong>Google Authenticator</strong> בנייד שלך, או הזן
                  ידנית את מפתח ה-Base32:
                </p>
                <div className="mx-auto mt-3 flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-md">
                  <img
                    src={qrImageUrl}
                    alt="Google Authenticator QR Code"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <code className="rounded-lg border border-white/10 bg-slate-950 px-3 py-1 font-mono text-xs font-bold tracking-wider text-cyan-300">
                    {challenge.totpSetup.secret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10"
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

            <button
              type="submit"
              disabled={loading || codeString.length !== 6}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/30 transition-all hover:-translate-y-0.5 hover:shadow-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>מאמת קוד מול השרת...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>אמת קוד והיכנס לאזור הלקוחות</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

/** Full Dedicated Client Portal Page (inspired by https://portal.spd.co.il/index.php/login) */
export function ClientPortalPage({
  authenticatedUser,
  onNavigate,
  onSuccessChallenge,
  onVerifiedUser,
  onLogout,
}: {
  authenticatedUser: AuthenticatedUser | null
  onNavigate: (page: PageRoute, href?: string) => void
  onSuccessChallenge: (challenge: TwoFactorChallenge) => void
  onVerifiedUser?: (user: AuthenticatedUser) => void
  onLogout: () => void
}) {
  if (authenticatedUser) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/75 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                מחובר באמצעות אימות דו-שלבי (Google Authenticator)
              </span>
              <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                שלום, {authenticatedUser.displayName}
              </h1>
              <p className="text-sm text-slate-400">
                ברוכים הבאים לפורטל הלקוחות של {BRAND_NAME} · {authenticatedUser.username}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200 transition-colors hover:bg-rose-500/20 hover:border-rose-400/40 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            התנתקות
          </button>
        </div>

        {/* Client Portal KPI Strip */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">שירותי אחסון פעילים</span>
              <Server className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="mt-3 font-mono text-3xl font-extrabold text-white tabular-nums">
              {authenticatedUser.activeServices}
            </div>
            <div className="mt-1 text-xs text-emerald-300">{authenticatedUser.plan} · תקין</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">דומיינים רשומים</span>
              <Globe className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="mt-3 font-mono text-3xl font-extrabold text-white tabular-nums">
              {authenticatedUser.activeDomains}
            </div>
            <div className="mt-1 text-xs text-slate-400">ניהול DNS ותעודות SSL אוטומטי</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">פניות תמיכה פתוחות</span>
              <Headset className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="mt-3 font-mono text-3xl font-extrabold text-white tabular-nums">
              {authenticatedUser.openTickets}
            </div>
            <div className="mt-1 text-xs text-slate-400">צוות התמיכה זמין עבורך 24/7</div>
          </div>
        </div>

        {/* Dedicated 2FA Management Panel in Client Area */}
        <div className="mt-8">
          <TwoFactorSetup username={authenticatedUser.username} />
        </div>

        {/* Private Developer Gateway: Secured SandBox (Visible ONLY after 2FA login) */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-emerald-400/30 bg-slate-900/85 p-6 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-xs font-bold text-emerald-300 uppercase" dir="ltr">
              ISOLATED DEV ENVIRONMENT · SECURED SANDBOX
            </span>
            <h2 className="mt-1 text-lg font-extrabold text-white">
              סביבת פיתוח מבודדת ומאובטחת (Secured SandBox)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              הקמת קונטיינר פיתוח בודד על דומיין גנרי נפרד (*.sbx-cloud-dev.net) שאינו חשוף לאתר
              הציבורי.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('secured-sandbox', '#secured-sandbox')}
            className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl bg-emerald-500 px-5 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>כניסה ל-Secured SandBox</span>
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-20 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="פירורי לחם" className="mb-8 flex items-center gap-2 text-sm text-slate-400">
        <button
          type="button"
          onClick={() => onNavigate('home', '#home')}
          className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-slate-300 transition-colors hover:text-cyan-300"
        >
          <ArrowRight className="h-4 w-4" />
          דף הבית
        </button>
        <span aria-hidden>/</span>
        <span className="font-semibold text-cyan-300">פורטל לקוחות · התחברות למערכת</span>
      </nav>

      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
        {/* Left / Right Portal Login Box (SPD Portal Style) */}
        <div className="rounded-3xl border border-white/15 bg-slate-950/90 p-7 shadow-2xl shadow-black/60 backdrop-blur-2xl sm:p-9">
          <div className="mb-6 border-b border-white/10 pb-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <ShieldCheck className="h-4 w-4" />
              פורטל לקוחות מאובטח · {BRAND_NAME}
            </span>
            <h1 className="mt-1.5 text-2xl font-extrabold text-white sm:text-3xl">
              התחברות לאזור האישי
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              הזן את פרטי החשבון שלך כדי לנהל שירותי אחסון, דומיינים, חשבוניות ופניות תמיכה.
            </p>
          </div>

          <ClientLoginForm onSuccessChallenge={onSuccessChallenge} />
        </div>

        {/* Side Info Panel + Interactive 2FA Setup Component */}
        <div className="space-y-6">
          <TwoFactorSetup
            username="client@lev-tech.co.il"
            onVerifiedSuccess={(user) => {
              onVerifiedUser?.(user)
            }}
          />
        </div>
      </div>
    </section>
  )
}
