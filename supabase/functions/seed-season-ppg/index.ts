import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Maps every historical BBRef abbreviation → current franchise name used in our DB
const ABBREV_TO_FRANCHISE: Record<string, string> = {
  // Atlanta Hawks (incl. Tri-Cities/Milwaukee/St. Louis eras)
  'ATL': 'Atlanta Hawks', 'STL': 'Atlanta Hawks', 'MLH': 'Atlanta Hawks',
  'TRI': 'Atlanta Hawks', 'BOM': 'Atlanta Hawks',
  // Boston Celtics
  'BOS': 'Boston Celtics',
  // Brooklyn/New Jersey Nets
  'BRK': 'Brooklyn Nets', 'NJN': 'Brooklyn Nets', 'NYN': 'Brooklyn Nets',
  // Charlotte Hornets (Bobcats lineage)
  'CHA': 'Charlotte Hornets', 'CHO': 'Charlotte Hornets',
  // Chicago Bulls
  'CHI': 'Chicago Bulls',
  // Cleveland Cavaliers
  'CLE': 'Cleveland Cavaliers',
  // Dallas Mavericks
  'DAL': 'Dallas Mavericks',
  // Denver Nuggets
  'DEN': 'Denver Nuggets',
  // Detroit Pistons (incl. Fort Wayne era)
  'DET': 'Detroit Pistons', 'FTW': 'Detroit Pistons',
  // Golden State Warriors (incl. Philadelphia/San Francisco eras)
  'GSW': 'Golden State Warriors', 'SFW': 'Golden State Warriors', 'PHW': 'Golden State Warriors',
  // Houston Rockets (incl. San Diego era)
  'HOU': 'Houston Rockets', 'SDR': 'Houston Rockets',
  // Indiana Pacers
  'IND': 'Indiana Pacers',
  // LA Clippers (incl. Buffalo/San Diego eras)
  'LAC': 'Los Angeles Clippers', 'SDC': 'Los Angeles Clippers', 'BUF': 'Los Angeles Clippers',
  // LA Lakers (incl. Minneapolis era)
  'LAL': 'Los Angeles Lakers', 'MNL': 'Los Angeles Lakers',
  // Memphis Grizzlies (incl. Vancouver era)
  'MEM': 'Memphis Grizzlies', 'VAN': 'Memphis Grizzlies',
  // Miami Heat
  'MIA': 'Miami Heat',
  // Milwaukee Bucks
  'MIL': 'Milwaukee Bucks',
  // Minnesota Timberwolves
  'MIN': 'Minnesota Timberwolves',
  // New Orleans Pelicans (incl. Charlotte/New Orleans Hornets eras)
  'NOP': 'New Orleans Pelicans', 'NOH': 'New Orleans Pelicans', 'NOK': 'New Orleans Pelicans',
  // New York Knicks
  'NYK': 'New York Knicks',
  // OKC Thunder (incl. Seattle SuperSonics)
  'OKC': 'Oklahoma City Thunder', 'SEA': 'Oklahoma City Thunder',
  // Orlando Magic
  'ORL': 'Orlando Magic',
  // Philadelphia 76ers (incl. Syracuse Nationals)
  'PHI': 'Philadelphia 76ers', 'SYR': 'Philadelphia 76ers',
  // Phoenix Suns
  'PHO': 'Phoenix Suns',
  // Portland Trail Blazers
  'POR': 'Portland Trail Blazers',
  // Sacramento Kings (incl. Rochester/Cincinnati/Kansas City eras)
  'SAC': 'Sacramento Kings', 'KCK': 'Sacramento Kings',
  'CIN': 'Sacramento Kings', 'ROC': 'Sacramento Kings',
  // San Antonio Spurs
  'SAS': 'San Antonio Spurs',
  // Toronto Raptors
  'TOR': 'Toronto Raptors',
  // Utah Jazz (incl. New Orleans Jazz era)
  'UTA': 'Utah Jazz', 'NOJ': 'Utah Jazz',
  // Washington Wizards (incl. Baltimore/Capital/Washington eras)
  'WAS': 'Washington Wizards', 'WSB': 'Washington Wizards',
  'CAP': 'Washington Wizards', 'BAL': 'Washington Wizards',
};

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.basketball-reference.com/',
};

