import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Cpu,
  DatabaseBackup,
  GitBranch,
  Headset,
  Layers,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react'
import { ANNUAL_DISCOUNT, type BillingCycle, type PlanLocation } from '@/data/pricing'
import { GlobalEarthSvg, IsraelFlagSvg, ServerLocationsRow } from '@/components/LocationBadges'
import { BRAND_NAME, type PageRoute } from '@/components/Navbar'

const WORDPRESS_LOGO_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5jxBavTal0A1gCTnimxifwD10gSRyObm8rNrnsA7nsQ&s'

type WpPlan = {
  id: string
  name: string
  nameEn: string
  subtitle: string
  monthlyPrice: number
  highlighted?: boolean
  badge?: string
  sitesCount: string
  nvmeStorage: string
  ram: string
  cpuCores: string
  phpMemory: string
  locations: PlanLocation[]
  features: string[]
}

const wpPlans: WpPlan[] = [
  {
    id: 'wp-personal',
    name: 'וורדפרס Personal',
    nameEn: 'WP Managed 1',
    subtitle: 'לאתר תדמית או בלוג וורדפרס עסקי שרוצה מהירות וניהול מלא בראש שקט',
    monthlyPrice: 45,
    sitesCount: 'אתר וורדפרס 1',
    nvmeStorage: '15GB NVMe',
    ram: '2GB DDR5',
    cpuCores: '2 ליבות vCPU',
    phpMemory: '512MB PHP',
    locations: ['il', 'global'],
    features: [
      'עדכונים אוטומטיים (ליבה, תבניות ותוספים)',
      'שרת LiteSpeed Enterprise + LSCache',
      'ממשק ניהול WP Toolkit מתקדם',
      'אבטחת FortiGate + Imunify360 WAF',
      'גיבוי יומי אוטומטי חינם (30 יום)',
      'תעודת SSL חינם והעברת אתר חינם',
      'תיבות דוא״ל עסקיות ללא הגבלה',
    ],
  },
  {
    id: 'wp-business',
    name: 'וורדפרס Business',
    nameEn: 'WP Managed 5',
    subtitle: 'החבילה הנבחרת לעסקים ואתרי אלמנטור פרו הדורשים ביצועים גבוהים',
    monthlyPrice: 79,
    highlighted: true,
    badge: 'המומלצת לעסקים',
    sitesCount: 'עד 5 אתרי וורדפרס',
    nvmeStorage: '35GB NVMe',
    ram: '4GB DDR5',
    cpuCores: '3 ליבות vCPU',
    phpMemory: '1024MB PHP',
    locations: ['il', 'global'],
    features: [
      'עדכונים אוטומטיים חכמים + גיבוי לפני עדכון',
      'סביבת Staging (פיתוח ובדיקות) בלחיצה',
      'האצת Redis Object Cache מובנית',
      'מותאם 100% ל-Elementor Pro ללא תקיעות',
      'אבטחת FortiGate + Imunify360 + Anti-DDoS',
      'גיבוי יומי אוטומטי חינם (30 יום + ענן חיצוני)',
      'תעודת SSL חינם והעברת אתרים חינם',
    ],
  },
  {
    id: 'wp-pro',
    name: 'וורדפרס Pro',
    nameEn: 'WP Managed 15',
    subtitle: 'לפורטלים, אתרי תוכן גדולים ומפתחי וורדפרס שצריכים כלי פיתוח מתקדמים',
    monthlyPrice: 129,
    sitesCount: 'עד 15 אתרי וורדפרס',
    nvmeStorage: '75GB NVMe',
    ram: '8GB DDR5',
    cpuCores: '4 ליבות vCPU',
    phpMemory: '2048MB PHP',
    locations: ['il', 'global'],
    features: [
      'כל יכולות הניהול האוטומטי + Staging כפול',
      'גישת SSH מלאה + WP-CLI + חיבור Git',
      'האצת LiteSpeed Enterprise + Redis פרטי',
      'ניטור שינויי קבצים וחסימת פריצות בזמן אמת',
      'דו״חות אבטחה ותאימות GDPR מובנים',
      'גיבוי יומי חינם (60 יום אחורה)',
      'תמיכת Webmaster מומחה וורדפרס 24/7',
    ],
  },
  {
    id: 'wp-agency',
    name: 'וורדפרס Agency',
    nameEn: 'WP Managed 50',
    subtitle: 'לסוכנויות דיגיטל ובוני אתרים המנהלים עשרות אתרי לקוחות תחת קורת גג אחת',
    monthlyPrice: 219,
    sitesCount: 'עד 50 אתרי וורדפרס',
    nvmeStorage: '150GB NVMe',
    ram: '16GB DDR5',
    cpuCores: '6 ליבות vCPU',
    phpMemory: '2048MB PHP',
    locations: ['il', 'global'],
    features: [
      'לוח בקרה מרכזי לניהול כל אתרי הלקוחות',
      'בידוד משאבים (CloudLinux) למניעת זליגת עומסים',
      'שכפול תבניות Master להקמת אתר חדש בדקה',
      'כתובת IP ישראלית ייעודית חינם',
      'גיבוי 90 יום + שחזור פרטני לכל אתר',
      'סריקת נוזקות וניקוי אוטומטי ללא עלות נוספת',
      'מנהל לקוח הנדסי אישי ו-SLA 99.99%',
    ],
  },
]

