// One-time seed script — reads RAW_DATA from src/App.js and inserts into Supabase.
// Run: node scripts/seed.js
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const src = readFileSync(new URL('../src/App.js', import.meta.url), 'utf8');
const match = src.match(/const RAW_DATA\s*=\s*(\[[\s\S]*?\]);/);
if (!match) { console.error('Could not find RAW_DATA in App.js'); process.exit(1); }

const raw = JSON.parse(match[1]);

const rows = raw.map(d => ({
  franchise:  d.franchise,
  coach:      d.coach,
  start_year: d.start,
  end_year:   d.end,
  wins:       d.wins,
  losses:     d.losses,
  is_active:  d.end === 2026,
}));

console.log(`Seeding ${rows.length} coaching stints…`);

// Insert in batches of 100
const BATCH = 100;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await supabase.from('coaching_stints').insert(batch);
  if (error) {
    console.error(`Batch ${i / BATCH + 1} failed:`, error.message);
    process.exit(1);
  }
  console.log(`  inserted rows ${i + 1}–${Math.min(i + BATCH, rows.length)}`);
}

console.log('Done.');
