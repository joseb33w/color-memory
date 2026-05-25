# Color Memory

A single-page Simon-Says clone built with Vite, TypeScript, Tailwind CSS, WebAudio, and Supabase. Players sign in, watch a growing sequence of four pastel color pads, repeat it, and save each completed run for personal best and average stats.

## Features

- Four large pastel pads in a 2×2 grid: blue, green, red, and yellow.
- WebAudio tones for each color and glow states during playback/taps.
- Round-by-round memory gameplay with game-over handling.
- Supabase-backed authenticated run history with per-user RLS.
- Stats card showing best run, average run length, and total runs.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Fill `.env` with the Supabase URL, anon key, and user-scoped table prefix. The app reads from `<VITE_TABLE_PREFIX>_color_runs`.

## Build

```bash
npm run build
```

The production build is emitted to `dist/`.
