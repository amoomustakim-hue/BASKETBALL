'use client'

import { useEffect, useRef, useState } from 'react'
import { Ball, useChrome } from './Chrome'
import { gsap, useScene } from '@/lib/motion'
import { clank, crowd, dribble, flick, haptic, hum, swish } from '@/lib/sound'

const POSITIONS = ['Guard', 'Wing', 'Big'] as const
const HEIGHTS = [`5'10"`, `6'0"`, `6'2"`, `6'4"`, `6'6"`, `6'8"`, `6'10"`, `7'0"`]

const rating = (name: string, pos: string, h: string) => {
  let x = 7
  for (const c of `${name}|${pos}|${h}`) x = (x * 31 + c.charCodeAt(0)) % 9973
  return 72 + (x % 18)
}

/**
 * The finale. "With the next pick, Banire selects... YOU." The visitor builds
 * their own prospect card, downloads it as an Instagram Story, then has to
 * make a shot to unlock the Elite 50 application.
 */
export function YoureNext() {
  const root = useRef<HTMLElement>(null)
  const [name, setName] = useState('')
  const [pos, setPos] = useState<(typeof POSITIONS)[number]>('Wing')
  const [height, setHeight] = useState(`6'4"`)
  const [photo, setPhoto] = useState<string | null>(null)
  const [ovr, setOvr] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const { quarter } = useChrome()

  useScene(root, () => {
    gsap
      .timeline({ scrollTrigger: { trigger: root.current, start: 'top 60%', onToggle: (s) => s.isActive && quarter('Q4 · You’re next') } })
      .fromTo('.yn-spot', { opacity: 0 }, { opacity: 1, duration: 0.6 })
      .fromTo('.yn-pick', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .fromTo('.yn-you span', { opacity: 0, y: 40, rotate: 6 }, { opacity: 1, y: 0, rotate: 0, stagger: 0.12, duration: 0.4, ease: 'back.out(2)', onStart: () => crowd(2, 0.25) }, '+=0.25')
  })

  const roll = () => {
    if (rolling) return
    setRolling(true)
    const target = rating(name || 'You', pos, height)
    const st = { v: 40 }
    hum(1.2)
    gsap.to(st, {
      v: target,
      duration: 1.1,
      ease: 'power3.out',
      onUpdate: () => {
        setOvr(Math.round(st.v))
        if (Math.random() < 0.3) flick()
      },
      onComplete: () => {
        setRolling(false)
        crowd(1.2, 0.2)
        haptic(30)
      },
    })
  }

  const display = name.trim() || 'Your name'

  return (
    <section id="next" ref={root} className="relative overflow-hidden bg-ink py-28 sm:py-36" aria-label="You're next">
      <div aria-hidden="true" className="yn-spot pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(40%_70%_at_50%_0%,rgba(242,241,236,0.18),transparent_70%)]" />
      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-10">
        <p className="yn-pick text-center font-mono text-[12px] tracking-[0.35em] text-ash uppercase sm:text-[13px]">With the next pick, Banire selects…</p>
        <h2 className="yn-you display mt-4 text-center text-[clamp(110px,26vw,330px)] text-volt" aria-label="You">
          {'YOU.'.split('').map((c, i) => (
            <span key={i} className="inline-block">
              {c}
            </span>
          ))}
        </h2>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,420px)]">
          {/* Builder */}
          <div className="flex flex-col gap-6">
            <h3 className="display text-[clamp(36px,5vw,64px)]">Make your prospect card</h3>
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[11px] tracking-widest text-ash uppercase">Name</span>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value.slice(0, 18))
                  setOvr(null)
                }}
                placeholder="Type your name"
                className="h-14 rounded-[10px] border border-chalk/15 bg-concrete px-4 text-[18px] outline-none placeholder:text-ash focus:border-volt"
              />
            </label>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] tracking-widest text-ash uppercase">Position</span>
              <div className="grid grid-cols-3 gap-2">
                {POSITIONS.map((x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => {
                      setPos(x)
                      setOvr(null)
                      dribble(0.6)
                    }}
                    className={`display h-14 rounded-[10px] text-[22px] transition-colors ${pos === x ? 'bg-volt text-ink' : 'border border-chalk/15 bg-concrete hover:border-chalk/50'}`}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] tracking-widest text-ash uppercase">Height</span>
              <div className="flex flex-wrap gap-2">
                {HEIGHTS.map((x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => {
                      setHeight(x)
                      setOvr(null)
                    }}
                    className={`h-11 rounded-full px-4 font-mono text-[13px] transition-colors ${height === x ? 'bg-chalk text-ink' : 'border border-chalk/15 hover:border-chalk/50'}`}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-dashed border-chalk/25 p-4 transition-colors hover:border-volt">
              <span className="grid size-11 place-items-center rounded-full bg-concrete font-mono text-lg">+</span>
              <span className="text-[14px] text-chalk/80">
                Add a photo <span className="text-ash">(optional, stays on your device)</span>
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setPhoto(URL.createObjectURL(f))
                }}
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={roll} className="h-14 rounded-full bg-volt px-8 font-mono text-[13px] font-bold tracking-widest text-ink uppercase transition-transform active:scale-95">
                {ovr === null ? 'Get my rating' : 'Re-roll'}
              </button>
              <button
                type="button"
                disabled={ovr === null || rolling}
                onClick={() => downloadStory({ name: display, pos, height, ovr: ovr ?? 0, photo })}
                className="h-14 rounded-full border border-chalk/25 px-8 font-mono text-[13px] tracking-widest uppercase transition-colors hover:border-volt disabled:opacity-30"
              >
                Download for Stories
              </button>
            </div>
          </div>

          {/* Live card */}
          <div className="relative mx-auto aspect-[5/7] w-full max-w-[380px] overflow-hidden rounded-[18px] border border-chalk/20 bg-[linear-gradient(160deg,#26262b,#0d0d0f)] shadow-[0_40px_80px_-30px_rgba(212,255,58,.25)]">
            <span className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_30%,rgba(212,255,58,.22),transparent)]" />
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="absolute inset-x-0 top-[12%] mx-auto h-[62%] w-[78%] rounded-[12px] object-cover" />
            ) : (
              <div className="absolute inset-x-0 top-[16%] mx-auto grid size-[54%] place-items-center rounded-full border border-chalk/10">
                <Ball className="size-1/2 opacity-80" />
              </div>
            )}
            <span className="absolute top-4 left-4 flex flex-col items-center leading-none">
              <span className="display text-[46px] text-volt tabular-nums">{ovr ?? '??'}</span>
              <span className="font-mono text-[10px] tracking-widest text-chalk/70">OVR</span>
            </span>
            <span className="absolute top-5 right-4 font-mono text-[10px] tracking-[0.3em] text-chalk/60 uppercase">Banire</span>
            <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-[linear-gradient(transparent,rgba(10,10,11,.96)_35%)] px-5 pt-14 pb-5">
              <span className="display truncate text-[40px] leading-none">{display}</span>
              <span className="flex justify-between font-mono text-[11px] tracking-widest text-chalk/70 uppercase">
                <span>{pos}</span>
                <span>{height}</span>
                <span className="text-volt">Elite 50 hopeful</span>
              </span>
            </span>
          </div>
        </div>

        {/* The shot that unlocks the application */}
        <div className="mt-28">
          <h3 className="display text-center text-[clamp(44px,7vw,100px)]">
            Make it. <span className="text-volt">Apply.</span>
          </h3>
          <p className="mt-3 text-center text-[15px] text-chalk/70">Drag the ball back and let go. Score once to unlock the Elite 50 application.</p>
          {unlocked ? <Apply /> : <FlickShot onScore={() => setUnlocked(true)} onSkip={() => setUnlocked(true)} />}
        </div>
      </div>
    </section>
  )
}

