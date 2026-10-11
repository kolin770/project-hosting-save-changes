import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Edit3,
  FileText,
  Globe,
  Hash,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Phone,
  Server,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { BRAND_NAME, type PageRoute } from '@/components/Navbar'
import { GlobalEarthSvg, IsraelFlagSvg } from '@/components/LocationBadges'
import type { BillingCycle, PlanLocation } from '@/data/pricing'
import type { AuthenticatedUser, TwoFactorChallenge } from '@/components/ClientAuth'
import { ClientLoginForm } from '@/components/ClientAuth'

export type CartItem = {
  id: string
  title: string
  category: string
  priceMonthly: number
  cycle: BillingCycle
  location: PlanLocation
  ipAddress: string
  domain?: string
}

type AgreementKey = 'eula' | 'sla' | 'whmcs'

const AGREEMENTS: Record<
  AgreementKey,
  { title: string; titleEn: string; clauses: string[] }
> = {
  eula: {
    title: 'הסכם רישיון משתמש קצה (EULA)',
    titleEn: 'End User License Agreement',
    clauses: [
      'השימוש בתשתיות האחסון, שרתי ה-NVMe ורישיונות התוכנה של לב-טק טכנולוגיות כפוף לחוקי מדינת ישראל ולתקני אבטחת מידע בינלאומיים (ISO/IEC 27001).',
      'חל איסור מוחלט על הרצת סקריפטים זדוניים, הפצת דואר זבל (Spam), פישינג או אחסון תוכן המפר זכויות יוצרים על גבי שרתי החברה.',
      'כל חשבון פועל בסביבת CloudLinux LVE מבודדת; ניסיון לעקוף מגבלות משאבים או לבצע סריקת פורטים ברשת הפנימית יוביל להשעיה אוטומטית של השירות.',
    ],
  },
  sla: {
    title: 'הסכם תמיכה טכנית ורמת שירות (SLA)',
    titleEn: 'Technical Support Agreement',
    clauses: [
      'לב-טק טכנולוגיות מתחייבת לזמינות רשת וחשמל בשיעור של 99.99% (Uptime SLA) בחוות השרתים בפתח תקווה (Tier-III) ובאירופה.',
      'מוקד ה-NOC וצוות ההנדסה זמינים 24/7/365 לטיפול בתקלות תשתית קריטיות, שחזור מגיבויי JetBackup וניטור מתקפות DDoS / WAF.',
      'זמן תגובה מובטח לפניית תמיכה דחופה בפורטל הלקוחות: עד 15 דקות.',
    ],
  },
  whmcs: {
    title: 'הסכם שירותי אחסון וחיוב אוטומטי (WHMCS)',
    titleEn: 'WHMCS Service Agreement',
    clauses: [
      'הודעה על חידוש אוטומטי: השירות מתחדש אוטומטית בסוף כל תקופת חיוב (חודשית או שנתית) באמצעות אמצעי התשלום השמור במערכת WHMCS, אלא אם בוצע ביטול מראש.',
      'ניתן לבטל חידוש אוטומטי או לשדרג/לשנמך חבילה בכל עת בלחיצת כפתור מתוך אזור הלקוחות (Client Area -> השירותים שלי).',
      'חשבונית מס/קבלה חתומה דיגיטלית מופקת ונשלחת אוטומטית לכתובת הדוא״ל מיד עם השלמת העסקה.',
    ],
  },
}

const CATALOG_PRESETS: Omit<CartItem, 'id'>[] = [
  {
    title: 'אחסון NVMe פרימיום Pro (cPanel + LiteSpeed)',
    category: 'Enterprise NVMe Hosting',
    priceMonthly: 69,
    cycle: 'annual',
    location: 'il',
    ipAddress: '185.199.108.153 (IL Tier-III)',
    domain: 'lev-tech.net',
  },
  {
    title: 'אחסון WooCommerce מסחרי מנוהל + Redis Pro',
    category: 'Managed E-Commerce Cloud',
    priceMonthly: 119,
    cycle: 'annual',
    location: 'il',
    ipAddress: 'Dedicated IPv4 · פתח תקווה',
    domain: 'shop.lev-tech.net',
  },
  {
    title: 'אחסון וורדפרס מנוהל Startup NVMe',
    category: 'Managed WordPress Hosting',
    priceMonthly: 39,
    cycle: 'monthly',
    location: 'il',
    ipAddress: 'Shared Anycast IPv4 (IL)',
    domain: '',
  },
  {
    title: 'רישיון WHMCS Business + אוטומציית לקוחות',
    category: 'WHMCS Billing & Automation',
    priceMonthly: 149,
    cycle: 'monthly',
    location: 'global',
    ipAddress: 'Dedicated License IP',
    domain: 'portal.lev-tech.net',
  },
]

