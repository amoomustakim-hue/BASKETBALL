'use client'

import { useEffect, useRef, useState } from 'react'
import { useChrome } from './Chrome'
import { LINEUP, PLAYERS, type Player } from '@/lib/players'
import { gsap, isTouch, range, useScene } from '@/lib/motion'
import { crowd, haptic, squeak } from '@/lib/sound'

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
 * The hero. The team on a Lagos road, in black and white, with BANIRE behind
 * them. Hover (or tap) a player: everyone else drops into the dark, he lights
 * up in colour with a volt rim, and his highlight plays inside his silhouette.
 * Click (or tap again) and the camera dives into him.
 */
export function Lineup() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const shaker = useRef<HTMLDivElement>(null)
  const hit = useRef<{ data: Uint8ClampedArray; w: number; h: number } | null>(null)
  const hovering = useRef<string | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const [auto, setAuto] = useState<string | null>(null)
  const { dive, quarter } = useChrome()
  const shown = active ?? auto
  const [touch, setTouch] = useState(false)
  useEffect(() => setTouch(isTouch()), [])
  const player = shown ? byId(shown) : null

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

  /** Camera shake + a white flash frame. */
  const impact = (strength = 1) => {
    const st = shaker.current
    if (st) {
      st.classList.remove('shake')
      void st.offsetWidth
      st.classList.add('shake')
    }
    gsap.fromTo(root.current!.querySelector('.lu-flash'), { opacity: 0.55 * strength }, { opacity: 0, duration: 0.18, ease: 'power2.out' })
  }

  const light = (id: string | null) => {
    if (id === hovering.current) return
    hovering.current = id
    setActive(id)
    if (id) {
      squeak()
      crowd(1.2, 0.12)
      impact(0.5)
    }
  }

  const enter = (id: string) => {
    const el = stage.current?.querySelector<HTMLImageElement>(`[data-cut="${id}"]`)
    const p = byId(id)
    if (!el || !p) return
    haptic(25)
    dive({ from: el.getBoundingClientRect(), src: `/lineup/${id}.webp`, href: `/players/${p.slug}`, focus: [0.5, 0.22] })
  }

  // Scroll: push in, the starting-lineup intro, then lights out but the ball.
  useScene(root, ({ motion, mobile }) => {
    if (!motion) return
    let last = -1
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: mobile ? '+=220%' : '+=260%',
        pin: true,
        scrub: 0.6,
        onToggle: (s) => s.isActive && quarter('Q1 · The Lineup'),
        onUpdate: (s) => {
          const p = s.progress
          const k = p > 0.18 && p < 0.74 ? Math.floor(range(p, 0.18, 0.74) * LINEUP.intro.length * 0.999) : -1
          if (k !== last) {
            last = k
            const id = k >= 0 ? LINEUP.intro[k] : null
            setAuto(id)
            if (id && !hovering.current) {
              crowd(1, 0.18)
              haptic(14)
              impact()
            }
          }
        },
      },
    })
    tl.to('.lu-stage', { scale: 1.12, ease: 'none', duration: 0.2 }, 0)
      .to('.lu-word', { yPercent: -18, scale: 1.06, ease: 'none', duration: 0.2 }, 0)
      .to('.lu-hint', { opacity: 0, duration: 0.05 }, 0.05)
      .to('.lu-dark', { opacity: 0.88, ease: 'power1.in', duration: 0.2 }, 0.76)
      .fromTo('.lu-ball', { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, ease: 'back.out(2)', duration: 0.12 }, 0.82)
      .to('.lu-word', { opacity: 0.12, duration: 0.15 }, 0.78)
      .to({}, { duration: 0.06 })
  })


  return (
    <section id="lineup" ref={root} className="relative h-svh overflow-hidden bg-volt text-tar" aria-label="The lineup">
      <div className="halftone opacity-40" aria-hidden="true" />
      {/* Hazard bands, like the pole on that road */}
      <div aria-hidden="true" className="hazard absolute -top-6 -left-24 h-14 w-[70vw] -rotate-6 shadow-[0_8px_0_#0b0b0b]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-20 h-12 overflow-hidden border-t-4 border-tar bg-tar">
        <div className="marquee-l flex w-max items-center gap-8 py-2 whitespace-nowrap">
          {[...Array(2)].flatMap((_, k) =>
            ['Banire Basketball', 'Lagos', 'Elite 50', 'Top 50 prospects', 'Lagos builds them'].map((t) => (
              <span key={`${k}${t}`} className="display flex items-center gap-8 text-[26px] text-volt">
                {t} <span className="text-fire">✦</span>
              </span>
            )),
          )}
        </div>
      </div>

      <h1 className="lu-word display pointer-events-none absolute inset-x-0 top-[12svh] text-center text-[28vw] leading-[0.8] text-tar select-none sm:top-[7svh] sm:text-[25vw]" aria-label="Banire">
        <span className="relative inline-block">
          <span aria-hidden="true" className="absolute inset-0 translate-x-[0.035em] translate-y-[0.035em] text-transparent [-webkit-text-stroke:3px_#0b0b0b]">
            Banire
          </span>
          Banire
        </span>
      </h1>

      {/* Marker scribbles */}
      <div aria-hidden="true" className="lu-word pointer-events-none absolute top-[44svh] left-[4vw] hidden -rotate-6 sm:block">
        <span className="marker text-[clamp(22px,2.4vw,40px)] text-fire">Lagos, NG</span>
        <svg viewBox="0 0 200 80" className="absolute -inset-4 w-[calc(100%+32px)]" fill="none" stroke="#ff4d00" strokeWidth="4" strokeLinecap="round">
          <path d="M20 40c0-26 160-34 168-6 8 26-150 40-176 14C0 36 40 10 90 8" />
        </svg>
      </div>
      <div aria-hidden="true" className="lu-word pointer-events-none absolute top-[38svh] right-[4vw] hidden rotate-3 text-right sm:block">
        <span className="marker block text-[clamp(22px,2.4vw,40px)]">the future</span>
        <svg viewBox="0 0 160 70" className="ml-auto w-[120px]" fill="none" stroke="#0b0b0b" strokeWidth="5" strokeLinecap="round">
          <path d="M150 6C120 40 70 58 14 56M14 56l20-16M14 56l22 10" />
        </svg>
      </div>

      <div ref={shaker} className="absolute inset-0">
      <div
        ref={stage}
        className="lu-stage absolute bottom-12 left-1/2 aspect-[1210/1208] h-[min(calc(100svh-48px),130vw)] origin-bottom -translate-x-1/2"
        onPointerMove={(e) => !touch && light(who(e.clientX, e.clientY))}
        onPointerLeave={() => !touch && light(null)}
        onClick={(e) => {
          const id = who(e.clientX, e.clientY)
          if (!id) return light(null)
          if (touch && hovering.current !== id) return light(id)
          enter(id)
        }}
        data-cursor={active ? 'ENTER' : undefined}
      >
        {/* The team: a black-and-white sticker on yellow */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lineup/players.webp"
          alt="The Banire Basketball team on a Lagos road"
          className="absolute max-w-none transition-[filter,opacity] duration-150"
          style={{ ...FULL, filter: `grayscale(1) contrast(1.4) brightness(1.05) drop-shadow(10px 10px 0 rgba(11,11,11,.85))`, opacity: shown ? 0.32 : 1 }}
        />
        {/* The lit player: full colour, white sticker edge, his highlight inside him */}
        {IDS.map((id) => {
          const on = shown === id
          const p = byId(id)
          return (
            <div key={id} className={`pointer-events-none absolute transition-transform duration-200 ${on ? 'z-10 scale-[1.06]' : ''}`} style={{ ...place(LINEUP.boxes[id]), transformOrigin: '50% 100%' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-cut={id}
                src={`/lineup/${id}.webp`}
                alt=""
                className="absolute inset-0 h-full w-full max-w-none"
                style={{
                  opacity: on ? 1 : 0,
                  filter: 'saturate(1.35) contrast(1.1) drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff) drop-shadow(12px 12px 0 #0b0b0b)',
                }}
              />
              {on && <SilhouetteVideo id={id} clip={p.clip} />}
            </div>
          )
        })}
        {/* The ball that becomes the shot */}
        <span
          className="lu-ball pointer-events-none absolute size-[7%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          style={{
            left: `${(LINEUP.ball.x / LINEUP.W) * 100}%`,
            top: `${((LINEUP.ball.y - LINEUP.top) / VIEW_H) * 100}%`,
            background: 'radial-gradient(circle, rgba(255,140,60,0.95) 0%, rgba(255,106,26,0.6) 35%, rgba(255,106,26,0) 70%)',
            boxShadow: '0 0 80px 30px rgba(255,106,26,0.45)',
          }}
        />
      </div>
      </div>

      {/* The name slams in across the bottom */}
      {player && <Banner key={player.slug} p={player} />}

      {/* Impact flash */}
      <div className="lu-flash pointer-events-none absolute inset-0 z-30 bg-chalk opacity-0" aria-hidden="true" />
      {/* Lights out (scroll end) */}
      <div className="lu-dark pointer-events-none absolute inset-0 z-30 bg-ink opacity-0" aria-hidden="true" />

      <p className="lu-hint pointer-events-none absolute inset-x-0 bottom-16 z-20 text-center font-mono text-[11px] font-bold tracking-[0.3em] text-tar uppercase">
        {touch ? 'Tap a player · tap again to enter' : 'Hover a player · click to enter'} ↓ scroll
      </p>
    </section>
  )
}

