import { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { TEAM_COLORS, COACH_CHAMPS, COACH_FULL_NAMES } from './constants';

// ── SVG layout ───────────────────────────────────────────────────────────────
const SVG_W = 580, SVG_H = 460;
const M = { top: 24, right: 28, bottom: 58, left: 62 };
const PW = SVG_W - M.left - M.right;
const PH = SVG_H - M.top - M.bottom;
const P0 = 0.17, P1 = 0.88;

function px(p) { return ((p - P0) / (P1 - P0)) * PW; }
function py(p) { return PH - ((p - P0) / (P1 - P0)) * PH; }
function dotR(wins) { return Math.max(5, Math.min(16, Math.sqrt(wins / 9))); }
function fmtP(p) { return p != null ? (p * 100).toFixed(1) + '%' : '—'; }

const TICKS = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];

const AXIS_OPTS = [
  { key: 'year1',   label: 'Year 1 Win%'    },
  { key: 'finalYr', label: 'Final Year Win%' },
  { key: 'yrs1to3', label: 'Yrs 1–3 Win%'   },
  { key: 'career',  label: 'Career Win%'     },
];

// Abbreviated names of currently active coaches (from nbacoaches.com)
const CURRENT_COACH_KEYS = new Set([
  'J. Mazzulla','J. Fernandez','M. Brown','N. Nurse','D. Rajakovic',
  'K. Atkinson','J. Bickerstaff','R. Carlisle','T. Jenkins',
  'Q. Snyder','C. Lee','E. Spoelstra','B. Keefe',
  'D. Adelman','C. Finch','M. Daigneault','C. Billups','W. Hardy',
  'S. Kerr','T. Lue','J. Redick','J. Ott','D. Christie',
  'I. Udoka','T. Iisalo',
]);

// ── data helpers ─────────────────────────────────────────────────────────────

function wp(w, l) { return w + l > 0 ? w / (w + l) : null; }

function stintSeasons(s, allSeasons) {
  return allSeasons
    .filter(r =>
      r.franchise === s.franchise &&
      r.season_year >= (s.mid_season_start ? s.start - 1 : s.start) &&
      r.season_year <= s.end - 1
    )
    .sort((a, b) => a.season_year - b.season_year);
}

function seasonMetrics(seasons) {
  if (!seasons.length) return null;
  const first3 = seasons.slice(0, 3);
  const f3w = first3.reduce((a, r) => a + r.wins, 0);
  const f3l = first3.reduce((a, r) => a + r.losses, 0);
  const totalW = seasons.reduce((a, r) => a + r.wins, 0);
  const totalL = seasons.reduce((a, r) => a + r.losses, 0);
  return {
    year1:   wp(seasons[0].wins, seasons[0].losses),
    finalYr: wp(seasons.at(-1).wins, seasons.at(-1).losses),
    yrs1to3: wp(f3w, f3l),
    career:  wp(totalW, totalL),
    count:   seasons.length,
  };
}

function buildPoints(coachData, allSeasons, byStint) {
  if (byStint) {
    return coachData.flatMap(s => {
      const seasons = stintSeasons(s, allSeasons);
      const m = seasonMetrics(seasons);
      if (!m) return [];
      return [{
        id:       `${s.coach}|${s.franchise}|${s.start}`,
        coach:    s.coach,
        label:    `${s.franchise.replace('Los Angeles ', 'LA ')} ${s.start}–${s.end}`,
        franchise: s.franchise,
        start:    s.start,
        end:      s.end,
        seasons:  m.count,
        year1:    m.year1,
        finalYr:  m.finalYr,
        yrs1to3:  m.yrs1to3,
        career:   m.career,
        wins:     s.wins,
        rings:    COACH_CHAMPS[s.coach] ?? 0,
        isActive: s.is_active,
        color:    TEAM_COLORS[s.franchise] || '#888',
      }];
    });
  }

  const byCoach = {};
  coachData.forEach(s => {
    if (!byCoach[s.coach]) byCoach[s.coach] = [];
    byCoach[s.coach].push(s);
  });

  return Object.entries(byCoach).flatMap(([coach, stints]) => {
    stints.sort((a, b) => a.start - b.start);
    const allS = stints
      .flatMap(s => stintSeasons(s, allSeasons))
      .sort((a, b) => a.season_year - b.season_year);
    const m = seasonMetrics(allS);
    if (!m) return [];
    const totalW = stints.reduce((a, s) => a + s.wins, 0);
    const totalL = stints.reduce((a, s) => a + s.losses, 0);
    const primary = [...stints].sort((a, b) => (b.end - b.start) - (a.end - a.start))[0];
    return [{
      id:       coach,
      coach,
      label:    stints.length === 1 ? stints[0].franchise.replace('Los Angeles ', 'LA ') : `${stints.length} teams`,
      franchise: primary.franchise,
      start:    stints[0].start,
      end:      stints.at(-1).end,
      seasons:  m.count,
      year1:    m.year1,
      finalYr:  m.finalYr,
      yrs1to3:  m.yrs1to3,
      career:   wp(totalW, totalL),
      wins:     totalW,
      rings:    COACH_CHAMPS[coach] ?? 0,
      isActive: stints.some(s => s.is_active),
      color:    TEAM_COLORS[primary.franchise] || '#888',
    }];
  });
}