/**
 * Parse a per-game stats table from BBRef HTML.
 * statName: 'pts' for the team table, 'opp_pts' for the opponent table.
 * Returns Map<abbrev, ppg> for each team row found.
 *
 * BBRef row format (team column):
 *   <td data-stat="team" ><a href='/teams/MIL/2021.html'>Milwaukee Bucks</a>*</td>
 * Points column:
 *   <td data-stat="pts" >120.1</td>
 */
function parseTable(html: string, tableId: string, statName: string): Map<string, number> {
  const result = new Map<string, number>();
  const start = html.indexOf(`id="${tableId}"`);
  if (start === -1) return result;
  const end = html.indexOf('</table>', start);
  const block = end >= 0 ? html.slice(start, end) : html.slice(start, start + 60_000);

  for (const row of block.split(/<tr[^>]*>/)) {
    // BBRef uses single-quoted href: href='/teams/ABC/2021.html'
    const abbM = row.match(/data-stat="team"[^>]*><a[^>]*href='[^']*?\/teams\/([A-Z]{2,3})\//);
    if (!abbM) continue;
    const ptsM = row.match(new RegExp(`data-stat="${statName}"[^>]*>([\\d.]+)<`));
    if (!ptsM) continue;
    result.set(abbM[1], parseFloat(ptsM[1]));
  }
  return result;
}

/**
 * Fetch one BBRef league per-game page and return
 * { ptsFor, ptsAgainst } keyed by our franchise name.
 * endYear = season_year + 1  (e.g. 2024 for the 2023-24 season)
 */
async function fetchLeagueYear(
  endYear: number,
): Promise<Map<string, { ptsFor: number; ptsAgainst: number | null }>> {
  const url = `https://www.basketball-reference.com/leagues/NBA_${endYear}.html`;
  const res = await fetch(url, { headers: HEADERS });
  if (res.status === 404) return new Map(); // pre-coverage seasons
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${endYear}`);

  const raw  = await res.text();
  // BBRef hides some tables inside HTML comments; strip the comment wrappers.
  const html = raw.replace(/<!--([\s\S]*?)-->/g, '$1');

  const teamPPG = parseTable(html, 'per_game-team',     'pts');
  const oppPPG  = parseTable(html, 'per_game-opponent', 'opp_pts');

  const out = new Map<string, { ptsFor: number; ptsAgainst: number | null }>();
  for (const [abbrev, ptsFor] of teamPPG) {
    const franchise = ABBREV_TO_FRANCHISE[abbrev];
    if (!franchise) continue;
    out.set(franchise, { ptsFor, ptsAgainst: oppPPG.get(abbrev) ?? null });
  }
  return out;
}

Deno.serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const urlObj   = new URL(req.url);
  // Use ?from=YYYY&to=YYYY to process a sub-range (run in parallel batches)
  const fromYear = parseInt(urlObj.searchParams.get('from') ?? '1950', 10);
  const toYear   = parseInt(urlObj.searchParams.get('to')   ?? '2025', 10);

  const results: any[] = [];
  const errors:  any[] = [];

  for (let seasonYear = fromYear; seasonYear <= toYear; seasonYear++) {
    const endYear = seasonYear + 1;
    try {
      console.log(`Season ${seasonYear}-${String(endYear).slice(-2)}...`);
      const teamStats = await fetchLeagueYear(endYear);
      if (teamStats.size === 0) continue; // no BBRef coverage

      const rows = [...teamStats.entries()].map(([franchise, { ptsFor, ptsAgainst }]) => ({
        franchise,
        season_year: seasonYear,
        pts_for:     ptsFor,
        pts_against: ptsAgainst,
      }));

      const { error } = await supabase
        .from('franchise_seasons')
        .upsert(rows, { onConflict: 'franchise,season_year' });

      if (error) {
        errors.push({ season_year: seasonYear, error: error.message });
      } else {
        results.push({ season_year: seasonYear, teams: rows.length });
        console.log(`  ✓ ${rows.length} teams`);
      }

      await new Promise(r => setTimeout(r, 1_000));
    } catch (err: any) {
      errors.push({ season_year: seasonYear, error: err.message });
      console.error(`  ✗ ${seasonYear}:`, err.message);
    }
  }

  return new Response(
    JSON.stringify({ ok: errors.length === 0, results, errors }, null, 2),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