function SectionDividerHeader({ titleHe, titleEn }: { titleHe: string; titleEn: string }) {
  return (
    <div className="my-8 flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/35 to-cyan-400/50" />
      <div className="text-center">
        <span className="block text-sm font-extrabold tracking-wide text-cyan-300 sm:text-base">
          {titleHe}
        </span>
        <span dir="ltr" className="block font-mono text-[11px] font-semibold text-slate-400">
          {titleEn}
        </span>
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-cyan-400/35 to-cyan-400/50" />
    </div>
  )
}

export function WhmcsCheckoutPage({
  items,
  authenticatedUser,
  onUpdateItems,
  onNavigate,
  onSuccessChallenge,
  onOrderCompleted,
}: {
  items: CartItem[]
  authenticatedUser: AuthenticatedUser | null
  onUpdateItems: (items: CartItem[]) => void
  onNavigate: (page: PageRoute, href?: string) => void
  onSuccessChallenge: (challenge: TwoFactorChallenge) => void
  onOrderCompleted?: (orderData: {
    orderNumber: string
    invoiceNumber: string
    items: CartItem[]
    totalPaid: number
    customerEmail: string
    customerName: string
  }) => void
}) {
  const [step, setStep] = useState<'configure' | 'checkout'>('checkout')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [showPromoInput, setShowPromoInput] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(
    null,
  )
  const [promoError, setPromoError] = useState<string | null>(null)
  const [showInlineLogin, setShowInlineLogin] = useState(false)

  // Personal Information state
  const [firstName, setFirstName] = useState(
    authenticatedUser?.displayName.split(' ')[0] || '',
  )
  const [lastName, setLastName] = useState(
    authenticatedUser?.displayName.split(' ').slice(1).join(' ') || '',
  )
  const [email, setEmail] = useState(authenticatedUser?.username || '')
  const [phonePrefix, setPhonePrefix] = useState('+972')
  const [phoneNumber, setPhoneNumber] = useState('')

  // Billing Address state
  const [companyName, setCompanyName] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [streetAddress2, setStreetAddress2] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('מרכז / תל אביב')
  const [postcode, setPostcode] = useState('')
  const [country, setCountry] = useState('Israel (ישראל)')
  const [taxId, setTaxId] = useState('')

  // Terms & Payment state
  const [activeAgreement, setActiveAgreement] = useState<AgreementKey | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal'>('credit_card')
  const [cardMode, setCardMode] = useState<'new' | 'saved'>('new')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardHolderName, setCardHolderName] = useState('')
  const [cardHolderId, setCardHolderId] = useState('')

  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<{
    orderNumber: string
    invoiceNumber: string
    totalPaid: number
    dueDate: string
  } | null>(null)

  // Calculate next due date (1 month or 1 year from today)
  const getNextDueDateString = (cycle: BillingCycle) => {
    const d = new Date()
    if (cycle === 'annual') {
      d.setFullYear(d.getFullYear() + 1)
    } else {
      d.setMonth(d.getMonth() + 1)
    }
    return d.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getItemDueToday = (item: CartItem) => {
    return item.cycle === 'annual' ? item.priceMonthly * 12 : item.priceMonthly
  }

  const subTotal = items.reduce((acc, item) => acc + getItemDueToday(item), 0)
  const discountAmount = appliedPromo
    ? Math.round(subTotal * (appliedPromo.discountPercent / 100))
    : 0
  const totalDueToday = Math.max(0, subTotal - discountAmount)

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    setPromoError(null)
    const clean = promoCode.trim().toUpperCase()
    if (!clean) return
    if (clean === 'LEVTECH20' || clean === 'VIP20') {
      setAppliedPromo({ code: clean, discountPercent: 20 })
      setShowPromoInput(false)
    } else if (clean === 'WHMCS10' || clean === 'WELCOME10') {
      setAppliedPromo({ code: clean, discountPercent: 10 })
      setShowPromoInput(false)
    } else {
      setPromoError('קוד קופון לא תקין. נסה: LEVTECH20 (20% הנחה) או WHMCS10 (10% הנחה)')
    }
  }

  const handleRemoveItem = (id: string) => {
    onUpdateItems(items.filter((i) => i.id !== id))
  }

  const handleEmptyCart = () => {
    onUpdateItems([])
  }

  const handleAddPresetItem = (preset: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...preset,
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    }
    onUpdateItems([...items, newItem])
  }

  const handleToggleItemCycle = (id: string) => {
    onUpdateItems(
      items.map((item) =>
        item.id === id
          ? { ...item, cycle: item.cycle === 'annual' ? 'monthly' : 'annual' }
          : item,
      ),
    )
  }

  const handleToggleItemLocation = (id: string) => {
    onUpdateItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              location: item.location === 'il' ? 'global' : 'il',
              ipAddress:
                item.location === 'il'
                  ? '185.199.109.153 (EU Frankfurt)'
                  : '185.199.108.153 (IL Tier-III)',
            }
          : item,
      ),
    )
  }

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (items.length === 0) {
      setFormError('סל ההזמנות שלך ריק. אנא הוסף חבילת אחסון או שירות להמשך.')
      return
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim()) {
      setFormError('נא למלא את כל שדות החובה תחת פרטים אישיים (שם פרטי, שם משפחה, דוא״ל וטלפון).')
      return
    }
    if (!streetAddress.trim() || !city.trim()) {
      setFormError('נא להזין כתובת רחוב ועיר לצורך הפקת חשבונית מס כחוק.')
      return
    }
    if (!agreedToTerms) {
      setFormError('חובה לקרוא ולאשר את תנאי השימוש והסכם השירות (EULA & WHMCS Agreement) לפני ביצוע התשלום.')
      return
    }
    if (paymentMethod === 'credit_card' && cardMode === 'new') {
      if (cardNumber.replace(/\D/g, '').length < 12 || !cardExpiry.trim() || !cardCvv.trim()) {
        setFormError('נא להזין פרטי כרטיס אשראי תקינים (מספר כרטיס, תוקף ו-CVV).')
        return
      }
    }

    setSubmitting(true)
    setTimeout(() => {
      const orderNum = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
      const invNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      setSubmitting(false)
      setCompletedOrder({
        orderNumber: orderNum,
        invoiceNumber: invNum,
        totalPaid: totalDueToday,
        dueDate: getNextDueDateString(items[0]?.cycle || 'monthly'),
      })
      onOrderCompleted?.({
        orderNumber: orderNum,
        invoiceNumber: invNum,
        items,
        totalPaid: totalDueToday,
        customerEmail: email.trim(),
        customerName: `${firstName.trim()} ${lastName.trim()}`,
      })
    }, 900)
  }

  if (completedOrder) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="overflow-hidden rounded-3xl border border-emerald-400/30 bg-slate-950/90 p-8 text-center shadow-2xl backdrop-blur-2xl sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <p dir="ltr" className="mt-4 font-mono text-xs font-bold tracking-widest text-emerald-300 uppercase">
            WHMCS AUTO-PROVISIONING COMPLETED · {completedOrder.orderNumber}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
            ההזמנה הושלמה והשרת שלך בהקמה אוטומטית!
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300">
            תודה רבה, <strong>{firstName} {lastName}</strong>. מערכת ה-WHMCS של <strong>{BRAND_NAME}</strong> הפיקה עבורך חשבונית מס ({completedOrder.invoiceNumber}) ושלחה את פרטי הגישה לכתובת <span className="font-mono text-cyan-300">{email}</span>.
          </p>

          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-slate-900/75 p-5 text-right sm:grid-cols-3">
            <div>
              <span className="text-xs text-slate-400">מספר הזמנה (WHMCS)</span>
              <div className="mt-1 font-mono text-sm font-extrabold text-white" dir="ltr">
                {completedOrder.orderNumber}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400">מספר חשבונית מס</span>
              <div className="mt-1 font-mono text-sm font-extrabold text-cyan-300" dir="ltr">
                {completedOrder.invoiceNumber}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400">סה״כ שולם היום</span>
              <div className="mt-1 font-mono text-sm font-extrabold text-emerald-300 tabular-nums" dir="ltr">
                ₪{completedOrder.totalPaid.toLocaleString()} ILS
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('client-portal', '#client-portal')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/30 transition-all hover:-translate-y-0.5"
            >
              <Server className="h-4 w-4" />
              <span>מעבר לאזור הלקוחות וניהול השרת (WHMCS Portal)</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home', '#home')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-bold text-slate-200 transition-colors hover:bg-white/10"
            >
              <span>חזרה לדף הבית</span>
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative pb-24">
      {/* Top Step Progress Header Bar (Matches Screenshot: 1 CONFIGURE --- 2 CHECKOUT) */}
      <div className="border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-4 px-4 py-5 sm:gap-8">
          <button
            type="button"
            onClick={() => setStep('configure')}
            className={`group flex cursor-pointer items-center gap-2.5 text-xs font-extrabold tracking-wider uppercase transition-colors sm:text-sm ${
              step === 'configure' ? 'text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border font-mono text-xs font-extrabold transition-all ${
                step === 'configure'
                  ? 'border-cyan-400 bg-cyan-400/20 text-cyan-200 shadow-sm shadow-cyan-500/30'
                  : 'border-slate-600 bg-slate-900 text-slate-400'
              }`}
            >
              1
            </span>
            <div className="text-right">
              <span dir="ltr" className="block font-mono text-[11px]">
                CONFIGURE
              </span>
              <span className="block text-[11px] font-semibold">הגדרת תצורה</span>
            </div>
          </button>

          <div className="h-px w-12 bg-gradient-to-l from-cyan-400/50 to-slate-700 sm:w-20" />

          <button
            type="button"
            onClick={() => setStep('checkout')}
            className={`group flex cursor-pointer items-center gap-2.5 text-xs font-extrabold tracking-wider uppercase transition-colors sm:text-sm ${
              step === 'checkout' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border font-mono text-xs font-extrabold transition-all ${
                step === 'checkout'
                  ? 'border-amber-400 bg-amber-400/20 text-amber-300 shadow-sm shadow-amber-500/30'
                  : 'border-slate-600 bg-slate-900 text-slate-400'
              }`}
            >
              2
            </span>
            <div className="text-right">
              <span dir="ltr" className="block font-mono text-[11px]">
                CHECKOUT
              </span>
              <span className="block text-[11px] font-semibold">סיכום ותשלום</span>
            </div>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* Main Title Bar */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              dir="ltr"
              className="font-mono text-xs font-bold tracking-widest text-cyan-300 uppercase"
            >
              LEV-TECH WHMCS BILLING & PROVISIONING
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Checkout · השלמת הזמנה ותשלום
            </h1>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('client-portal', '#client-portal')}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-cyan-300 transition-colors hover:text-white"
          >
            <span>מעבר לאזור לקוחות (WHMCS Client Area)</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Step 1: Configure Add-ons / Quick Catalog Selector if user clicked Step 1 */}
        {step === 'configure' && (
          <div className="mt-8 rounded-2xl border border-cyan-400/30 bg-slate-900/80 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  שלב 1: הגדרת שירותים והוספת חבילות לסל ההזמנה
                </h2>
                <p className="text-xs text-slate-400">
                  בחר או הוסף שירותי אחסון NVMe, חבילות וורדפרס או רישיונות WHMCS לסל שלך לפני המעבר לתשלום:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-4 py-2.5 text-xs font-extrabold text-white"
              >
                <span>המשך לשלב 2 (Checkout)</span>
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CATALOG_PRESETS.map((preset) => (
                <div
                  key={preset.title}
                  className="flex flex-col justify-between rounded-xl border border-white/10 bg-slate-950/80 p-4"
                >
                  <div>
                    <span className="font-mono text-[11px] font-bold text-cyan-300">
                      {preset.category}
                    </span>
                    <h3 className="mt-1 text-sm font-extrabold text-white">{preset.title}</h3>
                    <p className="mt-1 font-mono text-xs text-slate-400" dir="ltr">
                      IP: {preset.ipAddress}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="font-mono text-sm font-extrabold text-white tabular-nums">
                      ₪{preset.priceMonthly} / חודש
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleAddPresetItem(preset)
                        setStep('checkout')
                      }}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/25 hover:text-white"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>הוסף להזמנה</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== ORDER SUMMARY ==================== */}
        <SectionDividerHeader titleHe="סיכום הזמנה" titleEn="Order Summary" />

        <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-950/90 shadow-2xl">
          {/* Dark Table Header (Matches screenshot dark navy header bar) */}
          <div className="hidden grid-cols-[2.2fr_1fr_1.2fr_1fr_1.1fr] items-center bg-slate-900 px-6 py-3.5 text-xs font-extrabold tracking-wide text-slate-200 uppercase md:grid">
            <div>סוג מוצר / שירות (Product Type)</div>
            <div>מחזור חיוב (Billing Cycle)</div>
            <div>כתובת IP / שרת (IP Address)</div>
            <div>מחיר חידוש (Recurring)</div>
            <div className="text-left">לתשלום היום (Due Today)</div>
          </div>

          {/* Items Rows */}
          {items.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <ShoppingCart className="mx-auto h-10 w-10 text-slate-500" />
              <p className="mt-3 text-sm font-bold text-slate-300">
                סל ההזמנות שלך ריק כעת.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                בחר חבילת אחסון מהקטלוג או לחץ למטה להוספת חבילה לדוגמה.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAddPresetItem(CATALOG_PRESETS[0])}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-4 py-2.5 text-xs font-extrabold text-white"
                >
                  <span>+ הוסף חבילת אחסון NVMe פרימיום</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('nvme-hosting', '#nvme-hosting')}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10"
                >
                  <span>חזרה לקטלוג החבילות</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {items.map((item) => {
                const dueToday = getItemDueToday(item)
                const isEditing = editingItemId === item.id
                return (
                  <div key={item.id} className="px-6 py-5 transition-colors hover:bg-white/[0.02]">
                    <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[2.2fr_1fr_1.2fr_1fr_1.1fr]">
                      {/* Product Type + Edit & Remove Actions */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-extrabold text-white">{item.title}</span>
                          <button
                            type="button"
                            onClick={() => setEditingItemId(isEditing ? null : item.id)}
                            className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-cyan-300 transition-colors hover:text-white"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit / עריכה</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            title="הסר פריט"
                            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span>{item.category}</span>
                          {item.domain && (
                            <>
                              <span>·</span>
                              <span dir="ltr" className="font-mono text-cyan-300">
                                {item.domain}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Billing Cycle */}
                      <div className="text-sm text-slate-200">
                        <span className="md:hidden text-xs text-slate-400">מחזור חיוב: </span>
                        <span className="font-semibold">
                          {item.cycle === 'annual' ? 'Annual (שנתי)' : 'Monthly (חודשי)'}
                        </span>
                      </div>

                      {/* IP Address / Location */}
                      <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300" dir="ltr">
                        {item.location === 'il' ? (
                          <IsraelFlagSvg className="h-3.5 w-4 shrink-0" />
                        ) : (
                          <GlobalEarthSvg className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate">{item.ipAddress || '-'}</span>
                      </div>

                      {/* Recurring Price */}
                      <div className="font-mono text-sm font-bold text-slate-200 tabular-nums" dir="ltr">
                        ₪{item.priceMonthly.toFixed(2)} ILS / mo
                      </div>

                      {/* Due Today + Next Due Date */}
                      <div className="md:text-left" dir="ltr">
                        <div className="font-mono text-base font-extrabold text-white tabular-nums">
                          ₪{dueToday.toFixed(2)} ILS
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Next Due Date: {getNextDueDateString(item.cycle)}
                        </div>
                      </div>
                    </div>

                    {/* Inline Quick Edit Drawer when "Edit / עריכה" is clicked */}
                    {isEditing && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-cyan-400/30 bg-slate-900/90 p-4 text-xs">
                        <div className="flex flex-wrap items-center gap-4">
                          <div>
                            <span className="block text-slate-400">מחזור חיוב:</span>
                            <button
                              type="button"
                              onClick={() => handleToggleItemCycle(item.id)}
                              className="mt-1 cursor-pointer rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 font-bold text-cyan-300 hover:border-cyan-400"
                            >
                              החלף ל-{item.cycle === 'annual' ? 'חיוב חודשי (Monthly)' : 'חיוב שנתי (Annual)'}
                            </button>
                          </div>

                          <div>
                            <span className="block text-slate-400">מיקום שרת (Data Center):</span>
                            <button
                              type="button"
                              onClick={() => handleToggleItemLocation(item.id)}
                              className="mt-1 cursor-pointer rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 font-bold text-cyan-300 hover:border-cyan-400"
                            >
                              החלף ל-{item.location === 'il' ? 'אירופה (Frankfurt Tier-III)' : 'ישראל (פתח תקווה Tier-III)'}
                            </button>
                          </div>

                          <div>
                            <span className="block text-slate-400">דומיין משויך:</span>
                            <input
                              type="text"
                              dir="ltr"
                              value={item.domain || ''}
                              onChange={(e) =>
                                onUpdateItems(
                                  items.map((it) =>
                                    it.id === item.id ? { ...it, domain: e.target.value } : it,
                                  ),
                                )
                              }
                              placeholder="yourdomain.co.il"
                              className="mt-1 rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 font-mono text-white focus:border-cyan-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditingItemId(null)}
                          className="cursor-pointer rounded-lg bg-cyan-500/20 px-3.5 py-1.5 font-bold text-cyan-200 hover:bg-cyan-500/30"
                        >
                          שמור שינויים
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Action Footer Bar inside Order Summary Table (Continue Shopping | Empty Cart) */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-slate-900/60 px-6 py-3.5 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setStep('configure')}
                className="inline-flex cursor-pointer items-center gap-1.5 font-bold text-cyan-300 transition-colors hover:text-white"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>Continue Shopping · הוספת שירות נוסף</span>
              </button>
              <span className="text-white/20">|</span>
              <button
                type="button"
                onClick={() => onNavigate('nvme-hosting', '#nvme-hosting')}
                className="cursor-pointer font-semibold text-slate-300 transition-colors hover:text-cyan-300"
              >
                צפייה בכל חבילות ה-NVMe
              </button>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={handleEmptyCart}
                className="inline-flex cursor-pointer items-center gap-1.5 font-bold text-slate-400 transition-colors hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Empty Cart · ריקון סל</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub Total & Total Due Today Box (Aligned like the screenshot) */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-slate-950/90 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-sm">
              <span className="font-semibold text-slate-300">Sub Total (סכום ביניים):</span>
              <span className="font-mono font-bold text-white tabular-nums" dir="ltr">
                ₪{subTotal.toFixed(2)} ILS
              </span>
            </div>

            {appliedPromo && (
              <div className="flex items-center justify-between border-b border-white/10 py-2.5 text-xs text-emerald-300">
                <span>
                  קופון פעיל ({appliedPromo.code} · {appliedPromo.discountPercent}%-):
                </span>
                <span className="font-mono font-bold tabular-nums" dir="ltr">
                  -₪{discountAmount.toFixed(2)} ILS
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3.5">
              <span className="text-base font-extrabold text-white">
                Total Due Today (לתשלום כעת):
              </span>
              <span className="font-mono text-xl font-extrabold text-cyan-300 tabular-nums" dir="ltr">
                ₪{totalDueToday.toFixed(2)} ILS
              </span>
            </div>

            <div className="mt-2 text-left">
              <button
                type="button"
                onClick={() => setShowPromoInput((v) => !v)}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-cyan-300 hover:text-white"
              >
                <Tag className="h-3 w-3" />
                <span>Got a promo code? · יש לך קוד קופון?</span>
              </button>
            </div>

            {showPromoInput && (
              <form onSubmit={handleApplyPromo} className="mt-3 space-y-2 border-t border-white/10 pt-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="LEVTECH20"
                    className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-1.5 font-mono text-xs text-white uppercase placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 cursor-pointer rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-cyan-400"
                  >
                    החל
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-rose-300">{promoError}</p>}
              </form>
            )}
          </div>
        </div>

        {/* Prominent Centered Account Button (Matches "Login or Create a Webpros Account" in screenshot) */}
        <div className="mt-8 text-center">
          {authenticatedUser ? (
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-xs font-bold text-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>
                מחובר לחשבון WHMCS פעיל: <strong>{authenticatedUser.displayName}</strong> ({authenticatedUser.username})
              </span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowInlineLogin((v) => !v)}
                className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-gradient-to-l from-violet-600 via-indigo-600 to-cyan-500 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-cyan-400/40"
              >
                <Sparkles className="h-4 w-4" />
                <span>התחבר לחשבון קיים או צור חשבון Lev-Tech WHMCS</span>
              </button>
              <p className="mt-2.5 text-xs text-slate-400">
                או המשך למילוי פרטי החשבון למטה להקמה אוטומטית של כרטיס לקוח חדש (כולל אימות 2FA)
              </p>
            </>
          )}
        </div>

        {/* Expandable Inline WHMCS Login Box (with Forgot Password support) */}
        <AnimatePresence>
          {showInlineLogin && !authenticatedUser && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-auto mt-6 max-w-lg overflow-hidden"
            >
              <div className="rounded-2xl border border-cyan-400/30 bg-slate-950 p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      התחברות מהירה ללקוחות רשומים (WHMCS Login)
                    </h3>
                    <p className="text-xs text-slate-400">
                      כולל שחזור סיסמה (&quot;שכחת סיסמה?&quot;) ואימות דו-שלבי Google Authenticator
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInlineLogin(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <ClientLoginForm onSuccessChallenge={onSuccessChallenge} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== MAIN CHECKOUT FORM ==================== */}
        <form onSubmit={handleCompleteOrder} className="mt-4">
          {formError && (
            <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200">
              {formError}
            </div>
          )}

          {/* 1. PERSONAL INFORMATION */}
          <SectionDividerHeader titleHe="פרטים אישיים" titleEn="Personal Information" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* First Name */}
            <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-950/90 focus-within:border-cyan-400">
              <span className="flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.03] text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="שם פרטי (First Name) *"
                className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Last Name */}
            <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-950/90 focus-within:border-cyan-400">
              <span className="flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.03] text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="שם משפחה (Last Name) *"
                className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Email Address */}
            <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-950/90 focus-within:border-cyan-400">
              <span className="flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.03] text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address (כתובת דוא״ל) *"
                className="w-full bg-transparent px-3.5 py-3 text-right text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Phone Number with Country Flag Prefix */}
            <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-950/90 focus-within:border-cyan-400">
              <div className="flex shrink-0 items-center gap-1.5 border-l border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-slate-200" dir="ltr">
                <IsraelFlagSvg className="h-3.5 w-4" />
                <select
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                  aria-label="קידומת מדינה"
                  className="bg-transparent font-mono text-xs text-white focus:outline-none"
                >
                  <option value="+972" className="bg-slate-900">+972</option>
                  <option value="+1" className="bg-slate-900">+1</option>
                  <option value="+44" className="bg-slate-900">+44</option>
                </select>
              </div>
              <input
                type="tel"
                required
                dir="ltr"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number (טלפון נייד) *"
                className="w-full bg-transparent px-3.5 py-3 text-right text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. BILLING ADDRESS */}
          <SectionDividerHeader titleHe="כתובת לחיוב וחשבונית מס" titleEn="Billing Address" />

          <div className="space-y-4">
            {/* Company Name (Optional) */}
            <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-950/90 focus-within:border-cyan-400">
              <span className="flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.03] text-slate-400">
                <Building2 className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="שם חברה / עוסק (אופציונלי) · Company Name (Optional)"
                className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Street Address */}
            <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-950/90 focus-within:border-cyan-400">
              <span className="flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.03] text-slate-400">
                <Building2 className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="כתובת רחוב ומספר בית * · Street Address"
                className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Street Address 2 */}
            <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-950/90 focus-within:border-cyan-400">
              <span className="flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.03] text-slate-400">
                <MapPin className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={streetAddress2}
                onChange={(e) => setStreetAddress2(e.target.value)}
                placeholder="כניסה, קומה, דירה / ת.ד. (אופציונלי) · Street Address 2"
                className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* 3-Column Row: City | Region/State | Postcode */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-950/90 focus-within:border-cyan-400">
                <span className="flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.03] text-slate-400">
                  <Building2 className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="עיר (City) *"
                  className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-950/90 focus-within:border-cyan-400">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  aria-label="מחוז / אזור"
                  className="w-full bg-transparent px-3.5 py-3 text-sm text-white focus:outline-none"
                >
                  <option value="מרכז / תל אביב" className="bg-slate-900">מרכז / גוש דן</option>
                  <option value="ירושלים והסביבה" className="bg-slate-900">ירושלים והסביבה</option>
                  <option value="חיפה והצפון" className="bg-slate-900">חיפה והצפון</option>
                  <option value="השרון" className="bg-slate-900">השרון</option>
                  <option value="דרום / באר שבע" className="bg-slate-900">דרום / באר שבע</option>
                  <option value="International" className="bg-slate-900">International / אחר</option>
                </select>
              </div>

              <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-950/90 focus-within:border-cyan-400">
                <span className="flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.03] text-slate-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  dir="ltr"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="מיקוד (Postcode)"
                  className="w-full bg-transparent px-3.5 py-3 text-right text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Country */}
            <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-950/90 focus-within:border-cyan-400">
              <span className="flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.03] text-slate-400">
                <Globe className="h-4 w-4" />
              </span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                aria-label="מדינה"
                className="w-full bg-transparent px-3.5 py-3 text-sm text-white focus:outline-none"
              >
                <option value="Israel (ישראל)" className="bg-slate-900">Israel (ישראל)</option>
                <option value="United States" className="bg-slate-900">United States</option>
                <option value="United Kingdom" className="bg-slate-900">United Kingdom</option>
                <option value="Germany / EU" className="bg-slate-900">Germany / European Union</option>
              </select>
            </div>

            {/* Tax ID (Optional) */}
            <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-950/90 focus-within:border-cyan-400">
              <span className="flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.03] text-slate-400">
                <Hash className="h-4 w-4" />
              </span>
              <input
                type="text"
                dir="ltr"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="ח.פ. / מספר עוסק מורשה (אופציונלי) · Tax ID (Optional)"
                className="w-full bg-transparent px-3.5 py-3 text-right text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 3. ACCOUNT SECURITY */}
          <SectionDividerHeader titleHe="אבטחת חשבון" titleEn="Account Security" />

          <div className="mx-auto max-w-2xl rounded-xl border border-amber-400/35 bg-amber-500/10 px-5 py-4 text-center shadow-lg">
            <p className="text-xs font-bold leading-6 text-amber-200 sm:text-sm">
              ההזמנה שלך תעובד באופן אוטומטי ויישלח אליך דוא״ל להשלמת הגדרת חשבון הניהול ואימות דו-שלבי (2FA).
            </p>
            <p dir="ltr" className="mt-0.5 font-mono text-[11px] text-amber-300/80">
              Your order will be processed and an email sent to you to finish account management setup.
            </p>
          </div>

          {/* 4. TERMS & CONDITIONS */}
          <SectionDividerHeader titleHe="תנאי שימוש והסכמים" titleEn="Terms & Conditions" />

          <div className="rounded-2xl border border-white/15 bg-slate-950/90 p-6 shadow-xl">
            <p className="text-xs font-extrabold text-white sm:text-sm">
              הודעה על חידוש אוטומטי (Notice of Automatic Renewal): שירות החיוב האוטומטי שלנו מחייב את אמצעי התשלום השמור במערכת לפני פקיעת תקופת המנוי, למניעת השבתת שרתים או אובדן דומיין.
            </p>
            <p className="mt-2.5 text-xs leading-6 text-slate-300">
              אם סיכום ההזמנה שלך כולל תקופת ניסיון או מחזור חיוב מתחדש, תוכל לבטל את המנוי בכל עת לפני מועד החיוב הבא מתוך פורטל הלקוחות של <strong>{BRAND_NAME}</strong> (התחברות ל-WHMCS Client Area &larr; השירותים שלי &larr; ביטול חידוש).
            </p>

            {/* 3 Agreement Buttons (Exact match to screenshot: End User License Agreement | Technical Support Agreement | WHMCS Agreement) */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              {(Object.keys(AGREEMENTS) as AgreementKey[]).map((key) => {
                const ag = AGREEMENTS[key]
                const isSelected = activeAgreement === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveAgreement(isSelected ? null : key)}
                    className={`cursor-pointer rounded-lg border px-3.5 py-2 text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-sm shadow-cyan-500/20'
                        : 'border-white/25 bg-slate-900 text-slate-200 hover:border-cyan-400/50 hover:text-white'
                    }`}
                  >
                    <span>{ag.title}</span>
                    <span dir="ltr" className="mr-1.5 font-mono text-[10px] text-cyan-300">
                      ({ag.titleEn})
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Expandable Agreement Reader Box */}
            <AnimatePresence>
              {activeAgreement && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-4 rounded-xl border border-cyan-400/30 bg-slate-900 p-4 text-xs text-slate-200"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-extrabold text-cyan-300">
                      {AGREEMENTS[activeAgreement].title} — {AGREEMENTS[activeAgreement].titleEn}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveAgreement(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <ul className="mt-2.5 list-disc space-y-1.5 pr-4 leading-6 text-slate-300">
                    {AGREEMENTS[activeAgreement].clauses.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Agreement Checkbox */}
            <label className="mt-5 flex cursor-pointer items-start gap-3 select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
              />
              <span className="text-xs leading-5 text-slate-300">
                קראתי, הבנתי ואני מסכים לתנאי השימוש, להסכם רמת השירות (SLA) ולהסכם רישיון המשתמש (EULA).
                <span dir="ltr" className="block font-mono text-[11px] text-slate-400">
                  I have read, understood and agree to the terms and conditions of this Agreement and the EULA.
                </span>
              </span>
            </label>
          </div>

          {/* 5. PAYMENT DETAILS */}
          <SectionDividerHeader titleHe="פרטי תשלום" titleEn="Payment Details" />

          <div className="text-xs text-slate-400">
            בחר את אמצעי התשלום המועדף עליך (Please choose your preferred method of payment):
          </div>

          {/* Radio Selectors: Credit Card | PayPal */}
          <div className="mt-5 flex items-center justify-center gap-8">
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-bold text-white select-none">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'credit_card'}
                onChange={() => setPaymentMethod('credit_card')}
                className="h-4 w-4 border-white/30 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
              />
              <CreditCard className="h-4 w-4 text-cyan-300" />
              <span>כרטיס אשראי (Credit Card)</span>
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-bold text-white select-none">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'paypal'}
                onChange={() => setPaymentMethod('paypal')}
                className="h-4 w-4 border-white/30 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
              />
              <Globe className="h-4 w-4 text-blue-400" />
              <span>PayPal</span>
            </label>
          </div>

          {/* Payment Box */}
          <div className="mt-6 rounded-2xl border border-white/15 bg-slate-950/90 p-6 shadow-2xl">
            {paymentMethod === 'credit_card' ? (
              <div className="space-y-5">
                <label className="inline-flex cursor-pointer items-center gap-2.5 text-xs font-extrabold text-cyan-300">
                  <input
                    type="radio"
                    checked={cardMode === 'new'}
                    onChange={() => setCardMode('new')}
                    className="h-4 w-4 border-white/30 bg-slate-900 text-cyan-500"
                  />
                  <span>הזן פרטי כרטיס אשראי חדש למטה (Enter New Card Information Below)</span>
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-slate-300">
                      מספר כרטיס אשראי (Card Number) *
                    </label>
                    <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-slate-900 focus-within:border-cyan-400">
                      <span className="flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-white/[0.03] text-cyan-300">
                        <CreditCard className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        dir="ltr"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4580 •••• •••• ••••"
                        className="w-full bg-transparent px-3.5 py-3 font-mono text-sm text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-300">
                      תוקף הכרטיס (MM/YY) *
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="08/29"
                      className="w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-3 font-mono text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-300">
                      קוד אבטחה בגב הכרטיס (CVV / CVC) *
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      className="w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-3 font-mono text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-300">
                      שם בעל הכרטיס (Cardholder Name)
                    </label>
                    <input
                      type="text"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value)}
                      placeholder="ישראל ישראלי"
                      className="w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-300">
                      ת.ז. בעל הכרטיס / ח.פ. (ID Number)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={cardHolderId}
                      onChange={(e) => setCardHolderId(e.target.value)}
                      placeholder="000000000"
                      className="w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-3 font-mono text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm font-bold text-white">
                  תשלום מהיר ומאובטח באמצעות חשבון ה-PayPal שלך
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  לאחר הלחיצה על &quot;השלם הזמנה&quot;, תועבר לאישור העסקה המאובטח ב-PayPal והשרת יוקם מיידית.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row">
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <Lock className="h-4 w-4 shrink-0" />
                <span>סליקה מוצפנת בתקן PCI-DSS Level 1 · TLS 1.3 · 256-Bit SSL</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-cyan-500/30 transition-all hover:-translate-y-0.5 hover:shadow-cyan-400/50 disabled:opacity-60 sm:w-auto"
              >
                <ShieldCheck className="h-5 w-5" />
                <span>
                  {submitting
                    ? 'מעבד תשלום ומקים שרת ב-WHMCS...'
                    : `השלם הזמנה ותשלום (₪${totalDueToday.toFixed(2)})`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
