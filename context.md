# Technical Context — coachdb

## Supabase project
- **Project ID:** `nxptotqxckjxaprplxbz`
- **URL:** `https://nxptotqxckjxaprplxbz.supabase.co`
- **Anon key:** in `.env.local` as `VITE_SUPABASE_ANON_KEY`

## Database schema — `public.coaching_stints`
```sql
id          serial primary key
franchise   text not null          -- full team name, e.g. "Boston Celtics"
coach       text not null          -- abbreviated, e.g. "P. Riley"
start_year  integer not null       -- first season year (inclusive)
end_year    integer not null       -- last season year (inclusive, 2026 = active)
wins        integer default 0
losses      integer default 0
is_active   boolean default false  -- true = current head coach for 2025-26 season
```

**RLS policies:** anon key has SELECT only. No INSERT/UPDATE from the browser.

**Indexes:** `(franchise)`, `(coach)`, `(is_active)`

**Row count:** 526 rows (525 historical + 1 added for Jordi Fernández, Brooklyn Nets 2024-2026)

## Active coaches (2025-26 season, is_active = true)
These 30 coaches have `end_year = 2026` and `is_active = true`:

| Franchise | Coach |
|-----------|-------|
| Atlanta Hawks | Q. Snyder |
| Boston Celtics | J. Mazzulla |
| Brooklyn Nets | J. Fernández |
| Charlotte Hornets | C. Martin |
| Chicago Bulls | B. Bickerstaff |
| Cleveland Cavaliers | K. Atkinson |
| Dallas Mavericks | J. Kidd *(verify)* |
| Denver Nuggets | D. Malone |
| Detroit Pistons | J. Loyer |
| Golden State Warriors | J. Kerr |
| Houston Rockets | I. Udoka |
| Indiana Pacers | R. Carlisle |
| Los Angeles Clippers | T. Jenkins |
| Los Angeles Lakers | J. Redick |
| Memphis Grizzlies | T. Jenkins |
| Miami Heat | E. Spoelstra |
| Milwaukee Bucks | D. Oholund |
| Minnesota Timberwolves | C. Finch |
| New Orleans Pelicans | J. Borrego *(interim)* |
| New York Knicks | T. Thibodeau |
| Oklahoma City Thunder | M. Daigneault |
| Orlando Magic | J. Skiles |
| Philadelphia 76ers | N. Nurse |
| Phoenix Suns | M. Williams |
| Portland Trail Blazers | C. Billups |
| Sacramento Kings | D. Brown |
| San Antonio Spurs | G. Popovich |
| Toronto Raptors | D. Casey |
| Utah Jazz | W. Hardy |
| Washington Wizards | B. Wittman |

## Edge Function — `sync-active-coaches`
- **Runtime:** Deno (Supabase Edge Functions)
- **Trigger:** pg_cron nightly at 02:00 UTC via `net.http_post`
- **Endpoint:** `https://nxptotqxckjxaprplxbz.supabase.co/functions/v1/sync-active-coaches`
- **Auth:** `verify_jwt: false`; optional `CRON_SECRET` env var for header guard
- **Data source:** ESPN public standings API (no key required)
  - `https://site.api.espn.com/apis/v2/sports/basketball/nba/standings`
- **What it does:** Fetches all 30 teams' W/L from ESPN, updates `wins`/`losses` on all `is_active = true` rows

## App rendering — how the SVG works
```
svgW = 900px
LABEL_W = 185px      ← franchise name labels
chartW = svgW - LABEL_W - 20
xScale(year) = LABEL_W + ((year - viewStart) / (viewEnd - viewStart)) * chartW

Each franchise row = ROW_H (28px)
Each coaching stint = rect from xScale(start) to xScale(end), height 18px
Block fill = team primary color (TEAM_COLORS)
Top stripe + partial fill = team accent color scaled by win% (TEAM_ACCENT)
```

## Static data in App.jsx (hardcoded, not in Supabase)
- `TEAM_COLORS` — primary hex per franchise
- `TEAM_ACCENT` — accent hex per franchise  
- `CHAMPIONSHIPS` — all-time title count per franchise
- `COACH_CHAMPS` — championship rings per coach (as head coach)
- `FRANCHISE_STATS` — all-time win%, playoff appearances, conf finals, finals, titles
- `MIN_YEAR = 1946`, `MAX_YEAR = 2026`

## Applied Supabase migrations (in order)
1. `create_coaching_stints`
2. `allow_anon_insert_for_seed`
3. `revoke_anon_insert_seed_policy`
4. `enable_pg_cron_pg_net`
5. `schedule_sync_active_coaches`
6. `fix_cron_use_net_http_post`
7. `fix_active_coaches_2025_26`
