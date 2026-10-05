'use client'

import { useRef } from 'react'
import { useChrome } from './Chrome'
import { gsap, useScene } from '@/lib/motion'

/**
 * Caution tape. Two giant bands cross the screen like an X and run faster
 * (and lean harder) the faster you scroll; scroll back and they reverse.
 */
export function Tape() {
  const root = useRef<HTMLElement>(null)
  const { lenis } = useChrome()
  const lenisRef = useRef(lenis)
  lenisRef.current = lenis

  useScene(root, () => {
    const rows = gsap.utils.toArray<HTMLElement>('.tp-row')
    const pos = rows.map(() => 0)
    let dir = 1
    let skew = 0
    const tick = () => {
      const v = (lenisRef.current?.velocity ?? 0) * 60
      if (v) dir = v > 0 ? 1 : -1
      const speed = 1.2 + Math.min(18, Math.abs(v) / 120)
      skew += ((Math.max(-14, Math.min(14, v / 160)) - skew) * 0.15)
      rows.forEach((r, i) => {
        const w = r.scrollWidth / 2
        pos[i] = (pos[i] - speed * dir * (i ? -1 : 1)) % w
        if (pos[i] > 0) pos[i] -= w
        gsap.set(r, { x: pos[i], skewX: skew * (i ? -1 : 1) })
      })
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  })

  const A = ['Lagos', 'builds', 'ballers', 'hoops', 'heat', 'hustle']
  const B = ['Elite 50', 'Banire', 'Top 50 prospects', 'Lagos', 'Next up']
  return (
    <section ref={root} className="relative h-[70vh] min-h-[460px] overflow-hidden bg-fire" aria-hidden="true">
      <div className="halftone opacity-40" />
      <div className="absolute top-1/2 left-[-10%] w-[120%] -translate-y-[70%] rotate-[-7deg] border-y-[6px] border-tar bg-volt py-3 shadow-[0_14px_0_rgba(0,0,0,.4)]">
        <div className="tp-row flex w-max will-change-transform">
          {[...Array(2)].flatMap((_, k) =>
            A.map((w, i) => (
              <span key={`${k}${i}`} className="display flex items-center px-6 text-[clamp(70px,11vw,170px)] leading-none text-tar">
                {w}
                <span className="ml-12 inline-block size-[0.4em] rotate-45 bg-tar" />
              </span>
            )),
          )}
        </div>
      </div>
      <div className="absolute top-1/2 left-[-10%] w-[120%] -translate-y-[10%] rotate-[6deg] border-y-[6px] border-volt bg-tar py-3 shadow-[0_14px_0_rgba(0,0,0,.4)]">
        <div className="tp-row flex w-max will-change-transform">
          {[...Array(2)].flatMap((_, k) =>
            B.map((w, i) => (
              <span key={`${k}${i}`} className="display flex items-center px-6 text-[clamp(70px,11vw,170px)] leading-none text-volt">
                {w}
                <span className="ml-12 text-fire">✦</span>
              </span>
            )),
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * ELITE 50 as a window. The camp footage plays through the letters; scroll
 * and you fly through the gap in the "0" until the footage fills the screen.
 */
export function Window() {
  const root = useRef<HTMLElement>(null)
  const { quarter } = useChrome()

  useScene(root, ({ mobile }) => {
    gsap
      .timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: mobile ? '+=150%' : '+=200%', pin: true, scrub: 0.5, onToggle: (s) => s.isActive && quarter('Q2 · Elite 50') },
      })
      .fromTo('.wn-text', { scale: 1 }, { scale: mobile ? 26 : 34, ease: 'power3.in', duration: 1 }, 0)
      .fromTo('.wn-mask', { opacity: 1 }, { opacity: 0, duration: 0.12 }, 0.86)
      .fromTo('.wn-cap', { opacity: 1, y: 0 }, { opacity: 0, y: -30, duration: 0.15 }, 0.05)
      .fromTo('.wn-after', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.1 }, 0.9)
  })

  return (
    <section ref={root} className="relative h-svh overflow-hidden bg-tar" aria-label="Elite 50">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted playsInline loop poster="/media/hl-arena.jpg" aria-hidden="true">
        <source src="/media/hl-arena.webm" type="video/webm" />
        <source src="/media/hl-arena.mp4" type="video/mp4" />
      </video>
      {/* The mask: black everywhere except the letters (multiply knocks out white) */}
      <div className="wn-mask absolute inset-0 grid place-items-center bg-tar mix-blend-multiply">
        <span className="wn-text display block origin-[60%_52%] text-[clamp(120px,30vw,520px)] leading-none whitespace-nowrap text-white will-change-transform">Elite 50</span>
      </div>
      <p className="wn-cap marker absolute inset-x-0 bottom-[12%] -rotate-2 text-center text-[clamp(22px,3vw,40px)] text-volt">banire × adidas · top 50 prospects · one camp</p>
      <div className="wn-after absolute inset-x-0 bottom-[10%] px-5 text-center opacity-0">
        <p className="display text-[clamp(44px,8vw,120px)] text-chalk [text-shadow:6px_6px_0_#0b0b0b]">Every rep watched.</p>
        <p className="display text-[clamp(44px,8vw,120px)] text-volt [text-shadow:6px_6px_0_#0b0b0b]">Every name written down.</p>
      </div>
    </section>
  )
}
