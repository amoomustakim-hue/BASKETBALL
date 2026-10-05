/**
 * The words on the site.
 *
 * PLACEHOLDERS: everything marked `TBC` or written as a stand-in should be
 * replaced with the coach's own words and the academy's real numbers. Keep
 * the tone: plain, calm, proud. No hype.
 */

export const ACADEMY = {
  name: 'Banire Basketball Academy',
  city: 'Lagos, Nigeria',
  /** The line the homepage stands on. Ideally something the coach actually says. */
  motto: ['We don’t talk about it.', 'We develop it.'],
}

export const COACH = {
  name: 'Head Coach', // TBC: the coach's name
  title: 'Founder & Head Coach',
  /** One sentence in his own words. */
  quote: 'Talent gets you noticed. Work, every day, gets you somewhere.', // TBC
  about: [
    'Banire started on outdoor courts in Lagos with a few boys, one ball and a standard: show up, work, respect the game.',
    'The standard has not changed. The academy trains young players in fundamentals, discipline and character, and opens doors for those who earn it.',
  ], // TBC: his own story
  facts: [
    ['Founded', 'TBC'],
    ['Players placed abroad', 'TBC'],
    ['Elite 50 camps', 'TBC'],
  ] as [string, string][],
}

export const ELITE = {
  intro: 'Fifty of the best young prospects in the country, one gym, and every rep watched. The Elite 50 is where the work gets seen.',
  facts: [
    ['50', 'Prospects invited'],
    ['1', 'Camp, Lagos'],
    ['×', 'Banire with adidas'],
  ] as [string, string][],
}

/** PLACEHOLDER alumni: name, where they went, year. */
export const ALUMNI: [string, string, string][] = [
  ['Name to confirm', 'US prep school', '2025'],
  ['Name to confirm', 'NCAA Division I', '2026'],
  ['Name to confirm', 'Basketball Without Borders', '2026'],
  ['Name to confirm', 'Europe, pro academy', '2026'],
  ['Name to confirm', 'Regional showcase', '2027'],
]
