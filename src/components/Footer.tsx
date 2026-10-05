import Link from 'next/link'
import { Wordmark } from './Chrome'
import { ACADEMY } from '@/lib/academy'

/** Contacts and dates are placeholders until the academy confirms them. */
export function Footer() {
  return (
    <footer id="contact" className="border-t border-line bg-ink px-5 pt-24 pb-12 sm:px-10">
      <div className="mx-auto max-w-[1440px]">
        <p className="serif max-w-[16ch] text-[clamp(44px,6vw,96px)] leading-[0.95]">
          {ACADEMY.motto[0]} <span className="text-bone/60 italic">{ACADEMY.motto[1]}</span>
        </p>
        <div className="mt-20 grid gap-10 border-t border-line pt-10 sm:grid-cols-4">
          <Wordmark />
          <div>
            <p className="label">Contact</p>
            <ul className="mt-3 flex flex-col gap-1.5 text-[15px] text-bone/75">
              <li>Phone · to confirm</li>
              <li>Email · to confirm</li>
              <li>Instagram · to confirm</li>
            </ul>
          </div>
          <div>
            <p className="label">Elite 50</p>
            <ul className="mt-3 flex flex-col gap-1.5 text-[15px] text-bone/75">
              <li>Banire with adidas</li>
              <li>Next camp · to confirm</li>
            </ul>
          </div>
          <div>
            <p className="label">Academy</p>
            <ul className="mt-3 flex flex-col gap-1.5 text-[15px]">
              <li>
                <Link href="/#players" className="text-bone/75 transition-colors duration-500 hover:text-gold">The players</Link>
              </li>
              <li>
                <Link href="/#apply" className="text-bone/75 transition-colors duration-500 hover:text-gold">Apply</Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="label mt-16">
          {ACADEMY.name} · {ACADEMY.city}
        </p>
      </div>
    </footer>
  )
}
