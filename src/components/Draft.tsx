'use client'

import { useRef, useState } from 'react'
import { useChrome } from './Chrome'
import { PLAYERS, type Player, type Position } from '@/lib/players'
import { gsap, isTouch, useScene } from '@/lib/motion'
import { flick, squeak } from '@/lib/sound'

const FILTERS: ('All' | Position)[] = ['All', 'Guard', 'Wing', 'Big', 'Coach']

export function cardImage(p: Player) {
  if (p.image.kind === 'lineup') return `/lineup/${p.image.id}.webp`
  return p.image.src
}

/**
 * The Draft Board. Every player is a holographic trading card: it tilts to
 * the pointer, a rainbow sheen slides across, and his highlight plays behind
 * him. Filters shuffle the deck. Click a card to open his scouting report.
 */
export function Draft() {
  const root = useRef<HTMLElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const { quarter } = useChrome()
  const shown = PLAYERS.filter((p) => filter === 'All' || p.position === filter)

  useScene(root, () => {
    gsap.fromTo(
      '.dr-card',
      { y: 120, rotate: () => gsap.utils.random(-14, 14), opacity: 0 },
      {
        y: 0,
        rotate: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.05,
        ease: 'back.out(1.3)',
        scrollTrigger: { trigger: grid.current, start: 'top 80%', onEnter: () => flick(), onToggle: (s) => s.isActive && quarter('Q2 · Draft Board') },
      },
    )
  })

  const shuffle = (f: (typeof FILTERS)[number]) => {
    if (f === filter) return
    flick()
    gsap.to('.dr-card', {
      y: 30,
      opacity: 0,
      rotate: () => gsap.utils.random(-8, 8),
      duration: 0.16,
      stagger: 0.015,
      onComplete: () => {
        setFilter(f)
        requestAnimationFrame(() => gsap.fromTo('.dr-card', { y: -30, opacity: 0 }, { y: 0, opacity: 1, rotate: 0, duration: 0.35, stagger: 0.03, ease: 'back.out(1.6)' }))
      },
    })
  }

  return (
    <section id="draft" ref={root} className="relative bg-court py-24 sm:py-32" aria-label="Draft board">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.35em] text-ash uppercase">The roster</p>
            <h2 className="display mt-2 text-[clamp(64px,12vw,180px)]">
              Draft <span className="text-volt">board</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by position">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={f === filter}
                onClick={() => shuffle(f)}
                className={`h-10 rounded-full px-4 font-mono text-[11px] tracking-widest uppercase transition-colors ${f === filter ? 'bg-volt text-ink' : 'border border-chalk/20 text-chalk/80 hover:border-chalk/60'}`}
                data-cursor="DEAL"
              >
                {f === 'All' ? 'All' : f === 'Coach' ? 'Staff' : `${f}s`}
              </button>
            ))}
          </div>
        </div>
        <div ref={grid} className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((p) => (
            <Card key={p.slug} p={p} />
          ))}
        </div>
        <p className="mt-8 font-mono text-[11px] text-ash">Names, numbers and stats are placeholders until the academy confirms them.</p>
      </div>
    </section>
  )
}

export function Card({ p, big = false }: { p: Player; big?: boolean }) {
  const el = useRef<HTMLButtonElement>(null)
  const [hot, setHot] = useState(false)
  const { dive } = useChrome()
  const photo = p.image.kind === 'photo'

  const move = (e: React.PointerEvent) => {
    const r = el.current!.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.current!.style.setProperty('--rx', `${(0.5 - y) * 16}deg`)
    el.current!.style.setProperty('--ry', `${(x - 0.5) * 18}deg`)
    el.current!.style.setProperty('--mx', `${x * 100}%`)
    el.current!.style.setProperty('--my', `${y * 100}%`)
  }

  return (
    <button
      ref={el}
      type="button"
      className={`dr-card group relative block aspect-[5/7] w-full [perspective:900px] text-left ${big ? 'max-w-[380px]' : ''}`}
      onPointerEnter={() => {
        if (!isTouch()) {
          setHot(true)
          squeak()
        }
      }}
      onPointerMove={move}
      onPointerLeave={() => {
        setHot(false)
        el.current!.style.setProperty('--rx', '0deg')
        el.current!.style.setProperty('--ry', '0deg')
      }}
      onClick={() => {
        flick()
        const img = el.current!.querySelector('img')!
        dive({ from: img.getBoundingClientRect(), src: cardImage(p), href: `/players/${p.slug}`, focus: [0.5, 0.25] })
      }}
      data-cursor="SCOUT"
      aria-label={`${p.name}, ${p.position}, number ${p.number}`}
    >
      <span className="absolute inset-0 overflow-hidden rounded-[14px] border border-chalk/15 bg-[linear-gradient(160deg,#232327,#0f0f11)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] transition-transform duration-200 ease-out [transform:rotateX(var(--rx,0))_rotateY(var(--ry,0))] [transform-style:preserve-3d]">
        {/* highlight behind him */}
        {hot && (
          <video className="absolute inset-0 h-full w-full object-cover opacity-45 pop-in [filter:grayscale(.3)]" autoPlay muted playsInline loop aria-hidden="true">
            <source src={`/media/${p.clip}.webm`} type="video/webm" />
            <source src={`/media/${p.clip}.mp4`} type="video/mp4" />
          </video>
        )}
        <span className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(70%_60%_at_50%_30%,rgba(212,255,58,0.18),transparent)]" />
        {/* the player */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardImage(p)}
          alt=""
          loading="lazy"
          className={`absolute transition-[filter,transform] duration-300 ${photo ? 'inset-0 h-full w-full object-cover' : 'bottom-[18%] left-1/2 h-[76%] w-auto max-w-none object-contain'} ${hot ? '[filter:grayscale(0)_drop-shadow(0_0_10px_rgba(212,255,58,.5))]' : '[filter:grayscale(1)_contrast(1.1)]'}`}
          style={photo ? undefined : { transform: `translateX(-50%) ${hot ? 'scale(1.04)' : ''}` }}
        />
        {/* holo sheen */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-color-dodge transition-opacity duration-200 group-hover:opacity-70"
          style={{ background: 'linear-gradient(115deg, transparent 20%, rgba(255,0,140,.35) 35%, rgba(0,255,220,.35) 45%, rgba(212,255,58,.45) 55%, transparent 70%)', backgroundSize: '220% 220%', backgroundPosition: 'var(--mx,50%) var(--my,50%)' }}
        />
        {/* top: rating + number */}
        <span className="absolute top-3 left-3 flex flex-col items-center leading-none">
          <span className="display text-[clamp(26px,3vw,38px)] text-volt">{p.ovr}</span>
          <span className="font-mono text-[9px] tracking-widest text-chalk/70">OVR</span>
        </span>
        <span className="display absolute top-3 right-3 text-[clamp(22px,2.6vw,32px)] text-chalk/90">#{p.number}</span>
        {/* bottom plate */}
        <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-[linear-gradient(transparent,rgba(10,10,11,.95)_40%)] px-3 pt-8 pb-3">
          <span className="display text-[clamp(20px,2.4vw,30px)] leading-none">{p.name}</span>
          <span className="flex items-center justify-between font-mono text-[10px] tracking-widest text-chalk/70 uppercase">
            <span>{p.position}</span>
            <span>{p.height}</span>
            <span className="text-volt">{p.classOf}</span>
          </span>
        </span>
      </span>
    </button>
  )
}
