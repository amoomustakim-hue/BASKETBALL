'use client'

import { useEffect, useRef, useState } from 'react'
import { useChrome, useReveal } from './Chrome'
import { PLAYERS, type Player } from '@/lib/players'
import { gsap, isTouch } from '@/lib/motion'

export function cardImage(p: Player) {
  if (p.image.kind === 'lineup') return `/lineup/${p.image.id}.webp`
  return p.image.src
}

/** A framed black-and-white portrait (3:4) for lists and pages. */
export function portrait(p: Player) {
  return `/portraits/${p.image.kind === 'lineup' ? p.image.id : p.slug}.webp`
}

/**
 * The players, as an index. Names in a column, numbers in gold. Rest on a
 * name and his portrait rises beside the pointer; the rest of the list
 * steps back. Click to meet him.
 */
export function Draft() {
  const root = useRef<HTMLElement>(null)
  const float = useRef<HTMLDivElement>(null)
  const [hot, setHot] = useState<Player | null>(null)
  const [touch, setTouch] = useState(false)
  const { enter } = useChrome()
  useReveal(root)

  useEffect(() => setTouch(isTouch()), [])

  useEffect(() => {
    if (touch) return
    const x = gsap.quickTo(float.current, 'x', { duration: 0.9, ease: 'expo.out' })
    const y = gsap.quickTo(float.current, 'y', { duration: 0.9, ease: 'expo.out' })
    const move = (e: PointerEvent) => {
      x(e.clientX + 40)
      y(e.clientY - 220)
    }
    addEventListener('pointermove', move, { passive: true })
    return () => removeEventListener('pointermove', move)
  }, [touch])

  const players = PLAYERS.filter((p) => p.position !== 'Coach')

  return (
    <section id="players" ref={root} className="relative border-t border-line bg-ink px-5 py-28 sm:px-10 sm:py-40" aria-label="The players">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label" data-reveal>
              Chapter I
            </p>
            <h2 className="serif mt-4 text-[clamp(56px,8vw,140px)] leading-[0.9]" data-reveal>
              The players
            </h2>
          </div>
          <p className="max-w-[380px] text-[15px] leading-relaxed text-stone" data-reveal>
            Every one of them earned the jersey. Names, numbers and measurements are placeholders until the academy confirms them.
          </p>
        </div>

        <ol className="mt-16 border-t border-line" onPointerLeave={() => setHot(null)}>
          {players.map((p) => (
            <li key={p.slug} data-reveal>
              <button
                type="button"
                onPointerEnter={() => !touch && setHot(p)}
                onClick={(e) => {
                  const img = (touch ? e.currentTarget.querySelector('img') : float.current?.querySelector('img')) as HTMLImageElement | null
                  if (img) enter({ from: img.getBoundingClientRect(), src: portrait(p), href: `/players/${p.slug}` })
                }}
                className={`group grid w-full grid-cols-[3.5rem_1fr_auto] items-center gap-4 border-b border-line py-5 text-left transition-opacity duration-700 sm:grid-cols-[6rem_1fr_10rem_6rem_2rem] sm:py-7 ${hot && hot.slug !== p.slug ? 'opacity-35' : 'opacity-100'}`}
              >
                <span className="font-mono text-[13px] text-gold">No. {p.number}</span>
                <span className="serif text-[clamp(32px,4.4vw,68px)] leading-none transition-transform duration-700 ease-[var(--ease-calm)] group-hover:translate-x-3">{p.name}</span>
                <span className="label hidden sm:block">{p.position}</span>
                <span className="label hidden sm:block">{p.height}</span>
                {touch ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={portrait(p)} alt="" className="h-16 w-12 object-cover [filter:grayscale(1)]" />
                ) : (
                  <span className="text-right text-stone transition-colors duration-500 group-hover:text-gold" aria-hidden="true">
                    →
                  </span>
                )}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* The portrait that follows the pointer */}
      {!touch && (
        <div ref={float} className="pointer-events-none fixed top-0 left-0 z-40 h-[400px] w-[300px]" aria-hidden="true">
          {hot && (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={hot.slug} src={portrait(hot)} alt="" className="rise absolute inset-0 h-full w-full object-cover [filter:grayscale(1)_contrast(1.05)]" />
          )}
        </div>
      )}
    </section>
  )
}
