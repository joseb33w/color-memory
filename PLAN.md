# Goal
Build Color Memory as a new Vite + TypeScript + Tailwind single-page Simon-Says game in a new repository, with Supabase-backed authenticated run stats.

# Files to touch
- Project scaffold: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `.gitignore`, `.env.example`, `README.md`
- Frontend source under `src/`, including requested `src/game/`, `src/components/`, and `src/lib/` modules
- Supabase schema for the prefixed `color_runs` table applied to the shared project

# Verification approach
- Run TypeScript/build checks with `npm run build`.
- Apply and inspect Supabase schema, grants, and RLS policies.
- Verify Supabase auth plus positive and negative RLS access using real test users, then clean up test users and rows.
- Run a local production preview and drive the game in Playwright: sign up/sign in, complete a sequence, intentionally fail, confirm stats update, and check for console/network errors.
- Deploy `dist/` to R2 and verify the preview URL returns 200.

# Out of scope
- Multiplayer/global leaderboards.
- Social sharing or public run browsing.
- Native mobile packaging.