const managedFeatures = [
  {
    num: '01.',
    icon: RefreshCw,
    title: 'עדכונים אוטומטיים חכמים ובטוחים',
    description:
      'מערכת הניהול מבצעת עדכוני ליבת וורדפרס, תבניות ותוספים באופן אוטומטי, תוך יצירת נקודת שחזור לפני כל עדכון ובדיקה ויזואלית שהאתר תקין.',
  },
  {
    num: '02.',
    icon: Layers,
    title: 'מותאם במיוחד ל-Elementor Pro',
    description:
      'שכחו משגיאות 500 או מסך טעינה תקוע באלמנטור. הקצינו PHP Memory Limit של עד 2048MB ומעבדי AMD EPYC מהירים לעבודה חלקה בעורך.',
  },
  {
    num: '03.',
    icon: GitBranch,
    title: 'סביבת Staging ושכפול בלחיצה',
    description:
      'רוצים לבדוק תוסף חדש או לשדרג עיצוב? צרו עותק פיתוח מדויק של האתר בלחיצה אחת, בצעו שינויים וסנכרנו חזרה לאתר החי ללא השבתה.',
  },
  {
    num: '04.',
    icon: ShieldCheck,
    title: 'אבטחת מידע 360° (FortiGate + Imunify)',
    description:
      'הגנה היקפית הכוללת חומת אש חומרתית FortiGate, בידוד חשבונות CloudLinux, מערכת WAF ייעודית לחוקי וורדפרס וחסימת בוטים עוינים ב-XML-RPC.',
  },
  {
    num: '05.',
    icon: Zap,
    title: 'LiteSpeed Enterprise + Redis Cache',
    description:
      'האצת וורדפרס ברמת השרת עם תוסף LSCache מוגדר מראש ומטמון אובייקטים Redis, המעניקים ציוני Google Core Web Vitals ירוקים וטעינה בפחות מחצי שנייה.',
  },
  {
    num: '06.',
    icon: Terminal,
    title: 'כלי מפתחים: WP-CLI, SSH ו-Git',
    description:
      'סביבה אידיאלית לאנשי מקצוע: הרצת פקודות WP-CLI, ניהול גרסאות PHP (7.4 עד 8.4) לכל תיקייה בנפרד, גישת SSH מאובטחת ומנהל משימות Cron.',
  },
]