// ── ScatterPlot ───────────────────────────────────────────────────────────────

function ScatterPlot({ points, xKey, yKey, xLabel, yLabel, onRemove }) {
  const [hovered, setHovered] = useState(null);

  const visible = points.filter(p => p[xKey] != null && p[yKey] != null);

  return (
    <svg
      width={SVG_W} height={SVG_H}
      style={{ display: 'block', maxWidth: '100%', fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      <g transform={`translate(${M.left},${M.top})`}>

        {/* Grid */}
        {TICKS.map(t => (
          <g key={t}>
            <line x1={px(t)} y1={0} x2={px(t)} y2={PH} stroke="#f0f0f0" strokeWidth={1} />
            <line x1={0} y1={py(t)} x2={PW} y2={py(t)} stroke="#f0f0f0" strokeWidth={1} />
          </g>
        ))}

        {/* Diagonal reference */}
        <line x1={px(P0)} y1={py(P0)} x2={px(P1)} y2={py(P1)}
          stroke="#ddd" strokeWidth={1.5} strokeDasharray="5 4" />

        {/* Axes */}
        <line x1={0} y1={PH} x2={PW} y2={PH} stroke="#ccc" strokeWidth={1.5} />
        <line x1={0} y1={0} x2={0}  y2={PH} stroke="#ccc" strokeWidth={1.5} />

        {/* Tick labels */}
        {TICKS.map(t => (
          <g key={t}>
            <text x={px(t)} y={PH + 17} textAnchor="middle" fontSize={10} fill="#bbb">{Math.round(t * 100)}%</text>
            <text x={-8}   y={py(t) + 4} textAnchor="end"    fontSize={10} fill="#bbb">{Math.round(t * 100)}%</text>
          </g>
        ))}

        {/* Axis labels */}
        <text x={PW / 2} y={PH + 44} textAnchor="middle" fontSize={11} fontWeight={700} fill="#888" letterSpacing="0.5">
          {xLabel.toUpperCase()}
        </text>
        <text transform={`translate(-48,${PH / 2}) rotate(-90)`} textAnchor="middle" fontSize={11} fontWeight={700} fill="#888" letterSpacing="0.5">
          {yLabel.toUpperCase()}
        </text>

        {/* Empty state */}
        {visible.length === 0 && (
          <text x={PW / 2} y={PH / 2} textAnchor="middle" fontSize={14} fill="#ccc" fontWeight={600}>
            Search for coaches above to start comparing
          </text>
        )}

        {/* Dots */}
        {visible.map(p => {
          const cx  = px(p[xKey]);
          const cy  = py(p[yKey]);
          const rad = dotR(p.wins);
          return (
            <g key={p.id}
              onMouseEnter={() => setHovered(p)}
              onMouseLeave={() => setHovered(v => v?.id === p.id ? null : v)}
              style={{ cursor: 'default' }}
            >
              {p.rings > 0 && (
                <circle cx={cx} cy={cy} r={rad + 3.5} fill="#ffd700" opacity={0.55} />
              )}
              <circle cx={cx} cy={cy} r={rad}
                fill={p.color} opacity={0.85}
                stroke="#fff" strokeWidth={1.5}
              />
              <text x={cx + rad + 4} y={cy + 4} fontSize={10} fill={p.color} fontWeight={700}
                style={{ pointerEvents: 'none' }}>
                {(COACH_FULL_NAMES[p.coach] || p.coach).split(' ').pop()}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        {hovered && (() => {
          const cx   = px(hovered[xKey]);
          const cy   = py(hovered[yKey]);
          const TW   = 185, TH = 88;
          const tx   = cx + 16 + TW > PW ? cx - TW - 10 : cx + 16;
          const ty   = Math.max(0, Math.min(cy - TH / 2, PH - TH));
          const full = COACH_FULL_NAMES[hovered.coach] || hovered.coach;
          return (
            <g transform={`translate(${tx},${ty})`} pointerEvents="none">
              <rect width={TW} height={TH} rx={7} fill="rgba(18,18,36,0.93)" />
              <text x={10} y={20} fontSize={13} fontWeight={800} fill="#fff">
                {full}{hovered.rings > 0 ? ' 🏆' : ''}
              </text>
              <text x={10} y={34} fontSize={10} fill="#999">
                {hovered.label} · {hovered.start}–{hovered.end}
              </text>
              <text x={10} y={51} fontSize={11} fill="#ddd">
                {xLabel}: <tspan fontWeight={700}>{fmtP(hovered[xKey])}</tspan>
                {'   '}
                {yLabel}: <tspan fontWeight={700}>{fmtP(hovered[yKey])}</tspan>
              </text>
              <text x={10} y={66} fontSize={10} fill="#bbb">
                Career: {fmtP(hovered.career)} · {hovered.wins}W · {hovered.seasons} seasons
              </text>
              <text x={TW - 10} y={82} fontSize={9} fill="#555" fontStyle="italic" textAnchor="end"
                onClick={() => onRemove(hovered.id)} style={{ cursor: 'pointer' }}>
                Remove ×
              </text>
            </g>
          );
        })()}
      </g>
    </svg>
  );
}

// ── CoachSearch ───────────────────────────────────────────────────────────────

function CoachSearch({ allPoints, addedIds, onAdd }) {
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allPoints
      .filter(p => {
        if (addedIds.has(p.id)) return false;
        const full = COACH_FULL_NAMES[p.coach] || p.coach;
        return full.toLowerCase().includes(q) || p.coach.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [query, allPoints, addedIds]);

  const handleSelect = p => {
    onAdd(p.id);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search coach name…"
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '7px 14px', borderRadius: 20,
          border: '1.5px solid #ddd', background: '#fff',
          fontFamily: 'inherit', fontSize: 13, color: '#222',
          outline: 'none',
        }}
      />
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 50,
          background: '#fff', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          border: '1px solid #eee', overflow: 'hidden',
        }}>
          {suggestions.map(p => {
            const full = COACH_FULL_NAMES[p.coach] || p.coach;
            return (
              <div key={p.id} onMouseDown={() => handleSelect(p)} style={{
                padding: '9px 14px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid #f5f5f5',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f7ff'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1a2e' }}>{full}</span>
                  {p.rings > 0 && <span style={{ marginLeft: 4, fontSize: 11 }}>{'🏆'.repeat(Math.min(p.rings, 3))}</span>}
                  {p.isActive && <span style={{ marginLeft: 6, fontSize: 9, background: '#e8f5e9', color: '#2e7d32', padding: '1px 5px', borderRadius: 6 }}>ACTIVE</span>}
                </div>
                <span style={{ fontSize: 11, color: TEAM_COLORS[p.franchise] || '#888', fontWeight: 600 }}>
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── PerformanceTab ─────────────────────────────────────────────────────────────

export default function PerformanceTab({ coachData }) {
  const [allSeasons,  setAllSeasons]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [xKey,        setXKey]        = useState('year1');
  const [yKey,        setYKey]        = useState('finalYr');
  const [byStint,     setByStint]     = useState(false);
  const [view,        setView]        = useState('graph');
  const [addedIds,    setAddedIds]    = useState(new Set());
  const [sortCol,     setSortCol]     = useState('career');
  const [sortAsc,     setSortAsc]     = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('franchise_seasons').select('franchise, season_year, wins, losses').range(0, 999),
      supabase.from('franchise_seasons').select('franchise, season_year, wins, losses').range(1000, 1999),
    ]).then(([r1, r2]) => {
      setAllSeasons([...(r1.data || []), ...(r2.data || [])]);
      setLoading(false);
    });
  }, []);

  // All computed points (no active/season filters — search should see everything)
  const allPoints = useMemo(() => {
    if (!allSeasons.length) return [];
    return buildPoints(coachData, allSeasons, byStint);
  }, [coachData, allSeasons, byStint]);

  // Only the coaches the user has added
  const addedPoints = useMemo(
    () => allPoints.filter(p => addedIds.has(p.id)),
    [allPoints, addedIds]
  );

  const addCoach   = id => setAddedIds(prev => new Set([...prev, id]));
  const removeCoach = id => setAddedIds(prev => { const n = new Set(prev); n.delete(id); return n; });

  const addCurrentCoaches = () => {
    const ids = allPoints
      .filter(p => CURRENT_COACH_KEYS.has(p.coach))
      .map(p => p.id);
    setAddedIds(new Set(ids));
  };

  const xLabel = AXIS_OPTS.find(o => o.key === xKey)?.label ?? '';
  const yLabel = AXIS_OPTS.find(o => o.key === yKey)?.label ?? '';

  const sortedRows = useMemo(() => (
    [...addedPoints].sort((a, b) => {
      if (sortCol === 'coach') {
        const af = COACH_FULL_NAMES[a.coach] || a.coach;
        const bf = COACH_FULL_NAMES[b.coach] || b.coach;
        return sortAsc ? af.localeCompare(bf) : bf.localeCompare(af);
      }
      const av = a[sortCol] ?? -1, bv = b[sortCol] ?? -1;
      return sortAsc ? av - bv : bv - av;
    })
  ), [addedPoints, sortCol, sortAsc]);

  const toggleSort = col => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(false); }
  };

  const pill = (active, onClick, label, accent) => (
    <button key={label} onClick={onClick} style={{
      background: active ? (accent || '#1a1a2e') : '#fff',
      color:      active ? '#fff' : '#555',
      border:     `1.5px solid ${active ? (accent || '#1a1a2e') : '#ddd'}`,
      padding: '4px 11px', borderRadius: 20, cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
      transition: 'all 0.12s',
    }}>{label}</button>
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400,
      color: '#bbb', fontSize: 14, fontFamily: "'Barlow Condensed', sans-serif" }}>
      Loading…
    </div>
  );

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", padding: '14px 20px' }}>

      {/* ── Top controls ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>

        {/* Search */}
        <CoachSearch allPoints={allPoints} addedIds={addedIds} onAdd={addCoach} />

        {/* Preset */}
        <button onClick={addCurrentCoaches} style={{
          background: '#e8f5e9', color: '#2e7d32', border: '1.5px solid #a5d6a7',
          padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
        }}>
          🟢 Current coaches
        </button>

        {addedIds.size > 0 && (
          <button onClick={() => setAddedIds(new Set())} style={{
            background: '#fafafa', color: '#aaa', border: '1.5px solid #eee',
            padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
          }}>
            Clear all
          </button>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <span style={lbl}>VIEW</span>
          {pill(view === 'graph', () => setView('graph'), '📈 Graph')}
          {pill(view === 'table', () => setView('table'), '📋 Table')}
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <span style={lbl}>BY</span>
          {pill(!byStint, () => setByStint(false), 'Career')}
          {pill( byStint, () => setByStint(true),  'Stint')}
        </div>
      </div>

      {/* ── Added coach chips ── */}
      {addedPoints.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {addedPoints.map(p => (
            <span key={p.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 20,
              background: p.color + '18', border: `1.5px solid ${p.color}`,
              color: p.color, fontSize: 12, fontWeight: 700,
            }}>
              {(COACH_FULL_NAMES[p.coach] || p.coach).split(' ').pop()}
              {p.rings > 0 ? ' 🏆' : ''}
              {p.isActive ? <span style={{ fontSize: 9, background: '#e8f5e9', color: '#2e7d32', padding: '1px 4px', borderRadius: 5 }}>NOW</span> : null}
              <span
                onMouseDown={() => removeCoach(p.id)}
                style={{ fontSize: 14, lineHeight: 1, color: '#aaa', cursor: 'pointer', marginLeft: 1 }}
              >×</span>
            </span>
          ))}
        </div>
      )}

      {view === 'graph' && (
        <>
          {/* Axis selectors */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={lbl}>X AXIS</span>
              {AXIS_OPTS.map(o => pill(xKey === o.key, () => setXKey(o.key), o.label))}
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={lbl}>Y AXIS</span>
              {AXIS_OPTS.map(o => pill(yKey === o.key, () => setYKey(o.key), o.label))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <ScatterPlot
              points={addedPoints}
              xKey={xKey} yKey={yKey}
              xLabel={xLabel} yLabel={yLabel}
              onRemove={removeCoach}
            />
            <div style={{ paddingTop: 28, fontSize: 11, color: '#aaa', lineHeight: 1.9, minWidth: 130 }}>
              <div style={{ fontWeight: 700, color: '#444', fontSize: 13, marginBottom: 6 }}>
                {addedPoints.filter(p => p[xKey] != null && p[yKey] != null).length} plotted
              </div>
              <div>Dot size ∝ wins</div>
              <div>🏆 = championship</div>
              <div style={{ marginBottom: 10 }}>Hover for stats</div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: 8, fontSize: 10 }}>
                Dashed = equal<br />Above = Y &gt; X
              </div>
            </div>
          </div>
        </>
      )}

      {view === 'table' && (
        <div style={{ overflowX: 'auto' }}>
          {addedPoints.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#ccc', fontSize: 14 }}>
              Search for coaches above to compare
            </div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ebebeb', background: '#f5f5f5' }}>
                    {[
                      ['#',         null],
                      ['COACH',     'coach'],
                      ['TEAM / STINTS', null],
                      ['YRS',       'seasons'],
                      ['WINS',      'wins'],
                      ['CAREER',    'career'],
                      ['YEAR 1',    'year1'],
                      ['FINAL YR',  'finalYr'],
                      ['YRS 1–3',   'yrs1to3'],
                      ['',          null],
                    ].map(([h, col]) => (
                      <th key={h + (col || '')} onClick={col ? () => toggleSort(col) : undefined} style={{
                        padding: '6px 10px',
                        textAlign: !col && h !== '#' ? 'left' : 'right',
                        fontSize: 9, fontWeight: 700,
                        color: sortCol === col ? '#1a1a2e' : '#bbb',
                        letterSpacing: '0.6px',
                        cursor: col ? 'pointer' : 'default',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                      }}>
                        {h}{sortCol === col ? (sortAsc ? ' ↑' : ' ↓') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((p, i) => {
                    const full = COACH_FULL_NAMES[p.coach] || p.coach;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '5px 10px', color: '#bbb', textAlign: 'right', fontSize: 11 }}>{i + 1}</td>
                        <td style={{ padding: '5px 10px', fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap' }}>
                          {full}
                          {p.rings > 0 && <span style={{ marginLeft: 4, fontSize: 11 }}>{p.rings > 3 ? `🏆×${p.rings}` : '🏆'.repeat(p.rings)}</span>}
                          {p.isActive && <span style={{ marginLeft: 6, fontSize: 9, background: '#e8f5e9', color: '#2e7d32', padding: '1px 6px', borderRadius: 8 }}>ACTIVE</span>}
                        </td>
                        <td style={{ padding: '5px 10px', color: TEAM_COLORS[p.franchise] || '#888', fontWeight: 600, fontSize: 12 }}>{p.label}</td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', color: '#999' }}>{p.seasons}</td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', color: '#2e7d32', fontWeight: 700 }}>{p.wins}</td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 700, color: p.career != null && p.career >= 0.5 ? '#2e7d32' : '#c62828' }}>{fmtP(p.career)}</td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', color: '#555' }}>{fmtP(p.year1)}</td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', color: '#555' }}>{fmtP(p.finalYr)}</td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', color: '#555' }}>{fmtP(p.yrs1to3)}</td>
                        <td style={{ padding: '5px 10px', textAlign: 'right' }}>
                          <span onClick={() => removeCoach(p.id)} style={{ color: '#ddd', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>×</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ padding: '8px 10px 2px', fontSize: 10, color: '#ccc' }}>
                {sortedRows.length} coaches · click headers to sort
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const lbl = {
  fontSize: 9, fontWeight: 700, color: '#bbb', letterSpacing: '0.7px', marginRight: 4,
};
