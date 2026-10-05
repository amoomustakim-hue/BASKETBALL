'use client'

import { useEffect, useRef, useState } from 'react'
import { useChrome } from './Chrome'
import { gsap, range, useScene } from '@/lib/motion'
import { flick } from '@/lib/sound'

/** PLACEHOLDER routes: swap in real alumni, schools and years. */
const ROUTES = [
  { code: 'USA', city: 'US Prep School', who: 'Alumni name', year: '2025', status: 'Boarded', x: 860, y: 150 },
  { code: 'NCA', city: 'NCAA Division I', who: 'Alumni name', year: '2026', status: 'Boarded', x: 700, y: 70 },
  { code: 'BWB', city: 'Basketball Without Borders', who: 'Alumni name', year: '2026', status: 'Landed', x: 760, y: 300 },
  { code: 'EUR', city: 'Europe · Pro Academy', who: 'Alumni name', year: '2026', status: 'On time', x: 560, y: 110 },
  { code: 'DKR', city: 'Regional Showcase', who: 'Alumni name', year: '2027', status: 'Final call', x: 470, y: 330 },
]
const LOS = { x: 170, y: 440 }
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/** One split-flap cell row: letters flick through before they land. */
function Flap({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`pw-flap inline-flex gap-[2px] ${className}`} data-text={text.toUpperCase()}>
      {text
        .toUpperCase()
        .split('')
        .map((c, i) => (
          <span key={i} className="inline-grid h-[1.45em] w-[0.9em] place-items-center rounded-[3px] bg-[#16161a] text-chalk shadow-[inset_0_-1px_0_rgba(0,0,0,.6),inset_0_1px_0_rgba(255,255,255,.05)] [background-image:linear-gradient(transparent_49%,rgba(0,0,0,.55)_50%,transparent_51%)]">
            {c === ' ' ? ' ' : c}
          </span>
        ))}
    </span>
  )
}

/**
 * The Pathway: Lagos to the world. A departures board flips through the
 * destinations while routes draw themselves out of Lagos on the map. Pinned;
 * the scroll launches each flight.
 */
