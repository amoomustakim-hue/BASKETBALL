'use client'

import Lenis from 'lenis'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, ScrollTrigger, reduced } from '@/lib/motion'

/* ---------- Context: smooth scroll + a calm page transition ---------- */

type Enter = (opts: { from: DOMRect; src: string; href: string }) => void
const Ctx = createContext<{ lenis: Lenis | null; enter: Enter }>({ lenis: null, enter: () => {} })
export const useChrome = () => useContext(Ctx)

export function Chrome({ children }: { children: ReactNode }) {
  const router = useRouter()
  const path = usePathname()
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const veil = useRef<HTMLDivElement>(null)
  const ghost = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (reduced()) return
    const l = new Lenis({ lerp: 0.085, smoothWheel: true })
    l.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => l.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    setLenis(l)
    return () => {
      gsap.ticker.remove(raf)
      l.destroy()
    }
  }, [])

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    if (!hash) {
      lenis?.scrollTo(0, { immediate: true })
      window.scrollTo(0, 0)
    }
    const t = setTimeout(() => ScrollTrigger.refresh(), 150)
    if (veil.current?.dataset.on === '1') {
      veil.current.dataset.on = '0'
      gsap.to(veil.current, { opacity: 0, duration: 1, delay: 0.1, ease: 'power2.out', onComplete: () => gsap.set(veil.current, { display: 'none' }) })
    }
    return () => clearTimeout(t)
  }, [path, lenis])

  // A player is chosen: everything else falls away and he holds the frame
  // for a moment, then the page changes.
  const enter = useCallback<Enter>(
    ({ from, src, href }) => {
      const v = veil.current, g = ghost.current
      if (!v || !g || reduced()) return router.push(href)
      g.src = src
      v.dataset.on = '1'
      gsap.set(v, { display: 'block', opacity: 1, backgroundColor: 'rgba(13,13,12,0)' })
      gsap.set(g, { left: from.left, top: from.top, width: from.width, height: from.height, opacity: 1, x: 0, y: 0, scale: 1, filter: 'grayscale(0)' })
      lenis?.stop()
      gsap
        .timeline({
          onComplete: () => {
            lenis?.start()
            router.push(href)
          },
        })
        .to(v, { backgroundColor: 'rgba(13,13,12,1)', duration: 0.7, ease: 'power2.inOut' }, 0)
        .to(g, { x: innerWidth / 2 - (from.left + from.width / 2), y: innerHeight * 0.06, scale: Math.min(1.5, (innerHeight * 0.8) / from.height), duration: 1.1, ease: 'expo.inOut' }, 0)
        .to(g, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 1)
    },
    [lenis, router],
  )

  return (
    <Ctx.Provider value={{ lenis, enter }}>
      <Nav />
      {children}
      <div ref={veil} data-on="0" className="fixed inset-0 z-[90] hidden" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={ghost} alt="" className="absolute object-contain" />
      </div>
      <div className="grain" aria-hidden="true" />
    </Ctx.Provider>
  )
}

/* ---------- Nav ---------- */

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-baseline gap-2 ${className}`}>
      <span className="serif text-[26px] leading-none">Banire</span>
      <span className="label text-[10px]">Basketball Academy</span>
    </span>
  )
}

const LINKS = [
  ['The players', '/#players'],
  ['Elite 50', '/#elite'],
  ['Alumni', '/#alumni'],
  ['Apply', '/#apply'],
]

function Nav() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-700 ${solid || open ? 'bg-ink/85 backdrop-blur-md' : ''}`}>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:h-20 sm:px-10">
        <Link href="/" aria-label="Banire Basketball Academy" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
          {LINKS.map(([l, h]) => (
            <Link key={h} href={h} className="label text-bone/80 transition-colors duration-500 hover:text-gold">
              {l}
            </Link>
          ))}
        </nav>
        <button type="button" className="label text-bone md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {open && (
        <nav className="border-t border-line px-5 pb-6 md:hidden" aria-label="Main">
          {LINKS.map(([l, h]) => (
            <Link key={h} href={h} onClick={() => setOpen(false)} className="serif block border-b border-line py-4 text-[34px]">
              {l}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}

/** Lines of text that rise slowly into place as they enter. */
export function useReveal(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!root.current || reduced()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
      })
      gsap.utils.toArray<HTMLElement>('[data-reveal-img]').forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(12% 8% 12% 8%)', scale: 1.08 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } })
      })
    }, root)
    return () => ctx.revert()
  }, [root])
}