/* ---------- Story export (1080x1920) ---------- */

async function downloadStory({ name, pos, height, ovr, photo }: { name: string; pos: string; height: string; ovr: number; photo: string | null }) {
  await document.fonts.load('100px Anton')
  const c = document.createElement('canvas')
  c.width = 1080
  c.height = 1920
  const g = c.getContext('2d')!
  g.fillStyle = '#0a0a0b'
  g.fillRect(0, 0, 1080, 1920)
  const glow = g.createRadialGradient(540, 700, 50, 540, 700, 760)
  glow.addColorStop(0, 'rgba(212,255,58,0.35)')
  glow.addColorStop(1, 'rgba(212,255,58,0)')
  g.fillStyle = glow
  g.fillRect(0, 0, 1080, 1920)
  g.fillStyle = '#f2f1ec'
  g.font = '64px Anton'
  g.textAlign = 'center'
  g.fillText('BANIRE BASKETBALL', 540, 170)
  g.font = '30px monospace'
  g.fillStyle = '#8a8a90'
  g.fillText('WITH THE NEXT PICK, BANIRE SELECTS', 540, 230)
  // card
  const x = 170, y = 300, w = 740, h = 1036
  g.save()
  g.beginPath()
  g.roundRect(x, y, w, h, 36)
  const cg = g.createLinearGradient(x, y, x + w, y + h)
  cg.addColorStop(0, '#26262b')
  cg.addColorStop(1, '#0d0d0f')
  g.fillStyle = cg
  g.fill()
  g.clip()
  if (photo) {
    const img = await new Promise<HTMLImageElement>((r) => {
      const i = new Image()
      i.onload = () => r(i)
      i.src = photo
    })
    const pw = 580, ph = 640, px = 540 - pw / 2, py = y + 130
    const s = Math.max(pw / img.width, ph / img.height)
    g.save()
    g.beginPath()
    g.roundRect(px, py, pw, ph, 24)
    g.clip()
    g.drawImage(img, px + (pw - img.width * s) / 2, py + (ph - img.height * s) / 2, img.width * s, img.height * s)
    g.restore()
  } else {
    g.strokeStyle = 'rgba(242,241,236,0.12)'
    g.lineWidth = 3
    g.beginPath()
    g.arc(540, y + 420, 210, 0, Math.PI * 2)
    g.stroke()
    g.fillStyle = '#ff6a1a'
    g.beginPath()
    g.arc(540, y + 420, 110, 0, Math.PI * 2)
    g.fill()
  }
  const fade = g.createLinearGradient(0, y + h - 380, 0, y + h)
  fade.addColorStop(0, 'rgba(10,10,11,0)')
  fade.addColorStop(0.4, 'rgba(10,10,11,0.95)')
  g.fillStyle = fade
  g.fillRect(x, y + h - 380, w, 380)
  g.restore()
  g.strokeStyle = 'rgba(242,241,236,0.25)'
  g.lineWidth = 3
  g.beginPath()
  g.roundRect(x, y, w, h, 36)
  g.stroke()
  g.textAlign = 'left'
  g.fillStyle = '#d4ff3a'
  g.font = '140px Anton'
  g.fillText(String(ovr), x + 46, y + 170)
  g.font = '28px monospace'
  g.fillStyle = 'rgba(242,241,236,0.7)'
  g.fillText('OVR', x + 56, y + 210)
  g.fillStyle = '#f2f1ec'
  g.font = '104px Anton'
  g.fillText(name.toUpperCase(), x + 46, y + h - 110, w - 92)
  g.font = '30px monospace'
  g.fillStyle = 'rgba(242,241,236,0.75)'
  g.fillText(`${pos.toUpperCase()}   ${height}`, x + 50, y + h - 50)
  g.textAlign = 'right'
  g.fillStyle = '#d4ff3a'
  g.fillText('ELITE 50 HOPEFUL', x + w - 50, y + h - 50)
  g.textAlign = 'center'
  g.fillStyle = '#d4ff3a'
  g.font = '120px Anton'
  g.fillText('YOU’RE NEXT.', 540, 1560)
  g.font = '34px monospace'
  g.fillStyle = '#f2f1ec'
  g.fillText('LAGOS BUILDS THEM. THE WORLD PLAYS THEM.', 540, 1650)
  g.fillStyle = '#8a8a90'
  g.font = '28px monospace'
  g.fillText('BANIRE BASKETBALL ACADEMY  ·  LAGOS', 540, 1820)
  const a = document.createElement('a')
  a.download = `banire-${name.toLowerCase().replace(/\W+/g, '-')}.png`
  a.href = c.toDataURL('image/png')
  a.click()
  swish()
}

