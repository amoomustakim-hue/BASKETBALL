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
    gsap.fromTo('.el-row-a', { xPercent: 0 }, { xPercent: -35, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    gsap.fromTo('.el-row-b', { xPercent: -30 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
  })

  return (
    <section id="elite" ref={root} className="relative overflow-hidden bg-volt py-24 text-tar sm:py-32" aria-label="Elite 50 camp">
      <div className="halftone opacity-35" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex max-w-[1400px] flex-col gap-2 px-5 sm:px-10">
        <p className="marker -rotate-2 text-[clamp(20px,2.4vw,32px)] text-fire">the camp everybody wants in</p>
        <div className="flex items-end gap-4">
          <span className="el-num display text-[clamp(170px,40vw,560px)] leading-[0.76] tabular-nums [text-shadow:12px_12px_0_#ff4d00]">00</span>
          <span className="display mb-[3vw] bg-tar px-3 text-[clamp(40px,9vw,140px)] text-volt">Elite</span>
        </div>
        <p className="max-w-[560px] text-[18px] font-medium sm:text-[21px]">Top 50 prospects. One camp. Banire × adidas.</p>
      </div>

      <div className="relative mt-16 flex flex-col gap-8">
        {[ROW_A, ROW_B].map((row, r) => (
          <div key={r} className={`${r ? 'el-row-b' : 'el-row-a'} flex w-max gap-10 px-6 will-change-transform`}>
            {[...row, ...row].map((src, i) => (
              <figure
                key={i}
                className="group relative h-[30vw] max-h-[320px] min-h-[170px] w-[42vw] max-w-[460px] min-w-[240px] shrink-0 border-[10px] border-b-[34px] border-chalk bg-chalk shadow-[12px_14px_0_#0b0b0b] transition-transform duration-200 hover:z-10 hover:scale-105 hover:rotate-0"
                style={{ transform: `rotate(${((i * 37 + r * 11) % 13) - 6}deg)` }}
              >
                <span className="tape -top-4 left-1/2 -translate-x-1/2 rotate-[-4deg]" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover [filter:grayscale(1)_contrast(1.35)] transition-[filter] duration-200 group-hover:[filter:grayscale(0)_saturate(1.3)]" />
                <span className="marker absolute -bottom-[30px] left-2 text-[17px] text-tar">{['day 1', 'the run', 'locked in', 'lagos', 'elite 50'][(i + r) % 5]}</span>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
