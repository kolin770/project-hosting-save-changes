import { useState } from 'react'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Cpu,
  CreditCard,
  Database,
  Gauge,
  Headset,
  Layers,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { ANNUAL_DISCOUNT, type BillingCycle, type PlanLocation } from '@/data/pricing'
import { GlobalEarthSvg, IsraelFlagSvg, ServerLocationsRow } from '@/components/LocationBadges'
import { BRAND_NAME, type PageRoute } from '@/components/Navbar'

const WOOCOMMERCE_LOGO_URL =
  'https://logos-world.net/wp-content/uploads/2025/04/WooCommerce-Logo.png'

type WooPlan = {
  id: string
  name: string
  nameEn: string
  subtitle: string
  monthlyPrice: number
  highlighted?: boolean
  badge?: string
  nvmeStorage: string
  ram: string
  cpuCores: string
  phpWorkers: string
  catalogSize: string
  locations: PlanLocation[]
  features: string[]
}

const wooPlans: WooPlan[] = [
  {
    id: 'woo-start',
    name: 'Woo Start',
    nameEn: '2CPU · 3GB RAM',
    subtitle: 'לחנויות אונליין בתחילת הדרך וקטלוגים עד 1,000 מוצרים',
    monthlyPrice: 89,
    nvmeStorage: '20GB NVMe',
    ram: '3GB DDR5',
    cpuCores: '2 ליבות vCPU',
    phpWorkers: '30 PHP Workers',
    catalogSize: 'עד 1,000 מוצרים',
    locations: ['il', 'global'],
    features: [
      'שרת LiteSpeed Enterprise + LSCache ל-Woo',
      'האצת Redis Object Cache לשאילתות מוצרים',
      'עבודה חלקה באלמנטור פרו ללא תקיעות',
      'תעודת SSL חינם מותאמת לדפי סליקה',
      'גיבוי יומי אוטומטי חינם (30 יום)',
      'סביבת פיתוח (Staging) לבדיקת תוספים',
      'העברת חנות WooCommerce חינם ע״י מומחה',
    ],
  },
  {
    id: 'woo-business',
    name: 'Woo Business',
    nameEn: '4CPU · 6GB RAM',
    subtitle: 'החבילה המובילה לחנויות פעילות עם קמפיינים ממומנים ותנועה גבוהה',
    monthlyPrice: 139,
    highlighted: true,
    badge: 'הנבחרת לחנויות',
    nvmeStorage: '50GB NVMe',
    ram: '6GB DDR5',
    cpuCores: '4 ליבות vCPU',
    phpWorkers: '60 PHP Workers',
    catalogSize: 'עד 10,000 מוצרים',
    locations: ['il', 'global'],
    features: [
      'ביצועי קצה בלוח הבקרה wp-admin ובקופה',
      'Smart ESI Cache – מטמון חכם שלא משבש עגלות',
      'אופטימיזציית MariaDB למסנני מוצרים ווריאציות',
      'סביבת Staging כפולה לבדיקת שערי תשלום',
      'הגנת DDoS + WAF מותאם לחנויות מסחר',
      'גיבוי יומי אוטומטי חינם (30 יום + ענן חיצוני)',
      'העברת חנות WooCommerce חינם באפס השבתה',
    ],
  },
  {
    id: 'woo-scale',
    name: 'Woo Scale',
    nameEn: '6CPU · 12GB RAM',
    subtitle: 'למותגים, רשתות קמעונאות וחנויות עם סנכרון מלאי ו-ERP בזמן אמת',
    monthlyPrice: 229,
    nvmeStorage: '100GB NVMe',
    ram: '12GB DDR5',
    cpuCores: '6 ליבות vCPU',
    phpWorkers: '120 PHP Workers',
    catalogSize: 'ללא הגבלה',
    locations: ['il', 'global'],
    features: [
      'משאבי CPU ו-RAM מבודדים לעומסי קמפיינים',
      'תמיכה מלאה ב-Webhooks וחיבורי ERP (Priority/חשבשבת)',
      'כתובת IP ייעודית לחיבור מאובטח לחברות אשראי',
      'Redis מוקצה ב-RAM לחיפוש מוצרים מיידי',
      'גיבוי דו-יומי חינם (60 יום אחורה)',
      'ניטור זמינות עמודי קופה וסליקה 24/7',
      'עדיפות עליונה בתמיכה הנדסית בעברית',
    ],
  },
  {
    id: 'woo-enterprise',
    name: 'Woo Enterprise',
    nameEn: '8CPU · 24GB RAM',
    subtitle: 'לפלטפורמות מסחר גדולות ואירועי מכירות קיצוניים (ShoppingIL / Black Friday)',
    monthlyPrice: 369,
    nvmeStorage: '200GB NVMe',
    ram: '24GB DDR5',
    cpuCores: '8 ליבות vCPU',
    phpWorkers: '250 PHP Workers',
    catalogSize: 'ללא הגבלה',
    locations: ['il', 'global'],
    features: [
      'עוצמת עיבוד של שרת ייעודי בניהול מלא שלנו',
      'אפס שגיאות מסד נתונים גם באלפי רוכשים במקביל',
      'כתובת IP ייעודית + SSL Wildcard חינם',
      'אופטימיזציית שאילתות איטיות (Slow Query Tuning)',
      'גיבוי 90 יום + נקודות שחזור לפני מבצעים',
      'מנהל לקוח הנדסי אישי ו-SLA 99.99%',
      'העברה וליווי מלא של צוות DevOps בכיר',
    ],
  },
]

