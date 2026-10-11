import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  Activity,
  ArrowLeft,
  ArrowLeftRight,
  Cpu,
  Gauge,
  Headset,
  Search,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { IsraelFlagSvg, GlobalEarthSvg } from '@/components/LocationBadges'
import type { PageRoute } from '@/components/Navbar'

type Node = { x: number; y: number; vx: number; vy: number; r: number; hub: boolean }
type Packet = { from: number; to: number; t: number; speed: number }

const LINK_DISTANCE = 150

/**
 * Full-viewport animated infrastructure network: drifting server nodes, faint
 * links between nearby nodes and data packets travelling along those links.
 */
export function InfrastructureBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let nodes: Node[] = []
    let packets: Packet[] = []
    let frame = 0
    const pointer = { x: -9999, y: -9999 }

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(80, Math.round((width * height) / 18000))
      nodes = Array.from({ length: count }, () => {
        const hub = Math.random() < 0.12
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          r: hub ? 2.4 : 1.2,
          hub,
        }
      })
      packets = []
    }

    const spawnPacket = () => {
      const from = Math.floor(Math.random() * nodes.length)
      const a = nodes[from]
      let best = -1
      let bestD = LINK_DISTANCE
      for (let i = 0; i < nodes.length; i++) {
        if (i === from) continue
        const d = Math.hypot(nodes[i].x - a.x, nodes[i].y - a.y)
        if (d < bestD && Math.random() > 0.3) {
          bestD = d
          best = i
        }
      }
      if (best >= 0) packets.push({ from, to: best, t: 0, speed: 0.006 + Math.random() * 0.009 })
    }

    const draw = (animate: boolean) => {
      ctx.clearRect(0, 0, width, height)

      if (animate) {
        for (const n of nodes) {
          n.x += n.vx
          n.y += n.vy
          if (n.x < -20) n.x = width + 20
          if (n.x > width + 20) n.x = -20
          if (n.y < -20) n.y = height + 20
          if (n.y > height + 20) n.y = -20
        }
      }

      ctx.lineWidth = 0.6
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > LINK_DISTANCE * LINK_DISTANCE) continue
          const alpha = (1 - Math.sqrt(d2) / LINK_DISTANCE) * 0.18
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
        const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y)
        if (pd < 180) {
          ctx.strokeStyle = `rgba(34, 211, 238, ${(1 - pd / 180) * 0.3})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(pointer.x, pointer.y)
          ctx.stroke()
        }
      }

      for (const n of nodes) {
        if (n.hub) {
          ctx.fillStyle = 'rgba(34, 211, 238, 0.12)'
          ctx.beginPath()
          ctx.arc(n.x, n.y, 8, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = 'rgba(165, 243, 252, 0.75)'
          ctx.fillRect(n.x - 2, n.y - 2, 4, 4)
        } else {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.45)'
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      if (animate) {
        if (packets.length < 12 && Math.random() < 0.07) spawnPacket()
        packets = packets.filter((p) => (p.t += p.speed) < 1)
      }
      for (const p of packets) {
        const a = nodes[p.from]
        const b = nodes[p.to]
        if (!a || !b) continue
        const x = a.x + (b.x - a.x) * p.t
        const y = a.y + (b.y - a.y) * p.t
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 5)
        glow.addColorStop(0, 'rgba(103, 232, 249, 0.85)')
        glow.addColorStop(1, 'rgba(103, 232, 249, 0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = () => {
      draw(true)
      frame = requestAnimationFrame(loop)
    }

    const start = () => {
      cancelAnimationFrame(frame)
      if (reduceMotion) draw(false)
      else frame = requestAnimationFrame(loop)
    }

    const onResize = () => {
      seed()
      start()
    }
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(frame)
      else start()
    }
    const onPointer = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
    }

    seed()
    start()
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [reduceMotion])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0c1938_0%,#060a17_58%,#03050b_100%)]" />
      <div className="absolute -top-48 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-blue-600/15 blur-[130px]" />
      <div className="absolute top-1/3 left-[-15%] h-[30rem] w-[30rem] rounded-full bg-cyan-600/10 blur-[130px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-65" />
    </div>
  )
}

const stats = [
  { value: '99.99%', label: 'זמינות SLA שנתית מובטחת' },
  { value: '4.2ms', label: 'שיהוי פנים-ארצי ממוצע (IIX)' },
  { value: '24/7/365', label: 'מוקד הנדסי NOC בישראל' },
  { value: '10Gbps', label: 'קישוריות סיבים כפולה לארון' },
]

const rackUnits = [
  { name: 'il-ptk-nvme-01', region: 'IL', stack: 'LiteSpeed + PHP 8.3', load: 0.38 },
  { name: 'il-ptk-nvme-02', region: 'IL', stack: 'WooCommerce Redis', load: 0.54 },
  { name: 'il-ptk-db-mysql', region: 'IL', stack: 'MySQL 8.0 InnoDB', load: 0.41 },
  { name: 'eu-fra-edge-03', region: 'EU', stack: 'WireGuard + BGP', load: 0.29 },
]

function RackVisual() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-lg"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-950/90 shadow-2xl shadow-black/70 backdrop-blur-xl">
        {/* Top Terminal Title Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-xs font-bold tracking-wider text-white uppercase" dir="ltr">
              NOC-IL-PTK · CLUSTER TELEMETRY
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>BGP ALL ROUTERS ONLINE</span>
          </div>
        </div>

        <div className="p-5">
          {/* Datacenter Location Strip */}
          <div className="mb-4 flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 px-3.5 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <IsraelFlagSvg className="h-3.5 w-5" />
              <span className="font-semibold text-white">מתקן Tier-III פתח תקווה</span>
            </div>
            <span className="font-mono text-[11px] text-cyan-300" dir="ltr">
              AS42801 · 2x10GbE Uplinks
            </span>
          </div>

          {/* Server Nodes Table */}
          <div className="space-y-2.5" dir="ltr">
            {rackUnits.map((unit, i) => (
              <div
                key={unit.name}
                className="rounded-xl border border-white/10 bg-slate-900/55 px-3.5 py-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-mono font-bold text-white">{unit.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-cyan-300">{unit.stack}</span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-white/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      initial={{ width: `${unit.load * 100}%` }}
                      animate={
                        reduceMotion
                          ? { width: `${unit.load * 100}%` }
                          : {
                              width: [
                                `${unit.load * 100}%`,
                                `${Math.min(unit.load + 0.14, 0.9) * 100}%`,
                                `${unit.load * 100}%`,
                              ],
                            }
                      }
                      transition={{
                        duration: 4.5 + i,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-[11px] text-slate-400 tabular-nums">
                    {Math.round(unit.load * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Hardware Spec Metrics */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {[
              { icon: Cpu, label: 'מעבדי שרת', value: 'AMD EPYC™ 9654' },
              { icon: Gauge, label: 'מערך אחסון', value: 'NVMe Gen4 RAID10' },
              { icon: ShieldCheck, label: 'הגנת WAF', value: 'Imunify360 Pro' },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-center"
              >
                <m.icon className="mx-auto h-4 w-4 text-cyan-300" />
                <div className="mt-1.5 font-mono text-xs font-bold text-white" dir="ltr">
                  {m.value}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export function HeroSection({
  onNavigate,
}: {
  onNavigate?: (page: PageRoute, href?: string) => void
}) {
  const [quickDomain, setQuickDomain] = useState('')

  const handleDomainCheck = (e: React.FormEvent) => {
    e.preventDefault()
    if (onNavigate) {
      onNavigate('domains-whois', '#domains-whois')
    } else {
      window.location.hash = '#domains-whois'
    }
  }

  return (
    <section className="relative pb-16 pt-12 sm:pt-16 lg:pb-24 lg:pt-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.18fr_1fr] lg:px-8">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.08 }}
          className="text-right"
        >
          {/* Editorial Technical Kicker (Zero-Pill, authentic datacenter badge) */}
          <motion.div
            variants={fadeUp}
            className="inline-flex flex-wrap items-center gap-2.5 border-r-2 border-cyan-400 pr-3 text-xs font-bold tracking-wider text-cyan-300 uppercase"
          >
            <span className="inline-flex items-center gap-1.5">
              <IsraelFlagSvg className="h-3.5 w-5" />
              <span>חוות שרתים Tier-III בישראל</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="inline-flex items-center gap-1 text-slate-300">
              <GlobalEarthSvg className="h-3.5 w-3.5" />
              <span>נקודות קצה באירופה וארה״ב</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-cyan-300" dir="ltr">
              ISO/IEC 27001
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            תשתית אחסון ושרתים הנדסית,
            <br />
            <span className="bg-gradient-to-l from-cyan-300 via-blue-400 to-slate-100 bg-clip-text text-transparent">
              מהירה ויציבה ללא פשרות.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
          >
            אחסון אתרים מנוהל על גבי מערכי <strong>Enterprise NVMe Gen4</strong> ושרתי{' '}
            <strong>LiteSpeed Enterprise</strong>, סביבות מותאמות ל-WordPress, WooCommerce ומערכות{' '}
            <strong>PHP / MySQL / Python</strong> – בליווי צוות מהנדסי System ואבטחת מידע בישראל
            24/7.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-3.5"
          >
            <a
              href="#pricing"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-cyan-500/25 transition-all hover:-translate-y-0.5 hover:shadow-cyan-400/40"
            >
              <span>למחירון חבילות האחסון</span>
              <ArrowLeft
                className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                aria-hidden
              />
            </a>
            <button
              type="button"
              onClick={() => onNavigate?.('nvme-hosting', '#nvme-hosting')}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:border-cyan-400/40 hover:bg-slate-900"
            >
              <span>מפרט שרתי NVMe</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('client-portal', '#client-portal')}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-bold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Headset className="h-4 w-4 text-cyan-300" aria-hidden />
              <span>פורטל לקוחות ותמיכה</span>
            </button>
          </motion.div>

          {/* Direct Domain & WHOIS Lookup Bar */}
          <motion.form
            variants={fadeUp}
            onSubmit={handleDomainCheck}
            className="mt-8 max-w-2xl rounded-2xl border border-white/15 bg-slate-900/85 p-2 shadow-xl backdrop-blur-xl"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex flex-1 items-center">
                <Search className="pointer-events-none absolute right-3.5 h-4 w-4 text-cyan-300" />
                <input
                  type="text"
                  dir="ltr"
                  value={quickDomain}
                  onChange={(e) => setQuickDomain(e.target.value)}
                  placeholder="בדוק זמינות דומיין או מידע WHOIS (למשל: yourbrand.co.il)"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pr-10 pl-3 text-left font-mono text-xs font-semibold text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none sm:text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-cyan-500/25 hover:text-cyan-200 sm:flex-none"
                >
                  <Search className="h-3.5 w-3.5 text-cyan-300" />
                  <span>בדיקת WHOIS</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('domains-transfer', '#domains-transfer')}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-white"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-300" />
                  <span>העברת דומיין</span>
                </button>
              </div>
            </div>
          </motion.form>

          <motion.dl
            variants={fadeUp}
            className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-7 sm:grid-cols-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="border-r border-white/10 pr-3.5">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-mono text-2xl font-extrabold text-white tabular-nums" dir="ltr">
                  {s.value}
                </dd>
                <dd className="mt-0.5 text-xs font-medium text-slate-400">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <RackVisual />
      </div>
    </section>
  )
}

export default HeroSection
