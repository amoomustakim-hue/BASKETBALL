'use client'

import { useEffect, useRef, useState } from 'react'
import { useChrome } from './Chrome'
import { PLAYERS, type Player, type Position } from '@/lib/players'
import { gsap, useScene } from '@/lib/motion'
import { dribble, flick, squeak } from '@/lib/sound'

const FILTERS: ('All' | Position)[] = ['All', 'Guard', 'Wing', 'Big', 'Coach']

export function cardImage(p: Player) {
  if (p.image.kind === 'lineup') return `/lineup/${p.image.id}.webp`
  return p.image.src
}

/** Where each card lands in the pile (percent of the floor), and its tilt. */
function scatter(i: number, n: number) {
  const cols = Math.ceil(Math.sqrt(n * 1.8))
  const r = (k: number) => {
    const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
    return x - Math.floor(x)
  }
  const col = i % cols
  const row = Math.floor(i / cols)
  const rows = Math.ceil(n / cols)
  return {
    x: ((col + 0.5) / cols) * 100 + (r(1) - 0.5) * 9,
    y: ((row + 0.5) / rows) * 100 + (r(2) - 0.5) * 14,
    rot: (r(3) - 0.5) * 34,
  }
}

/**
 * The Pile. The roster is thrown onto the hardwood as trading cards. Grab
 * one and fling it, hover to lift it off the pile, click to open the
 * scouting report. Phones get a fanned hand you swipe through.
 */
