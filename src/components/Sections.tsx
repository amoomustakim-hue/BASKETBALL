'use client'

import { useRef, useState } from 'react'
import { useReveal } from './Chrome'
import { ALUMNI, COACH, ELITE } from '@/lib/academy'
import { gsap, useScene } from '@/lib/motion'

/** The coach, in his own words. */
export function Coach() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  return (
    <section id="coach" ref={root} className="relative bg-ink px-5 py-28 sm:px-10 sm:py-44" aria-label="The coach">
      <div className="mx-auto grid max-w-[1440px] items-end gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
        <figure className="relative mx-auto aspect-[3/4] w-full max-w-[460px] overflow-hidden bg-coal" data-reveal-img>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/portraits/coach.webp" alt={COACH.name} className="absolute inset-0 h-full w-full object-cover [filter:grayscale(1)_contrast(1.05)]" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/90 to-transparent" />
          <figcaption className="label absolute bottom-4 left-4">
            {COACH.name} · {COACH.title}
          </figcaption>
        </figure>
        <div>
          <p className="label" data-reveal>
            The coach
          </p>
          <blockquote className="serif mt-6 text-[clamp(38px,4.8vw,80px)] leading-[1.02]" data-reveal>
            <span className="text-gold">“</span>
            {COACH.quote}
            <span className="text-gold">”</span>
          </blockquote>
          <div className="mt-10 grid max-w-[640px] gap-5 text-[17px] leading-relaxed text-bone/75" data-reveal>
            {COACH.about.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
          <dl className="mt-14 grid grid-cols-3 border-t border-line" data-reveal>
            {COACH.facts.map(([k, v]) => (
              <div key={k} className="border-r border-line pt-5 pr-4 last:border-r-0">
                <dt className="label">{k}</dt>
                <dd className="serif mt-2 text-[clamp(30px,3.4vw,52px)] leading-none">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

/** Chapter II: the Elite 50 camp, told like a documentary. */
export function Elite() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  useScene(root, ({ motion }) => {
    if (!motion) return
    gsap.fromTo('.el-film', { clipPath: 'inset(14% 10% 14% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.el-film', start: 'top 90%', end: 'top 20%', scrub: true } })
    gsap.fromTo('.el-film video', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.el-film', start: 'top bottom', end: 'bottom top', scrub: true } })
  })
  return (
    <section id="elite" ref={root} className="relative border-t border-line bg-ink py-28 sm:py-40" aria-label="Elite 50">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-10 lg:grid-cols-2">
        <div>
          <p className="label" data-reveal>
            Chapter II
          </p>
          <h2 className="serif mt-4 text-[clamp(56px,8vw,140px)] leading-[0.9]" data-reveal>
            Elite 50
          </h2>
        </div>
        <p className="self-end text-[18px] leading-relaxed text-bone/75 lg:max-w-[520px]" data-reveal>
          {ELITE.intro}
        </p>
      </div>

      <div className="el-film relative mx-auto mt-16 aspect-[16/9] w-full max-w-[1600px] overflow-hidden bg-coal sm:mt-24">
        <video className="absolute inset-0 h-full w-full object-cover [filter:grayscale(.85)_contrast(1.05)]" autoPlay muted playsInline loop poster="/media/hl-arena.jpg" aria-label="Footage from the Elite 50 camp">
          <source src="/media/hl-arena.webm" type="video/webm" />
          <source src="/media/hl-arena.mp4" type="video/mp4" />
        </video>
      </div>

      <dl className="mx-auto mt-16 grid max-w-[1440px] grid-cols-3 border-t border-line px-5 sm:px-10">
        {ELITE.facts.map(([n, l]) => (
          <div key={l} className="border-r border-line pt-6 pr-4 last:border-r-0" data-reveal>
            <dd className="serif text-[clamp(48px,6vw,104px)] leading-none">{n}</dd>
            <dt className="label mt-3">{l}</dt>
          </div>
        ))}
      </dl>

      <div className="mx-auto mt-20 grid max-w-[1440px] gap-4 px-5 sm:grid-cols-3 sm:gap-6 sm:px-10">
        {[
          ['/photos/elite.webp', 'Camp floor'],
          ['/photos/bench.webp', 'Waiting their turn'],
          ['/photos/bwb.webp', 'On to the next stage'],
        ].map(([src, cap], i) => (
          <figure key={src} className={i === 1 ? 'sm:mt-24' : ''}>
            <div className="aspect-[4/5] overflow-hidden bg-coal" data-reveal-img>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover [filter:grayscale(1)_contrast(1.05)]" />
            </div>
            <figcaption className="label mt-3">{cap}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/** Chapter III: where they went. */
export function Alumni() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  return (
    <section id="alumni" ref={root} className="border-t border-line bg-ink px-5 py-28 sm:px-10 sm:py-40" aria-label="Alumni">
      <div className="mx-auto max-w-[1440px]">
        <p className="label" data-reveal>
          Chapter III
        </p>
        <h2 className="serif mt-4 text-[clamp(56px,8vw,140px)] leading-[0.9]" data-reveal>
          Where they went
        </h2>
        <table className="mt-16 w-full border-t border-line text-left">
          <thead className="sr-only">
            <tr>
              <th>Player</th>
              <th>Destination</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            {ALUMNI.map(([n, d, y], i) => (
              <tr key={i} className="border-b border-line" data-reveal>
                <td className="serif py-6 text-[clamp(26px,3vw,44px)] leading-none text-bone/90">{n}</td>
                <td className="py-6 text-[15px] text-bone/75">{d}</td>
                <td className="py-6 text-right font-mono text-[13px] text-gold">{y}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="label mt-6">Placeholder list until the academy confirms names.</p>
      </div>
    </section>
  )
}

/** Applications: plain and serious. Not connected to anything yet. */
export function Apply() {
  const root = useRef<HTMLElement>(null)
  const [sent, setSent] = useState(false)
  useReveal(root)
  return (
    <section id="apply" ref={root} className="border-t border-line bg-coal px-5 py-28 sm:px-10 sm:py-40" aria-label="Apply">
      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-2">
        <div>
          <p className="label" data-reveal>
            Applications
          </p>
          <h2 className="serif mt-4 text-[clamp(56px,7vw,120px)] leading-[0.92]" data-reveal>
            Earn your place.
          </h2>
          <p className="mt-8 max-w-[460px] text-[17px] leading-relaxed text-bone/75" data-reveal>
            Applications for the academy and the next Elite 50 camp are read by the coaching staff. Tell us who you are and send your film.
          </p>
        </div>
        {sent ? (
          <p className="serif self-center text-[40px] leading-tight" data-reveal>
            Received. The staff will be in touch.
            <span className="label mt-4 block">Demo: this form is not connected yet.</span>
          </p>
        ) : (
          <form
            className="grid gap-x-6 gap-y-8 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
            data-reveal
          >
            {[
              ['Full name', 'text'],
              ['Age', 'number'],
              ['Position', 'text'],
              ['Height', 'text'],
              ['Phone or WhatsApp', 'tel'],
              ['Link to film', 'url'],
            ].map(([l, t]) => (
              <label key={l} className="flex flex-col gap-2">
                <span className="label">{l}</span>
                <input type={t} required={l !== 'Link to film'} className="border-b border-line bg-transparent pb-2 text-[19px] outline-none transition-colors duration-500 focus:border-gold" />
              </label>
            ))}
            <button type="submit" className="label mt-2 h-14 justify-self-start border border-bone/40 px-8 text-bone transition-colors duration-500 hover:border-gold hover:text-gold sm:col-span-2">
              Send application
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
