import { useState, useMemo } from 'react';
import { TEAM_COLORS, COACH_CHAMPS, getHistoricalName } from './constants';

// ─── helpers ──────────────────────────────────────────────────────────────────

function getStats(name, coachData) {
  const stints = coachData.filter(d => d.coach === name);
  if (!stints.length) return null;
  const wins  = stints.reduce((s, d) => s + d.wins,   0);
  const losses = stints.reduce((s, d) => s + d.losses, 0);
  const rings  = COACH_CHAMPS[name] ?? 0;
  const winPct = wins + losses > 0 ? wins / (wins + losses) : 0;
  const teams  = [...new Set(stints.map(s => s.franchise))];
  const tenure = stints.reduce((t, s) => t + (s.end - s.start), 0);
  const firstYear = Math.min(...stints.map(s => s.start));
  const lastYear  = Math.max(...stints.map(s => s.end));
  const bestWinPct  = Math.max(...stints.map(s => {
    const tot = s.wins + s.losses;
    return tot > 0 ? s.wins / tot : 0;
  }));
  const isActive = stints.some(s => s.is_active);
  return { wins, losses, rings, winPct, teams, tenure, firstYear, lastYear, bestWinPct, isActive, stints };
}

function shortName(f) {
  return f.replace('Los Angeles ', 'LA ').replace('Oklahoma City ', 'OKC ');
}

// ─── CoachDropdown ─────────────────────────────────────────────────────────────

