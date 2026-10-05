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

  const light = (id: string | null) => {
    if (id === hovering.current) return
    hovering.current = id
    setActive(id)
    if (id) {
      squeak()
      crowd(1.2, 0.12)
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
              haptic(10)
            }
          }
        },
      },
    })
    tl.to('.lu-stage', { scale: 1.1, ease: 'none', duration: 0.2 }, 0)
      .to('.lu-word', { yPercent: -18, scale: 1.06, ease: 'none', duration: 0.2 }, 0)
      .to('.lu-hint', { opacity: 0, duration: 0.05 }, 0.05)
      .to('.lu-dark', { opacity: 0.88, ease: 'power1.in', duration: 0.2 }, 0.76)
      .fromTo('.lu-ball', { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, ease: 'back.out(2)', duration: 0.12 }, 0.82)
      .to('.lu-word', { opacity: 0.12, duration: 0.15 }, 0.78)
      .to({}, { duration: 0.06 })
  })


  return (
    <section id="lineup" ref={root} className="relative h-svh overflow-hidden bg-ink" aria-label="The lineup">
      {/* Street-light glow */}
      <div aria-hidden="true" className="flicker absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(242,241,236,0.13),transparent)]" />

      {/* The road, at night (under the word) */}
      <div aria-hidden="true" className="lu-stage absolute bottom-0 left-1/2 aspect-[1210/1208] h-[min(100svh,130vw)] origin-bottom -translate-x-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/lineup/bg.webp" alt="" className="absolute max-w-none [filter:grayscale(1)_brightness(.32)_contrast(1.25)]" style={FULL} />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_80%,transparent,rgba(10,10,11,0.9))]" />
      </div>

      <h1 className="lu-word display pointer-events-none absolute inset-x-0 top-[13svh] text-center text-[27vw] text-chalk/95 select-none sm:top-[9svh] sm:text-[24vw]" aria-label="Banire">
        Banire
      </h1>

      <div
        ref={stage}
        className="lu-stage absolute bottom-0 left-1/2 aspect-[1210/1208] h-[min(100svh,130vw)] origin-bottom -translate-x-1/2"
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
        {/* The team */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lineup/players.webp"
          alt="The Banire Basketball team on a Lagos road"
          className="absolute max-w-none transition-[filter] duration-300"
          style={{ ...FULL, filter: `grayscale(1) contrast(1.15) brightness(${shown ? 0.3 : 0.95})` }}
        />
        {/* The lit player: colour, volt rim, and his highlight inside his body */}
        {IDS.map((id) => {
          const on = shown === id
          const p = byId(id)
          return (
            <div key={id} className="pointer-events-none absolute" style={place(LINEUP.boxes[id])}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-cut={id}
                src={`/lineup/${id}.webp`}
                alt=""
                className="absolute inset-0 h-full w-full max-w-none transition-opacity duration-200"
                style={{ opacity: on ? 1 : 0, filter: 'drop-shadow(0 0 1.5px #d4ff3a) drop-shadow(0 0 14px rgba(212,255,58,0.55))' }}
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
        {/* Name tag at his feet */}
        {player && <Tag p={player} box={LINEUP.boxes[shown!]} />}
      </div>

      {/* Lights out (scroll end) */}
      <div className="lu-dark pointer-events-none absolute inset-0 bg-ink opacity-0" aria-hidden="true" />

      <p className="lu-hint pointer-events-none absolute inset-x-0 bottom-5 text-center font-mono text-[11px] tracking-[0.3em] text-chalk/70 uppercase">
        {touch ? 'Tap a player · tap again to enter' : 'Hover a player · click to enter'} <span className="text-volt">↓ scroll</span>
      </p>
    </section>
  )
}

function SilhouetteVideo({ id, clip }: { id: string; clip: string }) {
  const mask = `url(/lineup/${id}.webp)`
  return (
    <video
      className="absolute inset-0 h-full w-full max-w-none object-cover pop-in"
      style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', opacity: 0.88, mixBlendMode: 'screen' }}
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

function Tag({ p, box }: { p: Player; box: { x: number; y: number; w: number; h: number } }) {
  const style = place(box)
  return (
    <div
      key={p.slug}
      className="pointer-events-none absolute z-10 flex -translate-x-1/2 flex-col items-center pop-in"
      style={{ left: `calc(${style.left} + ${style.width} / 2)`, top: `min(calc(${style.top} + ${style.height} - 4%), 90%)` }}
    >
      <span className="rounded-[4px] bg-volt px-2 py-1 font-mono text-[10px] font-bold tracking-widest whitespace-nowrap text-ink uppercase sm:text-[11px]">
        #{p.number} · {p.position} · {p.height}
      </span>
      <span className="display mt-1 text-[clamp(18px,2.4vw,30px)] whitespace-nowrap text-chalk [text-shadow:0_2px_18px_rgba(0,0,0,.9)]">{p.name}</span>
    </div>
  )
}