export function Pathway() {
  const root = useRef<HTMLElement>(null)
  const { quarter } = useChrome()
  // Phones: fit the whole map (Lagos to the far routes) above the board.
  const [narrow, setNarrow] = useState(false)
  useEffect(() => setNarrow(window.innerWidth < 640), [])

  useScene(root, ({ mobile }) => {
    const routes = gsap.utils.toArray<SVGPathElement>('.pw-route')
    const rows = gsap.utils.toArray<HTMLElement>('.pw-row')
    routes.forEach((r) => {
      const len = r.getTotalLength()
      gsap.set(r, { strokeDasharray: len, strokeDashoffset: len })
    })
    const flipped = new Set<number>()
    const flip = (row: HTMLElement) => {
      row.querySelectorAll<HTMLElement>('.pw-flap').forEach((f) => {
        const target = f.dataset.text ?? ''
        const cells = f.querySelectorAll('span')
        cells.forEach((cell, i) => {
          let n = 0
          const want = target[i] === ' ' ? ' ' : target[i]
          const id = setInterval(() => {
            n++
            cell.textContent = n > 6 + i ? want : CHARS[Math.floor(Math.random() * CHARS.length)]
            if (n > 6 + i) clearInterval(id)
          }, 34)
        })
      })
      flick()
    }
    gsap.timeline({
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: mobile ? '+=200%' : '+=240%',
        pin: true,
        scrub: 0.5,
        onToggle: (s) => s.isActive && quarter('Q3 · The Pathway'),
        onUpdate: (s) => {
          routes.forEach((r, i) => {
            const t = range(s.progress, 0.08 + i * 0.13, 0.22 + i * 0.13)
            r.style.strokeDashoffset = String(r.getTotalLength() * (1 - t))
            const dot = root.current!.querySelector<SVGGElement>(`.pw-dest-${i}`)
            if (dot) dot.style.opacity = t > 0.98 ? '1' : '0.15'
            if (t > 0.05 && !flipped.has(i)) {
              flipped.add(i)
              rows[i]?.classList.add('is-on')
              flip(rows[i])
            }
          })
        },
      },
    })
      .fromTo('.pw-map', { scale: 1.25, transformOrigin: '17% 73%' }, { scale: 1, ease: 'none', duration: 0.85 }, 0)
      .fromTo('.pw-total', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.1 }, 0.85)
  })

  return (
    <section id="pathway" ref={root} className="relative h-svh overflow-hidden bg-ink" aria-label="The pathway">
      {/* Map */}
      <svg className="pw-map absolute inset-x-0 top-16 h-[48%] w-full sm:inset-0 sm:h-full" viewBox="0 0 1000 600" preserveAspectRatio={narrow ? 'xMidYMid meet' : 'xMidYMid slice'} aria-hidden="true">
        <defs>
          <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="#f2f1ec" opacity="0.13" />
          </pattern>
          <radialGradient id="los">
            <stop offset="0" stopColor="#d4ff3a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#d4ff3a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="600" fill="url(#dots)" />
        <circle cx={LOS.x} cy={LOS.y} r="90" fill="url(#los)" />
        {ROUTES.map((r, i) => (
          <path key={r.code} className="pw-route" d={`M${LOS.x} ${LOS.y} Q ${(LOS.x + r.x) / 2} ${Math.min(LOS.y, r.y) - 160} ${r.x} ${r.y}`} fill="none" stroke="#d4ff3a" strokeWidth="2" strokeLinecap="round" opacity={0.9 - i * 0.08} />
        ))}
        {ROUTES.map((r, i) => (
          <g key={r.code} className={`pw-dest-${i}`} style={{ opacity: 0.15, transition: 'opacity .3s' }}>
            <circle cx={r.x} cy={r.y} r="6" fill="#d4ff3a" />
            <circle cx={r.x} cy={r.y} r="14" fill="none" stroke="#d4ff3a" strokeOpacity="0.5" />
            <text x={r.x + 18} y={r.y + 5} fill="#f2f1ec" fontFamily="ui-monospace, monospace" fontSize="14" letterSpacing="2">
              {r.code}
            </text>
          </g>
        ))}
        <circle cx={LOS.x} cy={LOS.y} r="9" fill="#d4ff3a" />
        <text x={LOS.x - 14} y={LOS.y + 34} fill="#d4ff3a" fontFamily="Anton, Impact, sans-serif" fontSize="30">
          LAGOS
        </text>
      </svg>

      {/* Departures board */}
      <div className="absolute inset-x-4 bottom-4 rounded-[10px] border border-chalk/10 bg-ink/85 p-3 backdrop-blur-md sm:inset-x-auto sm:top-24 sm:bottom-auto sm:left-8 sm:w-[min(640px,52vw)] sm:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="display text-[clamp(30px,4.4vw,56px)]">
            Departures <span className="text-volt">· LOS</span>
          </h2>
          <span className="font-mono text-[10px] tracking-widest text-ash uppercase">Placeholder routes</span>
        </div>
        <div className="mt-3 grid grid-cols-[auto_1fr_auto] gap-x-3 font-mono text-[9px] tracking-widest text-ash uppercase sm:text-[10px]">
          <span>Code</span>
          <span>Destination · Player</span>
          <span>Status</span>
        </div>
        <ol className="mt-2 flex flex-col gap-1.5">
          {ROUTES.map((r) => (
            <li key={r.code} className="pw-row grid grid-cols-[auto_1fr_auto] items-center gap-x-3 opacity-30 transition-opacity duration-300 [&.is-on]:opacity-100">
              <Flap text={r.code} className="font-mono text-[12px] font-bold sm:text-[15px]" />
              <span className="min-w-0 truncate font-mono text-[11px] text-chalk/85 sm:text-[13px]">
                {r.city} <span className="text-ash">· {r.who} · {r.year}</span>
              </span>
              <span className={`font-mono text-[10px] font-bold tracking-widest uppercase sm:text-[11px] ${r.status === 'Final call' ? 'text-ball' : 'text-volt'}`}>{r.status}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="pw-total absolute top-24 right-5 text-right opacity-0 sm:top-auto sm:right-10 sm:bottom-10">
        <span className="display block text-[clamp(44px,8vw,120px)] text-volt">Coming soon</span>
        <span className="font-mono text-[11px] tracking-[0.3em] text-ash uppercase">Players placed · count to confirm</span>
      </p>
    </section>
  )
}
