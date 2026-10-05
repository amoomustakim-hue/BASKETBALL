'use client'

import { useRef } from 'react'
import { useChrome } from './Chrome'
import { gsap, useScene } from '@/lib/motion'

const ROW_A = ['/photos/elite.webp', '/media/hl-arena.jpg', '/photos/bench.webp', '/media/hl-game.jpg', '/photos/bwb.webp']
const ROW_B = ['/media/hl-huddle.jpg', '/photos/dunk.webp', '/media/hl-drills.jpg', '/photos/flex.webp', '/media/hl-crew.jpg']

/**
 * Elite 50: a counter half a screen tall runs to 50 with the scroll, while
 * camp photos slide past in black and white. The volt spotlight follows the
 * cursor; whatever it touches comes back in colour.
 */
export function Elite() {
  const root = useRef<HTMLElement>(null)
  const { quarter } = useChrome()

  useScene(root, ({ motion }) => {
    const num = root.current!.querySelector('.el-num')!
    const st = { v: 0 }
    gsap.to(st, {
      v: 50,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top 75%', end: 'center 45%', scrub: 0.4, onToggle: (s) => s.isActive && quarter('Q2 · Elite 50') },
      onUpdate: () => (num.textContent = String(Math.round(st.v)).padStart(2, '0')),
    })
    if (!motion) return
    gsap.fromTo('.el-row-a', { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    gsap.fromTo('.el-row-b', { xPercent: -30 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
  })

  return (
    <section
      id="elite"
      ref={root}
      className="relative overflow-hidden bg-ink py-24 sm:py-32"
      aria-label="Elite 50"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--sx', `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty('--sy', `${e.clientY - r.top}px`)
      }}
    >
      <div className="relative z-10 mx-auto flex max-w-[1400px] flex-col gap-2 px-5 sm:px-10">
        <p className="font-mono text-[11px] tracking-[0.35em] text-ash uppercase">Banire × adidas basketball camp</p>
        <div className="flex items-end gap-4">
          <span className="el-num display text-[clamp(160px,38vw,520px)] leading-[0.78] text-chalk tabular-nums">00</span>
          <span className="display mb-[3vw] text-[clamp(40px,9vw,140px)] text-volt">Elite</span>
        </div>
        <p className="max-w-[520px] text-[17px] leading-relaxed text-chalk/75 sm:text-[19px]">Top 50 prospects. One camp. Every rep watched, every name written down.</p>
      </div>

      <div className="relative mt-14 flex flex-col gap-4">
        {[ROW_A, ROW_B].map((row, r) => (
          <div key={r} className={`${r ? 'el-row-b' : 'el-row-a'} flex w-max gap-4 px-4 will-change-transform`}>
            {[...row, ...row].map((src, i) => (
              <figure key={i} className="group relative h-[34vw] max-h-[340px] min-h-[180px] w-[50vw] max-w-[520px] min-w-[260px] overflow-hidden rounded-[6px] bg-concrete">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover [filter:grayscale(1)_contrast(1.15)_brightness(.8)] transition-[filter,transform] duration-500 group-hover:scale-[1.04] group-hover:[filter:grayscale(0)_contrast(1.05)]" />
              </figure>
            ))}
          </div>
        ))}
        {/* Volt spotlight that follows the cursor */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-soft-light [background:radial-gradient(220px_220px_at_var(--sx,50%)_var(--sy,50%),rgba(212,255,58,0.85),transparent_70%)]" />
      </div>
    </section>
  )
}
