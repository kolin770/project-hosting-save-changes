import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  DatabaseBackup,
  Globe,
  Headset,
  Lock,
  Server,
  ShieldCheck,
  Terminal,
  Waypoints,
  X,
  Zap,
} from 'lucide-react'
import { BRAND_NAME, Navbar, type PageRoute } from '@/components/Navbar'
import { HeroSection, InfrastructureBackground } from '@/components/HeroSection'
import { PricingComparison } from '@/components/PricingComparison'
import { NvmeHostingPage } from '@/components/NvmeHostingPage'
import { WordpressHostingPage } from '@/components/WordpressHostingPage'
import { WoocommerceHostingPage } from '@/components/WoocommerceHostingPage'
import { DomainTransferPage } from '@/components/DomainTransferPage'
import { WhoisLookupPage } from '@/components/WhoisLookupPage'
import { InternalSystemsPage } from '@/components/InternalSystemsPage'
import {
  ClientPortalPage,
  GoogleAuthenticatorModal,
  type AuthenticatedUser,
  type TwoFactorChallenge,
} from '@/components/ClientAuth'
import { WhmcsCheckoutPage, type CartItem } from '@/components/WhmcsCheckoutPage'
import { GlobalEarthSvg, IsraelFlagSvg } from '@/components/LocationBadges'
import { monthlyPriceFor, type BillingCycle, type PlanLocation, type PricingPlan } from '@/data/pricing'

const infrastructurePillars = [
  {
    icon: Cpu,
    spec: 'AMD EPYC™ 9654 + NVMe Gen4',
    title: 'חומרת שרתים ארגונית בבידוד משאבים מלא',
    text: 'כל חשבון אחסון פועל בסביבת CloudLinux LVE מבודדת עם ליבות CPU וזיכרון DDR5 ECC מובטחים, על גבי מערכי Enterprise NVMe RAID-10.',
  },
  {
    icon: ShieldCheck,
    spec: 'Imunify360 AI + Anycast DDoS',
    title: 'אבטחת סייבר ו-WAF בשכבת הקצה',
    text: 'סינון מתקפות DDoS נפחיות בזמן אמת, חומת אש אפליקטיבית (ModSecurity WAF), סריקת נוזקות אוטומטית ואימות דו-שלבי (TOTP 2FA).',
  },
  {
    icon: Database,
    spec: 'PHP 8.3 · MySQL 8.0 · Python 3.12',
    title: 'תמיכה מלאה במערכות ליבה ואוטומציה',
    text: 'סביבת ריצה מותאמת למערכות וורדפרס ו-WooCommerce לצד אפליקציות PHP (PDO), מסדי נתונים MySQL/MariaDB, שירותי Python ו-Redis Object Cache.',
  },
  {
    icon: DatabaseBackup,
    spec: 'JetBackup Off-Site · 30 ימים אחורה',
    title: 'גיבוי יומי מוצפן מחוץ לחוות השרתים',
    text: 'גיבוי אוטומטי מלא של קבצים, מסדי נתונים ותיבות דוא״ל לשרתי אחסון נפרדים גיאוגרפית, עם שחזור עצמאי בלחיצה אחת מתוך פאנל הניהול.',
  },
]

const engineeringSpecs = [
  { label: 'מתקן אירוח ראשי', value: 'Tier-III פתח תקווה, ישראל' },
  { label: 'שדרת תקשורת', value: '2x40GbE Redundant BGP' },
  { label: 'שרת Web ומטמון', value: 'LiteSpeed Enterprise + LSCache' },
  { label: 'סביבות פיתוח', value: 'PHP 7.4–8.3 / Python 3.12 / Node.js' },
  { label: 'מסדי נתונים', value: 'MySQL 8.0 / MariaDB 10.11 / Redis 7' },
  { label: 'תקני אבטחה', value: 'ISO/IEC 27001 · PCI-DSS · GDPR' },
]

type OrderSelection = {
  title: string
  price: number
  cycle: BillingCycle
  location: PlanLocation
}

