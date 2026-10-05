'use client'

import { useRef } from 'react'
import { Ball, useChrome } from './Chrome'
import { gsap, range, useScene } from '@/lib/motion'
import { haptic, swish } from '@/lib/sound'

/**
 * The jump shot. Your scroll is the shot: the ball rises from the bottom
 * left on a real arc, spinning, a dotted line tracing it, and drops through
 * the net. Swish, the net ripples, and the headline falls out of the hoop.
 */
export function Shot() {
  const root = useRef<HTMLElement>(null)
  const { quarter } = useChrome()

  useScene(root, ({ mobile }) => {
    const ball = root.current!.querySelector<HTMLDivElement>('.sh-ball')!
    const trail = root.current!.querySelector<SVGPolylineElement>('.sh-trail')!
    const svg = root.current!.querySelector<SVGSVGElement>('.sh-svg')!
    const net = root.current!.querySelector<SVGGElement>('.sh-net')!
    const hoop = root.current!.querySelector<HTMLDivElement>('.sh-hoop')!

    let W = innerWidth, H = innerHeight
    let A = { x: 0, y: 0 }, C = { x: 0, y: 0 }, B = { x: 0, y: 0 }
    const layout = () => {
      W = innerWidth
      H = innerHeight
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
      const r = hoop.getBoundingClientRect()
      const sr = root.current!.getBoundingClientRect()
      B = { x: r.left - sr.left + r.width * 0.5, y: r.top - sr.top + r.height * 0.52 }
      A = { x: W * (mobile ? 0.12 : 0.1), y: H * 0.88 }
      C = { x: (A.x + B.x) / 2 - W * 0.05, y: Math.min(A.y, B.y) - H * (mobile ? 0.55 : 0.75) }
    }
    const at = (t: number) => ({
      x: (1 - t) * (1 - t) * A.x + 2 * (1 - t) * t * C.x + t * t * B.x,
      y: (1 - t) * (1 - t) * A.y + 2 * (1 - t) * t * C.y + t * t * B.y,
    })
    let scored = false
    const ballSize = () => ball.offsetWidth

    const update = (p: number) => {
      const t = range(p, 0.08, 0.72)
      let pos = at(t)
      let s = 1
      if (p > 0.72) {
        // Through the net and down.
        const d = range(p, 0.72, 0.9)
        pos = { x: B.x, y: B.y + d * H * 0.22 }
        s = 1 - d * 0.25
      }
      const b = ballSize()
      gsap.set(ball, { x: pos.x - b / 2, y: pos.y - b / 2, rotate: t * 900, scale: s, opacity: p < 0.9 ? 1 : 1 - range(p, 0.9, 0.95) })
      // Trail up to here.
      const pts: string[] = []
      for (let k = 0; k <= 40; k++) {
        const q = at((k / 40) * t)
        pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`)
      }
      trail.setAttribute('points', pts.join(' '))
      // Swish.
      if (p > 0.73 && !scored) {
        scored = true
        swish()
        haptic(30)
        gsap.fromTo(net, { scaleY: 1, skewX: 0 }, { scaleY: 1.18, skewX: 6, duration: 0.12, yoyo: true, repeat: 3, ease: 'sine.inOut', transformOrigin: '50% 0%' })
        gsap.fromTo(root.current, { x: -4 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' })
        gsap.fromTo('.sh-spark', { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.6, stagger: 0.02, ease: 'power2.out' })
        gsap.fromTo('.sh-swish', { scale: 3, opacity: 0, rotate: -20 }, { scale: 1, opacity: 1, rotate: -8, duration: 0.35, ease: 'back.out(2.2)' })
        gsap.fromTo('.sh-flash', { opacity: 0.8 }, { opacity: 0, duration: 0.25 })
      }
      if (p < 0.7) {
        scored = false
        gsap.set('.sh-swish', { opacity: 0 })
      }
    }

    layout()
    update(0)
    const st = gsap.timeline({
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: '+=210%',
        pin: true,
        scrub: 0.5,
        onRefresh: () => layout(),
        onToggle: (s) => s.isActive && quarter('Q1 · The Shot'),
        onUpdate: (s) => update(s.progress),
      },
    })
    st.fromTo('.sh-line', { yPercent: -120, opacity: 0, rotate: -4 }, { yPercent: 0, opacity: 1, rotate: 0, stagger: 0.06, duration: 0.12, ease: 'back.out(1.6)' }, 0.8)
      .fromTo('.sh-kicker', { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.02)
      .to('.sh-kicker', { opacity: 0, duration: 0.05 }, 0.3)
      .to({}, { duration: 0.08 })
    addEventListener('resize', layout)
    return () => removeEventListener('resize', layout)
  })

  return (
    <section ref={root} className="relative h-svh overflow-hidden bg-ink" aria-label="The shot">
      {/* Court floor */}
      <svg aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[30%] w-full opacity-30" viewBox="0 0 1000 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1c1c1f" stopOpacity="0" />
            <stop offset="1" stopColor="#2b2b30" />
          </linearGradient>
        </defs>
        <rect width="1000" height="300" fill="url(#floor)" />
        <path d="M0 120 H1000 M600 120 Q760 300 1000 290 M760 120 V300" fill="none" stroke="#f2f1ec" strokeWidth="2" />
      </svg>

      <p className="sh-kicker absolute top-[22%] left-[8%] font-mono text-[11px] tracking-[0.35em] text-ash uppercase">Keep scrolling · take the shot</p>

      {/* Hoop */}
      <div className="sh-hoop absolute top-[16%] right-[8%] w-[34vw] max-w-[300px] sm:right-[12%] sm:w-[22vw]">
        <svg viewBox="0 0 200 200" className="w-full overflow-visible" aria-hidden="true">
          <rect x="30" y="0" width="140" height="92" rx="4" fill="rgba(242,241,236,0.04)" stroke="#f2f1ec" strokeWidth="3" />
          <rect x="72" y="38" width="56" height="40" fill="none" stroke="#f2f1ec" strokeWidth="2.5" />
          <g className="sh-net" style={{ transformBox: 'fill-box' }}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <path key={i} d={`M${62 + i * 12.6} 106 L${74 + i * 8.6} 168`} stroke="#f2f1ec" strokeOpacity="0.85" strokeWidth="1.6" fill="none" />
            ))}
            <path d="M64 124 H136 M68 142 H132 M73 160 H127" stroke="#f2f1ec" strokeOpacity="0.6" strokeWidth="1.4" fill="none" />
          </g>
          <ellipse cx="100" cy="104" rx="42" ry="7" fill="none" stroke="#ff6a1a" strokeWidth="5" />
          {[...Array(10)].map((_, i) => (
            <circle key={i} className="sh-spark" cx={100 + Math.cos(i * 0.63) * 70} cy={110 + Math.sin(i * 0.63) * 40} r="3" fill="#ffc20e" opacity="0" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
          ))}
        </svg>
      </div>

      {/* Arc trail + ball */}
      <svg className="sh-svg pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <polyline className="sh-trail" fill="none" stroke="#ffc20e" strokeWidth="2.5" strokeDasharray="2 10" strokeLinecap="round" />
      </svg>
      <div className="sh-ball absolute top-0 left-0 size-[13vw] max-h-[92px] max-w-[92px] min-h-[54px] min-w-[54px] will-change-transform">
        <div className="absolute inset-[-40%] rounded-full bg-[radial-gradient(circle,rgba(255,106,26,0.45),transparent_65%)]" />
        <Ball />
      </div>

      {/* SWISH! */}
      <div className="sh-swish pointer-events-none absolute top-[8%] right-[30%] z-10 opacity-0 sm:right-[34%]" aria-hidden="true">
        <svg viewBox="0 0 300 200" className="w-[46vw] max-w-[380px] drop-shadow-[8px_8px_0_#0b0b0b]">
          <path
            d={Array.from({ length: 28 }, (_, i) => {
              const a = (i / 28) * Math.PI * 2
              const r = i % 2 ? 62 : 98
              return `${i ? 'L' : 'M'}${150 + Math.cos(a) * r * 1.45} ${100 + Math.sin(a) * r * 0.95}`
            }).join(' ') + 'Z'}
            fill="#ffc20e"
            stroke="#0b0b0b"
            strokeWidth="6"
          />
          <text x="150" y="122" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="74" fill="#0b0b0b">
            SWISH!
          </text>
        </svg>
      </div>
      <div className="sh-flash pointer-events-none absolute inset-0 z-20 bg-volt opacity-0" aria-hidden="true" />

      {/* Headline falls out of the net */}
      <h2 className="absolute right-[6%] bottom-[10%] left-[6%] text-right sm:right-[10%]">
        <span className="sh-line display block text-[clamp(52px,10vw,170px)] text-chalk [text-shadow:8px_8px_0_#ff4d00]">Lagos builds them.</span>
        <span className="sh-line display block text-[clamp(52px,10vw,170px)] text-volt [text-shadow:8px_8px_0_#ff4d00]">The world plays them.</span>
      </h2>
    </section>
  )
}
