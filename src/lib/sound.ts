/**
 * The arena, synthesised with Web Audio: no sound files to download. Silent
 * until the visitor chooses "Enter the arena".
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let on = false
const listeners = new Set<(v: boolean) => void>()

export const soundOn = () => on
export function onSound(fn: (v: boolean) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function setSound(v: boolean) {
  on = v
  if (v && !ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)
  }
  if (v) ctx?.resume()
  try {
    localStorage.setItem('banire-sound', v ? '1' : '0')
  } catch {}
  listeners.forEach((f) => f(v))
}

function env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
}

function noise(seconds: number) {
  const c = ctx!
  const b = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const s = c.createBufferSource()
  s.buffer = b
  return s
}

const ready = () => on && ctx && master

/** Ball on hardwood: a pitched-down thump. */
export function dribble(strength = 1) {
  if (!ready()) return
  const c = ctx!, t = c.currentTime
  const o = c.createOscillator(), g = c.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(150, t)
  o.frequency.exponentialRampToValueAtTime(48, t + 0.12)
  env(g, t, 0.9 * strength, 0.004, 0.16)
  o.connect(g).connect(master!)
  o.start(t)
  o.stop(t + 0.2)
}

/** Sneaker squeak. */
export function squeak() {
  if (!ready()) return
  const c = ctx!, t = c.currentTime
  const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter()
  o.type = 'sawtooth'
  o.frequency.setValueAtTime(2300, t)
  o.frequency.linearRampToValueAtTime(3100 + Math.random() * 600, t + 0.07)
  f.type = 'bandpass'
  f.frequency.value = 2800
  f.Q.value = 6
  env(g, t, 0.08, 0.005, 0.08)
  o.connect(f).connect(g).connect(master!)
  o.start(t)
  o.stop(t + 0.1)
}

/** The net: filtered noise brushing past. */
export function swish() {
  if (!ready()) return
  const c = ctx!, t = c.currentTime
  const n = noise(0.5), f = c.createBiquadFilter(), g = c.createGain()
  f.type = 'bandpass'
  f.frequency.setValueAtTime(1800, t)
  f.frequency.exponentialRampToValueAtTime(5200, t + 0.35)
  f.Q.value = 0.8
  env(g, t, 0.5, 0.03, 0.4)
  n.connect(f).connect(g).connect(master!)
  n.start(t)
}

/** Shot-clock buzzer. */
export function buzzer() {
  if (!ready()) return
  const c = ctx!, t = c.currentTime
  ;[220, 223].forEach((fq) => {
    const o = c.createOscillator(), g = c.createGain()
    o.type = 'square'
    o.frequency.value = fq
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.02)
    g.gain.setValueAtTime(0.16, t + 0.85)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1)
    o.connect(g).connect(master!)
    o.start(t)
    o.stop(t + 1.05)
  })
}

/** Arena light bank slamming on. */
export function clunk() {
  if (!ready()) return
  const c = ctx!, t = c.currentTime
  const n = noise(0.25), f = c.createBiquadFilter(), g = c.createGain()
  f.type = 'lowpass'
  f.frequency.value = 600
  env(g, t, 0.7, 0.002, 0.22)
  n.connect(f).connect(g).connect(master!)
  n.start(t)
  dribble(0.6)
}

/** Shot clock tick. */
export function tick() {
  if (!ready()) return
  const c = ctx!, t = c.currentTime
  const o = c.createOscillator(), g = c.createGain()
  o.type = 'square'
  o.frequency.value = 1800
  env(g, t, 0.05, 0.001, 0.03)
  o.connect(g).connect(master!)
  o.start(t)
  o.stop(t + 0.05)
}

/** Card dealt / flipped. */
export function flick() {
  if (!ready()) return
  const c = ctx!, t = c.currentTime
  const n = noise(0.08), f = c.createBiquadFilter(), g = c.createGain()
  f.type = 'highpass'
  f.frequency.value = 2500
  env(g, t, 0.25, 0.002, 0.06)
  n.connect(f).connect(g).connect(master!)
  n.start(t)
}

/** Crowd swell: a wash of band-passed noise. */
export function crowd(seconds = 1.6, peak = 0.22) {
  if (!ready()) return
  const c = ctx!, t = c.currentTime
  const n = noise(seconds), f = c.createBiquadFilter(), g = c.createGain()
  f.type = 'bandpass'
  f.frequency.value = 900
  f.Q.value = 0.5
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + seconds * 0.4)
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds)
  n.connect(f).connect(g).connect(master!)
  n.start(t)
}

/** Electric hum as attribute bars charge. */
export function hum(pitch = 1) {
  if (!ready()) return
  const c = ctx!, t = c.currentTime
  const o = c.createOscillator(), g = c.createGain()
  o.type = 'triangle'
  o.frequency.setValueAtTime(140 * pitch, t)
  o.frequency.linearRampToValueAtTime(420 * pitch, t + 0.5)
  env(g, t, 0.07, 0.02, 0.5)
  o.connect(g).connect(master!)
  o.start(t)
  o.stop(t + 0.6)
}

/** Ball off the rim. */
export function clank() {
  if (!ready()) return
  const c = ctx!, t = c.currentTime
  ;[620, 940, 1330].forEach((fq, i) => {
    const o = c.createOscillator(), g = c.createGain()
    o.type = 'sine'
    o.frequency.value = fq
    env(g, t, 0.12 / (i + 1), 0.002, 0.35)
    o.connect(g).connect(master!)
    o.start(t)
    o.stop(t + 0.4)
  })
}

/** Phones: a tiny buzz on big moments (Android). */
export const haptic = (ms = 18) => {
  try {
    navigator.vibrate?.(ms)
  } catch {}
}
