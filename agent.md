# Agent Instructions — coachdb

## What this project is
SVG-based React timeline of every NBA head coach (525+ stints, 1946–2026) backed by Supabase.  
Live at `npm run dev` → http://localhost:5173

## Stack
- **Vite 5 + React 18** (JSX, hooks only — no TypeScript, no class components)
- **@supabase/supabase-js v2** for all data access
- **Inline CSS only** — no Tailwind, no CSS modules, no styled-components
- **SVG rendering** — the chart is a single `<svg>` element drawn in JS

## Key files
| File | Purpose |
|------|---------|
| `src/App.jsx` | Entire app — data fetch, state, SVG render, tooltips, controls |
| `src/supabase.js` | Supabase client (reads `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`) |
| `.env.local` | Local env vars (gitignored) |
| `scripts/seed.js` | One-time seed script (already run — do not re-run) |

## Before making UI changes
1. Read `src/App.jsx` in full — all rendering logic lives there
2. Data shape from Supabase is `{ franchise, coach, start_year, end_year, wins, losses, is_active }`
3. After fetch, `start_year`/`end_year` are aliased to `start`/`end` in the component state

## Coding conventions
- Components go in `src/` as `.jsx` files
- New utility functions belong at the top of `App.jsx` or in a new `src/utils.js`
- Keep inline styles — don't introduce a CSS framework mid-project
- Supabase RLS: anon key has SELECT only; service role key is available server-side (Edge Functions) only

## Dev workflow
```
npm run dev        # Vite dev server on :5173
npm run build      # production build to /dist
```

## Do not
- Re-run `npm run seed` — data is already in Supabase
- Commit `.env.local`
- Add TypeScript without being asked
- Rename `src/App.jsx` (Vite entry expects this path)