/* ---------- The flick shot ---------- */

function FlickShot({ onScore, onSkip }: { onScore: () => void; onSkip: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null)
  const [misses, setMisses] = useState(0)
  const [made, setMade] = useState(false)
  const scored = useRef(onScore)
  scored.current = onScore

  useEffect(() => {
    const c = cv.current!
    const g = c.getContext('2d')!
    let W = 0, H = 0, dpr = 1
    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1)
      W = c.clientWidth
      H = c.clientHeight
      c.width = W * dpr
      c.height = H * dpr
    }
    size()
    const R = () => Math.max(18, Math.min(28, W * 0.045))
    const hoop = () => ({ x: W / 2, y: H * 0.3, half: R() * 1.9 })
    let startX = 0.5
    const start = () => ({ x: W * startX, y: H - R() * 2.2 })
    let ball = { ...start(), vx: 0, vy: 0, rot: 0, live: false }
    let drag: { x: number; y: number; t: number }[] | null = null
    let net = 0
    let resetAt = 0
    let scoredThis = false
    let raf = 0

    let launchedAt = 0
    const reset = () => {
      // Each new ball starts somewhere else along the floor: you have to aim.
      startX = 0.25 + Math.random() * 0.5
      ball = { ...start(), vx: 0, vy: 0, rot: 0, live: false }
      scoredThis = false
    }

    const draw = () => {
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, W, H)
      const h = hoop()
      // backboard
      g.strokeStyle = 'rgba(242,241,236,0.8)'
      g.lineWidth = 3
      g.strokeRect(h.x - h.half * 1.9, h.y - h.half * 1.5, h.half * 3.8, h.half * 1.35)
      g.strokeRect(h.x - h.half * 0.6, h.y - h.half * 0.9, h.half * 1.2, h.half * 0.75)
      // net
      g.strokeStyle = 'rgba(242,241,236,0.75)'
      g.lineWidth = 1.5
      const wob = Math.sin(performance.now() / 40) * net * 6
      for (let i = 0; i <= 6; i++) {
        const t = i / 6
        g.beginPath()
        g.moveTo(h.x - h.half + t * h.half * 2, h.y)
        g.lineTo(h.x - h.half * 0.6 + t * h.half * 1.2 + wob, h.y + h.half * (1.2 + net * 0.4))
        g.stroke()
      }
      // rim
      g.strokeStyle = '#ff6a1a'
      g.lineWidth = 5
      g.beginPath()
      g.moveTo(h.x - h.half, h.y)
      g.lineTo(h.x + h.half, h.y)
      g.stroke()
      // aim line
      if (drag && drag.length > 1) {
        const a = drag[0], b = drag[drag.length - 1]
        g.setLineDash([3, 8])
        g.strokeStyle = 'rgba(212,255,58,0.8)'
        g.lineWidth = 2.5
        g.beginPath()
        g.moveTo(ball.x, ball.y)
        g.lineTo(ball.x + (a.x - b.x) * 1.4, ball.y + (a.y - b.y) * 1.4)
        g.stroke()
        g.setLineDash([])
      }
      // ball
      const r = R()
      g.save()
      g.translate(ball.x, ball.y)
      g.rotate(ball.rot)
      const bg = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r)
      bg.addColorStop(0, '#ffb37a')
      bg.addColorStop(0.6, '#ff6a1a')
      bg.addColorStop(1, '#b8410a')
      g.fillStyle = bg
      g.beginPath()
      g.arc(0, 0, r, 0, Math.PI * 2)
      g.fill()
      g.strokeStyle = '#2b1405'
      g.lineWidth = 1.4
      g.beginPath()
      g.moveTo(-r, 0)
      g.lineTo(r, 0)
      g.moveTo(0, -r)
      g.lineTo(0, r)
      g.stroke()
      g.restore()
    }

    const step = () => {
      raf = requestAnimationFrame(step)
      net *= 0.92
      const h = hoop(), r = R()
      if (ball.live) {
        for (let k = 0; k < 2; k++) {
          ball.vy += 0.32
          const py = ball.y
          ball.x += ball.vx / 2
          ball.y += ball.vy / 2
          ball.rot += ball.vx * 0.01
          // rim ends
          for (const ex of [h.x - h.half, h.x + h.half]) {
            const dx = ball.x - ex, dy = ball.y - h.y, d = Math.hypot(dx, dy)
            if (d < r + 3) {
              const nx = dx / d, ny = dy / d, dot = ball.vx * nx + ball.vy * ny
              if (dot < 0) {
                ball.vx -= 1.6 * dot * nx
                ball.vy -= 1.6 * dot * ny
                ball.x = ex + nx * (r + 3)
                ball.y = h.y + ny * (r + 3)
                clank()
              }
            }
          }
          // through the hoop?
          if (!scoredThis && py < h.y && ball.y >= h.y && ball.vy > 0 && Math.abs(ball.x - h.x) < h.half - r * 0.55) {
            scoredThis = true
            net = 1
            swish()
            crowd(2.2, 0.35)
            haptic(40)
            setMade(true)
            confetti(c)
            setTimeout(() => scored.current(), 1300)
          }
          // floor
          if (ball.y > H - r) {
            ball.y = H - r
            ball.vy *= -0.55
            ball.vx *= 0.8
            if (Math.abs(ball.vy) > 2) dribble(0.6)
          }
          if (ball.x < r || ball.x > W - r) {
            ball.vx *= -0.7
            ball.x = Math.min(W - r, Math.max(r, ball.x))
          }
        }
        if (!resetAt && ((Math.abs(ball.vy) < 1.2 && ball.y > H - r - 2) || performance.now() - launchedAt > 3200)) resetAt = performance.now() + 400
        if (resetAt && performance.now() > resetAt) {
          resetAt = 0
          if (!scoredThis) setMisses((m) => m + 1)
          reset()
        }
      }
      draw()
    }
    step()

    const pt = (e: PointerEvent) => {
      const b = c.getBoundingClientRect()
      return { x: e.clientX - b.left, y: e.clientY - b.top, t: performance.now() }
    }
    const down = (e: PointerEvent) => {
      if (ball.live) return
      const p = pt(e)
      if (Math.hypot(p.x - ball.x, p.y - ball.y) > R() * 3) return
      c.setPointerCapture(e.pointerId)
      drag = [p]
      dribble(0.4)
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      drag.push(pt(e))
    }
    const up = () => {
      if (!drag || drag.length < 2) {
        drag = null
        return
      }
      const a = drag[0], b = drag[drag.length - 1]
      // Pull back like a slingshot: launch the opposite way. A ~150px pull
      // (about a thumb's length) puts it at the rim.
      const scale = H / 560
      const pull = Math.min(260, Math.max(0, b.y - a.y)) / scale
      ball.vx = Math.max(-9, Math.min(9, (a.x - b.x) * 0.07))
      ball.vy = -(10 + (pull / 260) * 22) * Math.sqrt(scale)
      ball.live = true
      launchedAt = performance.now()
      drag = null
      flick()
    }
    c.addEventListener('pointerdown', down)
    c.addEventListener('pointermove', move)
    c.addEventListener('pointerup', up)
    c.addEventListener('pointercancel', up)
    addEventListener('resize', size)
    return () => {
      cancelAnimationFrame(raf)
      c.removeEventListener('pointerdown', down)
      c.removeEventListener('pointermove', move)
      c.removeEventListener('pointerup', up)
      c.removeEventListener('pointercancel', up)
      removeEventListener('resize', size)
    }
  }, [])

  return (
    <div className="relative mx-auto mt-8 max-w-[560px]">
      <canvas ref={cv} className="block h-[min(70vh,560px)] w-full touch-none rounded-[18px] border border-chalk/10 bg-[radial-gradient(80%_60%_at_50%_20%,#1f1f23,#0d0d0f)]" data-cursor="SHOOT" aria-label="Flick the ball into the hoop" />
      <p className="mt-4 flex items-center justify-between font-mono text-[12px] tracking-widest text-ash uppercase">
        <span>{made ? 'Bucket!' : `Misses: ${misses}`}</span>
        <button type="button" onClick={onSkip} className="underline-offset-4 hover:text-chalk hover:underline">
          {misses >= 3 ? 'Coach says you can still apply →' : 'Skip to the form'}
        </button>
      </p>
    </div>
  )
}

