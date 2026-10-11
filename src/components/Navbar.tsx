import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowLeftRight,
  Asterisk,
  BadgeCheck,
  ChevronDown,
  Cloud,
  DatabaseBackup,
  Globe,
  Headset,
  KeyRound,
  LogIn,
  Menu,
  SearchCheck,
  Server,
  ServerCog,
  ShieldCheck,
  ShoppingCart,
  Waypoints,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import {
  ClientLoginForm,
  type AuthenticatedUser,
  type TwoFactorChallenge,
} from '@/components/ClientAuth'

export const BRAND_NAME = 'לב-טק טכנולוגיות'

export type PageRoute =
  | 'home'
  | 'nvme-hosting'
  | 'wordpress-hosting'
  | 'woocommerce-hosting'
  | 'domains-transfer'
  | 'domains-whois'
  | 'secured-sandbox'
  | 'client-portal'

type NavChild = {
  label: string
  description: string
  href: string
  page?: PageRoute
  targetBlank?: boolean
  badge?: string
  icon: LucideIcon
  logoUrl?: string
}

type NavItem = {
  label: string
  href: string
  page?: PageRoute
  /** One-line teaser shown in the mega menu's side column. */
  blurb?: string
  children?: NavChild[]
}

const OPENVPN_LOGO_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREWMAzTufmEprWwUnfI6bbCc0D4JaqaoYBS65A1_PJgg&s=10'
const WIREGUARD_LOGO_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpaZmhJvhqPGCHFwA5WIPb1F82PgH54x3uQePfPwk-9Q&s=10'
const WORDPRESS_LOGO_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5jxBavTal0A1gCTnimxifwD10gSRyObm8rNrnsA7nsQ&s'
const WOOCOMMERCE_LOGO_URL =
  'https://logos-world.net/wp-content/uploads/2025/04/WooCommerce-Logo.png'

const navItems: NavItem[] = [
  { label: 'דף הבית', href: '#home', page: 'home' },
  {
    label: 'אחסון אתרים',
    href: '#nvme-hosting',
    page: 'nvme-hosting',
    blurb: 'שרתי LiteSpeed Enterprise על דיסקי 100% NVMe בישראל ובעולם, מנוהלים 24/7 על ידי הצוות שלנו.',
    children: [
      {
        label: 'אחסון NVMe מהיר',
        description: 'אחסון פרימיום היברידי מהיר פי 10 מ-SSD רגיל, עם משאבים מובטחים',
        href: '#nvme-hosting',
        page: 'nvme-hosting',
        badge: 'פרימיום',
        icon: Zap,
      },
      {
        label: 'אחסון WooCommerce מתקדם',
        description: 'משאבים ייעודיים, Redis ו-LSCache לחנויות אונליין עם תנועה גבוהה',
        href: '#woocommerce-hosting',
        page: 'woocommerce-hosting',
        badge: 'חנויות מסחר',
        icon: ShoppingCart,
        logoUrl: WOOCOMMERCE_LOGO_URL,
      },
      {
        label: 'אחסון מנוהל לוורדפרס',
        description: 'עדכונים אוטומטיים, אבטחת Imunify360 ו-Staging – אנחנו מטפלים בהכול',
        href: '#wordpress-hosting',
        page: 'wordpress-hosting',
        badge: 'מנוהל',
        icon: Server,
        logoUrl: WORDPRESS_LOGO_URL,
      },
    ],
  },
  {
    label: 'דומיינים',
    href: '#domains',
    blurb: 'מאות סיומות, כולל ‎.co.il ו-‎.com, עם ניהול DNS מתקדם והגנת פרטיות.',
    children: [
      {
        label: 'רישום דומיין חדש',
        description: 'שריון השם של העסק שלכם בכמה שניות',
        href: '#domains-register',
        icon: Globe,
      },
      {
        label: 'העברת דומיינים',
        description: 'מעבר חלק מכל רשם, בלי זמן השבתה ומדריך העברה מלא',
        href: '#domains-transfer',
        page: 'domains-transfer',
        targetBlank: true,
        badge: 'ללא השבתה',
        icon: ArrowLeftRight,
      },
      {
        label: 'בדיקת זמינות Whois',
        description: 'בדיקה מיידית של זמינות ובעלות על דומיין בזמן אמת',
        href: '#domains-whois',
        page: 'domains-whois',
        targetBlank: true,
        badge: 'LIVE WHOIS',
        icon: SearchCheck,
      },
    ],
  },
  {
    label: 'שירותי מומחה',
    href: '#experts',
    blurb: 'מהנדסי תשתית ואבטחה שמתכננים, מקימים ומנטרים את הסביבה שלכם מסביב לשעון.',
    children: [
      {
        label: 'פתרונות ענן מותאמים',
        description: 'ארכיטקטורה גמישה שגדלה יחד עם העסק',
        href: '#experts-cloud',
        icon: Cloud,
      },
      {
        label: 'אבטחת מידע וסייבר',
        description: 'חומות אש, WAF וניטור איומים רציף',
        href: '#experts-security',
        icon: ShieldCheck,
      },
      {
        label: 'גיבוי ארגוני אוטומטי',
        description: 'גיבויים מוצפנים מחוץ לאתר עם שחזור מהיר',
        href: '#experts-backup',
        icon: DatabaseBackup,
      },
    ],
  },
  {
    label: 'תעודות SSL',
    href: '#ssl',
    blurb: 'הצפנה ברמה בנקאית ואמון מיידי של הגולשים ומנועי החיפוש.',
    children: [
      {
        label: 'תעודות DV / OV / EV',
        description: 'אימות דומיין או ארגון, לפי רמת האמון הנדרשת',
        href: '#ssl-validation',
        icon: BadgeCheck,
      },
      {
        label: 'תעודות Wildcard',
        description: 'תעודה אחת לכל תתי-הדומיינים',
        href: '#ssl-wildcard',
        icon: Asterisk,
      },
    ],
  },
  {
    label: 'שרתי VPN',
    href: '#vpn',
    blurb: 'גישה מרוחקת מוצפנת לצוותים וארגונים על גבי פרוטוקולי האבטחה המובילים בעולם.',
    children: [
      {
        label: 'שרת VPN עסקי מאובטח - OPENVPN',
        description: 'חיבור ארגוני מוצפן לעובדים מכל מקום עם ניהול הרשאות מלא',
        href: '#vpn-openvpn',
        icon: KeyRound,
        logoUrl: OPENVPN_LOGO_URL,
      },
      {
        label: 'שרת VPN עסקי מאובטח - WIREGUARD',
        description: 'דור העתיד של הצפנת רשת – מהירות קצה, שיהוי אפסי ואבטחה מודרנית',
        href: '#vpn-wireguard',
        icon: ShieldCheck,
        logoUrl: WIREGUARD_LOGO_URL,
      },
      {
        label: 'שרתים פרטיים ייעודיים',
        description: 'חומרה ייעודית עם כתובת IP קבועה ורוחב פס מובטח',
        href: '#vpn-dedicated',
        icon: ServerCog,
      },
    ],
  },
]