export function Draft() {
  const root = useRef<HTMLElement>(null)
  const floor = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const [mobile, setMobile] = useState(false)
  const { quarter } = useChrome()
  const shown = PLAYERS.filter((p) => filter === 'All' || p.position === filter)

  useEffect(() => setMobile(window.innerWidth < 768), [])

  // The throw: cards fly in from below the floor, spinning, and slap down.
  const deal = () => {
    const cards = gsap.utils.toArray<HTMLElement>('.pile-card', root.current)
    gsap.fromTo(
      cards,
      { y: () => innerHeight * 0.9, x: () => gsap.utils.random(-300, 300), rotate: () => gsap.utils.random(-260, 260), scale: 1.25, opacity: 0 },
      {
        y: 0,
        x: 0,
        rotate: (i) => (mobile ? 0 : scatter(i, cards.length).rot),
        scale: 1,
        opacity: 1,
        duration: 0.55,
        stagger: 0.07,
        ease: 'back.out(1.1)',
        onStart: () => flick(),
      },
    )
  }

  useScene(
    root,
    () => {
      gsap.set('.pile-card', { opacity: 0 })
      gsap.fromTo('.pile-title > span', { yPercent: 120, skewY: 12 }, { yPercent: 0, skewY: 0, stagger: 0.08, duration: 0.5, ease: 'back.out(1.6)', scrollTrigger: { trigger: root.current, start: 'top 70%' } })
      gsap.timeline({ scrollTrigger: { trigger: floor.current, start: 'top 75%', once: true, onEnter: deal, onToggle: (s) => s.isActive && quarter('Q2 · The pile') } })
    },
    [mobile],
  )

  const shuffle = (f: (typeof FILTERS)[number]) => {
    if (f === filter) return
    flick()
    // Sweep the table, then throw the new hand.
    gsap.to('.pile-card', {
      x: () => gsap.utils.random(-1, 1) * innerWidth,
      y: () => gsap.utils.random(-200, 200),
      rotate: () => gsap.utils.random(-400, 400),
      opacity: 0,
      duration: 0.3,
      stagger: 0.012,
      ease: 'power2.in',
      onComplete: () => {
        setFilter(f)
        requestAnimationFrame(() => requestAnimationFrame(deal))
      },
    })
  }

  return (
    <section id="draft" ref={root} className="relative overflow-hidden bg-tar pt-24 pb-16 sm:pt-32" aria-label="The roster">
      <div className="relative z-10 mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-5 sm:px-10">
        <h2 className="pile-title display overflow-hidden text-[clamp(70px,13vw,200px)] leading-[0.82]">
          <span className="inline-block">The</span> <span className="inline-block text-volt">pile</span>
        </h2>
        <div className="flex max-w-full flex-col items-start gap-3 sm:items-end">
          <p className="marker -rotate-2 text-[22px] text-volt">{mobile ? 'swipe the hand, tap a card' : 'grab one. fling it. click to scout.'}</p>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by position">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={f === filter}
                onClick={() => shuffle(f)}
                className={`display h-11 border-2 border-volt px-4 text-[20px] transition-[transform,background-color,color] active:scale-95 ${f === filter ? 'bg-volt text-tar' : 'text-volt hover:-translate-y-0.5'}`}
                data-cursor="DEAL"
              >
                {f === 'All' ? 'All' : f === 'Coach' ? 'Staff' : `${f}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mobile ? (
        <div ref={floor} className="relative mt-10 flex snap-x snap-mandatory gap-[-20px] overflow-x-auto px-[12vw] pt-6 pb-12 [scrollbar-width:none]">
          {shown.map((p, i) => (
            <div key={p.slug} className="pile-card w-[68vw] shrink-0 snap-center first:ml-0 [&:not(:first-child)]:-ml-[10vw]" style={{ zIndex: i, transform: `rotate(${i % 2 ? 4 : -4}deg)` }}>
              <Card p={p} />
            </div>
          ))}
        </div>
      ) : (
        <Floor floorRef={floor} players={shown} />
      )}
      <p className="relative z-10 px-5 font-mono text-[11px] text-ash sm:px-10">Names, numbers and stats are placeholders until the academy confirms them.</p>
    </section>
  )
}

/** Desktop: the hardwood, with draggable, flingable cards. */
function Floor({ floorRef, players }: { floorRef: React.RefObject<HTMLDivElement | null>; players: Player[] }) {
  const top = useRef(100)

  useEffect(() => {
    const el = floorRef.current
    if (!el) return
    const cards = Array.from(el.querySelectorAll<HTMLElement>('.pile-drag'))
    const cleanups = cards.map((c) => {
      let sx = 0, sy = 0, ox = 0, oy = 0, vx = 0, vy = 0, lx = 0, ly = 0, lt = 0, moved = 0
      let raf = 0
      const pos = { x: 0, y: 0 }
      const set = () => gsap.set(c, { x: pos.x, y: pos.y })
      const down = (e: PointerEvent) => {
        cancelAnimationFrame(raf)
        c.setPointerCapture(e.pointerId)
        sx = e.clientX
        sy = e.clientY
        ox = pos.x
        oy = pos.y
        lx = e.clientX
        ly = e.clientY
        lt = performance.now()
        moved = 0
        c.style.zIndex = String(++top.current)
        gsap.to(c, { scale: 1.08, duration: 0.15 })
        dribble(0.4)
      }
      const move = (e: PointerEvent) => {
        if (!c.hasPointerCapture(e.pointerId)) return
        pos.x = ox + e.clientX - sx
        pos.y = oy + e.clientY - sy
        moved = Math.max(moved, Math.hypot(e.clientX - sx, e.clientY - sy))
        const t = performance.now()
        const dt = Math.max(1, t - lt)
        vx = ((e.clientX - lx) / dt) * 16
        vy = ((e.clientY - ly) / dt) * 16
        lx = e.clientX
        ly = e.clientY
        lt = t
        set()
      }
      const up = (e: PointerEvent) => {
        if (!c.hasPointerCapture(e.pointerId)) return
        c.releasePointerCapture(e.pointerId)
        gsap.to(c, { scale: 1, duration: 0.2 })
        if (moved < 6) {
          // A tap, not a throw: open his page.
          c.dataset.click = '1'
          c.querySelector<HTMLButtonElement>('button')?.click()
          return
        }
        c.dataset.click = '0'
        flick()
        // Slide across the floor and slow down.
        const spin = Number(c.dataset.rot || 0)
        const glide = () => {
          vx *= 0.92
          vy *= 0.92
          pos.x += vx
          pos.y += vy
          set()
          gsap.set(c.firstElementChild, { rotate: spin + pos.x * 0.04 })
          if (Math.hypot(vx, vy) > 0.4) raf = requestAnimationFrame(glide)
        }
        glide()
      }
      c.addEventListener('pointerdown', down)
      c.addEventListener('pointermove', move)
      c.addEventListener('pointerup', up)
      return () => {
        cancelAnimationFrame(raf)
        c.removeEventListener('pointerdown', down)
        c.removeEventListener('pointermove', move)
        c.removeEventListener('pointerup', up)
      }
    })
    return () => cleanups.forEach((f) => f())
  }, [floorRef, players])

  return (
    <div
      ref={floorRef}
      className="relative mx-auto mt-6 h-[min(118vh,1100px)] max-w-[1500px]"
      style={{
        background:
          'radial-gradient(60% 55% at 50% 45%, rgba(255,194,14,.12), transparent 70%), repeating-linear-gradient(90deg, #6b3f1d 0 78px, #74451f 78px 80px, #5e3718 80px 158px, #6f421e 158px 160px), linear-gradient(#5a3416, #2a170a)',
        boxShadow: 'inset 0 40px 80px rgba(0,0,0,.7), inset 0 -60px 80px rgba(0,0,0,.8)',
      }}
    >
      {/* court paint */}
      <svg aria-hidden="true" viewBox="0 0 1000 700" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full opacity-70">
        <g fill="none" stroke="#f4efe6" strokeWidth="5">
          <circle cx="500" cy="350" r="120" />
          <path d="M500 0v700" />
        </g>
        <circle cx="500" cy="350" r="40" fill="#ffc20e" opacity="0.8" />
      </svg>
      <div className="halftone opacity-30" aria-hidden="true" />
      {players.map((p, i) => {
        const s = scatter(i, players.length)
        return (
          <div
            key={p.slug}
            className="pile-drag absolute w-[clamp(170px,15vw,230px)] touch-none select-none"
            style={{ left: `calc(${s.x}% - clamp(85px,7.5vw,115px))`, top: `calc(${Math.min(88, s.y)}% - 140px)`, zIndex: i + 1 }}
            data-rot={s.rot}
            onPointerEnter={(e) => {
              e.currentTarget.style.zIndex = String(++top.current)
              squeak()
            }}
          >
            <div className="pile-card" style={{ transform: `rotate(${s.rot}deg)` }}>
              <Card p={p} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Star burst for the rating. */
function Burst({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -top-4 -left-4 z-10 grid size-[34%] min-h-14 min-w-14 place-items-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full drop-shadow-[3px_3px_0_#0b0b0b]" aria-hidden="true">
        <path
          d={Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2
            const r = i % 2 ? 36 : 50
            return `${i ? 'L' : 'M'}${50 + Math.cos(a) * r} ${50 + Math.sin(a) * r}`
          }).join(' ') + 'Z'}
          fill="#ff4d00"
          stroke="#0b0b0b"
          strokeWidth="3"
        />
      </svg>
      <span className="relative flex flex-col items-center leading-none">
        <span className="display text-[clamp(22px,2.2vw,32px)] text-tar">{children}</span>
        <span className="font-mono text-[8px] font-bold tracking-widest text-tar">OVR</span>
      </span>
    </span>
  )
}

export function Card({ p }: { p: Player }) {
  const el = useRef<HTMLButtonElement>(null)
  const [hot, setHot] = useState(false)
  const { dive } = useChrome()
  const photo = p.image.kind === 'photo'

  return (
    <button
      ref={el}
      type="button"
      className="group relative block aspect-[5/7] w-full text-left transition-transform duration-150 hover:-translate-y-2"
      onPointerEnter={() => setHot(true)}
      onPointerLeave={() => setHot(false)}
      onClick={(e) => {
        const drag = e.currentTarget.closest<HTMLElement>('.pile-drag')
        if (drag && drag.dataset.click === '0') return
        flick()
        const img = el.current!.querySelector('img')!
        dive({ from: img.getBoundingClientRect(), src: cardImage(p), href: `/players/${p.slug}`, focus: [0.5, 0.25] })
      }}
      data-cursor="SCOUT"
      aria-label={`${p.name}, ${p.position}, number ${p.number}`}
    >
      <Burst>{p.ovr}</Burst>
      <span className="tape -top-3 right-6 rotate-6" aria-hidden="true" />
      <span className="absolute inset-0 overflow-hidden border-[5px] border-tar bg-volt shadow-[10px_12px_0_rgba(0,0,0,.55)]">
        {/* halftone heat */}
        <span className="absolute inset-[6px] overflow-hidden bg-[radial-gradient(80%_70%_at_50%_35%,#ff8a00,#ff4d00_55%,#b32400)]">
          <span className="halftone opacity-60" />
          {hot && (
            <video className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-luminosity" autoPlay muted playsInline loop aria-hidden="true">
              <source src={`/media/${p.clip}.webm`} type="video/webm" />
              <source src={`/media/${p.clip}.mp4`} type="video/mp4" />
            </video>
          )}
          {/* giant number behind him */}
          <span aria-hidden="true" className="display absolute top-[4%] right-[4%] text-[clamp(80px,9vw,130px)] leading-none text-transparent [-webkit-text-stroke:3px_#0b0b0b]">
            {p.number}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardImage(p)}
            alt=""
            draggable={false}
            className={`absolute transition-transform duration-200 ${photo ? 'inset-0 h-full w-full object-cover [filter:grayscale(1)_contrast(1.3)] mix-blend-multiply' : 'bottom-[20%] left-1/2 h-[74%] w-auto max-w-none -translate-x-1/2 [filter:saturate(1.3)_drop-shadow(6px_6px_0_#0b0b0b)] group-hover:scale-105'}`}
          />
        </span>
        {/* name plate */}
        <span className="absolute inset-x-0 bottom-0 border-t-[5px] border-tar bg-tar px-3 pt-1.5 pb-2">
          <span className="display block truncate text-[clamp(22px,2.2vw,30px)] leading-none text-volt">{p.name}</span>
          <span className="mt-1 flex justify-between font-mono text-[10px] font-bold tracking-widest text-chalk uppercase">
            <span>{p.position}</span>
            <span>{p.height}</span>
            <span className="text-fire">{p.classOf}</span>
          </span>
        </span>
      </span>
    </button>
  )
}
