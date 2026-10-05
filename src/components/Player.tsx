'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useChrome } from './Chrome'
import { cardImage } from './Draft'
import { find, next as nextOf, type Player } from '@/lib/players'
import { gsap, useScene } from '@/lib/motion'
import { crowd, dribble, flick, hum, squeak, swish } from '@/lib/sound'

/** Deterministic shot chart for a player (placeholder data). */
function shots(slug: string) {
  let x = 0
  for (const c of slug) x = (x * 33 + c.charCodeAt(0)) % 100003
  const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280)
  return Array.from({ length: 34 }, () => {
    const a = Math.PI * (0.05 + rnd() * 0.9)
    const d = 20 + rnd() * 230
    return { x: 250 + Math.cos(a) * d, y: 40 + Math.sin(a) * d * 0.95, made: rnd() < 0.52 }
  })
}

const FEET = [5 * 12, 7 * 12 + 6] // ruler: 5'0" to 7'6"

export function PlayerView({ slug }: { slug: string }) {
  const p = find(slug)!
  const nxt = nextOf(slug)
  const root = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const [leaving, setLeaving] = useState(false)
  const { quarter } = useChrome()
  const photo = p.image.kind === 'photo'

  useScene(root, ({ motion }) => {
    quarter(`${p.position === 'Coach' ? 'Staff' : 'Scouting report'} · #${p.number}`)
    // Entry: the name builds itself behind him, he rises in.
    gsap
      .timeline({ delay: 0.25 })
      .fromTo('.pl-letter', { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: 'expo.out', onStart: () => crowd(1.6, 0.2) })
      .fromTo('.pl-hero', { y: 80, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' }, 0.1)
      .fromTo('.pl-meta > *', { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.4 }, 0.5)
    if (!motion) return
    gsap.to('.pl-hero', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.pl-entry', start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('.pl-name', { yPercent: -25, ease: 'none', scrollTrigger: { trigger: '.pl-entry', start: 'top top', end: 'bottom top', scrub: true } })
    // Arena screen + rating card.
    gsap.fromTo('.pl-screen', { rotateX: 18, y: 60, opacity: 0 }, { rotateX: 0, y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.pl-screen', start: 'top 85%' } })
    gsap.fromTo('.pl-card', { x: 120, rotate: 8, opacity: 0 }, { x: 0, rotate: -3, opacity: 1, duration: 0.8, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.pl-card', start: 'top 85%', onEnter: () => flick() } })
    // Attribute bars charge one by one.
    gsap.utils.toArray<HTMLElement>('.pl-bar').forEach((b, i) => {
      gsap.fromTo(
        b,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, delay: i * 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.pl-attrs', start: 'top 75%', onEnter: () => setTimeout(() => hum(0.8 + i * 0.1), i * 120) } },
      )
    })
    gsap.utils.toArray<HTMLElement>('.pl-val').forEach((v) => {
      const n = Number(v.dataset.v)
      const o = { v: 0 }
      gsap.to(o, { v: n, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.pl-attrs', start: 'top 75%' }, onUpdate: () => (v.textContent = String(Math.round(o.v))) })
    })
    // Height marker climbs the ruler.
    gsap.fromTo('.pl-mark', { bottom: '0%' }, { bottom: `${((p.heightIn - FEET[0]) / (FEET[1] - FEET[0])) * 100}%`, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.pl-ruler', start: 'top 70%', onEnter: () => dribble(0.8) } })
    // Shot chart: makes pop in one by one.
    gsap.fromTo('.pl-shot', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, stagger: { each: 0.05, onStart: () => Math.random() < 0.3 && swish() }, ease: 'back.out(3)', transformOrigin: 'center', scrollTrigger: { trigger: '.pl-court', start: 'top 70%' } })
  }, [slug])

  const walkOn = () => {
    if (leaving) return
    setLeaving(true)
    squeak()
    gsap.to('.pl-hero', { x: '-120vw', duration: 0.6, ease: 'power2.in' })
    gsap.to('.pl-name', { opacity: 0, duration: 0.4, onComplete: () => router.push(`/players/${nxt.slug}`) })
  }

  const makes = shots(slug)
  const pct = Math.round((makes.filter((s) => s.made).length / makes.length) * 100)

  return (
    <div ref={root} className="bg-ink">
      {/* 1. Entry */}
      <section className={`pl-entry relative h-svh min-h-[620px] overflow-hidden ${photo ? "" : "bg-volt text-tar"}`}>
        {!photo && <div className="halftone opacity-40" aria-hidden="true" />}
        {!photo && <div aria-hidden="true" className="hazard absolute -top-6 -right-24 h-14 w-[60vw] rotate-6 shadow-[0_8px_0_#0b0b0b]" />}
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={(p.image as { src: string }).src} alt="" className="pl-hero absolute inset-0 h-full w-full object-cover [filter:grayscale(1)_contrast(1.15)_brightness(.6)]" />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_45%,rgba(255,194,14,0.16),transparent_70%)]" />
        <h1 className={`pl-name display pointer-events-none absolute inset-x-0 top-[18svh] overflow-hidden text-center text-[clamp(64px,19vw,300px)] leading-[0.85] ${photo ? "text-chalk/90" : "text-tar"}`} aria-label={p.name}>
          {p.name.split(' ').map((w, wi) => (
            <span key={wi} className="block whitespace-nowrap">
              {w.split('').map((c, i) => (
                <span key={i} className="pl-letter inline-block">
                  {c}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <span aria-hidden="true" className="display absolute right-[4%] bottom-[6%] text-[clamp(120px,24vw,360px)] text-transparent [-webkit-text-stroke:3px_#ff4d00]">
          {p.number}
        </span>
        {!photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cardImage(p)}
            alt={p.name}
            className="pl-hero absolute bottom-0 left-1/2 h-[84svh] w-auto max-w-none -translate-x-1/2 [filter:saturate(1.3)_drop-shadow(3px_0_0_#fff)_drop-shadow(-3px_0_0_#fff)_drop-shadow(0_-3px_0_#fff)_drop-shadow(16px_16px_0_#0b0b0b)]"
            style={{ transform: 'translateX(-50%)' }}
          />
        )}
        <div className="pl-meta absolute bottom-6 left-5 flex flex-col gap-2 sm:bottom-10 sm:left-10">
          <Link href="/#lineup" className="font-mono text-[11px] tracking-[0.3em] text-ash uppercase hover:text-chalk" data-cursor="BACK">
            ← The lineup
          </Link>
          <span className="w-fit rounded-[4px] bg-volt px-2 py-1 font-mono text-[11px] font-bold tracking-widest text-ink uppercase">
            #{p.number} · {p.position} · {p.height}
          </span>
          <span className="font-mono text-[10px] tracking-widest text-ash uppercase">Details are placeholders</span>
        </div>
      </section>

      {/* 2. Arena screen + rating card */}
      <section className="relative px-5 py-24 sm:px-10">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="[perspective:1200px]">
            <div className="pl-screen relative rounded-[14px] p-[3px]" style={{ background: 'linear-gradient(90deg,#ffc20e,#ff6a1a,#ffc20e,#f2f1ec,#ffc20e)', backgroundSize: '300% 100%', animation: 'led 3s linear infinite' }}>
              <div className="overflow-hidden rounded-[12px] bg-ink">
                <div className="flex items-center justify-between border-b border-chalk/10 px-4 py-2 font-mono text-[10px] tracking-widest text-ash uppercase">
                  <span>
                    <span className="mr-2 inline-block size-1.5 animate-pulse rounded-full bg-[#ff3b2f]" />
                    Arena screen · film
                  </span>
                  <span>{p.name}</span>
                </div>
                <video ref={video} className="aspect-video w-full bg-black object-contain" src={p.reel.src} poster={p.reel.poster} controls playsInline preload="metadata" />
                <div className="flex flex-wrap gap-2 p-3">
                  {p.reel.chapters.map(([label, t]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        if (!video.current) return
                        video.current.currentTime = t
                        video.current.play().catch(() => {})
                        flick()
                      }}
                      className="h-9 rounded-full border border-chalk/15 px-3.5 font-mono text-[11px] tracking-widest uppercase transition-colors hover:border-volt hover:text-volt"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <RatingCard p={p} />
        </div>
      </section>

      {/* 3. Attributes + measurements */}
      <section className="px-5 py-20 sm:px-10">
        <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div className="pl-attrs">
            <h2 className="display text-[clamp(48px,7vw,96px)]">
              Attributes <span className="text-volt">{p.ovr}</span>
            </h2>
            <ul className="mt-8 flex flex-col gap-5">
              {p.attrs.map(([label, v]) => (
                <li key={label} className="flex flex-col gap-2">
                  <span className="flex items-baseline justify-between font-mono text-[12px] tracking-widest uppercase">
                    {label}
                    <span className="pl-val display text-[28px] text-chalk" data-v={v}>
                      {v}
                    </span>
                  </span>
                  <span className="relative block h-3 overflow-hidden rounded-[2px] bg-steel">
                    <span className="pl-bar absolute inset-y-0 left-0 origin-left bg-[linear-gradient(90deg,#ff8a00,#ffc20e)] shadow-[0_0_18px_rgba(255,194,14,.6)]" style={{ width: `${v}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pl-ruler flex gap-8">
            <div className="relative h-[460px] w-20 border-l-2 border-chalk/30">
              {Array.from({ length: (FEET[1] - FEET[0]) / 2 + 1 }, (_, i) => FEET[0] + i * 2).map((inch) => (
                <span key={inch} className="absolute left-0 flex items-center gap-2 font-mono text-[10px] text-ash" style={{ bottom: `${((inch - FEET[0]) / (FEET[1] - FEET[0])) * 100}%` }}>
                  <span className={`h-px bg-chalk/40 ${inch % 12 === 0 ? 'w-6' : 'w-3'}`} />
                  {inch % 12 === 0 ? `${inch / 12}'0"` : ''}
                </span>
              ))}
              <span className="pl-mark absolute left-[-2px] flex items-center gap-2" style={{ bottom: 0 }}>
                <span className="h-[3px] w-16 bg-volt shadow-[0_0_14px_#ffc20e]" />
                <span className="display text-[34px] whitespace-nowrap text-volt">{p.height}</span>
              </span>
            </div>
            <dl className="flex flex-col justify-end gap-6">
              {[
                ['Height', p.height],
                ['Wingspan', p.wingspan],
                ['Vertical', p.vertical],
                ['Class', p.classOf],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[10px] tracking-[0.3em] text-ash uppercase">{k}</dt>
                  <dd className="display text-[40px]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 4. Shot chart */}
      <section className="px-5 py-20 sm:px-10">
        <div className="mx-auto max-w-[900px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display text-[clamp(48px,7vw,96px)]">Shot chart</h2>
            <p className="font-mono text-[12px] tracking-widest text-ash uppercase">
              <span className="text-volt">●</span> Make <span className="ml-3 text-ash">●</span> Miss · {pct}% (placeholder)
            </p>
          </div>
          <svg viewBox="0 0 500 300" className="pl-court mt-8 w-full rounded-[10px] bg-[#16110c]" aria-label="Shot chart">
            <rect x="0" y="0" width="500" height="300" fill="url(#wood)" />
            <defs>
              <pattern id="wood" width="500" height="18" patternUnits="userSpaceOnUse">
                <rect width="500" height="18" fill="#1b140d" />
                <rect y="17" width="500" height="1" fill="#000" opacity="0.35" />
              </pattern>
            </defs>
            <g fill="none" stroke="#f2f1ec" strokeOpacity="0.55" strokeWidth="2">
              <path d="M10 10 H490 V290 H10 Z" />
              <rect x="190" y="10" width="120" height="150" />
              <circle cx="250" cy="160" r="45" />
              <path d="M40 10 V90 A 220 220 0 0 0 460 90 V10" />
              <path d="M220 34 H280" stroke="#ff6a1a" strokeWidth="3" strokeOpacity="1" />
              <circle cx="250" cy="44" r="9" stroke="#ff6a1a" strokeOpacity="1" />
            </g>
            {makes.map((s, i) => (
              <circle key={i} className="pl-shot" cx={s.x} cy={s.y} r="6" fill={s.made ? '#ffc20e' : 'none'} stroke={s.made ? 'none' : '#8a8a90'} strokeWidth="2" style={{ transformBox: 'fill-box' }} />
            ))}
          </svg>
        </div>
      </section>

      {/* 5. Scouts + next player */}
      <section className="px-5 pt-10 pb-28 sm:px-10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-10 border-t border-chalk/10 pt-14 md:flex-row md:items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-ash uppercase">For coaches & scouts</p>
            <Link href="/#contact" className="display mt-2 inline-block text-[clamp(40px,6vw,80px)] hover:text-volt" data-cursor="FILM">
              Request full film →
            </Link>
          </div>
          <button type="button" onClick={walkOn} className="group flex items-center gap-5 text-left" data-cursor="NEXT">
            <span className="relative h-28 w-20 overflow-hidden rounded-[8px] bg-concrete">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cardImage(nxt)} alt="" className={`absolute h-full w-full ${nxt.image.kind === 'photo' ? 'object-cover' : 'object-contain object-bottom'} [filter:grayscale(1)] transition-[filter] group-hover:[filter:grayscale(0)]`} />
            </span>
            <span>
              <span className="block font-mono text-[11px] tracking-[0.3em] text-ash uppercase">Next player</span>
              <span className="display block text-[clamp(36px,5vw,64px)] transition-colors group-hover:text-volt">{nxt.name} →</span>
            </span>
          </button>
        </div>
      </section>
      <style>{`@keyframes led { to { background-position: 300% 0 } }`}</style>
    </div>
  )
}

function RatingCard({ p }: { p: Player }) {
  return (
    <div className="pl-card relative mx-auto aspect-[5/7] w-full max-w-[340px] overflow-hidden rounded-[16px] border border-chalk/20 bg-[linear-gradient(160deg,#26262b,#0d0d0f)] shadow-[0_40px_80px_-30px_rgba(255,194,14,.3)]">
      <span className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_30%,rgba(255,194,14,.2),transparent)]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cardImage(p)} alt="" className={`absolute ${p.image.kind === 'photo' ? 'inset-0 h-full w-full object-cover opacity-70' : 'bottom-[20%] left-1/2 h-[72%] w-auto max-w-none -translate-x-1/2'}`} />
      <span className="absolute top-4 left-4 flex flex-col items-center leading-none">
        <span className="display text-[52px] text-volt">{p.ovr}</span>
        <span className="font-mono text-[10px] tracking-widest">OVR</span>
      </span>
      <span className="display absolute top-4 right-4 text-[34px]">#{p.number}</span>
      <span className="absolute inset-x-0 bottom-0 bg-[linear-gradient(transparent,rgba(10,10,11,.96)_35%)] px-4 pt-12 pb-4">
        <span className="display block text-[34px] leading-none">{p.name}</span>
        <span className="mt-2 grid grid-cols-3 gap-1 font-mono text-[10px] tracking-widest uppercase">
          {p.attrs.slice(0, 6).map(([k, v]) => (
            <span key={k} className="flex justify-between gap-1 text-chalk/70">
              {k.slice(0, 3)} <b className="text-chalk">{v}</b>
            </span>
          ))}
        </span>
      </span>
    </div>
  )
}
