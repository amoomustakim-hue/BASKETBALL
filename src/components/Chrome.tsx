'use client'

import Lenis from 'lenis'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, ScrollTrigger, isTouch, reduced } from '@/lib/motion'
import { buzzer, clunk, dribble, onSound, setSound, soundOn, tick } from '@/lib/sound'

/* ---------- Context: smooth scroll + the dive transition ---------- */

type Dive = (opts: { from: DOMRect; src: string; href: string; focus?: [number, number] }) => void
const Ctx = createContext<{ lenis: Lenis | null; dive: Dive; quarter: (q: string) => void }>({ lenis: null, dive: () => {}, quarter: () => {} })
export const useChrome = () => useContext(Ctx)

export function Chrome({ children }: { children: ReactNode }) {
  const router = useRouter()
  const path = usePathname()
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const [q, setQ] = useState('Q1 · The Lineup')
  const overlay = useRef<HTMLDivElement>(null)
  const ghost = useRef<HTMLImageElement>(null)

  // Lenis, driven by GSAP's ticker so ScrollTrigger stays in sync.
  useEffect(() => {
    if (reduced()) return
    const l = new Lenis({ lerp: 0.11, smoothWheel: true })
    l.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => l.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    setLenis(l)

    // Dribble in step with scrolling (sound on only).
    let acc = 0
    l.on('scroll', (e: Lenis) => {
      acc += Math.abs(e.velocity)
      if (acc > 140) {
        acc = 0
        dribble(Math.min(1, 0.35 + Math.abs(e.velocity) / 60))
      }
    })
    return () => {
      gsap.ticker.remove(raf)
      l.destroy()
    }
  }, [])

  // New page: top, and recalc triggers.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    const t = setTimeout(() => ScrollTrigger.refresh(), 120)
    // Arrived from a dive: lift the black.
    if (overlay.current && overlay.current.dataset.on === '1') {
      overlay.current.dataset.on = '0'
      gsap.to(overlay.current, { opacity: 0, duration: 0.7, delay: 0.15, ease: 'power2.out', onComplete: () => gsap.set(overlay.current, { display: 'none' }) })
    }
    return () => clearTimeout(t)
  }, [path, lenis])

  const dive = useCallback<Dive>(
    ({ from, src, href, focus = [0.5, 0.2] }) => {
      const o = overlay.current, g = ghost.current
      if (!o || !g) return router.push(href)
      g.src = src
      gsap.set(o, { display: 'block', opacity: 1, background: 'rgba(10,10,11,0)' })
      gsap.set(g, { left: from.left, top: from.top, width: from.width, height: from.height, opacity: 1, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`, scale: 1, filter: 'brightness(1)' })
      o.dataset.on = '1'
      lenis?.stop()
      // Fly through his silhouette: centre on him, then push through the chest.
      const cx = innerWidth / 2 - (from.left + from.width * focus[0])
      const cy = innerHeight / 2 - (from.top + from.height * focus[1])
      gsap
        .timeline({
          onComplete: () => {
            lenis?.start()
            router.push(href)
          },
        })
        .to(o, { background: 'rgba(10,10,11,1)', duration: 0.35, ease: 'power2.in' }, 0)
        .to(g, { x: cx, y: cy, scale: 1.6, duration: 0.45, ease: 'power3.inOut' }, 0)
        .to(g, { scale: 26, filter: 'brightness(0)', duration: 0.6, ease: 'expo.in' }, 0.4)
    },
    [lenis, router],
  )

  return (
    <Ctx.Provider value={{ lenis, dive, quarter: setQ }}>
      <Preloader />
      <Cursor />
      <Nav quarter={q} />
      {children}
      <div ref={overlay} data-on="0" className="fixed inset-0 z-[90] hidden" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={ghost} alt="" className="absolute object-contain" />
      </div>
      <div className="grain" aria-hidden="true" />
    </Ctx.Provider>
  )
}

/* ---------- Tip-off: shot clock, buzzer, lights ---------- */

function Preloader() {
  const [stage, setStage] = useState<'clock' | 'choose' | 'gone'>('clock')
  const [n, setN] = useState(24)
  const root = useRef<HTMLDivElement>(null)
  const lights = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let seen = false
    try {
      seen = !!sessionStorage.getItem('banire-tip')
      sessionStorage.setItem('banire-tip', '1')
    } catch {}
    if (seen || reduced()) {
      setStage('gone')
      return
    }
    document.documentElement.style.overflow = 'hidden'
    // 24 → 0, speeding up.
    let k = 24
    let timer: ReturnType<typeof setTimeout>
    const step = () => {
      k -= 1
      setN(k)
      tick()
      if (k > 0) timer = setTimeout(step, Math.max(22, 70 - (24 - k) * 3))
      else {
        buzzer()
        // Flash, then the light banks.
        const tl = gsap.timeline({ onComplete: () => setStage('choose') })
        tl.to(root.current, { backgroundColor: '#f2f1ec', duration: 0.05 })
          .to(root.current, { backgroundColor: '#0a0a0b', duration: 0.4 })
          .add(() => {
            lights.current?.querySelectorAll('span').forEach((s, i) => {
              gsap.to(s, { opacity: 1, duration: 0.05, delay: i * 0.12, onStart: clunk })
            })
          })
      }
    }
    timer = setTimeout(step, 250)
    return () => clearTimeout(timer)
  }, [])

  const enter = (withSound: boolean) => {
    setSound(withSound)
    if (withSound) {
      clunk()
    }
    gsap.to(root.current, {
      yPercent: -100,
      duration: 0.9,
      ease: 'expo.inOut',
      onComplete: () => {
        document.documentElement.style.overflow = ''
        setStage('gone')
        ScrollTrigger.refresh()
      },
    })
  }

  if (stage === 'gone') return null
  return (
    <div ref={root} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink" role="dialog" aria-label="Tip-off">
      <div ref={lights} className="absolute inset-x-0 top-0 flex justify-center gap-[6vw] pt-6" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="h-3 w-[10vw] rounded-full bg-chalk opacity-0 shadow-[0_0_60px_30px_rgba(242,241,236,0.35)]" />
        ))}
      </div>
      {stage === 'clock' ? (
        <div className="flex flex-col items-center gap-4">
          <span className="font-mono text-[11px] tracking-[0.4em] text-ash uppercase">Shot clock</span>
          <span
            className="font-mono text-[min(42vw,280px)] leading-none font-bold tabular-nums text-[#ff3b2f]"
            style={{ textShadow: '0 0 30px rgba(255,59,47,0.75), 0 0 90px rgba(255,59,47,0.35)' }}
          >
            {String(n).padStart(2, '0')}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8 px-6 text-center pop-in">
          <p className="display text-[clamp(56px,11vw,150px)]">
            Banire
            <br />
            <span className="text-volt">Basketball</span>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => enter(true)} className="h-14 rounded-full bg-volt px-8 font-mono text-sm font-semibold tracking-wider text-ink uppercase transition-transform active:scale-95">
              🔊 Enter the arena
            </button>
            <button type="button" onClick={() => enter(false)} className="h-14 rounded-full border border-chalk/25 px-8 font-mono text-sm tracking-wider text-chalk/80 uppercase transition-colors hover:border-chalk/60">
              Enter quietly
            </button>
          </div>
          <p className="font-mono text-[11px] text-ash">Sound is optional. You can switch it any time.</p>
        </div>
      )}
    </div>
  )
}

/* ---------- Ball cursor ---------- */

function Cursor() {
  const el = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  useEffect(() => {
    if (isTouch()) return
    document.documentElement.classList.add('ball-cursor')
    const x = gsap.quickTo(el.current, 'x', { duration: 0.18, ease: 'power3.out' })
    const y = gsap.quickTo(el.current, 'y', { duration: 0.18, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      if (el.current) el.current.style.opacity = '1'
      x(e.clientX)
      y(e.clientY)
      const t = (e.target as HTMLElement)?.closest?.('[data-cursor]') as HTMLElement | null
      setLabel(t?.dataset.cursor ?? '')
    }
    const down = () => gsap.fromTo(el.current?.firstElementChild ?? null, { y: 0 }, { y: 10, duration: 0.09, yoyo: true, repeat: 1, ease: 'power2.in', onStart: () => dribble(0.5) })
    addEventListener('pointermove', move, { passive: true })
    addEventListener('pointerdown', down)
    return () => {
      document.documentElement.classList.remove('ball-cursor')
      removeEventListener('pointermove', move)
      removeEventListener('pointerdown', down)
    }
  }, [])
  return (
    <div ref={el} style={{ opacity: 0 }} className="pointer-events-none fixed top-0 left-0 z-[95] hidden [@media(hover:hover)_and_(pointer:fine)]:block" aria-hidden="true">
      <div className={`-translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-200 ${label ? 'size-16' : 'size-6'}`}>
        <Ball />
        {label && <span className="absolute inset-0 grid place-items-center font-mono text-[10px] font-bold tracking-widest text-ink">{label}</span>}
      </div>
    </div>
  )
}

export function Ball({ className = 'size-full', spin = false }: { className?: string; spin?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" style={spin ? { animation: 'spin 1.2s linear infinite' } : undefined}>
      <defs>
        <radialGradient id="ballg" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffb37a" />
          <stop offset="55%" stopColor="#ff6a1a" />
          <stop offset="100%" stopColor="#b8410a" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="url(#ballg)" />
      <g fill="none" stroke="#2b1405" strokeWidth="1.3" opacity="0.85">
        <path d="M20 1v38M1 20h38" />
        <path d="M7 6c6 7 6 21 0 28M33 6c-6 7-6 21 0 28" />
      </g>
    </svg>
  )
}

/* ---------- Nav: crest, scoreboard quarter, sound, timeout board ---------- */

export function Crest({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 40 40" className="size-8" aria-hidden="true">
        <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 1.5v37M1.5 20h37M8 6.5c5.5 7 5.5 20 0 27M32 6.5c-5.5 7-5.5 20 0 27" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        <rect x="4" y="15" width="32" height="10" rx="2" fill="#0a0a0b" stroke="currentColor" strokeWidth="1" />
        <text x="20" y="22.6" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="8" fill="currentColor" letterSpacing="0.5">BANIRE</text>
      </svg>
      <span className="display text-[17px] leading-none tracking-wide">
        Banire<span className="block font-mono text-[8px] tracking-[0.3em] text-ash">Basketball</span>
      </span>
    </span>
  )
}

const MENU = [
  ['01', 'The Lineup', '/#lineup'],
  ['02', 'Elite 50', '/#elite'],
  ['03', 'Draft Board', '/#draft'],
  ['04', 'The Pathway', '/#pathway'],
  ['05', 'You’re Next', '/#next'],
]

function Nav({ quarter }: { quarter: string }) {
  const [open, setOpen] = useState(false)
  const [sound, setS] = useState(false)
  useEffect(() => {
    setS(soundOn())
    return onSound(setS)
  }, [])
  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between p-4 sm:p-6">
        <Link href="/" className="pointer-events-auto text-chalk" aria-label="Banire Basketball home" data-cursor="HOME">
          <Crest />
        </Link>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSound(!sound)}
            className="flex h-10 items-center gap-2 rounded-full border border-chalk/15 bg-ink/60 px-3.5 font-mono text-[11px] tracking-widest uppercase backdrop-blur-md transition-colors hover:border-volt/60"
            aria-pressed={sound}
            data-cursor={sound ? 'MUTE' : 'SOUND'}
          >
            <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="w-[2px] bg-volt" style={{ height: sound ? `${40 + ((i * 37) % 60)}%` : '20%', animation: sound ? `eq 0.${6 + i}s ease-in-out ${i * 0.1}s infinite alternate` : undefined }} />
              ))}
            </span>
            {sound ? 'Sound on' : 'Sound off'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-10 rounded-full bg-chalk px-4 font-mono text-[11px] font-semibold tracking-widest text-ink uppercase transition-transform active:scale-95"
            data-cursor="MENU"
          >
            Timeout
          </button>
        </div>
      </header>

      {/* Scoreboard quarter, bottom left */}
      <div className="pointer-events-none fixed bottom-4 left-4 z-50 hidden items-center gap-2 rounded-md border border-chalk/10 bg-ink/70 px-3 py-2 font-mono text-[11px] tracking-widest uppercase backdrop-blur-md sm:flex">
        <span className="size-1.5 animate-pulse rounded-full bg-[#ff3b2f]" />
        {quarter}
      </div>

      {/* Timeout board menu */}
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-md pop-in" role="dialog" aria-label="Menu" onClick={() => setOpen(false)}>
          <div className="relative w-full max-w-[680px] rounded-[28px] border-4 border-[#3a2a1a] bg-[#24452f] p-6 shadow-2xl sm:p-10" onClick={(e) => e.stopPropagation()}>
            {/* coach's whiteboard court */}
            <svg viewBox="0 0 300 160" className="pointer-events-none absolute inset-0 h-full w-full opacity-15" preserveAspectRatio="none" aria-hidden="true">
              <rect x="10" y="10" width="280" height="140" fill="none" stroke="#fff" strokeWidth="1.5" />
              <path d="M150 10v140M10 50h50v60H10M290 50h-50v60h50" fill="none" stroke="#fff" strokeWidth="1.5" />
              <circle cx="150" cy="80" r="22" fill="none" stroke="#fff" strokeWidth="1.5" />
            </svg>
            <div className="relative flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-[0.3em] text-chalk/70 uppercase">Timeout. Pick a play.</span>
              <button type="button" onClick={() => setOpen(false)} className="font-mono text-xs tracking-widest uppercase hover:text-volt" data-cursor="BACK">
                Close ✕
              </button>
            </div>
            <ol className="relative mt-6 flex flex-col">
              {MENU.map(([n, l, h]) => (
                <li key={h}>
                  <Link href={h} onClick={() => setOpen(false)} className="group flex items-baseline gap-4 border-b border-chalk/15 py-3" data-cursor="GO">
                    <span className="font-mono text-xs text-chalk/50">{n}</span>
                    <span className="display text-[clamp(34px,7vw,64px)] text-chalk transition-colors group-hover:text-volt" style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
                      {l}
                    </span>
                    <span className="ml-auto font-mono text-xs text-volt opacity-0 transition-opacity group-hover:opacity-100">✕ → ○</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
      <style>{`@keyframes eq { from { transform: scaleY(0.4) } to { transform: scaleY(1) } } @keyframes spin { to { transform: rotate(360deg) } } [style*="eq"] { transform-origin: bottom }`}</style>
    </>
  )
}