function resolveHashPage(hash: string): PageRoute {
  if (hash.startsWith('#nvme')) return 'nvme-hosting'
  if (hash.startsWith('#wordpress') || hash.startsWith('#wp-')) return 'wordpress-hosting'
  if (hash.startsWith('#woocommerce') || hash.startsWith('#woo-')) return 'woocommerce-hosting'
  if (hash.startsWith('#domains-transfer')) return 'domains-transfer'
  if (hash.startsWith('#domains-whois') || hash.startsWith('#whois')) return 'domains-whois'
  if (hash.startsWith('#secured-sandbox') || hash.startsWith('#sandbox')) return 'secured-sandbox'
  if (hash.startsWith('#client-portal')) return 'client-portal'
  if (hash.startsWith('#checkout') || hash.startsWith('#order')) return 'checkout'
  return 'home'
}

export default function App() {
  const [activePage, setActivePage] = useState<PageRoute>(() =>
    resolveHashPage(window.location.hash),
  )
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<TwoFactorChallenge | null>(null)
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'default_nvme_pro',
      title: 'אחסון NVMe פרימיום Pro · WHMCS Business',
      category: 'Enterprise NVMe Hosting · LiteSpeed + cPanel',
      priceMonthly: 69,
      cycle: 'monthly',
      location: 'il',
      ipAddress: '185.199.108.153 (IL Tier-III)',
      domain: 'lev-tech.net',
    },
  ])
  const [orderModal, setOrderModal] = useState<OrderSelection | null>(null)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerDomain, setCustomerDomain] = useState('')

  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash
      if (
        h.startsWith('#nvme') ||
        h.startsWith('#wordpress') ||
        h.startsWith('#woocommerce') ||
        h.startsWith('#domains-transfer') ||
        h.startsWith('#domains-whois') ||
        h.startsWith('#whois') ||
        h.startsWith('#secured-sandbox') ||
        h.startsWith('#sandbox') ||
        h.startsWith('#client-portal') ||
        h.startsWith('#checkout') ||
        h.startsWith('#order') ||
        h === '#home' ||
        h === ''
      ) {
        setActivePage(resolveHashPage(h))
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const handleNavigate = (page: PageRoute, href?: string) => {
    setActivePage(page)
    if (page === 'nvme-hosting') {
      window.history.pushState(null, '', '#nvme-hosting')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (page === 'wordpress-hosting') {
      window.history.pushState(null, '', '#wordpress-hosting')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (page === 'woocommerce-hosting') {
      window.history.pushState(null, '', '#woocommerce-hosting')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (page === 'domains-transfer') {
      window.history.pushState(null, '', '#domains-transfer')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (page === 'domains-whois') {
      window.history.pushState(null, '', '#domains-whois')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (page === 'secured-sandbox') {
      window.history.pushState(null, '', '#secured-sandbox')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (page === 'client-portal') {
      window.history.pushState(null, '', '#client-portal')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (page === 'checkout') {
      window.history.pushState(null, '', '#checkout')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.history.pushState(null, '', href || '#home')
      if (!href || href === '#home' || href === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setTimeout(() => {
          const el = document.querySelector(href)
          el?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      }
    }
  }

  const openOrderModal = (selection: OrderSelection) => {
    const newItem: CartItem = {
      id: `item_${Date.now()}`,
      title: selection.title,
      category: 'Managed Cloud & NVMe Infrastructure',
      priceMonthly: selection.price,
      cycle: selection.cycle,
      location: selection.location,
      ipAddress:
        selection.location === 'il'
          ? '185.199.108.153 (IL Tier-III)'
          : '185.199.109.153 (EU Tier-III)',
      domain: 'lev-tech.net',
    }
    setCartItems([newItem])
    handleNavigate('checkout', '#checkout')
  }

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim() || !customerPhone.trim()) return
    setOrderSubmitted(true)
  }

  return (
    <div className="relative min-h-screen text-slate-100">
      <InfrastructureBackground />
      <Navbar
        activePage={activePage}
        authenticatedUser={authenticatedUser}
        cartCount={cartItems.length}
        onNavigate={handleNavigate}
        onTrigger2FA={(challenge) => setTwoFactorChallenge(challenge)}
      />

      <main>
        {activePage === 'nvme-hosting' ? (
          <NvmeHostingPage
            onNavigate={handleNavigate}
            onOrderTier={(tierName, price, cycle, location) =>
              openOrderModal({ title: tierName, price, cycle, location })
            }
          />
        ) : activePage === 'wordpress-hosting' ? (
          <WordpressHostingPage
            onNavigate={handleNavigate}
            onOrderTier={(tierName, price, cycle, location) =>
              openOrderModal({ title: tierName, price, cycle, location })
            }
          />
        ) : activePage === 'woocommerce-hosting' ? (
          <WoocommerceHostingPage
            onNavigate={handleNavigate}
            onOrderTier={(tierName, price, cycle, location) =>
              openOrderModal({ title: tierName, price, cycle, location })
            }
          />
        ) : activePage === 'domains-transfer' ? (
          <DomainTransferPage
            onNavigate={handleNavigate}
            onOrderTransfer={(title, price, cycle, location) =>
              openOrderModal({ title, price, cycle, location })
            }
          />
        ) : activePage === 'domains-whois' ? (
          <WhoisLookupPage
            onNavigate={handleNavigate}
            onOrderDomain={(title, price, cycle, location) =>
              openOrderModal({ title, price, cycle, location })
            }
          />
        ) : activePage === 'secured-sandbox' ? (
          <InternalSystemsPage onNavigate={handleNavigate} />
        ) : activePage === 'client-portal' ? (
          <ClientPortalPage
            authenticatedUser={authenticatedUser}
            onNavigate={handleNavigate}
            onSuccessChallenge={(challenge) => setTwoFactorChallenge(challenge)}
            onVerifiedUser={(user) => setAuthenticatedUser(user)}
            onLogout={() => setAuthenticatedUser(null)}
          />
        ) : activePage === 'checkout' ? (
          <WhmcsCheckoutPage
            items={cartItems}
            authenticatedUser={authenticatedUser}
            onUpdateItems={setCartItems}
            onNavigate={handleNavigate}
            onSuccessChallenge={(challenge) => setTwoFactorChallenge(challenge)}
            onOrderCompleted={(orderData) => {
              if (!authenticatedUser) {
                setAuthenticatedUser({
                  username: orderData.customerEmail,
                  displayName: orderData.customerName,
                  plan: orderData.items[0]?.title || 'אחסון NVMe פרימיום Pro',
                  activeServices: orderData.items.length,
                  activeDomains: 1,
                  openTickets: 0,
                })
              }
            }}
          />
        ) : (
          <>
            <HeroSection onNavigate={handleNavigate} />

            {/* Pricing Section */}
            <section id="pricing" className="relative scroll-mt-24 py-16 lg:py-24">
              <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                  <p
                    dir="ltr"
                    className="font-mono text-xs font-bold tracking-widest text-cyan-300 uppercase"
                  >
                    ENTERPRISE NVME HOSTING · LITESPEED + REDIS
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                    חבילות אחסון מנוהל בביצועי קצה
                  </h2>
                  <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
                    תשתית שרתים ייעודית בישראל ובאירופה עם דיסקי 100% NVMe, משאבים מובטחים, הגנת
                    WAF ותמיכה הנדסית אנושית. בחרו את החבילה המתאימה להיקף הפעילות שלכם.
                  </p>
                </div>

                <div className="mt-12 lg:mt-14">
                  <PricingComparison
                    onSelectPlan={(plan: PricingPlan, cycle: BillingCycle) =>
                      openOrderModal({
                        title: `חבילת ${plan.title} (${plan.titleEn})`,
                        price: monthlyPriceFor(plan, cycle),
                        cycle,
                        location: 'il',
                      })
                    }
                  />
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/75 px-6 py-4 backdrop-blur lg:flex-row">
                  <p className="text-sm text-slate-300">
                    כל המחירים בשקלים חדשים ואינם כוללים מע״מ · העברת אתר מלאה בחינם על ידי צוות
                    המהנדסים שלנו
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleNavigate('nvme-hosting')}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-cyan-300 transition-colors hover:text-white"
                    >
                      אחסון NVMe מהיר
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                    </button>
                    <span className="text-white/20" aria-hidden>
                      |
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNavigate('woocommerce-hosting')}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-cyan-300 transition-colors hover:text-white"
                    >
                      אחסון WooCommerce מתקדם
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                    </button>
                    <span className="text-white/20" aria-hidden>
                      |
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNavigate('wordpress-hosting')}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-cyan-300 transition-colors hover:text-white"
                    >
                      אחסון מנוהל לוורדפרס
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Engineering Architecture & Spec Matrix Section */}
            <section className="border-t border-white/10 bg-slate-950/75 py-16 backdrop-blur-md sm:py-24">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-end">
                  <div>
                    <p
                      dir="ltr"
                      className="font-mono text-xs font-bold tracking-widest text-cyan-300 uppercase"
                    >
                      DATACENTER & SYSTEM ARCHITECTURE
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-4xl">
                      סטנדרט הנדסי לארגונים, מפתחים וחנויות מסחר
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigate('nvme-hosting', '#nvme-hosting')}
                    className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-xs font-bold text-cyan-200 transition-colors hover:bg-cyan-500/20 hover:text-white lg:self-auto"
                  >
                    <Server className="h-4 w-4 text-cyan-300" />
                    <span>למפרט הטכני המלא של שרתי ה-NVMe</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>

                {/* Hardware & Stack Spec Bar */}
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {engineeringSpecs.map((spec) => (
                    <div
                      key={spec.label}
                      className="rounded-xl border border-white/10 bg-slate-900/70 p-4"
                    >
                      <div className="text-xs text-slate-400">{spec.label}</div>
                      <div className="mt-1.5 font-mono text-xs font-bold text-white" dir="ltr">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 4 Detailed Engineering Pillars */}
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                  {infrastructurePillars.map((item) => (
                    <div
                      key={item.title}
                      className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition-colors hover:border-cyan-400/30 sm:p-7"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-500/10 text-cyan-300">
                            <item.icon className="h-5 w-5" aria-hidden />
                          </span>
                          <span
                            dir="ltr"
                            className="rounded border border-white/10 bg-slate-950 px-2.5 py-1 font-mono text-[11px] font-semibold text-cyan-300"
                          >
                            {item.spec}
                          </span>
                        </div>
                        <h3 className="mt-5 text-lg font-extrabold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Google Authenticator 2FA Popup Modal */}
      <GoogleAuthenticatorModal
        challenge={twoFactorChallenge}
        onClose={() => setTwoFactorChallenge(null)}
        onVerified={(user) => {
          setTwoFactorChallenge(null)
          setAuthenticatedUser(user)
          handleNavigate('client-portal', '#client-portal')
        }}
      />

      {/* Interactive Order / Quick Provision Modal */}
      {orderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-slate-950 p-6 text-white shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setOrderModal(null)}
              aria-label="סגירה"
              className="absolute left-5 top-5 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {orderSubmitted ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                <h3 className="mt-4 text-xl font-extrabold text-white">הבקשה התקבלה בהצלחה!</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  נציג הנדסי מ<strong>{BRAND_NAME}</strong> יחזור אליך בהקדם להשלמת הקמת השרת והעברת
                  האתר בחינם.
                </p>
                <button
                  type="button"
                  onClick={() => setOrderModal(null)}
                  className="mt-6 w-full cursor-pointer rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 py-3 text-sm font-bold text-white"
                >
                  סגירה
                </button>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-cyan-300">{BRAND_NAME} · הזמנת שירות</span>
                  <h3 className="mt-1 text-xl font-extrabold text-white">{orderModal.title}</h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-300">
                    <span className="font-mono text-base font-bold text-white tabular-nums">
                      ₪{orderModal.price} / חודש
                    </span>
                    <span>·</span>
                    <span>{orderModal.cycle === 'annual' ? 'חיוב שנתי (20% הנחה)' : 'חיוב חודשי'}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      {orderModal.location === 'il' ? (
                        <>
                          <IsraelFlagSvg className="h-3 w-4" />
                          ישראל
                        </>
                      ) : (
                        <>
                          <GlobalEarthSvg className="h-3.5 w-3.5" />
                          גלובלי
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">שם מלא / חברה *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ישראל ישראלי"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">טלפון ליצירת קשר *</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="050-0000000"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-right text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">
                    דומיין קיים להעברה חינם (אופציונלי)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={customerDomain}
                    onChange={(e) => setCustomerDomain(e.target.value)}
                    placeholder="example.co.il"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-left text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full cursor-pointer rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-400/40"
                >
                  המשך להקמת החבילה
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Multi-Column Enterprise Footer */}
      <footer className="border-t border-white/10 bg-slate-950/95 text-slate-400 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
            {/* Brand & Datacenter Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-white">
                  <Waypoints className="h-5 w-5" />
                </span>
                <span className="text-lg font-extrabold text-white">{BRAND_NAME}</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                ספקית תשתיות אחסון NVMe, שרתי ענן מנוהלים, רישום דומיינים ופיתוח מערכות ליבה
                ארגוניות. חוות שרתים תקניות בישראל ובאירופה בניטור NOC 24/7.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-slate-300">
                  <IsraelFlagSvg className="h-3 w-4" />
                  <span>Tier-III פתח תקווה</span>
                </span>
                <span className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 font-mono text-cyan-300">
                  ISO/IEC 27001
                </span>
                <span className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 font-mono text-emerald-300">
                  SLA 99.99%
                </span>
              </div>
            </div>

            {/* Column 1: Hosting */}
            <div>
              <h3 className="text-xs font-extrabold tracking-wider text-white uppercase">
                פתרונות אחסון ושרתים
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('nvme-hosting', '#nvme-hosting')}
                    className="cursor-pointer transition-colors hover:text-cyan-300"
                  >
                    אחסון NVMe מהיר (Prime)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('wordpress-hosting', '#wordpress-hosting')}
                    className="cursor-pointer transition-colors hover:text-cyan-300"
                  >
                    אחסון מנוהל לוורדפרס
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('woocommerce-hosting', '#woocommerce-hosting')}
                    className="cursor-pointer transition-colors hover:text-cyan-300"
                  >
                    אחסון WooCommerce מתקדם
                  </button>
                </li>
                <li>
                  <a href="#pricing" className="transition-colors hover:text-cyan-300">
                    השוואת חבילות ומחירון
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Domains & Security */}
            <div>
              <h3 className="text-xs font-extrabold tracking-wider text-white uppercase">
                דומיינים ואבטחת מידע
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('domains-whois', '#domains-whois')}
                    className="cursor-pointer transition-colors hover:text-cyan-300"
                  >
                    בדיקת זמינות ונתוני WHOIS
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('domains-transfer', '#domains-transfer')}
                    className="cursor-pointer transition-colors hover:text-cyan-300"
                  >
                    העברת דומיינים (ללא השבתה)
                  </button>
                </li>
                <li>
                  <span className="text-slate-400">שרתי VPN ארגוניים (OpenVPN / WireGuard)</span>
                </li>
                <li>
                  <span className="text-slate-400">תעודות הצפנה SSL (DV / OV / Wildcard)</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Client Portal & Support (Strictly Public Links Only) */}
            <div>
              <h3 className="text-xs font-extrabold tracking-wider text-white uppercase">
                פורטל לקוחות ותמיכה
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('client-portal', '#client-portal')}
                    className="cursor-pointer font-semibold text-cyan-300 transition-colors hover:text-white"
                  >
                    כניסה לאזור לקוחות (WHMCS 2FA)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('checkout', '#checkout')}
                    className="cursor-pointer font-semibold text-slate-300 transition-colors hover:text-cyan-300"
                  >
                    עמוד תשלום והשלמת הזמנה (Checkout)
                  </button>
                </li>
                <li>
                  <a href="#open-ticket" className="transition-colors hover:text-cyan-300">
                    פתיחת קריאת שירות למוקד NOC
                  </a>
                </li>
                <li className="pt-1 font-mono text-xs text-slate-400" dir="ltr">
                  NOC: support@lev-tech.co.il
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
            <div>
              © {new Date().getFullYear()} {BRAND_NAME} בע״מ · כל הזכויות שמורות · תשתית אירוח
              ושרתים מנוהלים
            </div>
            <div className="flex items-center gap-4 font-mono" dir="ltr">
              <span>X-CSRF-TOKEN PROTECTED</span>
              <span>·</span>
              <span>RFC 6238 TOTP 2FA</span>
              <span>·</span>
              <span>CLOUDFLARE TURNSTILE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
