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
| Look | "Street heat": danfo yellow, tar black, fire orange; hazard stripes, halftone, tape and marker scribbles. |
| Q1 · The Lineup | A street poster: the team as a black-and-white sticker on danfo yellow, a giant BANIRE behind them. Each name slams in with a flash and a camera shake. Hover a player: he lights up in colour with a volt rim and his highlight plays inside his silhouette. Click: the camera dives into him. Scroll: the starting lineup is announced one by one, then lights out except the ball. |
| Q1 · The Shot | Your scroll is the jump shot. Swish, the net ripples, the headline falls out of the hoop. |
| Caution tape | Two giant tapes cross the screen; they speed up and lean with your scroll speed. |
| Q2 · Elite 50 | The camp footage plays through the letters ELITE 50; scroll flies you through into the footage. Then a counter to 50 and taped prints. |
| Q2 · The Pile | Trading cards thrown onto the hardwood: grab and fling them, hover to lift, click to scout. Phones get a fanned hand. |
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
