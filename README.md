# Banire Basketball

**Lagos builds them. The world plays them.** A site for Banire Basketball
Academy and the Elite 50 (Banire × adidas) camp, built like a game.

Next.js (App Router), React, TypeScript, Tailwind, GSAP ScrollTrigger and Lenis.
Sound is synthesised in the browser with Web Audio, so there are no audio files.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

Deploy: import the repo in Vercel. No environment variables.

## The game

| Section | What happens |
| --- | --- |
| Tip-off | A 24-second shot clock counts down, the buzzer flashes, the arena lights slam on. Enter with sound or quietly. |
| Q1 · The Lineup | The team on a Lagos road in black and white, BANIRE behind them. Hover a player: he lights up in colour with a volt rim and his highlight plays inside his silhouette. Click: the camera dives into him. Scroll: the starting lineup is announced one by one, then lights out except the ball. |
| Q1 · The Shot | Your scroll is the jump shot. Swish, the net ripples, the headline falls out of the hoop. |
| Q2 · Elite 50 | A counter runs to 50; camp photos slide past in black and white; a volt spotlight follows the cursor. |
| Q2 · Draft Board | Holographic trading cards that tilt, shine and play highlights. Filters shuffle the deck. |
| Q3 · The Pathway | Split-flap departures board and routes drawing out of Lagos. |
| Q4 · You're next | Build your own prospect card and download it as an Instagram Story, then make a flick shot to unlock the Elite 50 application. |
| Player pages | `/players/[slug]`: name builds behind him, arena-screen film with chapters, attribute bars, height ruler, shot chart, next player. |

## Placeholders to replace

Everything below is marked in code and easy to swap:

- **Roster** (`src/lib/players.ts`): names, numbers, positions, heights, ratings, class years, which clip each player uses.
- **Pathway** (`src/components/Pathway.tsx`): alumni, destinations, years, players-placed count.
- **Contacts and camp dates** (`src/components/Footer.tsx`).
- **Application form** (`src/components/Next.tsx`): not connected to anything yet.
- **Shot charts** are generated sample data per player.

## Media

`public/lineup/`: the group photo (AI-upscaled with Real-ESRGAN), the team cut
out with BiRefNet, one cut-out per person, and a hit map so hovers land on the
exact player. `public/media/`: short silent loops for hovers and cards, plus
the Day 1 recap and the dunk clip as full reels. Swap in each player's own
highlight by adding a clip and pointing `clip` / `reel` at it.
