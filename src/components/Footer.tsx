import Link from 'next/link'

/** Final whistle: the scoreboard, contacts and dates (placeholders until confirmed). */
export function Footer() {
  return (
    <footer id="contact" className="relative bg-court px-5 pt-20 pb-24 sm:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="mx-auto flex max-w-[760px] items-stretch justify-center gap-3 rounded-[14px] border border-chalk/10 bg-ink p-4 font-mono sm:gap-6 sm:p-6">
          {[
            ['Banire', '50'],
            ['World', '00'],
          ].map(([t, s], i) => (
            <div key={t} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] tracking-[0.35em] text-ash uppercase">{t}</span>
              <span className={`text-[clamp(64px,13vw,140px)] leading-none font-bold tabular-nums ${i ? 'text-[#ff3b2f]/70' : 'text-[#ff3b2f]'}`} style={{ textShadow: '0 0 24px rgba(255,59,47,.6)' }}>
                {s}
              </span>
            </div>
          ))}
          <div className="flex flex-col items-center justify-center gap-1 border-l border-chalk/10 pl-3 sm:pl-6">
            <span className="text-[10px] tracking-widest text-ash uppercase">Qtr</span>
            <span className="text-[28px] text-volt">4</span>
            <span className="text-[10px] tracking-widest text-ash uppercase">Final</span>
          </div>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-ash uppercase">Contact</p>
            <ul className="mt-3 flex flex-col gap-2 text-[15px] text-chalk/80">
              <li>WhatsApp · to confirm</li>
              <li>Email · to confirm</li>
              <li>Instagram · to confirm</li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-ash uppercase">Elite 50 camp</p>
            <ul className="mt-3 flex flex-col gap-2 text-[15px] text-chalk/80">
              <li>Banire × adidas</li>
              <li>Lagos, Nigeria</li>
              <li>Next dates · to confirm</li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-ash uppercase">Play</p>
            <ul className="mt-3 flex flex-col gap-2 text-[15px]">
              <li>
                <Link href="/#draft" className="hover:text-volt">The roster</Link>
              </li>
              <li>
                <Link href="/#next" className="hover:text-volt">Apply for Elite 50</Link>
              </li>
              <li>
                <Link href="/#pathway" className="hover:text-volt">The pathway</Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="display mt-20 text-center text-[clamp(64px,16vw,240px)] text-chalk/[0.06]">Lagos builds them</p>
        <p className="text-center font-mono text-[11px] text-ash">Banire Basketball Academy · Lagos</p>
      </div>
    </footer>
  )
}
