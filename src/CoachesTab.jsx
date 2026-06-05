import { useState, useMemo, useEffect } from 'react';
import { supabase } from './supabase';
import { TEAM_COLORS, COACH_CHAMPS, getHistoricalName } from './constants';

// ─── helpers ────────────────────────────────────────────────────────────────

function buildAggregates(coachData) {
  const map = {};
  coachData.forEach(d => {
    if (!map[d.coach]) map[d.coach] = { coach: d.coach, stints: [], wins: 0, losses: 0 };
    map[d.coach].stints.push(d);
    map[d.coach].wins  += d.wins;
    map[d.coach].losses += d.losses;
  });
  return Object.values(map).map(c => ({
    ...c,
    winPct:    c.wins + c.losses > 0 ? c.wins / (c.wins + c.losses) : 0,
    teams:     [...new Set(c.stints.map(s => s.franchise))],
    tenure:    c.stints.reduce((t, s) => t + (s.end - s.start), 0),
    rings:     COACH_CHAMPS[c.coach] ?? 0,
    firstYear: Math.min(...c.stints.map(s => s.start)),
    lastYear:  Math.max(...c.stints.map(s => s.end)),
    isActive:  c.stints.some(s => s.is_active),
  }));
}

function fmtSeason(year) {
  return `${year}–${String(year + 1).slice(-2)}`;
}

function fmtPct(n) {
  return n != null ? n.toFixed(1) + '%' : '—';
}

function shortName(franchise) {
  return franchise
    .replace('Los Angeles ', 'LA ')
    .replace('Oklahoma City ', 'OKC ');
}

// ─── CoachDetail ─────────────────────────────────────────────────────────────

