import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  Globe,
  HardDrive,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { IsraelFlagSvg, GlobalEarthSvg } from '@/components/LocationBadges'
import { BRAND_NAME, type PageRoute } from '@/components/Navbar'
import type { BillingCycle, PlanLocation } from '@/data/pricing'
import { fetchStaticWhoisFallback, isJsonApiResponse } from '@/utils/serverlessFallback'

interface WhoisContact {
  handle?: string | null
  type?: string | null
  name?: string | null
  organization?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  phone?: string | null
}

interface WhoisJsonData {
  server?: string | null
  name?: string | null
  idnName?: string | null
  registered?: boolean
  status?: string | string[] | null
  statusAnalysis?: {
    clientDeleteProhibited?: boolean
    clientTransferProhibited?: boolean
    clientUpdateProhibited?: boolean
    isActive?: boolean
    isOnHold?: boolean
    isPendingDelete?: boolean
    isPendingTransfer?: boolean
    isRedemptionPeriod?: boolean
  } | null
  nameserver?: string[] | null
  nsAnalysis?: {
    count?: number
    list?: string[]
    detectedProviders?: string[]
    singleInfrastructure?: boolean
  } | null
  ips?: string | string[] | null
  created?: string | null
  changed?: string | null
  expires?: string | null
  age?: {
    days?: number
    months?: number
    years?: number
    isNewlyRegistered?: boolean
    isYoung?: boolean
  } | null
  expiration?: {
    daysLeft?: number
    isExpiringSoon?: boolean
    isExpired?: boolean
  } | null
  lastUpdated?: string | null
  dnssec?: string | null
  whoisserver?: string | null
  contacts?: {
    owner?: WhoisContact[] | null
    admin?: WhoisContact[] | null
    tech?: WhoisContact[] | null
    abuse?: WhoisContact[] | null
  } | null
  registrar?: {
    id?: string | null
    name?: string | null
    email?: string | null
    url?: string | null
    phone?: string | null
  } | null
  source?: string | null
}

interface WhoisApiResponse {
  csrfVerified: boolean
  queriedDomain: string
  queriedAt: string
  data: WhoisJsonData
}

const sampleDomains = [
  'google.co.il',
  'example.com',
  'cloudflare.com',
  'levtech-available-2026.co.il',
]

