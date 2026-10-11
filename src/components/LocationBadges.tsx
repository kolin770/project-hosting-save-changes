import type { PlanLocation } from '@/data/pricing'

/** Crisp inline SVG of the Flag of Israel — renders identically on Windows, macOS, Linux, and mobile. */
export function IsraelFlagSvg({ className = 'h-4 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 160"
      className={`shrink-0 rounded-[3px] shadow-xs ring-1 ring-white/20 ${className}`}
      aria-label="דגל ישראל"
      role="img"
    >
      {/* White background */}
      <rect width="220" height="160" fill="#FFFFFF" />
      {/* Top & bottom blue stripes */}
      <rect y="15" width="220" height="25" fill="#0038B8" />
      <rect y="120" width="220" height="25" fill="#0038B8" />
      {/* Star of David (Magen David) */}
      <g fill="none" stroke="#0038B8" strokeWidth="5.5" strokeLinejoin="miter">
        <polygon points="110,52 134,94 86,94" />
        <polygon points="110,108 134,66 86,66" />
      </g>
    </svg>
  )
}

/** Crisp inline SVG of Earth / Global network icon */
export function GlobalEarthSvg({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-cyan-300 ${className}`}
      aria-label="גלובלי"
      role="img"
    >
      <circle cx="12" cy="12" r="10" className="fill-cyan-500/15" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}

export function ServerLocationsRow({ locations }: { locations: PlanLocation[] }) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
      <span className="text-xs font-medium text-slate-400">מיקום שרתים:</span>
      <div className="flex flex-wrap items-center gap-2">
        {locations.map((loc) =>
          loc === 'il' ? (
            <span
              key="il"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/25 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-slate-100"
            >
              <IsraelFlagSvg className="h-3.5 w-5" />
              <span>ישראל</span>
            </span>
          ) : (
            <span
              key="global"
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-slate-100"
            >
              <GlobalEarthSvg className="h-3.5 w-3.5" />
              <span>גלובלי</span>
            </span>
          ),
        )}
      </div>
    </div>
  )
}