const wooPainSolutions = [
  {
    problem: 'איטיות מתסכלת במערכת הניהול (/wp-admin) ובעריכת הזמנות',
    solution:
      'הקצאת ליבות AMD EPYC ייעודיות וריבוי PHP Workers המבטיחים שפאנל הניהול יגיב מיידית גם כשמאות גולשים מבצעים רכישה במקביל.',
    icon: Cpu,
  },
  {
    problem: 'שגיאת "Error Establishing a Database Connection" בזמן קמפיינים',
    solution:
      'שילוב של כונני Enterprise NVMe עם MariaDB מכויל ו-Redis Object Cache ב-RAM, המורידים עד 80% מהעומס על מסד הנתונים.',
    icon: Database,
  },
  {
    problem: 'אלמנטור פרו נתקע או לא שומר עמודי מוצר מורכבים',
    solution:
      'הגדרת PHP Memory Limit נדיב (עד 2048MB), Max Input Vars מוגדל וביטול חנק משאבים – לעריכה חלקה ומהירה של כל תבנית חנות.',
    icon: Layers,
  },
  {
    problem: 'נטישת עגלות קניות עקב טעינה איטית של עמוד הקופה (Checkout)',
    solution:
      'טכנולוגיית LiteSpeed Smart ESI שומרת עמודים במטמון מהיר תוך השארת רכיבי העגלה והקופה דינמיים ומדויקים לכל לקוח.',
    icon: CreditCard,
  },
]

