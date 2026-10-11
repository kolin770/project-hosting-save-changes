import { useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import {
  ANNUAL_DISCOUNT,
  monthlyPriceFor,
  pricingPlans,
  type BillingCycle,
  type PricingPlan,
} from '@/data/pricing'
import { ServerLocationsRow } from '@/components/LocationBadges'

export function PricingComparison({
  plans = pricingPlans,
  onSelectPlan,
}: {
  plans?: PricingPlan[]
  onSelectPlan?: (plan: PricingPlan, cycle: BillingCycle) => void
}) {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  return (
    <div>
      <div className="mb-12 flex justify-center">
        <div className="inline-flex items-center rounded-2xl border border-white/10 bg-slate-900/80 p-1.5 shadow-xl shadow-black/30 backdrop-blur-xl">
          {(['monthly', 'annual'] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cycle === c}
              onClick={() => setCycle(c)}
              className={`whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
                cycle === c
                  ? 'bg-gradient-to-l from-cyan-400 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {c === 'monthly' ? 'חיוב חודשי' : `חיוב שנתי · ${ANNUAL_DISCOUNT * 100}% הנחה`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-3 lg:items-stretch">
        {plans.map((plan) => {
          const effectiveMonthly = monthlyPriceFor(plan, cycle)
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl border p-7 text-white backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 ${
                plan.highlighted
                  ? 'order-first border-cyan-400/50 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-blue-950/60 shadow-2xl shadow-cyan-500/15 ring-1 ring-cyan-400/20 lg:order-none'
                  : 'border-white/10 bg-slate-900/60 hover:border-white/20'
              }`}
            >
              {plan.badge && (
                <span className="-top-3.5 right-6 absolute inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/40 bg-gradient-to-l from-cyan-500 to-blue-600 px-3 py-1 text-xs font-extrabold tracking-wide text-white shadow-lg shadow-cyan-500/25">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  {plan.badge}
                </span>
              )}

              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-2xl font-extrabold tracking-tight text-white">{plan.title}</h3>
                  <span className="font-mono text-xs font-semibold tracking-wider text-cyan-300/80 uppercase">
                    {plan.titleEn}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-slate-400">{plan.tagline}</p>

                <div className="mt-6 border-y border-white/10 py-5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-4xl font-extrabold tracking-tight text-white tabular-nums sm:text-5xl">
                      ₪{effectiveMonthly}
                    </span>
                    <span className="text-sm font-medium text-slate-400">/ לחודש</span>
                  </div>
                  {cycle === 'annual' ? (
                    <p className="mt-1.5 text-xs font-medium text-emerald-300">
                      מחיר רגיל ₪{plan.monthlyPrice} · חיסכון של ₪{(plan.monthlyPrice - effectiveMonthly) * 12} בשנה
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-400">
                      ללא התחייבות · אפשרות לשדרוג בכל עת
                    </p>
                  )}
                </div>

                <div className="mt-6 space-y-3.5">
                  {plan.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">{m.label}</span>
                        <span className="font-mono font-bold text-white tabular-nums" dir="ltr">
                          {m.value}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-l from-cyan-400 to-blue-500 transition-all duration-500"
                          style={{ width: `${m.ratio * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Server Locations with crisp Israeli Flag SVG & Earth Icon */}
                <ServerLocationsRow locations={plan.locations} />

                <ul className="mt-6 space-y-2.5 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className={f.includes('חינם') ? 'font-semibold text-white' : 'text-slate-300'}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {onSelectPlan ? (
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan, cycle)}
                  className={`mt-8 block w-full cursor-pointer rounded-xl py-3.5 text-center text-sm font-bold transition-all hover:-translate-y-0.5 ${
                    plan.highlighted
                      ? 'bg-gradient-to-l from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50'
                      : 'border border-white/15 bg-white/5 text-white hover:border-cyan-400/40 hover:bg-white/10'
                  }`}
                >
                  {plan.ctaLabel}
                </button>
              ) : (
                <a
                  href={plan.orderUrl[cycle]}
                  className={`mt-8 block rounded-xl py-3.5 text-center text-sm font-bold transition-all hover:-translate-y-0.5 ${
                    plan.highlighted
                      ? 'bg-gradient-to-l from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50'
                      : 'border border-white/15 bg-white/5 text-white hover:border-cyan-400/40 hover:bg-white/10'
                  }`}
                >
                  {plan.ctaLabel}
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PricingComparison