const wpSpecTable = [
  { label: 'כמות אתרי וורדפרס מנוהלים', values: ['אתר 1', 'עד 5 אתרים', 'עד 15 אתרים', 'עד 50 אתרים'] },
  { label: 'נפח אחסון Enterprise NVMe', values: ['15GB', '35GB', '75GB', '150GB'] },
  { label: 'זיכרון RAM ייעודי (DDR5)', values: ['2GB', '4GB', '8GB', '16GB'] },
  { label: 'ליבות מעבד מוקצות (vCPU)', values: ['2 ליבות', '3 ליבות', '4 ליבות', '6 ליבות'] },
  { label: 'זיכרון PHP (Memory Limit)', values: ['512MB', '1024MB', '2048MB', '2048MB'] },
  { label: 'ניהול עדכוני ליבה ותוספים', values: ['אוטומטי מנוהל', 'אוטומטי מנוהל', 'אוטומטי מנוהל', 'אוטומטי מנוהל'] },
  { label: 'סביבת פיתוח ובדיקות (Staging)', values: ['—', 'כלול (בקליק)', 'כלול (בקליק)', 'כלול (לכל אתר)'] },
  { label: 'האצת מטמון שרת', values: ['LiteSpeed LSCache', 'LSCache + Redis', 'LSCache + Redis', 'LSCache + Redis'] },
  { label: 'אבטחת FortiGate + Imunify360', values: ['כלול', 'כלול', 'כלול + ניטור קבצים', 'כלול + ניקוי נוזקות'] },
  { label: 'גישת SSH / WP-CLI / Git', values: ['WP-CLI', 'SSH + WP-CLI', 'SSH + WP-CLI + Git', 'SSH + WP-CLI + Git'] },
  { label: 'גיבוי יומי אוטומטי חיצוני', values: ['30 יום אחורה', '30 יום אחורה', '60 יום אחורה', '90 יום אחורה'] },
  { label: 'העברת אתר וורדפרס חינם', values: ['חינם ע״י מומחה', 'חינם ע״י מומחה', 'חינם ע״י מומחה', 'חינם ע״י מומחה'] },
]

const wpFaqs = [
  {
    q: 'מה ההבדל בין אחסון וורדפרס מנוהל לאחסון רגיל?',
    a: 'באחסון וורדפרס מנוהל של לב-טק טכנולוגיות השרת והמערכת מותאמים ב-100% לוורדפרס: אתם מקבלים מערכת WP Toolkit המבצעת עדכונים אוטומטיים בטוחים לתוספים ולתבניות, סביבת Staging לבדיקת שינויים, הגנות WAF ספציפיות נגד פריצות וורדפרס, וצוות תמיכה שמכיר את וורדפרס ואלמנטור לעומק.',
  },
  {
    q: 'האם האחסון פותר בעיות איטיות ושגיאות זיכרון ב-Elementor Pro?',
    a: 'בהחלט. מרבית בעיות האיטיות והשגיאות באלמנטור נובעות ממגבלת PHP Memory נמוכה ומעבד עמוס. בחבילות הוורדפרס המנוהלות שלנו אנו מקצים עד 2048MB PHP Memory Limit יחד עם זיכרון DDR5 ייעודי וכונני NVMe, כך שעורך אלמנטור נטען בשניות.',
  },
  {
    q: 'איך מתבצעת העברת אתר הוורדפרס שלי אליכם?',
    a: 'הצוות שלנו מבצע עבורכם את כל תהליך ההעברה בחינם. אנו מעתיקים את קבצי הוורדפרס, מסד הנתונים והמיילים לשרת החדש, מגדירים עבורכם LiteSpeed Cache ו-SSL, בודקים שכל העמודים והטפסים עובדים כשורה ורק אז מעדכנים את ה-DNS – ללא שנייה של השבתה.',
  },
  {
    q: 'מה קורה אם תוסף שעודכן גורם לתקלה באתר?',
    a: 'לפני כל עדכון אוטומטי המערכת יוצרת Snapshot (נקודת שחזור) של האתר. במידה ועדכון של תוסף יוצר שגיאה, ניתן לשחזר את האתר למצבו המדויק מלפני העדכון בלחיצת כפתור אחת מתוך הפאנל.',
  },
]