const wooSpecTable = [
  { label: 'ליבות מעבד ייעודיות (AMD EPYC)', values: ['2 ליבות vCPU', '4 ליבות vCPU', '6 ליבות vCPU', '8 ליבות vCPU'] },
  { label: 'זיכרון RAM מובטח (DDR5)', values: ['3GB', '6GB', '12GB', '24GB'] },
  { label: 'נפח אחסון 100% NVMe SSD', values: ['20GB', '50GB', '100GB', '200GB'] },
  { label: 'תהליכי PHP במקביל (PHP Workers)', values: ['30', '60', '120', '250'] },
  { label: 'זיכרון PHP לאלמנטור ולווקומרס', values: ['1024MB', '2048MB', '2048MB', '4096MB'] },
  { label: 'גודל קטלוג מוצרים מומלץ', values: ['עד 1,000', 'עד 10,000', 'ללא הגבלה', 'ללא הגבלה'] },
  { label: 'האצת LiteSpeed ESI + Redis Cache', values: ['כלול', 'כלול', 'כלול (מוקצה ב-RAM)', 'כלול (Cluster)'] },
  { label: 'סביבת פיתוח (Staging) לבדיקת סליקה', values: ['כלול', 'כלול', 'כלול', 'כלול'] },
  { label: 'תאימות חיבורי ERP / קופות / API', values: ['מלאה', 'מלאה', 'מלאה + IP קבוע', 'מלאה + IP קבוע'] },
  { label: 'גיבוי יומי אוטומטי של הזמנות ומוצרים', values: ['30 יום אחורה', '30 יום אחורה', '60 יום אחורה', '90 יום אחורה'] },
  { label: 'העברת חנות WooCommerce חינם', values: ['חינם ע״י מומחה', 'חינם ע״י מומחה', 'חינם ע״י מומחה', 'חינם ע״י מומחה'] },
]

const wooFaqs = [
  {
    q: 'למה חנות WooCommerce צריכה חבילת אחסון ייעודית ולא אחסון רגיל?',
    a: 'בניגוד לאתר תדמית רגיל שבו רוב העמודים סטטיים, חנות WooCommerce מבצעת עשרות שאילתות למסד הנתונים בכל סינון מוצרים, הוספה לסל וחישוב משלוח או קופון. חבילות ה-WooCommerce של לב-טק טכנולוגיות כוללות ליבות CPU וזיכרון RAM מוגדלים, לצד Redis Object Cache ו-LiteSpeed ESI שמאיצים פעולות דינמיות אלו פי 6.',
  },
  {
    q: 'האם ניתן להעביר חנות פעילה בלי לאבד הזמנות שנכנסות בזמן ההעברה?',
    a: 'כן! אנו מבצעים העברת חנויות WooCommerce בשיטת סנכרון דו-שלבי (Delta Sync): תחילה אנו מעתיקים את כלל הקבצים והמוצרים לשרת החדש ובודקים את תקינות הסליקה, וברגע המעבר אנו מסנכרנים שוב רק את ההזמנות האחרונות שנכנסו – כך שאף הזמנה לא הולכת לאיבוד והחנות נשארת באוויר 100% מהזמן.',
  },
  {
    q: 'האם השרתים תומכים בחיבור לחברות אשראי ישראליות ומערכות ERP?',
    a: 'בהחלט. השרתים שלנו מוגדרים בתקני האבטחה המחמירים ביותר (TLS 1.3, Imunify360 WAF) ותומכים באופן מלא בכל תוספי הסליקה הישראליים (טרנזילה, קארדקום, משולם/Grow, פייפאל, ביט, אשראית) וכן בסנכרון דו-כיווני מול מערכות Priority, חשבשבת, רווחית ו-Morning.',
  },
  {
    q: 'מה קורה אם יש לי קמפיין גדול או מבצע נקודתי עם קפיצה חדה בתנועה?',
    a: 'הארכיטקטורה שלנו בנויה לגמישות מלאה. ניתן לשדרג משאבי CPU ו-RAM בלחיצת כפתור ובאופן מיידי (ללא צורך בהעברת שרת וללא השבתה) לפני קמפיינים גדולים או ימי מכירות כמו Black Friday ו-ShoppingIL.',
  },
]

