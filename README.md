# Banire Basketball

**We don’t talk about it. We develop it.** A site for Banire Basketball
Academy in Lagos and its Elite 50 camp with adidas.

The tone follows the coach: calm, plain and proud. It's a black-and-white
documentary in a serif type, with slow, quiet motion and gold kept for numbers.

Built with Next.js (App Router), React, TypeScript, Tailwind, GSAP ScrollTrigger and Lenis.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

To deploy, import the repo in Vercel. It needs no environment variables.

## Sections

| Section | What happens |
| --- | --- |
| Hero | The team photo in black and white beside the motto. Rest the pointer on a player and he comes back into colour while the rest step back; his number and name appear in the corner. Click him (or tap twice on a phone) to open his page. |
| The coach | His portrait, his line, a short story of the academy and three facts. |
| Chapter I · The players | An index of names. Rest on a name and his portrait follows the pointer; phones show a small portrait on each row. |
| Chapter II · Elite 50 | Camp footage that opens as you scroll, three facts and three photographs. |
| Chapter III · Where they went | Alumni and destinations. |
| Apply | A plain application form. |
| Player pages | `/players/[slug]`: portrait, measurements, film with chapters, scouting notes, then the next player. |

## Placeholders to replace

All of these are marked in the code:

- **Coach, story, Elite 50 copy and alumni** (`src/lib/academy.ts`): the coach's name and line, the founding facts and the alumni list.
- **Roster** (`src/lib/players.ts`): names, numbers, positions, heights, class years, and which film each player uses.
- **Contacts and camp dates** (`src/components/Footer.tsx`).
- **Application form** (`src/components/Sections.tsx`): not connected to anything yet.

## Media

- `public/lineup/`: the group photo, upscaled and cleaned up, with the team cut out. It also holds one colour cut-out per person and a hit map, so the hover lands on the exact player.
- `public/portraits/`: framed 3:4 crops of each person for the index and the player pages.
- `public/media/`: the camp footage, the Day 1 recap and the dunk clip.

To give a player his own film, add the clip and point his `reel` at it.