function CoachDetail({ coach, seasonData, loadingSeasons }) {
  const color   = TEAM_COLORS[coach.teams[0]] || '#444';

  const rtgRows = seasonData.filter(r => r.ortg != null);
  const avgOrtg = rtgRows.length ? rtgRows.reduce((s, r) => s + r.ortg, 0) / rtgRows.length : null;
  const avgDrtg = rtgRows.length ? rtgRows.reduce((s, r) => s + r.drtg, 0) / rtgRows.length : null;

  const ppgRows    = seasonData.filter(r => r.pts_for != null);
  const avgPtsFor  = ppgRows.length ? ppgRows.reduce((s, r) => s + r.pts_for,     0) / ppgRows.length : null;
  const avgPtsAgainst = ppgRows.length ? ppgRows.reduce((s, r) => s + r.pts_against, 0) / ppgRows.length : null;

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ padding: '22px 28px 16px', borderBottom: '1px solid #ebebeb', background: '#fafafa' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#1a1a2e' }}>{coach.coach}</h2>
          {coach.rings > 0 && (
            <span style={{ fontSize: 18 }}>
              {coach.rings > 5 ? `🏆 ×${coach.rings}` : '🏆'.repeat(coach.rings)}
            </span>
          )}
          {coach.isActive && (
            <span style={{ fontSize: 11, fontWeight: 700, background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: 12, letterSpacing: '0.5px' }}>
              ACTIVE
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 3 }}>
          {coach.firstYear}–{coach.lastYear} &nbsp;·&nbsp;
          {coach.teams.length === 1 ? coach.teams[0] : `${coach.teams.length} franchises`}
        </div>
        <div style={{ height: 3, width: 48, background: color, borderRadius: 2, marginTop: 10, opacity: 0.85 }} />
      </div>

      {/* ── Career totals ── */}
      <div style={{ padding: '16px 28px 14px', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', letterSpacing: '0.8px', marginBottom: 10 }}>CAREER TOTALS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px 16px' }}>
          {[
            ['WINS',       coach.wins,                               '#2e7d32'],
            ['LOSSES',     coach.losses,                             '#c62828'],
            ['WIN %',      fmtPct(coach.winPct * 100),              '#1a1a2e'],
            ['SEASONS',    coach.tenure,                             '#555'],
            ['FRANCHISES', coach.teams.length,                      '#555'],
          ].map(([lbl, val, col]) => (
            <div key={lbl}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#bbb', letterSpacing: '0.7px', marginBottom: 2 }}>{lbl}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: col, lineHeight: 1 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stints ── */}
      <div style={{ padding: '16px 28px 14px', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', letterSpacing: '0.8px', marginBottom: 10 }}>COACHING STINTS</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ebebeb' }}>
              {['FRANCHISE','SEASONS','W','L','WIN%'].map(h => (
                <th key={h} style={{
                  textAlign: h === 'FRANCHISE' ? 'left' : 'right',
                  padding: '3px 8px', fontSize: 9, fontWeight: 700, color: '#bbb', letterSpacing: '0.6px',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coach.stints.map((s, i) => {
              const tot = s.wins + s.losses;
              const wp  = tot > 0 ? (s.wins / tot * 100).toFixed(1) : '—';
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 700, color: TEAM_COLORS[getHistoricalName(s.franchise, s.start)] || '#444', fontSize: 12 }}>
                    {getHistoricalName(s.franchise, s.start)}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: '#888', fontSize: 12 }}>{s.start}–{s.end}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: '#2e7d32', fontWeight: 700 }}>{s.wins}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: '#c62828' }}>{s.losses}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: '#555', fontWeight: 600 }}>{wp}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Season-by-season stats ── */}
      <div style={{ padding: '16px 28px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', letterSpacing: '0.8px' }}>
            SEASON-BY-SEASON STATS
          </div>
          <div style={{ fontSize: 10, color: '#ccc' }}>
            Pts/G &amp; Opp/G = raw per game · Off/Def Rtg = per 100 possessions · Basketball Reference
          </div>
        </div>

        {loadingSeasons ? (
          <div style={{ color: '#bbb', fontSize: 14, padding: '12px 0' }}>Loading…</div>
        ) : seasonData.length === 0 ? (
          <div style={{ color: '#bbb', fontSize: 13, padding: '12px 0', lineHeight: 1.5 }}>
            No season data yet. Run <code style={{ background: '#f5f5f5', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>seed-franchise-seasons</code> to populate ratings,
            and <code style={{ background: '#f5f5f5', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>seed-season-ppg</code> to populate raw points.
          </div>
        ) : (
          <>
            {/* Career averages summary */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 12, padding: '10px 14px', background: '#f5f7ff', borderRadius: 6, flexWrap: 'wrap' }}>
              {avgPtsFor != null && ([
                ['AVG PTS/G',  avgPtsFor.toFixed(1),   '#e65100'],
                ['AVG OPP/G',  avgPtsAgainst?.toFixed(1) ?? '—', '#6a1b9a'],
                ['AVG DIFF',   avgPtsFor != null && avgPtsAgainst != null
                                 ? ((avgPtsFor - avgPtsAgainst) > 0 ? '+' : '') + (avgPtsFor - avgPtsAgainst).toFixed(1)
                                 : '—',
                               avgPtsFor > avgPtsAgainst ? '#2e7d32' : '#c62828'],
              ].map(([lbl, val, col]) => (
                <div key={lbl}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#bbb', letterSpacing: '0.6px' }}>{lbl}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: col }}>{val}</div>
                </div>
              )))}
              {avgPtsFor != null && avgOrtg != null && (
                <div style={{ width: 1, background: '#dde', alignSelf: 'stretch', margin: '0 4px' }} />
              )}
              {avgOrtg != null && ([
                ['OFF RTG',  avgOrtg.toFixed(1),  '#1565c0'],
                ['DEF RTG',  avgDrtg?.toFixed(1) ?? '—', '#b71c1c'],
                ['NET RTG',  avgOrtg != null && avgDrtg != null
                               ? ((avgOrtg - avgDrtg) > 0 ? '+' : '') + (avgOrtg - avgDrtg).toFixed(1)
                               : '—',
                             avgOrtg > avgDrtg ? '#2e7d32' : '#c62828'],
              ].map(([lbl, val, col]) => (
                <div key={lbl}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#bbb', letterSpacing: '0.6px' }}>{lbl}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: col }}>{val}</div>
                </div>
              )))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 580 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ebebeb' }}>
                    {[
                      ['SEASON',   true],  ['FRANCHISE', true],
                      ['W',        false], ['L',         false],
                      ['PTS/G',    false], ['OPP/G',     false], ['DIFF',    false],
                      ['OFF RTG',  false], ['DEF RTG',   false], ['NET RTG', false],
                    ].map(([h, left]) => (
                      <th key={h} style={{
                        textAlign: left ? 'left' : 'right',
                        padding: '3px 6px', fontSize: 9, fontWeight: 700, color: '#bbb', letterSpacing: '0.6px',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {seasonData.map((row, i) => {
                    const netRtg    = row.ortg != null && row.drtg != null ? row.ortg - row.drtg : null;
                    const rawDiff   = row.pts_for != null && row.pts_against != null ? row.pts_for - row.pts_against : null;
                    const fmtNet    = (n) => n != null ? (n > 0 ? '+' : '') + n.toFixed(1) : '—';
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '5px 6px', color: '#666', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {fmtSeason(row.season_year)}
                        </td>
                        <td style={{ padding: '5px 6px', color: TEAM_COLORS[getHistoricalName(row.franchise, row.season_year)] || '#444', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>
                          {getHistoricalName(row.franchise, row.season_year)}
                        </td>
                        <td style={{ padding: '5px 6px', textAlign: 'right', color: '#2e7d32', fontWeight: 700 }}>{row.wins ?? '—'}</td>
                        <td style={{ padding: '5px 6px', textAlign: 'right', color: '#c62828' }}>{row.losses ?? '—'}</td>
                        {/* Raw PPG */}
                        <td style={{ padding: '5px 6px', textAlign: 'right', color: '#e65100', fontWeight: 700 }}>
                          {row.pts_for != null ? row.pts_for.toFixed(1) : '—'}
                        </td>
                        <td style={{ padding: '5px 6px', textAlign: 'right', color: '#6a1b9a', fontWeight: 600 }}>
                          {row.pts_against != null ? row.pts_against.toFixed(1) : '—'}
                        </td>
                        <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700,
                          color: rawDiff != null ? (rawDiff > 0 ? '#2e7d32' : '#c62828') : '#bbb' }}>
                          {fmtNet(rawDiff)}
                        </td>
                        {/* Efficiency ratings */}
                        <td style={{ padding: '5px 6px', textAlign: 'right', color: '#1565c0', fontWeight: 600 }}>
                          {row.ortg != null ? row.ortg.toFixed(1) : '—'}
                        </td>
                        <td style={{ padding: '5px 6px', textAlign: 'right', color: '#b71c1c', fontWeight: 600 }}>
                          {row.drtg != null ? row.drtg.toFixed(1) : '—'}
                        </td>
                        <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700,
                          color: netRtg != null ? (netRtg > 0 ? '#2e7d32' : '#c62828') : '#bbb' }}>
                          {fmtNet(netRtg)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── CoachesTab (main export) ────────────────────────────────────────────────

export default function CoachesTab({ coachData }) {
  const [selectedCoach,  setSelectedCoach]  = useState(null);
  const [sortBy,         setSortBy]         = useState('wins');
  const [filter,         setFilter]         = useState('');
  const [seasonData,     setSeasonData]     = useState([]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);

  const coaches = useMemo(() => buildAggregates(coachData), [coachData]);

  const displayed = useMemo(() => {
    const q = filter.toLowerCase();
    return coaches
      .filter(c =>
        !q ||
        c.coach.toLowerCase().includes(q) ||
        c.teams.some(t => t.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        if (sortBy === 'wins')    return b.wins - a.wins;
        if (sortBy === 'winPct')  return b.winPct - a.winPct;
        if (sortBy === 'tenure')  return b.tenure - a.tenure;
        if (sortBy === 'rings')   return (b.rings - a.rings) || (b.wins - a.wins);
        return a.coach.localeCompare(b.coach);
      });
  }, [coaches, filter, sortBy]);

  // Fetch season data whenever selected coach changes
  useEffect(() => {
    if (!selectedCoach) { setSeasonData([]); return; }
    const coach = coaches.find(c => c.coach === selectedCoach);
    if (!coach) return;

    setLoadingSeasons(true);
    setSeasonData([]);

    // One query per stint; end_year is the year after the last season
    const queries = coach.stints.map(s =>
      supabase
        .from('franchise_seasons')
        .select('franchise, season_year, wins, losses, ortg, drtg, pts_for, pts_against')
        .eq('franchise', s.franchise)
        .gte('season_year', s.start)
        .lte('season_year', s.end - 1)
    );

    Promise.all(queries).then(results => {
      const data = results.flatMap(r => r.data || []);
      data.sort((a, b) => a.season_year - b.season_year || a.franchise.localeCompare(b.franchise));
      setSeasonData(data);
      setLoadingSeasons(false);
    });
  }, [selectedCoach, coaches]);

  const selectedCoachData = selectedCoach ? coaches.find(c => c.coach === selectedCoach) : null;

  const sortBtns = [
    ['wins',   'Wins'],
    ['winPct', 'Win%'],
    ['tenure', 'Tenure'],
    ['rings',  'Rings'],
    ['alpha',  'A–Z'],
  ];

  return (
    <div style={{
      display: 'flex', height: 'calc(100vh - 158px)',
      fontFamily: "'Barlow Condensed', sans-serif",
    }}>

      {/* ── LEFT: sortable coach list ── */}
      <div style={{ flex: '0 0 530px', display: 'flex', flexDirection: 'column', borderRight: '2px solid #ebebeb' }}>

        {/* Controls */}
        <div style={{
          padding: '10px 14px', borderBottom: '1px solid #efefef', background: '#fafafa',
          display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <input
            type="text" placeholder="Search coach or team…"
            value={filter} onChange={e => setFilter(e.target.value)}
            style={{
              flex: 1, minWidth: 140, background: '#fff', border: '1.5px solid #ddd',
              color: '#222', padding: '5px 12px', borderRadius: 20,
              fontFamily: 'inherit', fontSize: 13,
            }}
          />
          {sortBtns.map(([k, l]) => (
            <button key={k} onClick={() => setSortBy(k)} style={{
              background: sortBy === k ? '#1a1a2e' : '#fff',
              color:      sortBy === k ? '#fff' : '#666',
              border:     `1.5px solid ${sortBy === k ? '#1a1a2e' : '#ddd'}`,
              padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 11, fontWeight: 600, transition: 'all 0.12s',
            }}>{l}</button>
          ))}
        </div>

        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 48px 48px 56px 38px 36px 32px',
          padding: '5px 14px', borderBottom: '2px solid #ebebeb',
          background: '#f5f5f5', fontSize: 9, fontWeight: 700, color: '#bbb', letterSpacing: '0.7px',
        }}>
          {['COACH', 'W', 'L', 'WIN%', 'TMS', 'YRS', '🏆'].map((h, i) => (
            <span key={h} style={{ textAlign: i > 0 ? 'right' : 'left' }}>{h}</span>
          ))}
        </div>

        {/* Row list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {displayed.map((c, i) => {
            const sel   = selectedCoach === c.coach;
            const color = TEAM_COLORS[c.teams[0]] || '#555';
            return (
              <div key={c.coach}
                onClick={() => setSelectedCoach(sel ? null : c.coach)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 48px 48px 56px 38px 36px 32px',
                  padding: '6px 14px',
                  borderBottom: '1px solid #f0f0f0',
                  borderLeft: `3px solid ${sel ? color : 'transparent'}`,
                  background: sel ? '#f0f4ff' : (i % 2 === 0 ? '#fff' : '#fafafa'),
                  cursor: 'pointer', transition: 'background 0.1s',
                }}>
                <span style={{
                  fontSize: 13, fontWeight: sel ? 700 : 600,
                  color: sel ? '#1a1a2e' : '#222',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {c.coach}
                </span>
                <span style={{ textAlign: 'right', fontSize: 12, color: '#2e7d32', fontWeight: 700 }}>{c.wins}</span>
                <span style={{ textAlign: 'right', fontSize: 12, color: '#c62828' }}>{c.losses}</span>
                <span style={{ textAlign: 'right', fontSize: 12, color: '#555', fontWeight: 600 }}>
                  {fmtPct(c.winPct * 100)}
                </span>
                <span style={{ textAlign: 'right', fontSize: 12, color: '#999' }}>{c.teams.length}</span>
                <span style={{ textAlign: 'right', fontSize: 12, color: '#999' }}>{c.tenure}</span>
                <span style={{ textAlign: 'right', fontSize: 12, color: '#b8860b' }}>
                  {c.rings > 0 ? c.rings : '—'}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '7px 14px', borderTop: '1px solid #efefef', fontSize: 11, color: '#bbb' }}>
          {displayed.length} coaches · click a row to expand
        </div>
      </div>

      {/* ── RIGHT: detail panel ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {selectedCoachData ? (
          <CoachDetail
            coach={selectedCoachData}
            seasonData={seasonData}
            loadingSeasons={loadingSeasons}
          />
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: '#ccc', fontSize: 16, fontWeight: 600,
            fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.5px',
          }}>
            ← Select a coach to view career details
          </div>
        )}
      </div>
    </div>
  );
}