export function WoocommerceHostingPage({
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
            <span className="font-semibold text-cyan-300">אחסון WooCommerce מתקדם</span>
          </nav>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-3">
                {!logoError && (
                  <span className="flex h-10 w-16 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white px-2 py-1 shadow-md">
                    <img
                      src={WOOCOMMERCE_LOGO_URL}
                      alt="WooCommerce"
                      referrerPolicy="no-referrer"
                      onError={() => setLogoError(true)}
                      className="h-full w-full object-contain"
                    />
                  </span>
                )}
                <span className="text-sm font-bold tracking-wide text-cyan-300">
                  HIGH-PERFORMANCE WOOCOMMERCE · בנוי למסחר בעומסים גבוהים
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
                אחסון WooCommerce מתקדם –{' '}
                <span className="bg-gradient-to-l from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  חנות מהירה יותר,
                </span>{' '}
                יותר המרות בקופה.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                חבילות אחסון חזקות ומהירות במיוחד שנבנו לאתרי WooCommerce עם דרישות משאבים גבוהות.
                סוף לאיטיות במערכת הניהול, סוף לתקיעות באלמנטור וסוף לבעיות חיבור למסד הנתונים –
                עם ליבות CPU וזיכרון DDR5 מובטחים לכל חנות.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#woo-plans"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:-translate-y-0.5 hover:shadow-cyan-400/40"
                >
                  לחבילות אחסון WooCommerce
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href="#woo-solutions"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-100 backdrop-blur transition-colors hover:bg-white/10"
                >
                  איך אנחנו מאיצים את החנות?
                </a>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-7 sm:grid-cols-4">
                {[
                  { val: '+38%', label: 'שיפור ממוצע בהמרות' },
                  { val: '<120ms', label: 'תגובת עגלה וקופה' },
                  { val: '100% NVMe', label: 'דיסקים + Redis ב-RAM' },
                  { val: '0 השבתה', label: 'העברת חנות חינם' },
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

            {/* WooCommerce Live Store Telemetry / Acceleration Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  {!logoError ? (
                    <span className="flex h-9 w-14 items-center justify-center rounded-lg bg-white px-1.5 py-1">
                      <img
                        src={WOOCOMMERCE_LOGO_URL}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain"
                      />
                    </span>
                  ) : (
                    <ShoppingCart className="h-6 w-6 text-cyan-300" />
                  )}
                  <div>
                    <h2 className="text-base font-bold text-white">מנוע האצת מסחר WooCommerce</h2>
                    <p className="text-xs text-slate-400">אופטימיזציית קופה, סינון מוצרים וניהול</p>
                  </div>
                </div>
                <span className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-300">
                  PCI-Ready
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'זמן טעינת עמוד מוצר',
                    value: '0.28s',
                    sub: 'LiteSpeed LSCache + NVMe',
                    icon: Zap,
                  },
                  {
                    label: 'עדכון סל קניות (AJAX)',
                    value: '42ms',
                    sub: 'Redis Object Cache פעיל',
                    icon: ShoppingCart,
                  },
                  {
                    label: 'תגובת מערכת /wp-admin',
                    value: 'מיידית',
                    sub: 'PHP Workers ייעודיים',
                    icon: Gauge,
                  },
                  {
                    label: 'עמידות בעומס רוכשים',
                    value: '99.99%',
                    sub: 'ללא קריסת מסד נתונים',
                    icon: TrendingUp,
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{metric.label}</span>
                      <metric.icon className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div className="mt-2 font-mono text-xl font-extrabold text-white tabular-nums">
                      {metric.value}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">{metric.sub}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3.5 text-xs leading-5 text-emerald-100">
                <strong className="font-bold text-emerald-300">התחייבות לביצועים:</strong> פעולה
                חלקה ומהירה של עורך Elementor Pro, מסנני מוצרים (JetSmartFilters / WoodMart) ומערכות
                סליקה.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="woo-plans" className="scroll-mt-24 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              חבילות אחסון WooCommerce עוצמתיות
            </h2>
            <p className="mt-3 text-base text-slate-300 sm:text-lg">
              משאבי מעבד וזיכרון מובטחים לחנות שלכם, כולל העברת חנות מלאה בחינם וללא השבתת מכירות.
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
              <span className="px-3 text-xs font-semibold text-slate-400">מיקום שרת החנות:</span>
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
                <span>ישראל (מומלץ לקהל ישראלי)</span>
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
            {wooPlans.map((plan) => {
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
                      <span
                        dir="ltr"
                        className="font-mono text-xs font-semibold text-cyan-300/80"
                      >
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
                          : 'ללא התחייבות · שדרוג משאבים בלחיצה'}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                        <div className="text-[11px] text-slate-400">מעבד ו-RAM</div>
                        <div className="mt-0.5 text-xs font-bold text-cyan-300">
                          {plan.cpuCores} · {plan.ram}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                        <div className="text-[11px] text-slate-400">דיסק NVMe</div>
                        <div className="mt-0.5 font-mono text-xs font-bold text-white" dir="ltr">
                          {plan.nvmeStorage}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                        <div className="text-[11px] text-slate-400">תהליכי קופה</div>
                        <div className="mt-0.5 font-mono text-xs font-bold text-emerald-300" dir="ltr">
                          {plan.phpWorkers}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                        <div className="text-[11px] text-slate-400">היקף קטלוג</div>
                        <div className="mt-0.5 text-xs font-bold text-white">
                          {plan.catalogSize}
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
                              feat.includes('חינם') || feat.includes('Redis') || feat.includes('ESI')
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
                    הזמן חבילת WooCommerce
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Problem -> Solution Section (Inspired by Fast-Servers WooCommerce Pain Points) */}
      <section
        id="woo-solutions"
        className="scroll-mt-24 border-y border-white/10 bg-slate-950/60 py-16 backdrop-blur-md sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              פותר את כלצווארי הבקבוק של חנויות WooCommerce
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-300">
              בנינו את חבילות ה-WooCommerce של {BRAND_NAME} כדי לתת מענה הנדסי מדויק לתקלות שמאטות
              חנויות וורדפרס באחסונים רגילים.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {wooPainSolutions.map((item) => (
              <div
                key={item.problem}
                className="rounded-3xl border border-white/10 bg-slate-900/55 p-6 transition-all hover:border-cyan-400/30 sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-cyan-300 ring-1 ring-cyan-400/30">
                    <item.icon className="h-6 w-6" aria-hidden />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-rose-300/90">הבעיה המוכרת:</div>
                    <h3 className="mt-1 text-lg font-extrabold text-white">{item.problem}</h3>
                    <div className="mt-4 border-t border-white/10 pt-3">
                      <div className="text-xs font-bold text-emerald-300">
                        הפתרון ב-{BRAND_NAME}:
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{item.solution}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Spec Comparison Table */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              השוואת מפרט טכני לחנויות WooCommerce
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              משאבים מובטחים להתמודדות עם קטלוגים גדולים, וריאציות מרובות ותנועת גולשים ערה
            </p>
          </div>

          <div className="mt-10 overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <table className="w-full min-w-[680px] border-collapse text-right text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/60">
                  <th className="p-4 font-bold text-slate-300 sm:p-5">משאב / מפרט חנות</th>
                  {wooPlans.map((p) => (
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
                {wooSpecTable.map((row) => (
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
          שאלות נפוצות על אחסון WooCommerce מתקדם
        </h2>
        <div className="mt-8 space-y-3">
          {wooFaqs.map((faq, idx) => {
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
              רוצים להעביר את חנות ה-WooCommerce שלכם אלינו באפס השבתה?
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              מהנדסי {BRAND_NAME} יבצעו עבורכם העברה מלאה כולל סנכרון הזמנות חי ואופטימיזציית Redis
              ללא עלות.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOrderTier('העברת חנות WooCommerce חינם', 139, cycle, preferredLocation)}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5"
          >
            <Headset className="h-4 w-4" aria-hidden />
            תיאום העברת חנות חינם
          </button>
        </div>
      </section>
    </div>
  )
}

export default WoocommerceHostingPage