function SilhouetteVideo({ id, clip }: { id: string; clip: string }) {
  const mask = `url(/lineup/${id}.webp)`
  return (
    <video
      className="absolute inset-0 h-full w-full max-w-none object-cover pop-in"
      style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', opacity: 0.62, mixBlendMode: 'hard-light', filter: 'saturate(1.4) contrast(1.15)' }}
      autoPlay
      muted
      playsInline
      loop
      poster={`/media/${clip}.jpg`}
      aria-hidden="true"
    >
      <source src={`/media/${clip}.webm`} type="video/webm" />
      <source src={`/media/${clip}.mp4`} type="video/mp4" />
    </video>
  )
}

function Banner({ p }: { p: Player }) {
  return (
    <div className="pointer-events-none absolute bottom-16 left-3 z-20 flex max-w-[94vw] -rotate-2 items-end gap-3 sm:left-8 sm:gap-5">
      <span className="display slam bg-tar px-3 pt-2 pb-1 text-[clamp(56px,11vw,170px)] leading-[0.85] text-volt shadow-[8px_8px_0_#ff4d00]">{p.name}</span>
      <span className="slam flex flex-col items-start gap-1" style={{ animationDelay: '90ms' }}>
        <span className="display bg-fire px-2 text-[clamp(34px,5vw,72px)] leading-[0.95] text-tar">#{p.number}</span>
        <span className="marker -rotate-3 text-[clamp(18px,2vw,30px)] whitespace-nowrap">
          {p.position} · {p.height}
        </span>
      </span>
    </div>
  )
}
