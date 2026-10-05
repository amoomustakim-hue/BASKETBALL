'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useLayoutEffect, type RefObject } from 'react'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const useIso = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

/** Scoped GSAP setup that cleans itself up. */
export function useScene(root: RefObject<HTMLElement | null>, setup: (ctx: { mobile: boolean; motion: boolean }) => void | (() => void), deps: unknown[] = []) {
  useIso(() => {
    if (!root.current) return
    let cleanup: void | (() => void)
    const c = gsap.context(() => {
      cleanup = setup({ mobile: window.innerWidth < 768, motion: !reduced() })
    }, root)
    return () => {
      if (typeof cleanup === 'function') cleanup()
      c.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a))
