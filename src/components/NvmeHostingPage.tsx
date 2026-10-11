import { useState } from 'react'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Cpu,
  DatabaseBackup,
  Gauge,
  HardDrive,
  Headset,
  Layers,
  Lock,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { ANNUAL_DISCOUNT, type BillingCycle, type PlanLocation } from '@/data/pricing'
import { GlobalEarthSvg, IsraelFlagSvg, ServerLocationsRow } from '@/components/LocationBadges'
import { BRAND_NAME, type PageRoute } from '@/components/Navbar'

export type NvmeTier = {
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
  websites: string
  bandwidth: string
  iops: string
  locations: PlanLocation[]
  features: string[]
}

const nvmeTiers: NvmeTier[] = [
  {
    id: 'nvme-prime-1',
    name: 'פרימיום Start',
    nameEn: 'NVMe Prime 1',
    subtitle: 'לאתרי תדמית, בלוגים עתירי תוכן וחנויות בתחילת הדרך',
    monthlyPrice: 99,
    nvmeStorage: '25GB NVMe',
    ram: '4GB DDR5',
    cpuCores: '2 ליבות vCPU',
    websites: 'עד 3 אתרים',
    bandwidth: 'ללא הגבלה',
    iops: '25,000 IOPS',
    locations: ['il', 'global'],
    features: [
      'כונני 100% Enterprise NVMe Gen4',
      'שרת LiteSpeed Enterprise + LSCache',
      'האצת Redis Object Cache מובנית',
      'לוח בקרה cPanel + WordPress Toolkit',
      'הגנת Imunify360 + WAF פרואקטיבי',
      'גיבוי יומי אוטומטי חינם (30 יום)',
      'תעודת SSL חינם והעברת אתר חינם',
    ],
  },
  {
    id: 'nvme-prime-2',
    name: 'פרימיום Pro',
    nameEn: 'NVMe Prime 2',
    subtitle: 'אידיאלי לאתרי וורדפרס, אלמנטור פרו וחנויות WooCommerce פעילות',
    monthlyPrice: 129,
    highlighted: true,
    badge: 'הנמכר ביותר',
    nvmeStorage: '50GB NVMe',
    ram: '6GB DDR5',
    cpuCores: '4 ליבות vCPU',
    websites: 'עד 10 אתרים',
    bandwidth: 'ללא הגבלה',
    iops: '50,000 IOPS',
    locations: ['il', 'global'],
    features: [
      'כונני 100% Enterprise NVMe Gen4',
      'שרת LiteSpeed Enterprise + LSCache',
      'האצת Redis + Memcached ייעודית',
      'סביבת Staging + שכפול אתר בקליק',
      'הגנת Imunify360 + ניטור DDoS מתקדם',
      'גיבוי יומי אוטומטי חינם (30 יום + ענן חיצוני)',
      'תעודת SSL חינם והעברת אתר חינם',
    ],
  },
  {
    id: 'nvme-prime-3',
    name: 'פרימיום Business',
    nameEn: 'NVMe Prime 3',
    subtitle: 'לסוכנויות דיגיטל, פורטלים וחנויות מסחר עם עומסי תנועה גבוהים',
    monthlyPrice: 199,
    nvmeStorage: '100GB NVMe',
    ram: '12GB DDR5',
    cpuCores: '6 ליבות vCPU',
    websites: 'ללא הגבלה',
    bandwidth: 'ללא הגבלה',
    iops: '100,000 IOPS',
    locations: ['il', 'global'],
    features: [
      'כונני 100% Enterprise NVMe Gen4',
      'שרת LiteSpeed Enterprise + LSCache',
      'משאבי CPU ו-RAM מבודדים (Hybrid VPS)',
      'כתובת IP ייעודית קבועה חינם',
      'הגנת Imunify360 + WAF מותאם אישית',
      'גיבוי דו-יומי חינם (60 יום אחורה)',
      'עדיפות בתמיכה טכנית + העברת אתרים חינם',
    ],
  },
  {
    id: 'nvme-extreme',
    name: 'פרימיום Extreme',
    nameEn: 'NVMe Extreme',
    subtitle: 'ביצועי קצה לארגונים וחנויות ענק שדורשות מקסימום כוח עיבוד',
    monthlyPrice: 299,
    nvmeStorage: '200GB NVMe',
    ram: '24GB DDR5',
    cpuCores: '8 ליבות vCPU',
    websites: 'ללא הגבלה',
    bandwidth: 'ללא הגבלה',
    iops: '200,000 IOPS',
    locations: ['il', 'global'],
    features: [
      'כונני 100% Enterprise NVMe Gen4',
      'שרת LiteSpeed Enterprise + Redis Cluster',
      'משאבים מובטחים ברמת שרת ייעודי',
      'כתובת IP ייעודית + SSL Wildcard חינם',
      'ניטור שרת פרואקטיבי 24/7 ע״י צוות NOC',
      'גיבוי 90 יום + שחזור מיידי בלחיצה',
      'מנהל לקוח הנדסי אישי ו-SLA 99.99%',
    ],
  },
]

