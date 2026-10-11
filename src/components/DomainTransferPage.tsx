import { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  FileCheck2,
  Globe,
  Headset,
  KeyRound,
  LockOpen,
  MailCheck,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { IsraelFlagSvg, GlobalEarthSvg } from '@/components/LocationBadges'
import { BRAND_NAME, type PageRoute } from '@/components/Navbar'
import type { BillingCycle, PlanLocation } from '@/data/pricing'

type TransferTab = 'il' | 'global'

const tldPricing = [
  { tld: '.co.il', type: 'il' as const, transferPrice: 'חינם (₪0)', renewalNote: 'ללא שינוי בתוקף הקיים · חידוש שנתי ₪69' },
  { tld: '.org.il', type: 'il' as const, transferPrice: 'חינם (₪0)', renewalNote: 'ללא שינוי בתוקף הקיים · חידוש שנתי ₪69' },
  { tld: '.com', type: 'global' as const, transferPrice: '₪59', renewalNote: 'כולל הארכת תוקף הדומיין ב-+1 שנה מלאה' },
  { tld: '.net', type: 'global' as const, transferPrice: '₪65', renewalNote: 'כולל הארכת תוקף הדומיין ב-+1 שנה מלאה' },
  { tld: '.org', type: 'global' as const, transferPrice: '₪65', renewalNote: 'כולל הארכת תוקף הדומיין ב-+1 שנה מלאה' },
  { tld: '.io', type: 'global' as const, transferPrice: '₪199', renewalNote: 'כולל הארכת תוקף הדומיין ב-+1 שנה מלאה' },
]

const transferSteps = [
  {
    num: '01.',
    icon: LockOpen,
    title: 'שחרור נעילת דומיין (Unlock)',
    description:
      'היכנסו לממשק הרשם הנוכחי שלכם וודאו שהדומיין אינו נעול להעברה (שחרור סטטוס Registrar Lock / clientTransferProhibited).',
  },
  {
    num: '02.',
    icon: KeyRound,
    title: 'קבלת קוד העברה (EPP / Auth Code)',
    description:
      'בקשו או הפיקו מהרשם הנוכחי את קוד האימות הסודי (EPP Code). בדומיינים ישראליים (.co.il) הקוד תקף ל-5 ימים מרגע הנפקתו.',
  },
  {
    num: '03.',
    icon: ArrowLeftRight,
    title: 'הזנת הדומיין וקוד ה-EPP אצלנו',
    description:
      'הזינו את שם הדומיין וקוד ה-EPP בטופס ההעברה שבראש עמוד זה. המערכת תאמת את תקינות הקוד ותגיש את הבקשה לאיגוד האינטרנט / ICANN.',
  },
  {
    num: '04.',
    icon: MailCheck,
    title: 'אישור הודעת האימות בדוא״ל',
    description:
      'הודעת אישור אוטומטית תישלח לכתובת הדוא״ל של מחזיק הדומיין (Registrant). לחיצה על קישור האישור מזרזת את השלמת ההעברה.',
  },
  {
    num: '05.',
    icon: ShieldCheck,
    title: 'השלמת המעבר באפס זמן השבתה',
    description:
      'הדומיין עובר לניהול מלא בפורטל לב-טק טכנולוגיות תוך שמירה מלאה על רשומות ה-DNS ושרתי השמות (Name Servers) הקיימים – ללא ניתוק באתר או במייל.',
  },
]

const ilRules = [
  'העברת ניהול דומיין ישראלי (.co.il / .org.il) בין רשמים מוסמכים של איגוד האינטרנט הישראלי (ISOC-IL) מתבצעת ללא עלות.',
  'תאריך התפוגה של הדומיין נשמר כפי שהוא ואינו משתנה בעת ההעברה (אלא אם תבחרו לבצע גם חידוש יזום).',
  'קוד האימות (EPP / Auth Code) שמתקבל מהרשם הנוכחי תקף למשך 5 ימים קלנדריים בלבד.',
  'לא ניתן להעביר דומיין ישראלי במהלך 60 הימים הראשונים ממועד רישומו הראשוני או מהעברה קודמת.',
  'תהליך ההעברה אינו משנה את שרתי ה-DNS של הדומיין – האתר והמיילים ממשיכים לעבוד ברציפות של 100%.',
]

const globalRules = [
  'העברת דומיין בינלאומי (.com / .net / .org) כוללת בתוכה חידוש ותוספת של שנה שלמה (+1 שנה) לתאריך התפוגה הנוכחי של הדומיין.',
  'לפי תקנות ICANN, הדומיין חייב להיות בן 60 יום לפחות מיום הרישום או מיום העברת רשם אחרונה.',
  'חובה לוודא שירות הגנת פרטיות (WHOIS Privacy / ID Protection) אינו חוסם קבלת מיילים לכתובת בעל הדומיין (Admin / Registrant Email).',
  'לאחר הגשת הבקשה וקוד ה-EPP, יש לאשר את המייל שנשלח לבעל הדומיין. ההעברה מושלמת בתוך 5 עד 7 ימים קלנדריים (או מיידית באישור הרשם היוצא).',
  'מומלץ לבצע העברת דומיין לפחות 14 יום לפני מועד פקיעת התוקף שלו כדי למנוע עיכובים.',
]

const transferFaqs = [
  {
    q: 'האם האתר או תיבות המייל שלי יפסיקו לעבוד בזמן העברת הדומיין?',
    a: 'לא! העברת ניהול דומיין (Registrar Transfer) מעבירה רק את ניהול הרישום אל לב-טק טכנולוגיות, ומשאירה את שרתי השמות (Name Servers) ורשומות ה-DNS הקיימות שלכם ללא שום שינוי. לכן האתר והמיילים ימשיכו לפעול ברציפות מלאה ובאפס השבתה.',
  },
  {
    q: 'מה ההבדל בין העברת דומיין (Transfer) לבין הפניית DNS?',
    a: 'העברת דומיין (Transfer) מעבירה את החשבון והחידוש השנתי של הדומיין מרשם אחד לרשם אחר (באמצעות קוד EPP), כך שתוכלו לנהל גם את הדומיין וגם את האחסון תחת חשבון אחד ב-לב-טק טכנולוגיות. הפניית DNS משאירה את הדומיין אצל הרשם הקודם ורק מפנה את התעבורה לשרתי האחסון החדשים.',
  },
  {
    q: 'איך משיגים קוד העברה (EPP / Authorization Code)?',
    a: 'קוד ה-EPP מונפק על ידי הרשם הנוכחי שבו מנוהל הדומיין כרגע. במרבית הרשמים (כגון LiveDNS, Box, GoDaddy, Namecheap) ניתן להיכנס לאזור האישי, לבחור בדומיין, לבטל נעילת העברה (Unlock) וללחוץ על "קבלת קוד EPP / Auth Code".',
  },
  {
    q: 'מה עושים אם אין לי גישה למייל שמוגדר כבעל הדומיין (Registrant)?',
    a: 'לפני תחילת תהליך ההעברה, מומלץ להיכנס לפאנל הניהול אצל הרשם הנוכחי ולעדכן את כתובת הדוא״ל של מחזיק הדומיין לכתובת פעילה ונגישה, שכן לשם נשלחת הודעת האימות לאישור ההעברה.',
  },
]

export function DomainTransferPage({
  onNavigate,
  onOrderTransfer,
}: {
  onNavigate: (page: PageRoute, href?: string) => void
  onOrderTransfer: (title: string, price: number, cycle: BillingCycle, location: PlanLocation) => void
}) {
  const [domainInput, setDomainInput] = useState('')
  const [eppCode, setEppCode] = useState('')
  const [activeTab, setActiveTab] = useState<TransferTab>('il')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [checkResult, setCheckResult] = useState<{
    domain: string
    isIl: boolean
    ready: boolean
    priceText: string
    numericPrice: number
  } | null>(null)
  const [checklist, setChecklist] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false,
  })

  const handleCheckDomain = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = domainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '')
    if (!clean || !clean.includes('.')) return

    const isIl = clean.endsWith('.il')
    setCheckResult({
      domain: clean,
      isIl,
      ready: true,
      priceText: isIl ? 'חינם (₪0)' : '₪59 (כולל +1 שנה חידוש)',
      numericPrice: isIl ? 0 : 59,
    })
  }

  const toggleChecklist = (idx: number) => {
    setChecklist((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div className="pb-20">
      {/* Hero Section & Interactive Domain Transfer Form */}
      <section className="relative overflow-hidden border-b border-white/10 pb-16 pt-10 sm:pt-14 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb + Open in New Tab option */}
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
              <span className="font-semibold text-cyan-300">העברת דומיינים ומרכז סיוע (Transfer)</span>
            </nav>

            <a
              href="#domains-transfer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5 text-cyan-300" />
              <span>פתיחת עמוד זה בחלון חדש</span>
            </a>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300">
                <ArrowLeftRight className="h-4 w-4" aria-hidden />
                <span>DOMAIN TRANSFER CENTER · העברת דומיינים חלקה ובטוחה</span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
                העברת דומיינים לניהול{' '}
                <span className="bg-gradient-to-l from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  {BRAND_NAME}
                </span>{' '}
                – בלי זמן השבתה.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                רכזו את כל הדומיינים הישראליים (‎.co.il) והבינלאומיים (‎.com) שלכם תחת פאנל ניהול
                אחד מתקדם. שמירה מלאה על רשומות ה-DNS הקיימות, הגנת פרטיות, חידוש אוטומטי ותמיכה
                אנושית בעברית 24/7.
              </p>

              {/* Interactive Domain Transfer Box */}
              <form
                onSubmit={handleCheckDomain}
                className="mt-8 rounded-3xl border border-white/15 bg-slate-900/85 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-6"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    התחל תהליך העברת דומיין (Transfer Request)
                  </span>
                  <span className="text-xs font-semibold text-emerald-300">
                    העברת ‎.co.il בחינם!
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.3fr_1fr_auto]">
                  <div className="relative flex items-center">
                    <Globe className="pointer-events-none absolute right-3.5 h-4 w-4 text-cyan-300" />
                    <input
                      type="text"
                      required
                      dir="ltr"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="yourdomain.co.il"
                      className="w-full rounded-xl border border-white/15 bg-slate-950 py-3 pr-10 pl-3.5 text-left font-mono text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="relative flex items-center">
                    <KeyRound className="pointer-events-none absolute right-3.5 h-4 w-4 text-cyan-300" />
                    <input
                      type="text"
                      dir="ltr"
                      value={eppCode}
                      onChange={(e) => setEppCode(e.target.value)}
                      placeholder="קוד EPP / Auth Code"
                      className="w-full rounded-xl border border-white/15 bg-slate-950 py-3 pr-10 pl-3.5 text-left font-mono text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5 hover:shadow-cyan-400/40"
                  >
                    <Search className="h-4 w-4" />
                    <span>בדוק והעבר</span>
                  </button>
                </div>

                {checkResult && (
                  <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
                      <div>
                        <div className="text-sm font-bold text-white">
                          הדומיין <span className="font-mono text-cyan-300">{checkResult.domain}</span>{' '}
                          כשיר להעברה!
                        </div>
                        <div className="mt-0.5 text-xs text-slate-300">
                          עלות העברה: <strong className="text-emerald-300">{checkResult.priceText}</strong>{' '}
                          {eppCode ? `· קוד EPP הוזן (${eppCode.slice(0, 4)}***)` : '· ניתן להשלים קוד EPP בשלב הבא'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onOrderTransfer(
                          `העברת דומיין: ${checkResult.domain}`,
                          checkResult.numericPrice,
                          'annual',
                          checkResult.isIl ? 'il' : 'global',
                        )
                      }
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md transition-transform hover:scale-105"
                    >
                      <span>הגש בקשת העברה</span>
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Interactive Pre-Transfer Readiness Checklist Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-bold text-cyan-300">בדיקת מוכנות מהירה</span>
                  <h2 className="mt-0.5 text-lg font-extrabold text-white">
                    רשימת תיוג לפני העברת דומיין
                  </h2>
                </div>
                <FileCheck2 className="h-6 w-6 text-cyan-300" />
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-400">
                סמנו את הסעיפים הבאים כדי לוודא שהדומיין שלכם מוכן למעבר חלק ומהיר ללא עיכובים:
              </p>

              <div className="mt-4 space-y-2.5">
                {[
                  {
                    title: 'שחרור נעילת העברה (Domain Unlock)',
                    sub: 'הדומיין משוחרר מנעילה אצל הרשם הנוכחי (סטטוס Active / OK)',
                  },
                  {
                    title: 'קוד העברה (EPP / Auth Code) בתוקף',
                    sub: 'קיבלתם מהרשם הנוכחי את קוד ה-EPP (תקף ל-5 ימים ב-.co.il)',
                  },
                  {
                    title: 'גישה לתיבת הדוא״ל של מחזיק הדומיין',
                    sub: 'יש לכם גישה למייל המופיע ב-WHOIS לאישור הודעת ההעברה',
                  },
                  {
                    title: 'חלפו מעל 60 יום מהרישום או מהעברה קודמת',
                    sub: 'בהתאם לתקנות איגוד האינטרנט הישראלי ו-ICANN',
                  },
                ].map((item, idx) => {
                  const checked = Boolean(checklist[idx])
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => toggleChecklist(idx)}
                      className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-right transition-all ${
                        checked
                          ? 'border-cyan-400/40 bg-cyan-500/10'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          checked
                            ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                            : 'border-slate-500 bg-slate-900'
                        }`}
                      >
                        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-white">{item.title}</span>
                        <span className="mt-0.5 block text-xs text-slate-400">{item.sub}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-xs text-blue-100">
                <AlertCircle className="h-4 w-4 shrink-0 text-cyan-300" />
                <span>
                  נתקלתם בקושי מול הרשם הנוכחי? נציגי {BRAND_NAME} ישמחו לבצע עבורכם את התהליך!
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Visual Process Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              איך מתבצעת העברת הדומיין? 5 שלבים פשוטים
            </h2>
            <p className="mt-3 text-base text-slate-300">
              תהליך אוטומטי, שקוף ומאובטח השומר על רציפות הפעילות של האתר ותיבות הדוא״ל שלכם.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {transferSteps.map((step) => (
              <div
                key={step.num}
                className="relative flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-cyan-400/30"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-cyan-300 ring-1 ring-cyan-400/30">
                      <step.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="font-mono text-sm font-extrabold text-cyan-400/80">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-300">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LiveDNS-Inspired Detailed Transfer Rules & TLD Table */}
      <section className="border-y border-white/10 bg-slate-950/60 py-16 backdrop-blur-md sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <Sparkles className="h-4 w-4" />
                מדריך והנחיות העברה רשמיות (Transfer Help)
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                הנחיות העברה לפי סוג סיומת הדומיין
              </h2>
            </div>

            {/* Tab Switcher: Israeli (.co.il) vs International (.com) */}
            <div className="inline-flex rounded-2xl border border-white/10 bg-slate-900/90 p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('il')}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                  activeTab === 'il'
                    ? 'bg-gradient-to-l from-cyan-400 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <IsraelFlagSvg className="h-3.5 w-5" />
                <span>דומיין ישראלי (‎.co.il / ‎.org.il)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('global')}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                  activeTab === 'global'
                    ? 'bg-gradient-to-l from-cyan-400 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <GlobalEarthSvg className="h-4 w-4" />
                <span>דומיין בינלאומי (‎.com / ‎.net / ‎.org)</span>
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Left: Rules & Guidelines Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-7 backdrop-blur-xl">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                {activeTab === 'il' ? (
                  <IsraelFlagSvg className="h-5 w-7" />
                ) : (
                  <GlobalEarthSvg className="h-6 w-6" />
                )}
                <div>
                  <h3 className="text-xl font-extrabold text-white">
                    {activeTab === 'il'
                      ? 'דגשים להעברת דומיין ישראלי (.co.il / .org.il)'
                      : 'דגשים להעברת דומיין בינלאומי (.com / .net / .org)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeTab === 'il'
                      ? 'בהתאם לכללי איגוד האינטרנט הישראלי (ISOC-IL)'
                      : 'בהתאם לתקנות הארגון הבינלאומי ICANN'}
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-4">
                {(activeTab === 'il' ? ilRules : globalRules).map((rule) => (
                  <li key={rule} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Clock className="h-4 w-4 text-cyan-300" />
                  <span>
                    זמן השלמת העברה ממוצע:{' '}
                    <strong className="text-white">
                      {activeTab === 'il' ? 'מיידי עד 5 ימים' : '5 עד 7 ימים קלנדריים'}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOrderTransfer(
                      activeTab === 'il'
                        ? 'העברת דומיין ישראלי (.co.il)'
                        : 'העברת דומיין בינלאומי (.com)',
                      activeTab === 'il' ? 0 : 59,
                      'annual',
                      activeTab,
                    )
                  }
                  className="cursor-pointer text-xs font-bold text-cyan-300 hover:text-white"
                >
                  בקש סיוע מנציג בהעברה ←
                </button>
              </div>
            </div>

            {/* Right: TLD Transfer Pricing Table */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl">
              <div className="border-b border-white/10 bg-slate-950/60 p-5">
                <h3 className="text-lg font-extrabold text-white">טבלת עלויות העברת דומיינים</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  כולל ניהול DNS מתקדם, הגנת DDoS ותמיכה טכנית מלאה
                </p>
              </div>

              <div className="divide-y divide-white/10">
                {tldPricing.map((row) => (
                  <div
                    key={row.tld}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      {row.type === 'il' ? (
                        <IsraelFlagSvg className="h-3.5 w-5" />
                      ) : (
                        <GlobalEarthSvg className="h-4 w-4" />
                      )}
                      <div>
                        <span
                          dir="ltr"
                          className="font-mono text-base font-extrabold text-white"
                        >
                          {row.tld}
                        </span>
                        <span className="block text-[11px] text-slate-400">{row.renewalNote}</span>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-xl px-3 py-1 font-mono text-xs font-bold ${
                        row.type === 'il'
                          ? 'border border-emerald-400/30 bg-emerald-500/15 text-emerald-300'
                          : 'border border-cyan-400/25 bg-cyan-500/10 text-cyan-200'
                      }`}
                    >
                      {row.transferPrice}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <h2 className="text-center text-2xl font-extrabold text-white sm:text-3xl">
          שאלות ותשובות נפוצות על העברת דומיינים
        </h2>
        <div className="mt-8 space-y-3">
          {transferFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-4 text-right font-bold text-white transition-colors hover:bg-white/[0.03]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-cyan-300 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-white/10 px-6 py-4 text-sm leading-7 text-slate-300">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom Support Banner */}
        <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-3xl border border-cyan-400/30 bg-gradient-to-l from-blue-950/80 via-slate-900/90 to-slate-900/90 p-8 text-center sm:flex-row sm:text-right">
          <div>
            <h3 className="text-xl font-extrabold text-white">
              יש לכם מספר רב של דומיינים להעברה (Bulk Transfer)?
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              צוות הדומיינים של {BRAND_NAME} ילווה אתכם בהעברה מרוכזת של כלל הדומיינים שלכם ללא
              מאמץ.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOrderTransfer('העברת דומיינים מרוכזת בליווי נציג', 0, 'annual', 'il')}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5"
          >
            <Headset className="h-4 w-4" aria-hidden />
            פתיחת פנייה למחלקת דומיינים
          </button>
        </div>
      </section>
    </div>
  )
}

export default DomainTransferPage