function CoachDropdown({ label, accent, value, onChange, options }) {
  const [search, setSearch] = useState('');
  const [open,   setOpen]   = useState(false);

  const filtered = options
    .filter(o => o.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 22);

  const display = open ? search : (value || '');

  return (
    <div style={{ width: 260, position: 'relative' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: '0.9px', marginBottom: 5 }}>
        {label}
      </div>
      <input
        type="text"
        placeholder="Search coach…"
        value={display}
        onChange={e => { setSearch(e.target.value); setOpen(true); if (!e.target.value) onChange(''); }}
        onFocus={() => { setOpen(true); setSearch(''); }}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        style={{
          width: '100%', padding: '9px 14px', borderRadius: 8,
          border: `2px solid ${value ? accent : '#ddd'}`,
          fontSize: 14, fontFamily: 'inherit', color: '#222',
          background: '#fff', boxSizing: 'border-box', fontWeight: 600,
          outline: 'none',
        }}
      />
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1.5px solid #ddd', borderRadius: 8,
          boxShadow: '0 6px 24px rgba(0,0,0,0.10)', zIndex: 300,
          maxHeight: 280, overflowY: 'auto',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 14px', color: '#bbb', fontSize: 13 }}>No matches</div>
          ) : filtered.map(name => (
            <div key={name}
              onMouseDown={() => { onChange(name); setSearch(''); setOpen(false); }}
              style={{
                padding: '8px 14px', cursor: 'pointer', fontSize: 13,
                fontFamily: 'inherit', fontWeight: 600, color: '#222',
                borderBottom: '1px solid #f5f5f5',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f5f7ff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}>
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── StatRow ──────────────────────────────────────────────────────────────────

function StatRow({ label, val1, val2, fmt, higherIsBetter = true }) {
  const n1 = typeof val1 === 'number' ? val1 : 0;
  const n2 = typeof val2 === 'number' ? val2 : 0;
  const max = Math.max(Math.abs(n1), Math.abs(n2), 0.01);
  const pct1 = Math.abs(n1) / max * 100;
  const pct2 = Math.abs(n2) / max * 100;
  const winner = higherIsBetter
    ? (n1 > n2 ? 1 : n1 < n2 ? 2 : 0)
    : (n1 < n2 ? 1 : n1 > n2 ? 2 : 0);

  const GRID = { display: 'grid', gridTemplateColumns: '1fr 200px 1fr' };

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Values */}
      <div style={{ ...GRID, alignItems: 'center', marginBottom: 5 }}>
        <span style={{
          fontSize: 15, fontWeight: winner === 1 ? 800 : 500,
          color: winner === 1 ? '#1a1a2e' : '#bbb', textAlign: 'right', paddingRight: 16,
        }}>{fmt(val1)}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: '#bbb', letterSpacing: '0.8px', textAlign: 'center',
        }}>{label}</span>
        <span style={{
          fontSize: 15, fontWeight: winner === 2 ? 800 : 500,
          color: winner === 2 ? '#c0392b' : '#bbb', paddingLeft: 16,
        }}>{fmt(val2)}</span>
      </div>
      {/* Bars */}
      <div style={{ ...GRID, alignItems: 'center', height: 7 }}>
        {/* Left bar (Coach A) — grows right-to-left toward center */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            width: `${pct1}%`, height: 7, borderRadius: 4,
            background: winner === 1 ? '#1a1a2e' : '#e0e0e0',
            transition: 'width 0.35s',
          }} />
        </div>
        {/* Center dot */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e0e0e0' }} />
        </div>
        {/* Right bar (Coach B) — grows left-to-right from center */}
        <div>
          <div style={{
            width: `${pct2}%`, height: 7, borderRadius: 4,
            background: winner === 2 ? '#c0392b' : '#e0e0e0',
            transition: 'width 0.35s',
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── StintsTable ─────────────────────────────────────────────────────────────

function StintsTable({ stats, accent }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ borderBottom: `2px solid ${accent}` }}>
          {['FRANCHISE','YRS','W','L','WIN%'].map(h => (
            <th key={h} style={{
              textAlign: h === 'FRANCHISE' ? 'left' : 'right',
              padding: '4px 6px', fontSize: 9, fontWeight: 700, color: accent, letterSpacing: '0.5px',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {stats.stints.map((s, i) => {
          const tot = s.wins + s.losses;
          const wp  = tot > 0 ? (s.wins / tot * 100).toFixed(1) + '%' : '—';
          return (
            <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '5px 6px', color: TEAM_COLORS[getHistoricalName(s.franchise, s.start)] || '#444', fontWeight: 600, fontSize: 11 }}>
                {getHistoricalName(s.franchise, s.start)}
              </td>
              <td style={{ padding: '5px 6px', textAlign: 'right', color: '#999' }}>{s.end - s.start}</td>
              <td style={{ padding: '5px 6px', textAlign: 'right', color: '#2e7d32', fontWeight: 700 }}>{s.wins}</td>
              <td style={{ padding: '5px 6px', textAlign: 'right', color: '#c62828' }}>{s.losses}</td>
              <td style={{ padding: '5px 6px', textAlign: 'right', color: '#555', fontWeight: 600 }}>{wp}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── CompareTab (main export) ─────────────────────────────────────────────────

export default function CompareTab({ coachData }) {
  const [coach1, setCoach1] = useState('');
  const [coach2, setCoach2] = useState('');

  // List sorted by total wins (most prominent coaches first in dropdown)
  const coachNames = useMemo(() => {
    const map = {};
    coachData.forEach(d => { map[d.coach] = (map[d.coach] ?? 0) + d.wins; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([n]) => n);
  }, [coachData]);

  const stats1 = coach1 ? getStats(coach1, coachData) : null;
  const stats2 = coach2 ? getStats(coach2, coachData) : null;

  const ACCENT_A = '#1a1a2e';
  const ACCENT_B = '#c0392b';

  return (
    <div style={{
      padding: '24px 36px', fontFamily: "'Barlow Condensed', sans-serif",
      overflowY: 'auto', height: 'calc(100vh - 158px)', boxSizing: 'border-box',
    }}>

      {/* ── Picker row ── */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap' }}>
        <CoachDropdown
          label="COACH A" accent={ACCENT_A} value={coach1}
          onChange={setCoach1} options={coachNames.filter(n => n !== coach2)}
        />
        <div style={{ fontSize: 18, fontWeight: 800, color: '#ccc', paddingBottom: 10 }}>VS</div>
        <CoachDropdown
          label="COACH B" accent={ACCENT_B} value={coach2}
          onChange={setCoach2} options={coachNames.filter(n => n !== coach1)}
        />
        {(coach1 || coach2) && (
          <button onClick={() => { setCoach1(''); setCoach2(''); }}
            style={{
              background: '#fff', border: '1.5px solid #ddd', color: '#999',
              padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 600, alignSelf: 'flex-end', marginBottom: 2,
            }}>
            Clear
          </button>
        )}
      </div>

      {/* ── Prompt ── */}
      {(!stats1 || !stats2) && (
        <div style={{ color: '#ccc', fontSize: 17, fontWeight: 600, marginTop: 32 }}>
          Select two coaches above to compare their careers
        </div>
      )}

      {/* ── Comparison ── */}
      {stats1 && stats2 && (
        <>
          {/* Coach headers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: ACCENT_A }}>{coach1}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                {stats1.firstYear}–{stats1.lastYear}
                {stats1.isActive && <span style={{ marginLeft: 6, color: '#2e7d32', fontWeight: 700 }}>● ACTIVE</span>}
              </div>
              <div style={{ fontSize: 12, color: '#bbb' }}>{stats1.teams.map(shortName).join(' · ')}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: ACCENT_B }}>{coach2}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                {stats2.firstYear}–{stats2.lastYear}
                {stats2.isActive && <span style={{ marginLeft: 6, color: '#2e7d32', fontWeight: 700 }}>● ACTIVE</span>}
              </div>
              <div style={{ fontSize: 12, color: '#bbb' }}>{stats2.teams.map(shortName).join(' · ')}</div>
            </div>
          </div>

          {/* Stat bars */}
          <div style={{ marginBottom: 32 }}>
            <StatRow
              label="CAREER WINS" val1={stats1.wins} val2={stats2.wins}
              fmt={v => v} higherIsBetter
            />
            <StatRow
              label="CAREER LOSSES" val1={stats1.losses} val2={stats2.losses}
              fmt={v => v} higherIsBetter={false}
            />
            <StatRow
              label="WIN %" val1={+(stats1.winPct * 100).toFixed(1)} val2={+(stats2.winPct * 100).toFixed(1)}
              fmt={v => v.toFixed(1) + '%'} higherIsBetter
            />
            <StatRow
              label="BEST STINT WIN %" val1={+(stats1.bestWinPct * 100).toFixed(1)} val2={+(stats2.bestWinPct * 100).toFixed(1)}
              fmt={v => v.toFixed(1) + '%'} higherIsBetter
            />
            <StatRow
              label="CHAMPIONSHIPS" val1={stats1.rings} val2={stats2.rings}
              fmt={v => v > 0 ? '🏆 ×' + v : '0'} higherIsBetter
            />
            <StatRow
              label="SEASONS COACHED" val1={stats1.tenure} val2={stats2.tenure}
              fmt={v => v} higherIsBetter
            />
            <StatRow
              label="FRANCHISES" val1={stats1.teams.length} val2={stats2.teams.length}
              fmt={v => v} higherIsBetter={false}
            />
          </div>

          {/* Per-stint tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            {[[coach1, stats1, ACCENT_A], [coach2, stats2, ACCENT_B]].map(([name, st, acc]) => (
              <div key={name}>
                <div style={{ fontSize: 10, fontWeight: 700, color: acc, letterSpacing: '0.8px', marginBottom: 8 }}>
                  {name.toUpperCase()} — COACHING STINTS
                </div>
                <StintsTable stats={st} accent={acc} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
