// Pricing data for the shared/managed hosting line.
// Plans are listed in DOM order. The page is RTL, so the first plan renders on
// the right, Professional (highlighted) in the centre and Enterprise on the left.

export type BillingCycle = 'monthly' | 'annual'

/** Discount applied to the annual cycle, shown on the billing toggle. */
export const ANNUAL_DISCOUNT = 0.2

export type PlanMetric = {
  label: string
  value: string
  /** 0–1, used to draw the capacity bar relative to the largest plan. */
  ratio: number
}

export type PlanLocation = 'il' | 'global'

export type PricingPlan = {
  id: string
  title: string
  titleEn: string
  tagline: string
  /** Monthly price (₪) when billed monthly. Annual price is derived from ANNUAL_DISCOUNT. */
  monthlyPrice: number
  metrics: PlanMetric[]
  locations: PlanLocation[]
  /** Short included-feature list; features containing "חינם" render with value emphasis. */
  features: string[]
  ctaLabel: string
  /**
   * Order links for the billing system, per cycle.
   * TODO: Replace with real WHMCS / FOSSBilling order URLs, e.g.
   *   WHMCS:       https://billing.example.co.il/cart.php?a=add&pid=<PRODUCT_ID>&billingcycle=annually
   *   FOSSBilling: https://billing.example.co.il/order/<product-slug>
   */
  orderUrl: Record<BillingCycle, string>
  highlighted?: boolean
  badge?: string
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    title: 'בסיסית',
    titleEn: 'Starter',
    tagline: 'מושלם לאתרים אישיים ובלוגים',
    monthlyPrice: 29,
    metrics: [
      { label: 'נפח NVMe', value: '10GB', ratio: 0.1 },
      { label: 'זיכרון RAM ייעודי', value: '1GB', ratio: 0.125 },
      { label: 'תעבורה חודשית', value: '100GB', ratio: 0.1 },
    ],
    locations: ['il'],
    features: [
      'תיבות דואר ללא הגבלה',
      'גיבוי יומי חינם',
      'שרת LiteSpeed Enterprise',
      'לוח בקרה cPanel',
      'HTTP/3 + QUIC',
      'תעודת SSL חינם',
    ],
    ctaLabel: 'בחר חבילה',
    // TODO: WHMCS/FOSSBilling order links for "Starter"
    orderUrl: { monthly: '#order-starter-monthly', annual: '#order-starter-annual' },
  },
  {
    id: 'professional',
    title: 'מתקדמת',
    titleEn: 'Professional',
    tagline: 'החבילה הפופולרית לעסקים צומחים',
    monthlyPrice: 69,
    metrics: [
      { label: 'נפח NVMe', value: '50GB', ratio: 0.5 },
      { label: 'זיכרון RAM ייעודי', value: '4GB', ratio: 0.5 },
      { label: 'תעבורה חודשית', value: '500GB', ratio: 0.5 },
    ],
    locations: ['il', 'global'],
    features: [
      'תיבות דואר ללא הגבלה',
      'גיבוי יומי חינם · 30 יום אחורה',
      'שרת LiteSpeed Enterprise + LSCache',
      'לוח בקרה cPanel',
      'HTTP/3 + QUIC',
      'תעודת SSL חינם',
      'סביבת Staging ודומיין חינם',
    ],
    ctaLabel: 'התחל עכשיו',
    // TODO: WHMCS/FOSSBilling order links for "Professional" (primary conversion)
    orderUrl: { monthly: '#order-professional-monthly', annual: '#order-professional-annual' },
    highlighted: true,
    badge: 'הכי פופולרי',
  },
  {
    id: 'enterprise',
    title: 'מומחה',
    titleEn: 'Enterprise',
    tagline: 'לעסקים גדולים וחנויות ענק',
    monthlyPrice: 149,
    metrics: [
      { label: 'נפח NVMe', value: '100GB', ratio: 1 },
      { label: 'זיכרון RAM ייעודי', value: '8GB', ratio: 1 },
      { label: 'תעבורה חודשית', value: 'ללא הגבלה', ratio: 1 },
    ],
    locations: ['il', 'global'],
    features: [
      'תיבות דואר ללא הגבלה',
      'גיבוי יומי חינם · 90 יום + Off-site',
      'שרת LiteSpeed Enterprise + LSCache',
      'לוח בקרה מותאם + cPanel',
      'HTTP/3 + QUIC',
      'תעודת SSL חינם (כולל Wildcard)',
      'מנהל לקוח ייעודי ו-SLA 99.99%',
    ],
    ctaLabel: 'בחר חבילה',
    // TODO: WHMCS/FOSSBilling order links for "Enterprise"
    orderUrl: { monthly: '#order-enterprise-monthly', annual: '#order-enterprise-annual' },
  },
]

/** Effective monthly price for the selected cycle (annual = discounted per-month equivalent). */
export function monthlyPriceFor(plan: PricingPlan, cycle: BillingCycle) {
  return cycle === 'annual' ? Math.round(plan.monthlyPrice * (1 - ANNUAL_DISCOUNT)) : plan.monthlyPrice
}