export function WordpressHostingPage({
  onNavigate,
  onOrderTier,
}: {
  onNavigate: (page: PageRoute, href?: string) => void
  onOrderTier: (tierName: string, price: number, cycle: BillingCycle, location: PlanLocation) => void
}) {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [preferredLocation, setPreferredLocation] = useState<PlanLocation>('il')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [logoError, setLogoError] = useState(false)

  const getPrice = (monthly: number) =>
    cycle === 'annual' ? Math.round(monthly * (1 - ANNUAL_DISCOUNT)) : monthly

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10 pb-16 pt-10 sm:pt-14 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            <span>אחסון אתרים</span>
            <span aria-hidden>/</span>
            <span className="font-semibold text-cyan-300">אחסון מנוהל לוורדפרס</span>
          </nav>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-3">
                {!logoError && (
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white p-1.5 shadow-md">
                    <img
                      src={WORDPRESS_LOGO_URL}
                      alt="WordPress"
                      referrerPolicy="no-referrer"
                      onError={() => setLogoError(true)}
                      className="h-full w-full object-contain"
                    />
                  </span>
                )}
                <span className="text-sm font-bold tracking-wide text-cyan-300">
                  MANAGED WORDPRESS HOSTING · מנוהל ומאובטח 24/7
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
                אחסון מנוהל לוורדפרס –{' '}
                <span className="bg-gradient-to-l from-cyan-300 via-blue-400 to-sky-400 bg-clip-text text-transparent">
                  אתם מתמקדים בתוכן,
                </span>{' '}
                אנחנו דואגים לכל השאר.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                חבילות אחסון וורדפרס מנוהלות על שרתי LiteSpeed Enterprise וכונני NVMe, עם עדכונים
                אוטומטיים חכמים, סביבת Staging בלחיצה, אופטימיזציה מלאה לאלמנטור פרו ומעטפת אבטחת
                מידע ארגונית של {BRAND_NAME}.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#wp-plans"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:-translate-y-0.5 hover:shadow-cyan-400/40"
                >
                  לחבילות אחסון וורדפרס
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href="#wp-specs"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-100 backdrop-blur transition-colors hover:bg-white/10"
                >
                  השוואת מפרטים מלאה
                </a>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-7 sm:grid-cols-4">
                {[
                  { val: '99/100', label: 'ציון מהירות ממוצע' },
                  { val: '2048MB', label: 'זיכרון PHP לאלמנטור' },
                  { val: 'בקליק 1', label: 'סביבת Staging וגיבוי' },
                  { val: 'חינם', label: 'העברת אתר וורדפרס' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-mono text-2xl font-extrabold text-white tabular-nums">
                      {stat.val}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Managed WordPress Dashboard Showcase Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  {!logoError && (
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1">
                      <img
                        src={WORDPRESS_LOGO_URL}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain"
                      />
                    </span>
                  )}
                  <div>
                    <h2 className="text-base font-bold text-white">מרכז בקרה WP Toolkit Deluxe</h2>
                    <p className="text-xs text-slate-400">ניהול אוטומטי, אבטחה והאצה בזמן אמת</p>
                  </div>
                </div>
                <span className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300">
                  מנוהל ומוגן
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  {
                    title: 'עדכוני ליבה, תבניות ותוספים',
                    status: 'אוטומטי + Snapshot',
                    desc: 'WordPress 6.7 · גיבוי אוטומטי לפני כל שדרוג',
                  },
                  {
                    title: 'האצת LiteSpeed Cache + Redis',
                    status: 'TTFB 38ms',
                    desc: 'מטמון עמודים + מטמון שאילתות מסד נתונים פעיל',
                  },
                  {
                    title: 'סביבת Staging (פיתוח ובדיקות)',
                    status: 'מוכן לסנכרון',
                    desc: 'שכפול האתר לסביבת בדיקות והעלאה לאוויר בלחיצה',
                  },
                  {
                    title: 'חומת אש FortiGate + Imunify360 WAF',
                    status: 'פעיל 24/7',
                    desc: 'הגנת XML-RPC, סריקת נוזקות ובידוד חשבונות מלא',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{item.title}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{item.desc}</div>
                    </div>
                    <span className="shrink-0 font-mono text-xs font-bold text-cyan-300 tabular-nums">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-xs text-cyan-100">
                <span>מותאם במיוחד ל-Elementor Pro, WP Rocket, Yoast ו-ACF</span>
                <Code2 className="h-4 w-4 shrink-0 text-cyan-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="wp-plans" className="scroll-mt-24 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              חבילות אחסון מנוהל לוורדפרס
            </h2>
            <p className="mt-3 text-base text-slate-300 sm:text-lg">
              בחרו את החבילה המתאימה לכמות האתרים והיקף התנועה שלכם. כל החבילות כוללות העברת אתר
              חינם, תעודת SSL וגיבויים יומיים.
            </p>
          </div>

          {/* Controls: Billing Cycle + Server Location Selector */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <div className="inline-flex items-center rounded-2xl border border-white/10 bg-slate-900/80 p-1.5 shadow-lg">
              {(['monthly', 'annual'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCycle(c)}
                  className={`cursor-pointer whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                    cycle === c
                      ? 'bg-gradient-to-l from-cyan-400 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {c === 'monthly' ? 'חיוב חודשי' : `חיוב שנתי · ${ANNUAL_DISCOUNT * 100}% הנחה`}
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-1.5">
              <span className="px-3 text-xs font-semibold text-slate-400">מיקום שרת מועדף:</span>
              <button
                type="button"
                onClick={() => setPreferredLocation('il')}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  preferredLocation === 'il'
                    ? 'border border-blue-400/40 bg-blue-500/20 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <IsraelFlagSvg className="h-3.5 w-5" />
                <span>ישראל</span>
              </button>
              <button
                type="button"
                onClick={() => setPreferredLocation('global')}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  preferredLocation === 'global'
                    ? 'border border-cyan-400/40 bg-cyan-500/20 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <GlobalEarthSvg className="h-3.5 w-3.5" />
                <span>גלובלי (אירופה)</span>
              </button>
            </div>
          </div>

          {/* 4-Column Pricing Cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {wpPlans.map((plan) => {
              const price = getPrice(plan.monthlyPrice)
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-3xl border p-6 text-white backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 ${
                    plan.highlighted
                      ? 'border-cyan-400/50 bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-blue-950/60 shadow-2xl shadow-cyan-500/15 ring-1 ring-cyan-400/30'
                      : 'border-white/10 bg-slate-900/60 hover:border-white/20'
                  }`}
                >
                  {plan.badge && (
                    <span className="-top-3.5 right-6 absolute inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-cyan-400 to-blue-600 px-3.5 py-1 text-xs font-bold text-white shadow-lg shadow-cyan-500/30">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                      <span className="font-mono text-xs font-semibold text-cyan-300/80">
                        {plan.nameEn}
                      </span>
                    </div>
                    <p className="mt-1.5 min-h-[2.5rem] text-xs leading-5 text-slate-400">
                      {plan.subtitle}
                    </p>

                    <div className="mt-5 border-y border-white/10 py-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-4xl font-extrabold text-white tabular-nums">
                          ₪{price}
                        </span>
                        <span className="text-xs font-medium text-slate-400">/ לחודש</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {cycle === 'annual'
                          ? `בחיוב שנתי · חיסכון של ₪${(plan.monthlyPrice - price) * 12} בשנה`
                          : 'ללא התחייבות · הקמה מיידית'}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                        <div className="text-[11px] text-slate-400">כמות אתרים</div>
                        <div className="mt-0.5 text-xs font-bold text-cyan-300">
                          {plan.sitesCount}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                        <div className="text-[11px] text-slate-400">נפח אחסון</div>
                        <div className="mt-0.5 font-mono text-xs font-bold text-white" dir="ltr">
                          {plan.nvmeStorage}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                        <div className="text-[11px] text-slate-400">זיכרון ומעבד</div>
                        <div className="mt-0.5 text-xs font-bold text-white">
                          {plan.ram} · {plan.cpuCores}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                        <div className="text-[11px] text-slate-400">זיכרון לאלמנטור</div>
                        <div className="mt-0.5 font-mono text-xs font-bold text-emerald-300" dir="ltr">
                          {plan.phpMemory}
                        </div>
                      </div>
                    </div>

                    <ServerLocationsRow locations={plan.locations} />

                    <ul className="mt-5 space-y-2 text-xs">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
                            <Check className="h-3 w-3" aria-hidden />
                          </span>
                          <span
                            className={
                              feat.includes('חינם') || feat.includes('אוטומטיים')
                                ? 'font-semibold text-slate-100'
                                : 'text-slate-300'
                            }
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOrderTier(plan.name, price, cycle, preferredLocation)}
                    className={`mt-7 w-full cursor-pointer rounded-xl py-3 text-center text-sm font-bold transition-all hover:-translate-y-0.5 ${
                      plan.highlighted
                        ? 'bg-gradient-to-l from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50'
                        : 'border border-white/15 bg-white/5 text-white hover:border-cyan-400/40 hover:bg-white/10'
                    }`}
                  >
                    הזמן חבילה זו
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6 Managed WordPress Advantages */}
      <section className="border-y border-white/10 bg-slate-950/60 py-16 backdrop-blur-md sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              מה הופך את אחסון הוורדפרס שלנו למנוהל באמת?
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-300">
              במקום להתעסק בתחזוקת שרתים, עדכוני אבטחה ותקלות זיכרון – המערכת והצוות שלנו עושים
              את העבודה השחורה בשבילכם.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {managedFeatures.map((feat) => (
              <div
                key={feat.title}
                className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-cyan-400/30"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-cyan-300 ring-1 ring-cyan-400/30">
                    <feat.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-500">{feat.num}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{feat.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Spec Comparison Table */}
      <section id="wp-specs" className="scroll-mt-24 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              השוואת חבילות אחסון וורדפרס מנוהל
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              פירוט מלא של משאבי החומרה, כלי הפיתוח ומנגנוני ההגנה בכל חבילה
            </p>
          </div>

          <div className="mt-10 overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <table className="w-full min-w-[680px] border-collapse text-right text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/60">
                  <th className="p-4 font-bold text-slate-300 sm:p-5">מאפיין / משאב</th>
                  {wpPlans.map((p) => (
                    <th key={p.id} className="p-4 text-center sm:p-5">
                      <span className="block font-extrabold text-white">{p.name}</span>
                      <span className="mt-0.5 block font-mono text-xs text-cyan-300 tabular-nums">
                        ₪{getPrice(p.monthlyPrice)} / חודש
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {wpSpecTable.map((row) => (
                  <tr key={row.label} className="transition-colors hover:bg-white/[0.02]">
                    <td className="p-4 font-medium text-slate-200 sm:p-5">{row.label}</td>
                    {row.values.map((val, idx) => (
                      <td
                        key={idx}
                        className={`p-4 text-center font-mono text-xs font-semibold tabular-nums sm:p-5 ${
                          idx === 1 ? 'bg-cyan-500/[0.04] text-cyan-200' : 'text-slate-300'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-extrabold text-white sm:text-3xl">
          שאלות נפוצות על אחסון מנוהל לוורדפרס
        </h2>
        <div className="mt-8 space-y-3">
          {wpFaqs.map((faq, idx) => {
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

        {/* Bottom CTA */}
        <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-3xl border border-cyan-400/30 bg-gradient-to-l from-blue-950/80 via-slate-900/90 to-slate-900/90 p-8 text-center sm:flex-row sm:text-right">
          <div>
            <h3 className="text-xl font-extrabold text-white">
              רוצים להעביר את אתר הוורדפרס שלכם אלינו בחינם וללא השבתה?
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              מומחי הוורדפרס של {BRAND_NAME} יבצעו עבורכם העברה מלאה ואופטימיזציית מהירות ראשונית
              ללא עלות.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOrderTier('העברת אתר וורדפרס חינם', 79, cycle, preferredLocation)}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5"
          >
            <Headset className="h-4 w-4" aria-hidden />
            תיאום העברת וורדפרס חינם
          </button>
        </div>
      </section>
    </div>
  )
}

export default WordpressHostingPage
