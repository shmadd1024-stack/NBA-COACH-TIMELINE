# Project Memory — coachdb

## What's been built (complete)
1. **Cloned NBA-COACH-TIMELINE** into `coachdb` — 525-row hardcoded `RAW_DATA` was the starting point
2. **Supabase table** — `coaching_stints` created, seeded with all 525 stints, anon SELECT RLS applied
3. **React data layer** — `src/App.jsx` now fetches from Supabase instead of using hardcoded data; `src/supabase.js` added
4. **Nightly sync Edge Function** — `sync-active-coaches` (v6) deployed; uses ESPN public standings API (no key needed); pg_cron runs it at 02:00 UTC
5. **Active coach corrections** — 2025-26 roster verified against Wikipedia; 5 coaches deactivated, Jordi Fernández (Nets) added, Borrego (Pelicans interim) added; migration `fix_active_coaches_2025_26` applied
6. **Git commit** — `a63872f` on `main`; 10 files changed; active coach DB fixes live in Supabase only (not in git)

## Key decisions made
- **ESPN over balldontlie** — balldontlie free tier (60 req/min) got rate-limited when paginating a full season of games; `/standings` is paid-only. Switched to ESPN's undocumented public API — zero auth, single request.
- **RLS seed workaround** — used a temporary anon INSERT policy to seed from the browser, then revoked it. Service role key was never exposed client-side.
- **start/end alias** — Supabase columns are `start_year`/`end_year`; App.jsx maps them to `start`/`end` on fetch so the SVG rendering logic didn't need to change.
- **Jordi Fernández W/L** — seeded as 0-0 placeholder; the nightly sync fills in real values.

## Known state
- **W/L records** — synced to 2025-26 final standings (season over as of June 2026); nightly cron will re-sync in Oct 2026 when next season starts
- **`scripts/seed.js`** — references `src/App.js` (old filename before rename to App.jsx); one-time script, already run, do not re-run
- **`BALLDONTLIE_API_KEY`** — still set as a Supabase secret from earlier attempts; unused now but harmless to leave

## Pending / next work
- [ ] Coach stats detail panel (click a block → expanded view with career stats across franchises)
- [ ] Offensive/defensive ratings per coaching stint (need a data source — ESPN or NBA.com)
- [ ] Coach comparison feature (select 2 coaches, side-by-side stats)
- [ ] Deploy to production (Vercel or similar)

## Repo
- GitHub: `shmadd1024-stack/NBA-COACH-TIMELINE` was the source; local working copy is `C:\Users\shmad\Desktop\coachdb`
- Branch: `main`
- Remote: `nba-coach-timeline` pointing at the GitHub repo