function confetti(anchor: HTMLElement) {
  const host = anchor.parentElement!
  for (let i = 0; i < 46; i++) {
    const s = document.createElement('span')
    s.style.cssText = `position:absolute;left:50%;top:30%;width:8px;height:14px;border-radius:2px;background:${i % 3 ? '#d4ff3a' : '#f2f1ec'};pointer-events:none;z-index:5`
    host.appendChild(s)
    gsap.to(s, {
      x: gsap.utils.random(-260, 260),
      y: gsap.utils.random(-200, 320),
      rotate: gsap.utils.random(-540, 540),
      opacity: 0,
      duration: gsap.utils.random(0.9, 1.6),
      ease: 'power2.out',
      onComplete: () => s.remove(),
    })
  }
}

/* ---------- Application (placeholder: not sent anywhere yet) ---------- */

function Apply() {
  const [sent, setSent] = useState(false)
  if (sent)
    return (
      <div className="mx-auto mt-10 max-w-[560px] rounded-[18px] border border-volt/40 bg-concrete p-8 text-center pop-in">
        <p className="display text-[44px] text-volt">Application in.</p>
        <p className="mt-2 text-chalk/75">The coaching staff will be in touch. (Demo: this form isn&apos;t connected yet.)</p>
      </div>
    )
  return (
    <form
      className="mx-auto mt-10 grid max-w-[640px] gap-3 rounded-[18px] border border-chalk/15 bg-concrete p-6 pop-in sm:grid-cols-2 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
        swish()
      }}
    >
      <p className="display text-[34px] sm:col-span-2">
        Elite 50 <span className="text-volt">application</span>
      </p>
      {[
        ['Full name', 'text'],
        ['Age', 'number'],
        ['Position', 'text'],
        ['Height', 'text'],
        ['WhatsApp number', 'tel'],
        ['Highlight link', 'url'],
      ].map(([l, t]) => (
        <label key={l} className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] tracking-widest text-ash uppercase">{l}</span>
          <input type={t} required={l !== 'Highlight link'} className="h-12 rounded-[10px] border border-chalk/15 bg-ink px-3.5 text-[16px] outline-none focus:border-volt" />
        </label>
      ))}
      <button type="submit" className="mt-2 h-14 rounded-full bg-volt font-mono text-[13px] font-bold tracking-widest text-ink uppercase transition-transform active:scale-95 sm:col-span-2">
        Send application
      </button>
    </form>
  )
}