const CLIENT_PORTAL_URL = '#client-portal'
const OPEN_TICKET_URL = '#open-ticket'

function ChildIcon({
  child,
  size = 'desktop',
}: {
  child: NavChild
  size?: 'desktop' | 'mobile'
}) {
  const [imgError, setImgError] = useState(false)

  if (child.logoUrl && !imgError) {
    const boxSize = size === 'desktop' ? 'h-11 w-11 p-1.5' : 'h-8 w-8 p-1'
    return (
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white shadow-md shadow-black/25 transition-transform duration-200 group-hover:scale-105 ${boxSize}`}
      >
        <img
          src={child.logoUrl}
          alt={child.label}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-contain"
        />
      </span>
    )
  }

  if (size === 'mobile') {
    return (
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
        <child.icon className="h-4 w-4" aria-hidden />
      </span>
    )
  }

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 transition-colors group-hover:border-cyan-300/50 group-hover:bg-cyan-400/15 group-hover:text-cyan-200">
      <child.icon className="h-5 w-5" aria-hidden />
    </span>
  )
}

function Logo({ onNavigate }: { onNavigate?: (page: PageRoute, href?: string) => void }) {
  return (
    <a
      href="#home"
      onClick={(e) => {
        if (onNavigate) {
          e.preventDefault()
          onNavigate('home', '#home')
        }
      }}
      className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap"
      aria-label={`${BRAND_NAME} – דף הבית`}
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/30 transition-transform duration-200 group-hover:scale-105">
        <Waypoints className="h-5 w-5" aria-hidden />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30" />
      </span>
      <span className="text-xl font-extrabold tracking-tight text-white">{BRAND_NAME}</span>
    </a>
  )
}

function MegaMenu({
  item,
  open,
  activePage,
  onOpen,
  onClose,
  onNavigate,
}: {
  item: NavItem
  open: boolean
  activePage?: PageRoute
  onOpen: () => void
  onClose: () => void
  onNavigate?: (page: PageRoute, href?: string) => void
}) {
  const children = item.children ?? []
  const wide = children.length > 2
  const isSectionActive =
    item.children?.some((c) => c.page && c.page === activePage && c.page !== 'home') ?? false

  const handleChildClick = (e: React.MouseEvent, child: NavChild) => {
    onClose()
    if (onNavigate && child.page) {
      if (!child.targetBlank) {
        e.preventDefault()
      }
      onNavigate(child.page, child.href)
    }
  }

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => (open ? onClose() : onOpen())}
        className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-[15px] font-semibold transition-all ${
          open || isSectionActive
            ? 'bg-white/10 text-white shadow-xs ring-1 ring-white/15'
            : 'text-slate-200 hover:bg-white/[0.06] hover:text-white'
        }`}
      >
        {item.label}
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180 text-cyan-300' : ''
          }`}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-1/2 top-full z-50 translate-x-1/2 pt-3"
          >
            <div
              className={`grid overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 shadow-2xl shadow-black/70 ring-1 ring-cyan-500/10 backdrop-blur-2xl ${
                wide ? 'w-[42rem] grid-cols-[1fr_13.5rem]' : 'w-[36rem] grid-cols-[1fr_12.5rem]'
              }`}
            >
              <div className="space-y-1.5 p-3.5">
                {children.map((child) => (
                  <a
                    key={child.label}
                    href={child.href}
                    target={child.targetBlank ? '_blank' : undefined}
                    rel={child.targetBlank ? 'noopener noreferrer' : undefined}
                    onClick={(e) => handleChildClick(e, child)}
                    className="group flex items-start gap-3.5 rounded-xl border border-transparent p-3 transition-all hover:border-white/10 hover:bg-white/[0.06]"
                  >
                    <ChildIcon child={child} size="desktop" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-bold text-white transition-colors group-hover:text-cyan-200">
                          {child.label}
                        </span>
                        {child.badge && (
                          <span className="rounded-md bg-cyan-400/15 px-2 py-0.5 text-[11px] font-bold text-cyan-300 ring-1 ring-cyan-400/30">
                            {child.badge}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-sm leading-5 text-slate-400 group-hover:text-slate-300">
                        {child.description}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
              <div className="relative flex flex-col justify-between border-r border-white/10 bg-gradient-to-b from-blue-600/20 via-cyan-600/10 to-slate-900/60 p-5">
                <div>
                  <p className="text-xs font-bold tracking-wider text-cyan-300">
                    {item.label}
                  </p>
                  <p className="mt-2.5 text-sm leading-6 text-slate-300">{item.blurb}</p>
                </div>
                <a
                  href={item.href}
                  onClick={(e) => {
                    onClose()
                    if (onNavigate && item.page) {
                      e.preventDefault()
                      onNavigate(item.page, item.href)
                    }
                  }}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-cyan-300 transition-colors hover:text-white"
                >
                  לכל השירותים
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileDrawer({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean
  onClose: () => void
  onNavigate?: (page: PageRoute, href?: string) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="תפריט ניווט"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm flex-col border-l border-white/10 bg-slate-950/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <Logo
                onNavigate={(p, h) => {
                  onClose()
                  onNavigate?.(p, h)
                }}
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="סגירת תפריט"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav aria-label="ניווט ראשי – נייד" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label}>
                    <button
                      type="button"
                      aria-expanded={expanded === item.label}
                      onClick={() => setExpanded((v) => (v === item.label ? null : item.label))}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-base font-semibold text-slate-100 hover:bg-white/5"
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-5 w-5 text-slate-400 transition-transform ${
                          expanded === item.label ? 'rotate-180 text-cyan-300' : ''
                        }`}
                        aria-hidden
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {expanded === item.label && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mb-2 mr-3 space-y-1 border-r border-cyan-400/20 pr-2">
                            {item.children.map((child) => (
                              <a
                                key={child.label}
                                href={child.href}
                                target={child.targetBlank ? '_blank' : undefined}
                                rel={child.targetBlank ? 'noopener noreferrer' : undefined}
                                onClick={(e) => {
                                  onClose()
                                  if (onNavigate && child.page) {
                                    if (!child.targetBlank) {
                                      e.preventDefault()
                                    }
                                    onNavigate(child.page, child.href)
                                  }
                                }}
                                className="group flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5"
                              >
                                <ChildIcon child={child} size="mobile" />
                                <span>
                                  <span className="block text-[15px] font-semibold text-slate-100">
                                    {child.label}
                                  </span>
                                  <span className="block text-xs text-slate-400">
                                    {child.description}
                                  </span>
                                </span>
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      onClose()
                      if (onNavigate && item.page) {
                        e.preventDefault()
                        onNavigate(item.page, item.href)
                      }
                    }}
                    className="block rounded-xl px-3 py-3 text-base font-semibold text-slate-100 hover:bg-white/5"
                  >
                    {item.label}
                  </a>
                ),
              )}
            </nav>

            <div className="space-y-3 border-t border-white/10 p-5">
              <a
                href={CLIENT_PORTAL_URL}
                onClick={(e) => {
                  onClose()
                  if (onNavigate) {
                    e.preventDefault()
                    onNavigate('client-portal', '#client-portal')
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-cyan-500/25"
              >
                <LogIn className="h-4 w-4" aria-hidden />
                אזור לקוחות / התחברות
              </a>
              <a
                href={OPEN_TICKET_URL}
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5"
              >
                <Headset className="h-4 w-4" aria-hidden />
                פתיחת פניה לתמיכה
              </a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export function Navbar({
  activePage = 'home',
  authenticatedUser,
  onNavigate,
  onTrigger2FA,
}: {
  activePage?: PageRoute
  authenticatedUser?: AuthenticatedUser | null
  onNavigate?: (page: PageRoute, href?: string) => void
  onTrigger2FA?: (challenge: TwoFactorChallenge) => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the open mega menu or login dropdown on Escape or a click outside the navbar.
  useEffect(() => {
    if (!activeMenu && !loginDropdownOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setActiveMenu(null)
        setLoginDropdownOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null)
        setLoginDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [activeMenu, loginDropdownOpen])

  const openMenu = (label: string) => {
    clearTimeout(closeTimer.current)
    setLoginDropdownOpen(false)
    setActiveMenu(label)
  }
  const scheduleClose = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setActiveMenu(null), 130)
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-slate-950/85 shadow-lg shadow-black/30 backdrop-blur-xl'
          : 'border-b border-white/5 bg-slate-950/40 backdrop-blur-md'
      }`}
    >
      <nav
        ref={navRef}
        aria-label="ניווט ראשי"
        className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6 lg:px-8"
      >
        <Logo onNavigate={onNavigate} />

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) =>
            item.children ? (
              <MegaMenu
                key={item.label}
                item={item}
                open={activeMenu === item.label}
                activePage={activePage}
                onOpen={() => openMenu(item.label)}
                onClose={scheduleClose}
                onNavigate={onNavigate}
              />
            ) : (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (onNavigate && item.page) {
                    e.preventDefault()
                    onNavigate(item.page, item.href)
                  }
                }}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-[15px] font-semibold transition-all ${
                  activePage === item.page
                    ? 'bg-white/10 text-white ring-1 ring-white/15'
                    : 'text-slate-200 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ),
          )}
        </div>

        <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
          <a
            href={OPEN_TICKET_URL}
            aria-label="פתיחת פניה לתמיכה"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <Headset className="h-5 w-5" aria-hidden />
          </a>

          <div className="relative">
            <button
              type="button"
              aria-expanded={loginDropdownOpen}
              aria-haspopup="dialog"
              onClick={() => {
                setActiveMenu(null)
                if (authenticatedUser && onNavigate) {
                  onNavigate('client-portal', '#client-portal')
                } else {
                  setLoginDropdownOpen((v) => !v)
                }
              }}
              className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden whitespace-nowrap rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-400/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/40"
            >
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              <LogIn className="relative h-4 w-4" aria-hidden />
              <span className="relative">
                {authenticatedUser
                  ? `אזור אישי (${authenticatedUser.displayName})`
                  : 'אזור לקוחות / התחברות'}
              </span>
              <ChevronDown
                className={`relative h-4 w-4 transition-transform duration-200 ${
                  loginDropdownOpen ? 'rotate-180' : ''
                }`}
                aria-hidden
              />
            </button>

            <AnimatePresence>
              {loginDropdownOpen && !authenticatedUser && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute left-0 top-full z-50 mt-3 w-[24rem]"
                >
                  <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 p-5 shadow-2xl shadow-black/80 ring-1 ring-cyan-500/15 backdrop-blur-2xl">
                    <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[11px] font-bold text-cyan-300">
                          {BRAND_NAME} · פורטל לקוחות
                        </span>
                        <h3 className="text-base font-extrabold text-white">
                          התחברות לאזור האישי
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLoginDropdownOpen(false)}
                        aria-label="סגור חלון התחברות"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <ClientLoginForm
                      compact
                      onSuccessChallenge={(challenge) => {
                        setLoginDropdownOpen(false)
                        onTrigger2FA?.(challenge)
                      }}
                      onOpenFullPage={() => {
                        setLoginDropdownOpen(false)
                        onNavigate?.('client-portal', '#client-portal')
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-200 hover:bg-white/10 lg:hidden"
          aria-label="פתיחת תפריט"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      <MobileDrawer open={mobileOpen} onClose={closeMobile} onNavigate={onNavigate} />
    </header>
  )
}

export default Navbar
