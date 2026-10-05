'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { useChrome, useReveal } from './Chrome'
import { portrait } from './Draft'
import { find, next as nextOf } from '@/lib/players'
import { gsap, useScene } from '@/lib/motion'

/**
 * A player's page: his portrait, his numbers, his film. Calm and plain; the
 * work speaks. Details are placeholders until the academy confirms them.
 */
export function PlayerView({ slug }: { slug: string }) {
  const p = find(slug)!
  const nxt = nextOf(slug)
  const root = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const { enter } = useChrome()
  const coach = p.position === 'Coach'
  useReveal(root)

  useScene(
    root,
    ({ motion }) => {
      if (!motion) return
      gsap
        .timeline({ delay: 0.3 })
        .fromTo('.pl-portrait', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 2, ease: 'expo.out' })
        .fromTo('.pl-line', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.6, stagger: 0.15, ease: 'expo.out' }, 0.3)
      gsap.to('.pl-portrait', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.pl-hero', start: 'top top', end: 'bottom top', scrub: true } })
    },
    [slug],
  )

  const measures: [string, string][] = coach
    ? [
        ['Role', 'Founder & Head Coach'],
        ['Academy', 'Banire, Lagos'],
      ]
    : [
        ['Position', p.position],
        ['Height', p.height],
        ['Wingspan', p.wingspan],
        ['Vertical', p.vertical],
        ['Class', p.classOf],
      ]

  return (
    <div ref={root} className="bg-ink">
      {/* Portrait and name */}
      <section className="pl-hero relative min-h-svh overflow-hidden px-5 pt-28 pb-16 sm:px-10">
        <div className="mx-auto grid max-w-[1440px] items-end gap-10 lg:min-h-[calc(100svh-11rem)] lg:grid-cols-2">
          <div className="pl-portrait relative order-2 mx-auto aspect-[3/4] w-full max-w-[520px] overflow-hidden bg-coal lg:order-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait(p)} alt={p.name} className="absolute inset-0 h-full w-full object-cover [filter:grayscale(1)_contrast(1.05)]" />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-coal to-transparent" />
          </div>
          <div className="order-1 lg:order-2 lg:pb-6">
            <Link href="/#players" className="label pl-line inline-block transition-colors duration-500 hover:text-gold">
              ← The players
            </Link>
            <p className="pl-line mt-10 font-mono text-[14px] text-gold">{coach ? 'Staff' : `No. ${p.number}`}</p>
            <h1 className="pl-line serif mt-3 text-[clamp(64px,9vw,150px)] leading-[0.9]">{p.name}</h1>
            <dl className="pl-line mt-12 grid grid-cols-2 border-t border-line sm:grid-cols-3">
              {measures.map(([k, v]) => (
                <div key={k} className="border-b border-line py-5 pr-4">
                  <dt className="label">{k}</dt>
                  <dd className="serif mt-2 text-[34px] leading-none">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="label pl-line mt-6">Details are placeholders until the academy confirms them.</p>
          </div>
        </div>
      </section>

      {/* Film */}
      <section className="border-t border-line px-5 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="serif text-[clamp(48px,6vw,96px)] leading-none" data-reveal>
              Film
            </h2>
            <div className="flex flex-wrap gap-6" data-reveal>
              {p.reel.chapters.map(([label, t]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (!video.current) return
                    video.current.currentTime = t
                    video.current.play().catch(() => {})
                  }}
                  className="label transition-colors duration-500 hover:text-gold"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-10 overflow-hidden bg-coal" data-reveal-img>
            <video ref={video} className="aspect-video w-full bg-black object-contain" src={p.reel.src} poster={p.reel.poster} controls playsInline preload="metadata" />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="border-t border-line px-5 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1fr_2fr]">
          <p className="label" data-reveal>
            {coach ? 'In his words' : 'Scouting notes'}
          </p>
          <p className="serif text-[clamp(30px,3.4vw,54px)] leading-[1.1] text-bone/90" data-reveal>
            {coach
              ? 'Placeholder: a few lines from the coach about why he started Banire and what he asks of every player.'
              : 'Placeholder: two or three honest lines from the coaching staff on how he plays, how he works and where he is going.'}
          </p>
        </div>
      </section>

      {/* Next */}
      <section className="border-t border-line px-5 py-20 sm:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-8">
          <Link href="/#apply" className="label transition-colors duration-500 hover:text-gold">
            For coaches and scouts: request full film →
          </Link>
          <button
            type="button"
            className="group flex items-center gap-6 text-left"
            onClick={(e) => {
              const img = e.currentTarget.querySelector('img')!
              enter({ from: img.getBoundingClientRect(), src: portrait(nxt), href: `/players/${nxt.slug}` })
            }}
          >
            <span className="relative h-28 w-20 overflow-hidden bg-coal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portrait(nxt)} alt="" className="absolute h-full w-full object-cover [filter:grayscale(1)] transition-[filter] duration-700 group-hover:[filter:grayscale(0)]" />
            </span>
            <span>
              <span className="label block">Next</span>
              <span className="serif block text-[clamp(36px,4vw,64px)] leading-none transition-colors duration-500 group-hover:text-gold">{nxt.name}</span>
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}
