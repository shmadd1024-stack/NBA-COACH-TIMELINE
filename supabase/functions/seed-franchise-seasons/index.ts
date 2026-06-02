import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Basketball Reference franchise abbreviations (each page covers full franchise history)
const BBREF_ABBREV: Record<string, string> = {
  'Atlanta Hawks':           'ATL',
  'Boston Celtics':          'BOS',
  'Brooklyn Nets':           'BRK',
  'Charlotte Hornets':       'CHO',
  'Chicago Bulls':           'CHI',
  'Cleveland Cavaliers':     'CLE',
  'Dallas Mavericks':        'DAL',
  'Denver Nuggets':          'DEN',
  'Detroit Pistons':         'DET',
  'Golden State Warriors':   'GSW',
  'Houston Rockets':         'HOU',
  'Indiana Pacers':          'IND',
  'Los Angeles Clippers':    'LAC',
  'Los Angeles Lakers':      'LAL',
  'Memphis Grizzlies':       'MEM',
  'Miami Heat':              'MIA',
  'Milwaukee Bucks':         'MIL',
  'Minnesota Timberwolves':  'MIN',
  'New Orleans Pelicans':    'NOP',
  'New York Knicks':         'NYK',
  'Oklahoma City Thunder':   'OKC',
  'Orlando Magic':           'ORL',
  'Philadelphia 76ers':      'PHI',
  'Phoenix Suns':            'PHO',
  'Portland Trail Blazers':  'POR',
  'Sacramento Kings':        'SAC',
  'San Antonio Spurs':       'SAS',
  'Toronto Raptors':         'TOR',
  'Utah Jazz':               'UTA',
  'Washington Wizards':      'WAS',
};

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.basketball-reference.com/',
};

function parseNum(s: string | undefined): number | null {
  if (!s || s.trim() === '' || s === '&mdash;') return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

async function scrapeFranchise(abbrev: string): Promise<Array<{
  season_year: number;
  wins: number | null;
  losses: number | null;
  ortg: number | null;
  drtg: number | null;
  srs: number | null;
}>> {
  const url = `https://www.basketball-reference.com/teams/${abbrev}/`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${abbrev}`);
  const html = await res.text();

  // Basketball-reference wraps some tables in HTML comments to block simple scrapers.
  // Strip comment wrappers so we can see all table rows.
  const unescaped = html.replace(/<!--([\s\S]*?)-->/g, '$1');

  const rows: any[] = [];

  // Split on <tr> and inspect each segment
  const trParts = unescaped.split(/<tr[^>]*>/);

  for (const part of trParts) {
    // Must contain a season link like "2023-24"
    const seasonMatch = part.match(/data-stat="season"[^>]*>[^<]*<a[^>]*>(\d{4}-\d{2})<\/a>/);
    if (!seasonMatch) continue;

    const seasonYear = parseInt(seasonMatch[1].substring(0, 4), 10);
    if (isNaN(seasonYear) || seasonYear < 1946) continue;

    // Skip non-NBA seasons (ABA, BAA rows)
    const lgMatch = part.match(/data-stat="lg_id"[^>]*>(?:<[^>]+>)*([^<]+)/);
    const league = lgMatch?.[1]?.trim() ?? '';
    if (league && league !== 'NBA') continue;

    // Generic extractor: pull the numeric value from a data-stat cell
    const extract = (stat: string): number | null => {
      const m = part.match(new RegExp(`data-stat="${stat}"[^>]*>([\\d.+-]+)<`));
      return m ? parseNum(m[1]) : null;
    };

    rows.push({
      season_year: seasonYear,
      wins:   extract('wins'),
      losses: extract('losses'),
      ortg:   extract('off_rtg'),
      drtg:   extract('def_rtg'),
      srs:    extract('srs'),
    });
  }

  return rows;
}

Deno.serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Optional: target a single franchise for debugging/re-seeding
  //   POST /seed-franchise-seasons?franchise=Boston+Celtics
  const urlObj = new URL(req.url);
  const onlyFranchise = urlObj.searchParams.get('franchise');

  const entries = onlyFranchise
    ? Object.entries(BBREF_ABBREV).filter(([f]) => f === onlyFranchise)
    : Object.entries(BBREF_ABBREV);

  const results: any[] = [];
  const errors:  any[] = [];

  for (const [franchise, abbrev] of entries) {
    try {
      console.log(`Scraping ${franchise} (${abbrev})...`);
      const seasons = await scrapeFranchise(abbrev);

      if (seasons.length === 0) {
        errors.push({ franchise, error: 'No rows parsed — HTML structure may have changed' });
        continue;
      }

      const rows = seasons.map(s => ({ franchise, ...s }));
      const { error } = await supabase
        .from('franchise_seasons')
        .upsert(rows, { onConflict: 'franchise,season_year' });

      if (error) {
        errors.push({ franchise, error: error.message });
      } else {
        results.push({ franchise, seasons: seasons.length });
        console.log(`  ✓ ${seasons.length} seasons upserted`);
      }

      // Polite delay — basketball-reference throttles aggressive scrapers
      await new Promise(r => setTimeout(r, 1200));
    } catch (err: any) {
      errors.push({ franchise, error: err.message });
      console.error(`  ✗ ${franchise}:`, err.message);
    }
  }

  return new Response(
    JSON.stringify({ ok: errors.length === 0, results, errors }, null, 2),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