const speedComparison = [
  {
    label: `${BRAND_NAME} · Enterprise NVMe Gen4`,
    speed: '7,200 MB/s',
    iops: '1,000,000 IOPS',
    percent: 100,
    highlight: true,
  },
  {
    label: 'אחסון SSD SATA סטנדרטי',
    speed: '550 MB/s',
    iops: '90,000 IOPS',
    percent: 16,
    highlight: false,
  },
  {
    label: 'אחסון שיתופי רגיל (HDD / Hybrid)',
    speed: '180 MB/s',
    iops: '15,000 IOPS',
    percent: 6,
    highlight: false,
  },
]

const techPillars = [
  {
    num: '01.',
    icon: HardDrive,
    title: '100% כונני Enterprise NVMe',
    description:
      'קריאה וכתיבה של בסיסי נתונים וקבצים במהירות של עד פי 12 מכונני SSD רגילים. זמני טעינה מיידיים גם בעמודים מורכבים של אלמנטור ו-WooCommerce.',
  },
  {
    num: '02.',
    icon: Zap,
    title: 'LiteSpeed Enterprise + Redis',
    description:
      'שילוב של שרת הווב המהיר בעולם יחד עם LSCache ו-Redis Object Cache ברמת השרת, לחיסכון דרמטי בשאילתות SQL והאצת זמני TTFB.',
  },
  {
    num: '03.',
    icon: Cpu,
    title: 'ארכיטקטורת Hybrid – משאבים מבודדים',
    description:
      'כל חבילת אחסון פרימיום מקבלת ליבות מעבד AMD EPYC וזיכרון DDR5 ייעודיים ומבודדים ב-CloudLinux, כך שאף אתר שכן לא משפיע על הביצועים שלכם.',
  },
  {
    num: '04.',
    icon: ShieldCheck,
    title: 'מעטפת אבטחה Imunify360 + WAF',
    description:
      'חומת אש אפליקטיבית חכמה, סריקת נוזקות בזמן אמת, PHP Immunity וחסימת מתקפות Brute-Force ו-DDoS באופן אוטומטי וללא צורך בהגדרות.',
  },
  {
    num: '05.',
    icon: Layers,
    title: 'פאנל cPanel + WordPress Toolkit',
    description:
      'ממשק הניהול המוביל בעולם בעברית ובאנגלית: ניהול דומיינים, סביבת Staging בלחיצה, בחירת גרסת PHP (7.4 עד 8.4), וניהול עדכונים חכם.',
  },
  {
    num: '06.',
    icon: Rocket,
    title: 'העברת אתר חינם באפס השבתה',
    description:
      'עוברים מספק אחר? הצוות ההנדסי שלנו מעביר את האתר, מסדי הנתונים ותיבות המייל שלכם במלואם, בודק תקינות ורק אז מפנה את הדומיין.',
  },
]

