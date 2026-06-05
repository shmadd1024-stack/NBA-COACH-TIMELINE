import { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { TEAM_COLORS, COACH_CHAMPS, COACH_FULL_NAMES } from './constants';

// ── SVG layout (scatter) ─────────────────────────────────────────────────────
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

const CURRENT_COACH_KEYS = new Set([
  'J. Mazzulla','J. Fernandez','M. Brown','N. Nurse','D. Rajakovic',
  'K. Atkinson','J. Bickerstaff','R. Carlisle','T. Jenkins',
  'Q. Snyder','C. Lee','E. Spoelstra','B. Keefe',
  'D. Adelman','C. Finch','M. Daigneault','T. Splitter','W. Hardy',
  'S. Kerr','T. Lue','J. Redick','J. Ott','D. Christie',
  'I. Udoka','T. Iisalo','M. Johnson','J. Mosley',
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

// True if this coach was replaced mid-season (successor has mid_season_start).
function isMidSeasonEnd(s, allStints) {
  return allStints.some(other =>
    other.franchise === s.franchise &&
    other.start === s.end &&
    other.mid_season_start &&
    other.coach !== s.coach
  );
}

// Return season rows with wins/losses corrected for partial seasons.
//
// coaching_stints.wins/losses excludes games from the partial *start* season
// (season_year = start-1 when mid_season_start) but includes the partial *end*
// season (season_year = end-1 when fired mid-year).
//
// Partial-end record  = stintW - sum(true full seasons)
// Partial-start record = franchise season - predecessor's partial-end record
//   (where predecessor's partial-end = predStintW - sum(pred true full seasons))
function correctedStintSeasons(s, rawSeasons, allSeasons, allStints) {
  if (!rawSeasons.length) return rawSeasons;
  const midStart = s.mid_season_start;
  const midEnd   = isMidSeasonEnd(s, allStints);
  if (!midStart && !midEnd) return rawSeasons;

  const seasons = rawSeasons.map(r => ({ ...r }));

  // ── Partial LAST season ──────────────────────────────────────────────────────
  if (midEnd) {
    // True full seasons: exclude partial start (idx 0 when midStart) and partial end (last).
    const fullSlice = midStart ? seasons.slice(1, -1) : seasons.slice(0, -1);
    const fullW = fullSlice.reduce((a, r) => a + r.wins, 0);
    const fullL = fullSlice.reduce((a, r) => a + r.losses, 0);
    const lastW = Math.max(0, s.wins - fullW);
    const lastL = Math.max(0, s.losses - fullL);
    seasons[seasons.length - 1] = { ...seasons[seasons.length - 1], wins: lastW, losses: lastL };
  }

  // ── Partial FIRST season ─────────────────────────────────────────────────────
  if (midStart) {
    const partialYear = s.start - 1;
    const fSeason = allSeasons.find(r =>
      r.franchise === s.franchise && r.season_year === partialYear
    );

    if (!fSeason) {
      seasons[0] = { ...seasons[0], wins: 0, losses: 0 };
    } else {
      // Find the predecessor who was coaching when this season began.
      const pred = allStints.find(other =>
        other.franchise === s.franchise &&
        other.end === s.start &&
        other.coach !== s.coach
      );

      if (!pred) {
        // No predecessor found (e.g. first coach of a new franchise) — keep franchise total.
        seasons[0] = { ...seasons[0], wins: fSeason.wins, losses: fSeason.losses };
      } else {
        // Compute how many games pred coached in this shared season.
        // pred always has a mid-season end here (we replaced them), so their true full
        // seasons exclude their last year. Also exclude their partial start if they had one.
        const predRaw  = stintSeasons(pred, allSeasons);
        const predFull = pred.mid_season_start ? predRaw.slice(1, -1) : predRaw.slice(0, -1);
        const predFullW = predFull.reduce((a, r) => a + r.wins, 0);
        const predFullL = predFull.reduce((a, r) => a + r.losses, 0);
        const predPartialW = Math.max(0, pred.wins - predFullW);
        const predPartialL = Math.max(0, pred.losses - predFullL);

        seasons[0] = {
          ...seasons[0],
          wins:   Math.max(0, fSeason.wins   - predPartialW),
          losses: Math.max(0, fSeason.losses - predPartialL),
        };
      }
    }
  }

  return seasons;
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
      const seasons = correctedStintSeasons(s, stintSeasons(s, allSeasons), allSeasons, coachData);
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
      .flatMap(s => correctedStintSeasons(s, stintSeasons(s, allSeasons), allSeasons, coachData))
      .sort((a, b) => a.season_year - b.season_year);
    const m = seasonMetrics(allS);
    if (!m) return [];
    const totalW = stints.reduce((a, s) => a + s.wins, 0);
    const totalL = stints.reduce((a, s) => a + s.losses, 0);
    const primary = [...stints].sort((a, b) => (b.end - b.start) - (a.end - a.start))[0];
    const isActive = stints.some(s => s.is_active);
    const activeFranchise = stints.find(s => s.is_active)?.franchise;
    const labelFranchise = (isActive ? activeFranchise : primary.franchise) || primary.franchise;
    const uniqueTeams = new Set(stints.map(s => s.franchise)).size;
    const teamSuffix = uniqueTeams > 1 ? ` · ${uniqueTeams} teams` : '';
    return [{
      id:       coach,
      coach,
      label:    labelFranchise.replace('Los Angeles ', 'LA ') + teamSuffix,
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

// Build year-by-year series for the Timeline chart
function buildTimelineSeries(addedIds, coachData, allSeasons, byStint) {
  const result = [];

  if (byStint) {
    coachData.forEach(s => {
      const id = `${s.coach}|${s.franchise}|${s.start}`;
      if (!addedIds.has(id)) return;
      const seasons = correctedStintSeasons(s, stintSeasons(s, allSeasons), allSeasons, coachData);
      if (!seasons.length) return;
      result.push({
        id,
        coach: s.coach,
        label: `${s.franchise.replace('Los Angeles ', 'LA ')} ${s.start}–${s.end}`,
        franchise: s.franchise,
        color: TEAM_COLORS[s.franchise] || '#888',
        rings: COACH_CHAMPS[s.coach] ?? 0,
        isActive: s.is_active,
        points: seasons.map((r, i) => ({
          year: i + 1,
          wp: wp(r.wins, r.losses),
          wins: r.wins,
          losses: r.losses,
          seasonYear: r.season_year,
        })),
      });
    });
  } else {
    const byCoach = {};
    coachData.forEach(s => {
      if (!byCoach[s.coach]) byCoach[s.coach] = [];
      byCoach[s.coach].push(s);
    });
    Object.entries(byCoach).forEach(([coach, stints]) => {
      if (!addedIds.has(coach)) return;
      stints.sort((a, b) => a.start - b.start);
      const allS = stints
        .flatMap(s => correctedStintSeasons(s, stintSeasons(s, allSeasons), allSeasons, coachData))
        .sort((a, b) => a.season_year - b.season_year);
      if (!allS.length) return;
      const primary = [...stints].sort((a, b) => (b.end - b.start) - (a.end - a.start))[0];
      const isActive = stints.some(s => s.is_active);
      const activeFranchise = stints.find(s => s.is_active)?.franchise;
      const labelFranchise = (isActive ? activeFranchise : primary.franchise) || primary.franchise;
      const uniqueTeams = new Set(stints.map(s => s.franchise)).size;
      const teamSuffix = uniqueTeams > 1 ? ` · ${uniqueTeams} teams` : '';
      result.push({
        id: coach,
        coach,
        label: labelFranchise.replace('Los Angeles ', 'LA ') + teamSuffix,
        franchise: primary.franchise,
        color: TEAM_COLORS[primary.franchise] || '#888',
        rings: COACH_CHAMPS[coach] ?? 0,
        isActive,
        points: allS.map((r, i) => ({
          year: i + 1,
          wp: wp(r.wins, r.losses),
          wins: r.wins,
          losses: r.losses,
          seasonYear: r.season_year,
        })),
      });
    });
  }

  return result;
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
          const ttx  = cx + 16 + TW > PW ? cx - TW - 10 : cx + 16;
          const tty  = Math.max(0, Math.min(cy - TH / 2, PH - TH));
          const full = COACH_FULL_NAMES[hovered.coach] || hovered.coach;
          return (
            <g transform={`translate(${ttx},${tty})`} pointerEvents="none">
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

// ── TimelineChart ─────────────────────────────────────────────────────────────

const TL_M = { top: 24, right: 90, bottom: 58, left: 62 };
const TL_PW = SVG_W - TL_M.left - TL_M.right;
const TL_PH = SVG_H - TL_M.top - TL_M.bottom;

function tlPy(p) { return TL_PH - ((p - P0) / (P1 - P0)) * TL_PH; }

function TimelineChart({ series, lineStyle, onRemove }) {
  const [hovered, setHovered] = useState(null);

  const maxYear = series.length
    ? Math.max(...series.flatMap(s => s.points.map(p => p.year)))
    : 10;

  function yearX(yr) {
    if (maxYear === 1) return TL_PW / 2;
    return ((yr - 1) / (maxYear - 1)) * TL_PW;
  }

  const showLine = lineStyle === 'line' || lineStyle === 'both';
  const showDots = lineStyle === 'dots' || lineStyle === 'both';

  const step = maxYear <= 8 ? 1 : maxYear <= 16 ? 2 : 5;
  const xLabels = Array.from({ length: maxYear }, (_, i) => i + 1)
    .filter(yr => yr === 1 || yr === maxYear || yr % step === 0);

  return (
    <svg
      width={SVG_W} height={SVG_H}
      style={{ display: 'block', maxWidth: '100%', fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      <g transform={`translate(${TL_M.left},${TL_M.top})`}>

        {/* Y grid */}
        {TICKS.map(t => (
          <line key={t} x1={0} y1={tlPy(t)} x2={TL_PW} y2={tlPy(t)} stroke="#f0f0f0" strokeWidth={1} />
        ))}

        {/* 0.500 reference */}
        <line x1={0} y1={tlPy(0.5)} x2={TL_PW} y2={tlPy(0.5)}
          stroke="#ddd" strokeWidth={1.5} strokeDasharray="5 4" />

        {/* Axes */}
        <line x1={0} y1={TL_PH} x2={TL_PW} y2={TL_PH} stroke="#ccc" strokeWidth={1.5} />
        <line x1={0} y1={0} x2={0} y2={TL_PH} stroke="#ccc" strokeWidth={1.5} />

        {/* Y ticks */}
        {TICKS.map(t => (
          <text key={t} x={-8} y={tlPy(t) + 4} textAnchor="end" fontSize={10} fill="#bbb">
            {Math.round(t * 100)}%
          </text>
        ))}

        {/* X ticks */}
        {xLabels.map(yr => (
          <text key={yr} x={yearX(yr)} y={TL_PH + 17} textAnchor="middle" fontSize={10} fill="#bbb">
            {yr === 1 ? 'Yr 1' : `Yr ${yr}`}
          </text>
        ))}

        {/* Axis labels */}
        <text x={TL_PW / 2} y={TL_PH + 44} textAnchor="middle" fontSize={11} fontWeight={700} fill="#888" letterSpacing="0.5">
          YEAR OF TENURE
        </text>
        <text transform={`translate(-48,${TL_PH / 2}) rotate(-90)`} textAnchor="middle" fontSize={11} fontWeight={700} fill="#888" letterSpacing="0.5">
          WIN %
        </text>

        {/* Empty state */}
        {series.length === 0 && (
          <text x={TL_PW / 2} y={TL_PH / 2} textAnchor="middle" fontSize={14} fill="#ccc" fontWeight={600}>
            Search for coaches above to start comparing
          </text>
        )}

        {/* Series */}
        {series.map(s => {
          const pts = s.points.filter(p => p.wp != null);
          return (
            <g key={s.id}>
              {showLine && pts.length > 1 && (
                <polyline
                  points={pts.map(p => `${yearX(p.year)},${tlPy(p.wp)}`).join(' ')}
                  fill="none" stroke={s.color} strokeWidth={2.5} opacity={0.75}
                  strokeLinejoin="round" strokeLinecap="round"
                />
              )}
              {pts.map(p => (
                <circle
                  key={p.year}
                  cx={yearX(p.year)} cy={tlPy(p.wp)}
                  r={showDots ? 5 : 7}
                  fill={showDots ? s.color : 'transparent'}
                  stroke={showDots ? '#fff' : 'transparent'}
                  strokeWidth={showDots ? 1.5 : 0}
                  onMouseEnter={() => setHovered({ s, p })}
                  onMouseLeave={() => setHovered(v => (v?.s.id === s.id && v?.p.year === p.year) ? null : v)}
                  style={{ cursor: 'default' }}
                />
              ))}
            </g>
          );
        })}

        {/* End-of-line labels */}
        {series.map(s => {
          const pts = s.points.filter(p => p.wp != null);
          if (!pts.length) return null;
          const last = pts.at(-1);
          return (
            <text key={s.id}
              x={yearX(last.year) + 8} y={tlPy(last.wp) + 4}
              fontSize={10} fill={s.color} fontWeight={700}
              style={{ pointerEvents: 'none' }}
            >
              {(COACH_FULL_NAMES[s.coach] || s.coach).split(' ').pop()}
            </text>
          );
        })}

        {/* Tooltip */}
        {hovered && (() => {
          const { s, p } = hovered;
          const cx = yearX(p.year), cy = tlPy(p.wp);
          const TW = 195, TH = 82;
          const ttx = cx + 14 + TW > TL_PW ? cx - TW - 10 : cx + 14;
          const tty = Math.max(0, Math.min(cy - TH / 2, TL_PH - TH));
          const full = COACH_FULL_NAMES[s.coach] || s.coach;
          return (
            <g transform={`translate(${ttx},${tty})`} pointerEvents="none">
              <rect width={TW} height={TH} rx={7} fill="rgba(18,18,36,0.93)" />
              <text x={10} y={20} fontSize={13} fontWeight={800} fill="#fff">
                {full}{s.rings > 0 ? ' 🏆' : ''}
              </text>
              <text x={10} y={34} fontSize={10} fill="#999">
                {s.label}
              </text>
              <text x={10} y={51} fontSize={12} fill="#ddd">
                Year {p.year}{'  '}
                <tspan fontWeight={800}>{fmtP(p.wp)}</tspan>
                {'  '}
                <tspan fill="#aaa" fontSize={10}>{p.wins}–{p.losses}</tspan>
              </text>
              <text x={10} y={67} fontSize={10} fill="#777">
                {p.seasonYear}–{p.seasonYear + 1} season
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
  const [chartMode,   setChartMode]   = useState('scatter');
  const [lineStyle,   setLineStyle]   = useState('both');
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

  const allPoints = useMemo(() => {
    if (!allSeasons.length) return [];
    return buildPoints(coachData, allSeasons, byStint);
  }, [coachData, allSeasons, byStint]);

  const addedPoints = useMemo(
    () => allPoints.filter(p => addedIds.has(p.id)),
    [allPoints, addedIds]
  );

  const timelineSeries = useMemo(() => {
    if (!allSeasons.length || !addedIds.size) return [];
    return buildTimelineSeries(addedIds, coachData, allSeasons, byStint);
  }, [addedIds, coachData, allSeasons, byStint]);

  const addCoach    = id => setAddedIds(prev => new Set([...prev, id]));
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

      {/* ── Row 1: search + view controls ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>

        <CoachSearch allPoints={allPoints} addedIds={addedIds} onAdd={addCoach} />

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
          {pill(!byStint, () => setByStint(false), 'Coach')}
          {pill( byStint, () => setByStint(true),  'Stint')}
        </div>
      </div>

      {/* ── Row 2: chart-mode controls (graph only) ── */}
      {view === 'graph' && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={lbl}>CHART</span>
            {pill(chartMode === 'scatter',  () => setChartMode('scatter'),  'Scatter')}
            {pill(chartMode === 'timeline', () => setChartMode('timeline'), 'Year by Year')}
          </div>

          {chartMode === 'scatter' && (
            <>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={lbl}>X AXIS</span>
                {AXIS_OPTS.map(o => pill(xKey === o.key, () => setXKey(o.key), o.label))}
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={lbl}>Y AXIS</span>
                {AXIS_OPTS.map(o => pill(yKey === o.key, () => setYKey(o.key), o.label))}
              </div>
            </>
          )}

          {chartMode === 'timeline' && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={lbl}>STYLE</span>
              {pill(lineStyle === 'both', () => setLineStyle('both'), 'Line + Dots')}
              {pill(lineStyle === 'line', () => setLineStyle('line'), 'Line')}
              {pill(lineStyle === 'dots', () => setLineStyle('dots'), 'Dots')}
            </div>
          )}
        </div>
      )}

      {/* ── Coach chips ── */}
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
              <span
                onMouseDown={() => removeCoach(p.id)}
                style={{ fontSize: 14, lineHeight: 1, color: '#aaa', cursor: 'pointer', marginLeft: 1 }}
              >×</span>
            </span>
          ))}
        </div>
      )}

      {/* ── Graph view ── */}
      {view === 'graph' && chartMode === 'scatter' && (
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
      )}

      {view === 'graph' && chartMode === 'timeline' && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <TimelineChart
            series={timelineSeries}
            lineStyle={lineStyle}
            onRemove={removeCoach}
          />
          <div style={{ paddingTop: 28, fontSize: 11, color: '#aaa', lineHeight: 1.9, minWidth: 130 }}>
            <div style={{ fontWeight: 700, color: '#444', fontSize: 13, marginBottom: 6 }}>
              {timelineSeries.length} coaches
            </div>
            <div>Year 1 = first season</div>
            <div>🏆 = championship</div>
            <div style={{ marginBottom: 10 }}>Hover a point for stats</div>
            <div style={{ borderTop: '1px solid #eee', paddingTop: 8, fontSize: 10 }}>
              Dashed = .500<br />Above = winning record
            </div>
          </div>
        </div>
      )}

      {/* ── Table view ── */}
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
                        textAlign: (h === 'COACH' || h === 'TEAM / STINTS') ? 'left' : 'right',
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
