'use client'

import { useEffect, useRef, useState } from 'react'
import { useChrome } from './Chrome'
import { ACADEMY } from '@/lib/academy'
import { LINEUP, PLAYERS, type Player } from '@/lib/players'
import { gsap, isTouch, useScene } from '@/lib/motion'

const IDS = ['p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'coach', 'p08', 'p09', 'p10', 'p11', 'p12']
const VIEW_H = LINEUP.H - LINEUP.top
const byId = (id: string) => PLAYERS.find((p) => p.image.kind === 'lineup' && p.image.id === id)!

/** Position a box (in photo pixels) inside the stage, as percentages. */
const place = (b: { x: number; y: number; w: number; h: number }) => ({
  left: `${(b.x / LINEUP.W) * 100}%`,
  top: `${((b.y - LINEUP.top) / VIEW_H) * 100}%`,
  width: `${(b.w / LINEUP.W) * 100}%`,
  height: `${(b.h / VIEW_H) * 100}%`,
})
const FULL = place({ x: 0, y: 0, w: LINEUP.W, h: LINEUP.H })

/**
 * The opening. The team on a Lagos road, still and in black and white, with
 * the academy's line beneath. Rest on a player and he slowly comes into
 * colour while the others step back; his name appears. Click to meet him.
 */
export function Lineup() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const hit = useRef<{ data: Uint8ClampedArray; w: number; h: number } | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const [touch, setTouch] = useState(false)
  const { enter } = useChrome()
  const player = active ? byId(active) : null

  useEffect(() => setTouch(isTouch()), [])

  // Per-pixel hit map: which player is under the pointer.
  useEffect(() => {
    const img = new Image()
    img.src = '/lineup/hit.png'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      const g = c.getContext('2d', { willReadFrequently: true })!
      g.drawImage(img, 0, 0)
      hit.current = { data: g.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height }
    }
  }, [])

  const who = (clientX: number, clientY: number) => {
    const s = stage.current?.getBoundingClientRect()
    const h = hit.current
    if (!s || !h) return null
    const u = (clientX - s.left) / s.width
    const v = (clientY - s.top) / s.height
    if (u < 0 || u > 1 || v < 0 || v > 1) return null
    const px = Math.floor(u * h.w)
    const py = Math.floor(((LINEUP.top + v * VIEW_H) / LINEUP.H) * h.h)
    const k = h.data[(py * h.w + px) * 4]
    return k ? IDS[k - 1] : null
  }

  const open = (id: string) => {
    const el = stage.current?.querySelector<HTMLImageElement>(`[data-cut="${id}"]`)
    if (el) enter({ from: el.getBoundingClientRect(), src: `/lineup/${id}.webp`, href: `/players/${byId(id).slug}` })
  }

  // Arrival, then a slow drift as you leave.
  useScene(root, ({ motion }) => {
    if (!motion) return
    gsap
      .timeline({ delay: 0.2 })
      .fromTo('.hero-photo', { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 2.6, ease: 'expo.out' })
      .fromTo('.hero-line', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.8, stagger: 0.25, ease: 'expo.out' }, 0.6)
      .fromTo('.hero-meta', { opacity: 0 }, { opacity: 1, duration: 1.4 }, 1.2)
    gsap.to('.hero-photo', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('.hero-copy', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
  })

  return (
    <section id="top" ref={root} className="relative h-svh min-h-[640px] overflow-hidden bg-ink" aria-label={ACADEMY.name}>
      <div
        ref={stage}
        className="hero-photo absolute bottom-0 left-1/2 aspect-[1210/1208] h-[min(96svh,128vw)] -translate-x-1/2 sm:left-[62%]"
        onPointerMove={(e) => !touch && setActive(who(e.clientX, e.clientY))}
        onPointerLeave={() => !touch && setActive(null)}
        onClick={(e) => {
          const id = who(e.clientX, e.clientY)
          if (!id) return setActive(null)
          if (touch && active !== id) return setActive(id)
          open(id)
        }}
        style={{ cursor: active ? 'pointer' : 'default' }}
      >
        {/* The team */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lineup/players.webp"
          alt="The Banire Basketball Academy team on a Lagos road"
          className="absolute max-w-none transition-[filter,opacity] duration-[900ms] ease-[var(--ease-calm)]"
          style={{ ...FULL, filter: 'grayscale(1) contrast(1.08) brightness(.92)', opacity: active ? 0.38 : 1 }}
        />
        {/* The one you rest on, in colour */}
        {IDS.map((id) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={id}
            data-cut={id}
            src={`/lineup/${id}.webp`}
            alt=""
            className="pointer-events-none absolute max-w-none transition-opacity duration-[900ms] ease-[var(--ease-calm)]"
            style={{ ...place(LINEUP.boxes[id]), opacity: active === id ? 1 : 0 }}
          />
        ))}
        {/* Fade the photo into the page */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-ink to-transparent" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 bg-gradient-to-r from-ink via-ink/80 to-transparent sm:block" />

      <div className="hero-copy pointer-events-none absolute inset-x-5 top-24 sm:inset-x-10 sm:top-auto sm:bottom-[14svh]">
        <p className="hero-meta label">
          {ACADEMY.name} · {ACADEMY.city}
        </p>
        <h1 className="mt-5 max-w-[11ch] text-[clamp(52px,7.6vw,128px)] leading-[0.95]">
          <span className="hero-line serif block">{ACADEMY.motto[0]}</span>
          <span className="hero-line serif block text-bone/70 italic">{ACADEMY.motto[1]}</span>
        </h1>
      </div>

      {/* His name, quietly */}
      <div className="pointer-events-none absolute right-5 bottom-8 text-right sm:right-10 sm:bottom-10" aria-live="polite">
        {player ? <Name key={player.slug} p={player} touch={touch} /> : <p className="hero-meta label">{touch ? 'Tap a player' : 'Rest on a player to meet him'}</p>}
      </div>
    </section>
  )
}

function Name({ p, touch }: { p: Player; touch: boolean }) {
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.fromTo(el.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' })
  }, [])
  return (
    <div ref={el}>
      <p className="label">
        <span className="text-gold">No. {p.number}</span> · {p.position} · {p.height}
      </p>
      <p className="serif mt-1 text-[clamp(30px,3.4vw,52px)] leading-none">{p.name}</p>
      {touch && <p className="label mt-2">Tap again to meet him</p>}
    </div>
  )
}