const specRows = [
  { label: 'שטח דיסק NVMe SSD', values: ['25GB', '50GB', '100GB', '200GB'] },
  { label: 'זיכרון RAM ייעודי (DDR5)', values: ['4GB', '6GB', '12GB', '24GB'] },
  { label: 'ליבות מעבד (AMD EPYC vCPU)', values: ['2 ליבות', '4 ליבות', '6 ליבות', '8 ליבות'] },
  { label: 'כמות אתרים בחבילה', values: ['עד 3', 'עד 10', 'ללא הגבלה', 'ללא הגבלה'] },
  { label: 'קצב קריאה/כתיבה מובטח', values: ['250 MB/s', '500 MB/s', '1,000 MB/s', '2,000 MB/s'] },
  { label: 'מסדי נתונים ותיבות דוא״ל', values: ['ללא הגבלה', 'ללא הגבלה', 'ללא הגבלה', 'ללא הגבלה'] },
  { label: 'שרת ווב והאצת מטמון', values: ['LiteSpeed + Redis', 'LiteSpeed + Redis', 'LiteSpeed + Redis', 'LiteSpeed + Redis'] },
  { label: 'סביבת פיתוח (Staging)', values: ['כלול', 'כלול', 'כלול', 'כלול'] },
  { label: 'הגנת סייבר Imunify360 + WAF', values: ['כלול', 'כלול', 'כלול', 'כלול'] },
  { label: 'גיבוי יומי אוטומטי חיצוני', values: ['30 יום אחורה', '30 יום אחורה', '60 יום אחורה', '90 יום אחורה'] },
  { label: 'העברת אתר חינם ע״י מומחה', values: ['חינם', 'חינם', 'חינם', 'חינם'] },
]

const faqs = [
  {
    q: 'מה ההבדל בין אחסון אתרים רגיל לאחסון NVMe פרימיום?',
    a: 'אחסון NVMe פרימיום מבוסס על ארכיטקטורה היברידית המשלבת את נוחות הניהול של cPanel עם משאבים מובטחים של שרת VPS (עד 8 ליבות מעבד ו-24GB RAM לחשבון). בנוסף, כל המידע יושב על כונני 100% Enterprise NVMe בחיבור PCIe Gen4 המהירים פי 10 מכונני SSD רגילים.',
  },
  {
    q: 'האם אתם מבצעים העברת אתר בחינם מספק האחסון הנוכחי שלי?',
    a: 'כן, בהחלט! עם הרשמתכם לכל אחת מחבילות ה-NVMe, צוות המומחים של לב-טק טכנולוגיות יבצע עבורכם העברה מלאה של האתר, מסדי הנתונים ותיבות המייל ללא עלות וללא שום זמן השבתה (Zero Downtime).',
  },
  {
    q: 'האם ניתן לבחור בין שרת בישראל לשרת באירופה?',
    a: 'כן. בעת ההזמנה ניתן לבחור מיקום שרת בחוות השרתים שלנו בישראל (לזמן תגובה של פחות מ-10ms לגולשים מישראל) או בשרתים גלובליים באירופה (פרנקפורט/אמסטרדם) לקהל יעד בינלאומי.',
  },
  {
    q: 'האם החבילות מתאימות לאתרי אלמנטור כבדים וחנויות WooCommerce?',
    a: 'החבילות תוכננו במיוחד עבורם. בזכות נפח זיכרון RAM גבוה (החל מ-4GB ועד 24GB), PHP Memory Limit נדיב של עד 2048MB, ושרת LiteSpeed Enterprise עם Redis Object Cache – גם עריכה באלמנטור פרו וגם תהליך הרכישה בקופה עובדים במהירות שיא.',
  },
]

