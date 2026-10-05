/**
 * The roster.
 *
 * PLACEHOLDERS: names, numbers, positions, measurements, ratings and class
 * years below are stand-ins until the academy sends the real ones. Swap them
 * here and every page (lineup tags, draft board, player pages) updates.
 */

export type Position = 'Guard' | 'Wing' | 'Big' | 'Coach'

export type Player = {
  slug: string
  name: string
  number: string
  position: Position
  height: string
  heightIn: number
  wingspan: string
  vertical: string
  classOf: string
  ovr: number
  attrs: [string, number][]
  /** Short silent loop for hovers and cards. */
  clip: string
  /** Full highlight reel with sound, and its chapters (seconds). */
  reel: { src: string; poster: string; chapters: [string, number][] }
  /** Where his image comes from. */
  image: { kind: 'lineup'; id: string } | { kind: 'cut'; src: string; w: number; h: number } | { kind: 'photo'; src: string }
}

const RECAP = { src: '/media/recap.mp4', poster: '/media/recap.jpg', chapters: [['Arrival', 0], ['Drills', 28], ['Scrimmage', 44], ['Huddle', 62]] as [string, number][] }
const DUNK = { src: '/media/dunk.mp4', poster: '/media/dunk.jpg', chapters: [['Run-up', 0], ['The dunk', 3], ['Reaction', 7]] as [string, number][] }

const attrs = (s: number, h: number, f: number, d: number, a: number, iq: number): [string, number][] => [
  ['Shooting', s],
  ['Handles', h],
  ['Finishing', f],
  ['Defence', d],
  ['Athleticism', a],
  ['Basketball IQ', iq],
]

const ovr = (a: [string, number][]) => Math.round(a.reduce((t, [, v]) => t + v, 0) / a.length)

function p(
  slug: string,
  number: string,
  position: Position,
  height: string,
  heightIn: number,
  a: [string, number][],
  clip: string,
  image: Player['image'],
  reel = RECAP,
  extra: Partial<Player> = {},
): Player {
  const n = slug.replace(/\D/g, '').padStart(2, '0')
  return {
    slug,
    name: `Prospect ${n}`,
    number,
    position,
    height,
    heightIn,
    wingspan: `${Math.floor((heightIn + 4) / 12)}'${(heightIn + 4) % 12}"`,
    vertical: `${28 + (heightIn % 9)}"`,
    classOf: heightIn % 2 ? '2027' : '2026',
    ovr: ovr(a),
    attrs: a,
    clip,
    reel,
    image,
    ...extra,
  }
}

export const PLAYERS: Player[] = [
  p('p01', '23', 'Wing', `6'7"`, 79, attrs(78, 74, 82, 80, 86, 77), 'hl-game', { kind: 'lineup', id: 'p01' }),
  p('p02', '11', 'Wing', `6'6"`, 78, attrs(81, 76, 78, 77, 83, 80), 'hl-drills', { kind: 'lineup', id: 'p02' }),
  p('p03', '3', 'Guard', `6'1"`, 73, attrs(84, 86, 75, 72, 80, 82), 'hl-huddle', { kind: 'lineup', id: 'p03' }),
  p('p04', '34', 'Big', `6'10"`, 82, attrs(66, 62, 85, 84, 82, 76), 'hl-crew', { kind: 'lineup', id: 'p04' }),
  p('p05', '50', 'Big', `6'11"`, 83, attrs(64, 60, 87, 88, 84, 75), 'hl-arena', { kind: 'lineup', id: 'p05' }),
  p('p06', '7', 'Guard', `6'3"`, 75, attrs(82, 84, 77, 74, 81, 79), 'hl-game', { kind: 'lineup', id: 'p06' }),
  p('p08', '5', 'Guard', `6'2"`, 74, attrs(80, 85, 76, 73, 84, 78), 'hl-drills', { kind: 'lineup', id: 'p08' }),
  p('p09', '21', 'Wing', `6'5"`, 77, attrs(77, 75, 79, 79, 82, 76), 'hl-crew', { kind: 'lineup', id: 'p09' }),
  p('p10', '1', 'Guard', `6'0"`, 72, attrs(83, 87, 74, 70, 82, 80), 'hl-huddle', { kind: 'lineup', id: 'p10' }),
  p('p11', '15', 'Wing', `6'6"`, 78, attrs(79, 77, 80, 81, 83, 79), 'hl-game', { kind: 'lineup', id: 'p11' }),
  p('p12', '24', 'Wing', `6'8"`, 80, attrs(80, 73, 83, 82, 85, 78), 'hl-arena', { kind: 'lineup', id: 'p12' }),
  p('p13', '0', 'Big', `7'0"`, 84, attrs(62, 58, 88, 90, 86, 74), 'hl-crew', { kind: 'cut', src: '/photos/flex-cut.webp', w: 515, h: 1284 }),
  p('p14', '10', 'Wing', `6'5"`, 77, attrs(74, 79, 92, 76, 96, 75), 'hl-dunk', { kind: 'photo', src: '/photos/dunk.webp' }, DUNK),
  {
    ...p('coach', 'HC', 'Coach', `6'1"`, 73, [['Development', 95], ['Tactics', 92], ['Scouting', 94], ['Discipline', 93], ['Network', 96], ['Motivation', 97]], 'hl-drills', { kind: 'lineup', id: 'coach' }),
    name: 'Head Coach',
    classOf: 'Staff',
  },
]

export const find = (slug: string) => PLAYERS.find((x) => x.slug === slug)
export const next = (slug: string) => PLAYERS[(PLAYERS.findIndex((x) => x.slug === slug) + 1) % PLAYERS.length]

/** Cut-out boxes in the 1210x1538 lineup photo (from the media pipeline). */
export const LINEUP = {
  W: 1210,
  H: 1538,
  /** Only the part of the photo with people in it is shown. */
  top: 330,
  boxes: {
    p01: { x: 82, y: 673, w: 204, h: 791 },
    p02: { x: 236, y: 657, w: 207, h: 772 },
    p03: { x: 393, y: 720, w: 178, h: 711 },
    p04: { x: 493, y: 404, w: 205, h: 445 },
    p05: { x: 689, y: 382, w: 193, h: 430 },
    p06: { x: 587, y: 655, w: 145, h: 478 },
    coach: { x: 540, y: 843, w: 177, h: 695 },
    p08: { x: 706, y: 762, w: 192, h: 674 },
    p09: { x: 820, y: 589, w: 108, h: 497 },
    p10: { x: 887, y: 612, w: 74, h: 152 },
    p11: { x: 885, y: 663, w: 151, h: 778 },
    p12: { x: 1015, y: 677, w: 181, h: 773 },
  } as Record<string, { x: number; y: number; w: number; h: number }>,
  /** The ball that becomes the shot (in p01's hands). */
  ball: { x: 224, y: 972 },
  /** Order players step forward in the starting-five intro. */
  intro: ['p01', 'p02', 'p04', 'p05', 'p12', 'p11', 'coach'],
}