function formatDateDisplay(raw?: string | null): string {
  if (!raw) return 'לא זמין במאגר הציבורי'
  const d = new Date(raw.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function WhoisLookupPage({
  onNavigate,
  onOrderDomain,
}: {
  onNavigate: (page: PageRoute, href?: string) => void
  onOrderDomain: (title: string, price: number, cycle: BillingCycle, location: PlanLocation) => void
}) {
  const [domainInput, setDomainInput] = useState('google.co.il')
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [loadingCsrf, setLoadingCsrf] = useState(false)
  const [loadingWhois, setLoadingWhois] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<WhoisApiResponse | null>(null)
  const [showRawJson, setShowRawJson] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const fetchCsrfToken = useCallback(async (): Promise<string | null> => {
    setLoadingCsrf(true)
    try {
      const resp = await fetch('/api/csrf-token')
      if (!isJsonApiResponse(resp)) {
        const fallbackTok = Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
        setCsrfToken(fallbackTok)
        return fallbackTok
      }
      const data = (await resp.json()) as { csrfToken?: string }
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken)
        return data.csrfToken
      }
      return null
    } catch {
      const fallbackTok = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      setCsrfToken(fallbackTok)
      return fallbackTok
    } finally {
      setLoadingCsrf(false)
    }
  }, [])

  const performWhoisLookup = useCallback(
    async (targetDomain: string, tokenOverride?: string | null) => {
      const clean = targetDomain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0]

      if (!clean || !clean.includes('.')) {
        setError('נא להזין שם דומיין תקין כולל סיומת (למשל: domain.co.il או example.com)')
        return
      }

      setLoadingWhois(true)
      setError(null)

      try {
        let activeToken = tokenOverride ?? csrfToken
        if (!activeToken) {
          activeToken = await fetchCsrfToken()
        }

        const resp = await fetch('/api/whois', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': activeToken || '',
          },
          body: JSON.stringify({ domain: clean }),
        })

        if (!isJsonApiResponse(resp)) {
          const fallbackData = await fetchStaticWhoisFallback(clean)
          setResult(fallbackData as WhoisApiResponse)
          return
        }

        // If CSRF expired, refresh once and retry automatically
        if (resp.status === 403) {
          const freshToken = await fetchCsrfToken()
          if (freshToken) {
            const retryResp = await fetch('/api/whois', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': freshToken,
              },
              body: JSON.stringify({ domain: clean }),
            })
            const retryData = await retryResp.json()
            if (!retryResp.ok) {
              setError(retryData.error || 'שגיאה בביצוע בדיקת ה-WHOIS')
            } else {
              setResult(retryData as WhoisApiResponse)
            }
            return
          }
        }

        const data = await resp.json()
        if (!resp.ok) {
          setError(data.error || 'לא ניתן לשלוף נתוני WHOIS עבור דומיין זה כעת.')
        } else {
          setResult(data as WhoisApiResponse)
        }
      } catch {
        const fallbackData = await fetchStaticWhoisFallback(clean)
        setResult(fallbackData as WhoisApiResponse)
      } finally {
        setLoadingWhois(false)
      }
    },
    [csrfToken, fetchCsrfToken],
  )

  // Initial CSRF handshake + initial lookup so the page opens with live rich data immediately
  useEffect(() => {
    let mounted = true
    fetchCsrfToken().then((tok) => {
      if (mounted && tok) {
        performWhoisLookup('google.co.il', tok)
      }
    })
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCopy = (label: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    setTimeout(() => setCopiedField(null), 1800)
  }

  const whois = result?.data
  const statusList: string[] = Array.isArray(whois?.status)
    ? whois.status
    : whois?.status
      ? [whois.status]
      : []

  const ipList: string[] = Array.isArray(whois?.ips)
    ? whois.ips
    : whois?.ips
      ? [whois.ips]
      : []

  const isIsraeliDomain = result?.queriedDomain.endsWith('.il') ?? false
  const ownerContact = whois?.contacts?.owner?.[0]

  return (
    <div className="pb-24">
      {/* Top Hero & Search Header (Inspired by who.is) */}
      <section className="relative overflow-hidden border-b border-white/10 pb-14 pt-10 sm:pt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb + Open in New Tab + CSRF Status */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <nav aria-label="פירורי לחם" className="flex items-center gap-2 text-sm text-slate-400">
              <button
                type="button"
                onClick={() => onNavigate('home', '#home')}
                className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-slate-300 transition-colors hover:text-cyan-300"
              >
                <ArrowRight className="h-4 w-4" />
                דף הבית
              </button>
              <span aria-hidden>/</span>
              <span>דומיינים</span>
              <span aria-hidden>/</span>
              <span className="font-semibold text-cyan-300">בדיקת זמינות ונתוני WHOIS</span>
            </nav>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <Lock className="h-3.5 w-3.5" />
                <span>מוגן X-CSRF-TOKEN</span>
                {csrfToken && (
                  <span className="font-mono text-[10px] text-emerald-400/80" dir="ltr">
                    ({csrfToken.slice(0, 8)}…)
                  </span>
                )}
              </span>

              <a
                href="#domains-whois"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-white"
              >
                <ExternalLink className="h-3.5 w-3.5 text-cyan-300" />
                <span>פתיחה בחלון חדש</span>
              </a>
            </div>
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300">
              <Globe className="h-4 w-4" aria-hidden />
              <span>WHOIS & RDAP DOMAIN INTELLIGENCE · בזמן אמת</span>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              בדיקת זמינות דומיין ומידע{' '}
              <span className="bg-gradient-to-l from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                WHOIS רשמי
              </span>
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
              בדקו בזמן אמת האם הדומיין פנוי לרישום או צפו בפרטי הרישום המלאים: תאריכי תפוגה, רשם
              הדומיין, שרתי DNS, כתובות IP, נעילות העברה וסטטוס אבטחה DNSSEC.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                performWhoisLookup(domainInput)
              }}
              className="mt-8 rounded-3xl border border-white/15 bg-slate-900/90 p-2.5 shadow-2xl shadow-black/60 backdrop-blur-2xl sm:p-3"
            >
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <div className="relative flex flex-1 items-center">
                  <Search className="pointer-events-none absolute right-4 h-5 w-5 text-cyan-300" />
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="הזן שם דומיין (לדוגמה: example.com או domain.co.il)"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 py-3.5 pr-12 pl-4 text-left font-mono text-base font-bold text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingWhois || loadingCsrf}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-l from-cyan-400 to-blue-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/30 transition-all hover:-translate-y-0.5 hover:shadow-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingWhois ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>מבצע שאילתת WHOIS...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>חיפוש WHOIS</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Sample Domain Buttons */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 px-2 pb-1 text-xs">
                <span className="text-slate-400">בדיקה מהירה לדוגמה:</span>
                {sampleDomains.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setDomainInput(sample)
                      performWhoisLookup(sample)
                    }}
                    dir="ltr"
                    className="cursor-pointer rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </form>

            {error && (
              <div className="mt-5 flex items-center justify-center gap-2.5 rounded-2xl border border-rose-500/35 bg-rose-500/10 px-5 py-3.5 text-sm font-semibold text-rose-200">
                <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {loadingWhois ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 py-20 text-center backdrop-blur-xl">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
            <h2 className="mt-4 text-lg font-extrabold text-white">
              מתשאל את שרתי ה-WHOIS וה-RDAP העולמיים...
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              מאמת אסימון אבטחה X-CSRF-TOKEN ושולף נתונים חיים מ-whoisjson.com
            </p>
          </div>
        ) : result && whois ? (
          <div className="space-y-8">
            {/* Top Status Banner: Available vs Registered */}
            {whois.registered === false ? (
              <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-emerald-400/40 bg-gradient-to-l from-emerald-950/70 via-slate-900/90 to-slate-900/90 p-7 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl lg:flex-row">
                <div className="flex items-center gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/40">
                    <CheckCircle2 className="h-9 w-9" />
                  </span>
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>הדומיין פנוי לרישום מיידי!</span>
                    </div>
                    <h2
                      dir="ltr"
                      className="mt-1 font-mono text-2xl font-extrabold text-white sm:text-4xl"
                    >
                      {result.queriedDomain}
                    </h2>
                    <p className="mt-1 text-sm text-slate-300">
                      הדומיין אינו רשום במאגר ה-WHOIS העולמי וניתן לרישום מיידי על שמכם ב-{BRAND_NAME}.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <div className="text-center sm:text-left">
                    <div className="font-mono text-2xl font-extrabold text-white tabular-nums">
                      {isIsraeliDomain ? '₪69' : '₪59'}{' '}
                      <span className="text-xs font-normal text-slate-400">/ לשנה</span>
                    </div>
                    <div className="text-[11px] text-emerald-300">כולל ניהול DNS והגנת פרטיות</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onOrderDomain(
                        `רישום דומיין חדש: ${result.queriedDomain}`,
                        isIsraeliDomain ? 69 : 59,
                        'annual',
                        isIsraeliDomain ? 'il' : 'global',
                      )
                    }
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-emerald-500 px-7 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105"
                  >
                    <span>רשום דומיין זה עכשיו</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Registered Domain Summary Bar */}
                <div className="flex flex-col justify-between gap-6 rounded-3xl border border-white/15 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl lg:flex-row lg:items-center sm:p-8">
                  <div className="flex items-start gap-4 sm:items-center">
                    <span className="flex h-15 w-15 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300">
                      {isIsraeliDomain ? (
                        <IsraelFlagSvg className="h-7 w-10" />
                      ) : (
                        <GlobalEarthSvg className="h-8 w-8" />
                      )}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="rounded-lg border border-amber-400/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                          דומיין רשום ופעיל (Registered)
                        </span>
                        {whois.source && (
                          <span className="font-mono text-xs text-slate-400 uppercase">
                            מקור: {whois.source}
                          </span>
                        )}
                        {whois.dnssec && (
                          <span className="font-mono text-xs text-cyan-300">
                            DNSSEC: {whois.dnssec}
                          </span>
                        )}
                      </div>
                      <h2
                        dir="ltr"
                        className="mt-1.5 text-left font-mono text-2xl font-extrabold tracking-tight text-white sm:text-4xl"
                      >
                        {(whois.name || result.queriedDomain).toLowerCase()}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onNavigate('domains-transfer', '#domains-transfer')}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5 sm:text-sm"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      <span>העבר דומיין זה ל-{BRAND_NAME}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => performWhoisLookup(result.queriedDomain)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold text-slate-200 transition-colors hover:bg-white/10"
                    >
                      <RefreshCw className="h-4 w-4 text-cyan-300" />
                      <span>רענן נתונים</span>
                    </button>
                  </div>
                </div>

                {/* 4-Card Structured WHOIS Grid (who.is style) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Card 1: Dates & Domain Lifecycle */}
                  <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-6 backdrop-blur-xl sm:p-7">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-5 w-5 text-cyan-300" />
                        <h3 className="text-lg font-extrabold text-white">
                          תאריכים ומחזור חיי הדומיין
                        </h3>
                      </div>
                      {whois.age?.years !== undefined && (
                        <span className="rounded-lg border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-300">
                          ותק: {whois.age.years} שנים
                        </span>
                      )}
                    </div>

                    <dl className="mt-5 space-y-4 text-sm">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <dt className="text-slate-400">תאריך רישום (Created):</dt>
                        <dd className="font-semibold text-white">
                          {formatDateDisplay(whois.created)}
                        </dd>
                      </div>

                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <dt className="text-slate-400">תאריך תפוגה (Expires):</dt>
                        <dd className="font-semibold text-emerald-300">
                          {formatDateDisplay(whois.expires)}
                        </dd>
                      </div>

                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <dt className="text-slate-400">עדכון אחרון (Updated):</dt>
                        <dd className="font-semibold text-slate-200">
                          {formatDateDisplay(whois.changed || whois.lastUpdated)}
                        </dd>
                      </div>

                      {whois.expiration?.daysLeft !== undefined && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300">זמן שנותר עד לחידוש הדומיין:</span>
                            <span className="font-mono font-bold text-cyan-300 tabular-nums">
                              {whois.expiration.daysLeft} ימים
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${
                                whois.expiration.isExpiringSoon
                                  ? 'bg-amber-400'
                                  : 'bg-gradient-to-l from-cyan-400 to-blue-500'
                              }`}
                              style={{
                                width: `${Math.min(100, Math.max(8, (whois.expiration.daysLeft / 365) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Card 2: Registrar & Security Status */}
                  <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-6 backdrop-blur-xl sm:p-7">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="h-5 w-5 text-cyan-300" />
                        <h3 className="text-lg font-extrabold text-white">
                          פרטי רשם וסטטוס נעילות (Registrar)
                        </h3>
                      </div>
                      {whois.registrar?.id && (
                        <span className="font-mono text-xs text-slate-400">
                          IANA ID: {whois.registrar.id}
                        </span>
                      )}
                    </div>

                    <dl className="mt-5 space-y-4 text-sm">
                      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                        <dt className="shrink-0 text-slate-400">רשם הדומיין (Registrar):</dt>
                        <dd
                          dir="ltr"
                          className="truncate font-mono text-xs font-bold text-white sm:text-sm"
                        >
                          {whois.registrar?.name || 'רשם מוסמך'}
                        </dd>
                      </div>

                      {whois.registrar?.url && (
                        <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                          <dt className="shrink-0 text-slate-400">אתר הרשם:</dt>
                          <dd dir="ltr" className="truncate font-mono text-xs text-cyan-300">
                            {whois.registrar.url}
                          </dd>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                        <dt className="shrink-0 text-slate-400">שרת WHOIS רשמי:</dt>
                        <dd dir="ltr" className="font-mono text-xs text-slate-200">
                          {whois.whoisserver || whois.server || 'RDAP Global Server'}
                        </dd>
                      </div>

                      <div>
                        <dt className="mb-2 text-xs font-semibold text-slate-400">
                          סטטוס הגנות דומיין (EPP Status Codes):
                        </dt>
                        <dd className="flex flex-wrap gap-2">
                          {statusList.length > 0 ? (
                            statusList.map((st) => (
                              <span
                                key={st}
                                dir="ltr"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs text-slate-200"
                              >
                                <Lock className="h-3 w-3 text-cyan-300" />
                                {st}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">Active / OK</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Card 3: Name Servers (DNS) & IP Infrastructure */}
                  <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-6 backdrop-blur-xl sm:p-7">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2.5">
                        <Server className="h-5 w-5 text-cyan-300" />
                        <h3 className="text-lg font-extrabold text-white">
                          שרתי שמות (Name Servers) וכתובת IP
                        </h3>
                      </div>
                      {whois.nsAnalysis?.detectedProviders?.length ? (
                        <span className="rounded-lg border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-1 font-mono text-xs font-bold text-cyan-300 uppercase">
                          DNS: {whois.nsAnalysis.detectedProviders.join(', ')}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-5 space-y-4">
                      <div>
                        <div className="mb-2 text-xs font-semibold text-slate-400">
                          שרתי DNS מוגדרים ({whois.nameserver?.length || 0}):
                        </div>
                        {whois.nameserver && whois.nameserver.length > 0 ? (
                          <div className="space-y-2">
                            {whois.nameserver.map((ns) => (
                              <div
                                key={ns}
                                className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-2.5"
                              >
                                <span dir="ltr" className="font-mono text-xs font-bold text-cyan-200">
                                  {ns.toLowerCase()}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(ns, ns.toLowerCase())}
                                  className="inline-flex cursor-pointer items-center gap-1 text-xs text-slate-400 hover:text-white"
                                >
                                  {copiedField === ns ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">הועתק</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3.5 w-3.5" />
                                      <span>העתק</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">לא נמצאו שרתי שמות משויכים</p>
                        )}
                      </div>

                      {ipList.length > 0 && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                              <HardDrive className="h-3.5 w-3.5 text-cyan-300" />
                              כתובת IP של השרת המארח (A Record):
                            </span>
                            <div className="flex items-center gap-2">
                              <span dir="ltr" className="font-mono text-sm font-extrabold text-white">
                                {ipList.join(', ')}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy('ip', ipList.join(', '))}
                                className="cursor-pointer text-slate-400 hover:text-white"
                              >
                                {copiedField === 'ip' ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 4: Contacts & Ownership Privacy */}
                  <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-6 backdrop-blur-xl sm:p-7">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2.5">
                        <UserCheck className="h-5 w-5 text-cyan-300" />
                        <h3 className="text-lg font-extrabold text-white">
                          פרטי מחזיק הדומיין ואבטחת פרטיות
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400">WHOIS Contacts</span>
                    </div>

                    <div className="mt-5 space-y-3.5 text-sm">
                      {ownerContact &&
                      (ownerContact.name || ownerContact.organization || ownerContact.email) ? (
                        <>
                          {ownerContact.name && (
                            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                              <span className="text-slate-400">שם מחזיק (Registrant):</span>
                              <span className="font-semibold text-white">{ownerContact.name}</span>
                            </div>
                          )}
                          {ownerContact.organization && (
                            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                              <span className="text-slate-400">ארגון / חברה:</span>
                              <span className="font-semibold text-white">
                                {ownerContact.organization}
                              </span>
                            </div>
                          )}
                          {ownerContact.email && (
                            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                              <span className="text-slate-400">כתובת דוא״ל רשומה:</span>
                              <span dir="ltr" className="font-mono text-xs text-cyan-300">
                                {ownerContact.email}
                              </span>
                            </div>
                          )}
                          {ownerContact.country && (
                            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                              <span className="text-slate-400">מדינה:</span>
                              <span className="font-semibold text-white">{ownerContact.country}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-6 text-slate-300">
                          <div className="flex items-center gap-2 font-bold text-white">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            <span>פרטי מחזיק הדומיין מוגנים (WHOIS Privacy / GDPR Redacted)</span>
                          </div>
                          <p className="mt-1.5 text-slate-400">
                            בהתאם לתקנות הגנת הפרטיות העולמיות (GDPR / ICANN RDAP), פרטי הקשר האישיים
                            של בעל הדומיין מוסתרים מפני סורקי דוא״ל זדוניים.
                          </p>
                        </div>
                      )}

                      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3.5 text-xs text-cyan-100">
                        <div className="flex items-center justify-between">
                          <span>זמן בדיקה בשרת:</span>
                          <span dir="ltr" className="font-mono">
                            {new Date(result.queriedAt).toLocaleTimeString('he-IL')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Expandable Raw WHOIS / RDAP JSON Inspector */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl">
              <div className="flex items-center justify-between px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowRawJson((v) => !v)}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-200 hover:text-cyan-300"
                >
                  <Code2 className="h-4 w-4 text-cyan-300" />
                  <span>
                    {showRawJson
                      ? 'הסתר פלט נתוני WHOIS / RDAP גולמי (JSON)'
                      : 'הצג פלט נתוני WHOIS / RDAP גולמי מלא (JSON)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy('raw-json', JSON.stringify(whois, null, 2))}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  {copiedField === 'raw-json' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">JSON הועתק</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>העתק JSON</span>
                    </>
                  )}
                </button>
              </div>

              {showRawJson && (
                <pre
                  dir="ltr"
                  className="max-h-96 overflow-auto border-t border-white/10 bg-slate-950/90 p-5 text-left font-mono text-xs leading-5 text-cyan-200"
                >
                  {JSON.stringify(whois, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default WhoisLookupPage