export function NvmeHostingPage({
  onNavigate,
  onOrderTier,
}: {
  onNavigate: (page: PageRoute, href?: string) => void
  onOrderTier: (tierName: string, price: number, cycle: BillingCycle, location: PlanLocation) => void
}) {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [preferredLocation, setPreferredLocation] = useState<PlanLocation>('il')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

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
            <span className="font-semibold text-cyan-300">אחסון NVMe מהיר (פרימיום)</span>
          </nav>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <Zap className="h-4 w-4" aria-hidden />
                <span>100% ENTERPRISE NVMe SSD · LITESPEED + REDIS</span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                אחסון NVMe מהיר ופרימיום –{' '}
                <span className="bg-gradient-to-l from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  עוצמה של שרת פרטי,
                </span>{' '}
                פשטות של אחסון מנוהל.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                חבילות האחסון ההיברידיות של {BRAND_NAME} משלבות כונני NVMe מהירים פי 10 מ-SSD רגיל,
                ליבות מעבד וזיכרון DDR5 ייעודיים לכל חשבון, פאנל cPanel מתקדם ומעטפת אבטחה
                פרואקטיבית – לאתרי וורדפרס וחנויות WooCommerce שלא מתפשרים על מהירות.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#nvme-plans"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:-translate-y-0.5 hover:shadow-cyan-400/40"
                >
                  לצפייה בחבילות ומחירים
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href="#nvme-specs"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-100 backdrop-blur transition-colors hover:bg-white/10"
                >
                  מפרט טכני מלא
                </a>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-7 sm:grid-cols-4">
                {[
                  { val: 'פי 10', label: 'מהיר מ-SSD רגיל' },
                  { val: '99.99%', label: 'זמינות שרתים SLA' },
                  { val: 'חינם', label: 'העברת אתר ו-SSL' },
                  { val: '24/7', label: 'תמיכה הנדסית בעברית' },
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

            {/* Live Benchmark Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">מבחן ביצועי קריאה/כתיבה</h2>
                  <p className="text-xs text-slate-400">השוואת קצב העברת נתונים בשרתי הייצור</p>
                </div>
                <Gauge className="h-6 w-6 text-cyan-300" aria-hidden />
              </div>

              <div className="mt-6 space-y-5">
                {speedComparison.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className={item.highlight ? 'font-bold text-white' : 'text-slate-300'}>
                        {item.label}
                      </span>
                      <span
                        dir="ltr"
                        className={`font-mono text-sm font-bold tabular-nums ${
                          item.highlight ? 'text-cyan-300' : 'text-slate-400'
                        }`}
                      >
                        {item.speed}
                      </span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percent}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          item.highlight
                            ? 'bg-gradient-to-l from-cyan-400 via-blue-500 to-violet-500'
                            : 'bg-slate-600'
                        }`}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                      <span>{item.highlight ? 'ארכיטקטורת PCIe 4.0 Enterprise' : 'טכנולוגיה קודמת'}</span>
                      <span dir="ltr" className="font-mono tabular-nums">
                        {item.iops}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 shrink-0 text-cyan-300" />
                  <span>מעבדי AMD EPYC דור אחרון</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>הגנת DDoS + WAF מובנית</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="nvme-plans" className="scroll-mt-24 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              בחרו את חבילת ה-NVMe המתאימה לאתר שלכם
            </h2>
            <p className="mt-3 text-base text-slate-300 sm:text-lg">
              כל החבילות כוללות הפעלה מיידית, פאנל cPanel, תעודת SSL חינם, גיבוי יומי והעברת אתר
              מלאה בחינם על ידי הצוות שלנו.
            </p>
          </div>

          {/* Controls: Billing Cycle + Server Location Selector */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            {/* Billing Toggle */}
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

            {/* Preferred Datacenter Location */}
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-1.5">
              <span className="px-3 text-xs font-semibold text-slate-400">חוות שרתים מועדפת:</span>
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
                <span>ישראל (ת״א / פ״ת)</span>
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
                <span>אירופה (פרנקפורט)</span>
              </button>
            </div>
          </div>

          {/* 4-Column Pricing Cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {nvmeTiers.map((tier) => {
              const price = getPrice(tier.monthlyPrice)
              return (
                <div
                  key={tier.id}
                  className={`relative flex flex-col justify-between rounded-3xl border p-6 text-white backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 ${
                    tier.highlighted
                      ? 'border-cyan-400/50 bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-blue-950/60 shadow-2xl shadow-cyan-500/15 ring-1 ring-cyan-400/30'
                      : 'border-white/10 bg-slate-900/60 hover:border-white/20'
                  }`}
                >
                  {tier.badge && (
                    <span className="-top-3.5 right-6 absolute inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-cyan-400 to-blue-600 px-3.5 py-1 text-xs font-bold text-white shadow-lg shadow-cyan-500/30">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      {tier.badge}
                    </span>
                  )}

                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-xl font-extrabold text-white">{tier.name}</h3>
                      <span className="font-mono text-xs font-semibold text-cyan-300/80">
                        {tier.nameEn}
                      </span>
                    </div>
                    <p className="mt-1.5 min-h-[2.5rem] text-xs leading-5 text-slate-400">
                      {tier.subtitle}
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
                          ? `בחיוב שנתי · חיסכון של ₪${(tier.monthlyPrice - price) * 12} בשנה`
                          : 'ללא התחייבות · הפעלה מיידית'}
                      </p>
                    </div>

                    {/* Key Hardware Specs Box */}
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                        <div className="text-[11px] text-slate-400">שטח אחסון</div>
                        <div className="mt-0.5 font-mono text-xs font-bold text-cyan-300" dir="ltr">
                          {tier.nvmeStorage}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                        <div className="text-[11px] text-slate-400">זיכרון ייעודי</div>
                        <div className="mt-0.5 font-mono text-xs font-bold text-white" dir="ltr">
                          {tier.ram}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                        <div className="text-[11px] text-slate-400">כוח עיבוד</div>
                        <div className="mt-0.5 text-xs font-bold text-white">{tier.cpuCores}</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                        <div className="text-[11px] text-slate-400">אתרים בחבילה</div>
                        <div className="mt-0.5 text-xs font-bold text-white">{tier.websites}</div>
                      </div>
                    </div>

                    {/* Server Locations with Israeli Flag SVG */}
                    <ServerLocationsRow locations={tier.locations} />

                    <ul className="mt-5 space-y-2 text-xs">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
                            <Check className="h-3 w-3" aria-hidden />
                          </span>
                          <span
                            className={
                              feat.includes('חינם') || feat.includes('NVMe')
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
                    onClick={() => onOrderTier(tier.name, price, cycle, preferredLocation)}
                    className={`mt-7 w-full cursor-pointer rounded-xl py-3 text-center text-sm font-bold transition-all hover:-translate-y-0.5 ${
                      tier.highlighted
                        ? 'bg-gradient-to-l from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50'
                        : 'border border-white/15 bg-white/5 text-white hover:border-cyan-400/40 hover:bg-white/10'
                    }`}
                  >
                    הזמן עכשיו
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6 Core Technology Pillars */}
      <section className="border-y border-white/10 bg-slate-950/60 py-16 backdrop-blur-md sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              הטכנולוגיה מאחורי אחסון ה-NVMe שלנו
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-300">
              בנינו תשתית שלא משאירה צווארי בקבוק: מחומרת שרתים ארגונית ועד האצת קוד ומטמון ברמת
              הקרנל.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {techPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-cyan-400/30"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-cyan-300 ring-1 ring-cyan-400/30">
                    <pillar.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-500">{pillar.num}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Spec Comparison Table */}
      <section id="nvme-specs" className="scroll-mt-24 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              השוואת מפרט טכני מלא בין החבילות
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              שקיפות מלאה על כל משאבי המערכת המוקצים לחשבון שלכם
            </p>
          </div>

          <div className="mt-10 overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <table className="w-full min-w-[680px] border-collapse text-right text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/60">
                  <th className="p-4 font-bold text-slate-300 sm:p-5">משאב / תכונה</th>
                  {nvmeTiers.map((t) => (
                    <th key={t.id} className="p-4 text-center sm:p-5">
                      <span className="block font-extrabold text-white">{t.name}</span>
                      <span className="mt-0.5 block font-mono text-xs text-cyan-300 tabular-nums">
                        ₪{getPrice(t.monthlyPrice)} / חודש
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {specRows.map((row) => (
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
          שאלות נפוצות על אחסון NVMe מהיר
        </h2>
        <div className="mt-8 space-y-3">
          {faqs.map((faq, idx) => {
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

        {/* Bottom CTA Banner */}
        <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-3xl border border-cyan-400/30 bg-gradient-to-l from-blue-950/80 via-slate-900/90 to-slate-900/90 p-8 text-center sm:flex-row sm:text-right">
          <div>
            <h3 className="text-xl font-extrabold text-white">
              צריכים ייעוץ בבחירת חבילת ה-NVMe או העברת אתר קיים?
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              צוות המהנדסים של {BRAND_NAME} זמין לבדיקת האתר שלכם והתאמת חבילה מדויקת ללא עלות.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOrderTier('ייעוץ והעברת אתר חינם', 129, cycle, preferredLocation)}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5"
          >
            <Headset className="h-4 w-4" aria-hidden />
            תיאום העברת אתר חינם
          </button>
        </div>
      </section>
    </div>
  )
}

export default NvmeHostingPage
