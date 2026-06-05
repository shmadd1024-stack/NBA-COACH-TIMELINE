import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";
import CoachesTab from "./CoachesTab";
import CompareTab from "./CompareTab";
import {
  TEAM_COLORS, TEAM_ACCENT, CHAMPIONSHIPS, FRANCHISE_STATS,
  coachChamps, MIN_YEAR, MAX_YEAR,
} from "./constants";
import { Analytics } from "@vercel/analytics/react";

// ─── YearRangeSlider ─────────────────────────────────────────────────────────

function YearRangeSlider({ min, max, start, end, onChange }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const pct = (val) => ((val - min) / (max - min)) * 100;

  const valueFromEvent = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + ratio * (max - min));
  };

  const handleMouseDown = (handle) => (e) => {
    e.preventDefault();
    setDragging(handle);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const val = valueFromEvent(e);
      if (dragging === 'start') onChange(Math.min(val, end - 1), end);
      else onChange(start, Math.max(val, start + 1));
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, start, end]);

  const TRACK_W = 180;
  const HANDLE_R = 8;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#555', fontFamily: "'Barlow Condensed', sans-serif", minWidth: 36, textAlign: 'right' }}>
        {start}
      </span>
      <div ref={trackRef} style={{ position: 'relative', width: TRACK_W, height: 20, cursor: 'crosshair', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: '#e0e0e0', borderRadius: 2 }} />
        <div style={{
          position: 'absolute', left: `${pct(start)}%`, width: `${pct(end) - pct(start)}%`,
          height: 4, background: '#1a1a2e', borderRadius: 2,
          transition: dragging ? 'none' : 'all 0.1s',
        }} />
        {['start', 'end'].map(handle => (
          <div key={handle}
            onMouseDown={handleMouseDown(handle)}
            onTouchStart={handleMouseDown(handle)}
            style={{
              position: 'absolute',
              left: `calc(${pct(handle === 'start' ? start : end)}% - ${HANDLE_R}px)`,
              width: HANDLE_R * 2, height: HANDLE_R * 2, borderRadius: '50%',
              background: dragging === handle ? '#c0392b' : '#1a1a2e',
              border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              cursor: 'ew-resize', zIndex: 2,
              transition: dragging === handle ? 'none' : 'left 0.05s, background 0.15s',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#555', fontFamily: "'Barlow Condensed', sans-serif", minWidth: 36 }}>
        {end}
      </span>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [coachData,        setCoachData]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [activeTab,        setActiveTab]        = useState('coaches');
  const [tooltip,          setTooltip]          = useState(null);
  const [franchiseTip,     setFranchiseTip]     = useState(null);
  const [search,           setSearch]           = useState('');
  const [selectedFranchise,setSelectedFranchise]= useState(null);
  const [viewStart,        setViewStart]        = useState(MIN_YEAR);
  const [viewEnd,          setViewEnd]          = useState(MAX_YEAR);
  const [sortMode,         setSortMode]         = useState('champ');

  useEffect(() => {
    supabase
      .from('coaching_stints')
      .select('franchise, coach, start_year, end_year, wins, losses, is_active')
      .order('franchise')
      .order('start_year')
      .then(({ data, error }) => {
        if (error) { console.error('Supabase fetch error:', error); return; }
        setCoachData(data.map(d => ({ ...d, start: d.start_year, end: d.end_year })));
        setLoading(false);
      });
  }, []);

  // Clear hover state when switching tabs
  useEffect(() => {
    setTooltip(null);
    setFranchiseTip(null);
  }, [activeTab]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#fff',
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, color: '#aaa', letterSpacing: 1,
      }}>
        Loading coaching data…
      </div>
    );
  }

  const FRANCHISES      = [...new Set(coachData.map(d => d.franchise))].sort();
  const ROW_H           = 28;
  const LABEL_W         = 185;
  const PAD_TOP         = 50;
  const PAD_BOT         = 30;

  const sortedFranchises = [...FRANCHISES].sort((a, b) => {
    if (sortMode === 'champ') {
      const diff = (CHAMPIONSHIPS[b] ?? 0) - (CHAMPIONSHIPS[a] ?? 0);
      return diff !== 0 ? diff : a.localeCompare(b);
    }
    if (sortMode === 'coaches')
      return coachData.filter(d => d.franchise === b).length - coachData.filter(d => d.franchise === a).length;
    if (sortMode === 'longestTenure') {
      const longest = f => Math.max(...coachData.filter(d => d.franchise === f).map(d => d.end - d.start));
      return longest(b) - longest(a);
    }
    return a.localeCompare(b);
  });

  const filteredFranchises = sortedFranchises.filter(f =>
    f.toLowerCase().includes(search.toLowerCase()) ||
    coachData.some(d => d.franchise === f && d.coach.toLowerCase().includes(search.toLowerCase()))
  );

  const svgW     = 900;
  const svgH     = PAD_TOP + filteredFranchises.length * ROW_H + PAD_BOT;
  const yearSpan = viewEnd - viewStart;
  const chartW   = svgW - LABEL_W - 20;
  const xScale   = (yr) => LABEL_W + ((yr - viewStart) / yearSpan) * chartW;

  const decadeTicks = [];
  for (let yr = Math.ceil(viewStart / 10) * 10; yr <= viewEnd; yr += 10) decadeTicks.push(yr);

  const TABS = [
    ['coaches',  '👤 Coach Stats'],
    ['compare',  '⚡ Compare'],
    ['timeline', '📊 Timeline'],
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#ffffff',
      fontFamily: "'Barlow Condensed', 'Roboto Condensed', sans-serif", color: '#222',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800&display=swap');
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0f0f0; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
        .block-rect { transition: opacity 0.15s; cursor: pointer; }
        .block-rect:hover { opacity: 0.82; }
        .ctrl-btn { background: #fff; border: 1.5px solid #ddd; color: #555; padding: 5px 14px;
          border-radius: 20px; cursor: pointer; font-family: inherit; font-size: 12px; font-weight: 600; transition: all 0.15s; }
        .ctrl-btn:hover { background: #f5f5f5; border-color: #aaa; color: #111; }
        .ctrl-btn.active { background: #1a1a2e; border-color: #1a1a2e; color: #fff; }
        input[type=text] { background: #fff; border: 1.5px solid #ddd; color: #222;
          padding: 5px 12px; border-radius: 20px; font-family: inherit; font-size: 13px; width: 200px; }
        input[type=text]::placeholder { color: #bbb; }
        input[type=text]:focus { outline: none; border-color: #999; }
        .franchise-row { cursor: pointer; }
        .franchise-row:hover text { fill: #000 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding: '20px 32px 0', borderBottom: '2px solid #ebebeb' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <h1 style={{
            margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px',
            background: 'linear-gradient(90deg, #1a1a2e 0%, #c0392b 50%, #e67e22 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            NBA HEAD COACH DB
          </h1>
          <span style={{ color: '#aaa', fontSize: 13 }}>1946 – 2026 · {coachData.length} coaching stints</span>
        </div>

        {/* ── Tab bar ── */}
        <div style={{ display: 'flex', gap: 0, marginTop: 14 }}>
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 22px',
              fontFamily: 'inherit', fontSize: 14, fontWeight: activeTab === key ? 700 : 600,
              color: activeTab === key ? '#1a1a2e' : '#aaa',
              borderBottom: activeTab === key ? '3px solid #1a1a2e' : '3px solid transparent',
              marginBottom: -2, transition: 'color 0.15s, border-color 0.15s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ══ Timeline tab ══════════════════════════════════════════════════════ */}
      {activeTab === 'timeline' && (
        <>
          {/* Controls */}
          <div style={{
            padding: '12px 32px', borderBottom: '1px solid #efefef', background: '#fafafa',
            display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: '#aaa', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', marginRight: 4 }}>SORT</span>
              {[['champ','🏆 Championships'],['alpha','A–Z'],['coaches','Most Coaches'],['longestTenure','Longest Tenure']].map(([k,l]) => (
                <button key={k} className={`ctrl-btn ${sortMode===k?'active':''}`} onClick={() => setSortMode(k)}>{l}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: '#aaa', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', marginRight: 4 }}>SEARCH</span>
              <input type="text" placeholder="Team or coach name…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: '#aaa', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px' }}>ERA</span>
              {[[MIN_YEAR, MAX_YEAR,'All Time'],[1980,MAX_YEAR,'Since 1980'],[2000,MAX_YEAR,'Since 2000']].map(([s,e,l]) => (
                <button key={l} className={`ctrl-btn ${viewStart===s&&viewEnd===e?'active':''}`}
                  onClick={() => { setViewStart(s); setViewEnd(e); }}>{l}</button>
              ))}
              <YearRangeSlider min={MIN_YEAR} max={MAX_YEAR} start={viewStart} end={viewEnd}
                onChange={(s, e) => { setViewStart(s); setViewEnd(e); }} />
            </div>
            {selectedFranchise && (
              <button className="ctrl-btn" style={{ borderColor: '#E03A3E', color: '#c0392b' }}
                onClick={() => setSelectedFranchise(null)}>
                ✕ {selectedFranchise}
              </button>
            )}
          </div>

          {/* SVG Chart */}
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
            <svg width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto' }}>

              {decadeTicks.map(yr => (
                <g key={yr}>
                  <line x1={xScale(yr)} x2={xScale(yr)} y1={PAD_TOP - 10} y2={svgH - PAD_BOT}
                    stroke="#e8e8e8" strokeWidth={1} />
                  <text x={xScale(yr)} y={PAD_TOP - 14} textAnchor="middle"
                    fill="#aaa" fontSize={11} fontFamily="'Barlow Condensed', sans-serif" fontWeight={600}>
                    {yr}
                  </text>
                </g>
              ))}

              {filteredFranchises.map((franchise, fi) => {
                const y           = PAD_TOP + fi * ROW_H;
                const color       = TEAM_COLORS[franchise] || '#444';
                const accent      = TEAM_ACCENT[franchise] || '#fff';
                const isSelected  = selectedFranchise === franchise;
                const isHighlighted = !selectedFranchise || isSelected;
                const teamBlocks  = coachData.filter(d =>
                  d.franchise === franchise && d.end > viewStart && d.start < viewEnd
                );

                return (
                  <g key={franchise} className="franchise-row"
                    onClick={() => setSelectedFranchise(isSelected ? null : franchise)}>
                    <rect x={0} y={y} width={svgW} height={ROW_H - 1}
                      fill={fi % 2 === 0 ? '#fafafa' : '#ffffff'}
                      opacity={isHighlighted ? 1 : 0.4} />

                    <text x={LABEL_W - 8} y={y + ROW_H / 2 + 4}
                      textAnchor="end" fontSize={11}
                      fontFamily="'Barlow Condensed', sans-serif" fontWeight={600}
                      fill={isSelected ? '#000' : isHighlighted ? '#333' : '#bbb'}
                      style={{ transition: 'fill 0.15s', cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        const allBlocks  = coachData.filter(d => d.franchise === franchise);
                        const numCoaches = new Set(allBlocks.map(d => d.coach)).size;
                        setFranchiseTip({ franchise, numCoaches, x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => setFranchiseTip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                      onMouseLeave={() => setFranchiseTip(null)}>
                      {franchise.replace('Los Angeles ', 'LA ').replace('Oklahoma City ', 'OKC ')}
                      {sortMode === 'champ' && (CHAMPIONSHIPS[franchise] ?? 0) > 0 ? `  🏆${CHAMPIONSHIPS[franchise]}` : ''}
                    </text>

                    <line x1={LABEL_W} x2={svgW - 10} y1={y + ROW_H / 2}
                      y2={y + ROW_H / 2} stroke="#ececec" strokeWidth={1} />

                    {teamBlocks.map((block, bi) => {
                      const x1 = Math.max(xScale(block.start), xScale(viewStart));
                      const x2 = Math.min(xScale(block.end),   xScale(viewEnd));
                      const w  = x2 - x1;
                      if (w <= 0) return null;
                      const total  = block.wins + block.losses;
                      const winPct = total > 0 ? block.wins / total : 0;
                      const blockH = 18;
                      const by     = y + (ROW_H - blockH) / 2;
                      const alpha  = isHighlighted ? 1 : 0.2;

                      return (
                        <g key={bi}
                          onMouseEnter={(e) => setTooltip({ block, x: e.clientX, y: e.clientY })}
                          onMouseLeave={() => setTooltip(null)}
                          onMouseMove={(e) => setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}>
                          <rect className="block-rect" x={x1} y={by} width={w} height={blockH} rx={2}
                            fill={color} opacity={alpha} />
                          <rect x={x1} y={by} width={w * winPct} height={blockH} rx={2}
                            fill={accent} opacity={alpha * 0.25} style={{ pointerEvents: 'none' }} />
                          <rect x={x1} y={by} width={w} height={2} rx={0}
                            fill={accent} opacity={alpha * 0.7} style={{ pointerEvents: 'none' }} />
                          {w > 30 && (
                            <text x={x1 + w / 2} y={by + blockH / 2 + 4}
                              textAnchor="middle"
                              fontSize={Math.min(10, w / block.coach.length * 1.6)}
                              fontFamily="'Barlow Condensed', sans-serif" fontWeight={600}
                              fill="#fff" opacity={alpha * 0.9} style={{ pointerEvents: 'none' }}>
                              {w > 60 ? block.coach : (block.coach.split(' ')[1] || block.coach)}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              <line x1={LABEL_W} x2={svgW - 10} y1={svgH - PAD_BOT + 4} y2={svgH - PAD_BOT + 4}
                stroke="#ddd" strokeWidth={1} />
            </svg>
          </div>

          {/* Legend */}
          <div style={{
            padding: '12px 32px', borderTop: '1px solid #efefef', background: '#fafafa',
            display: 'flex', gap: 20, alignItems: 'center', color: '#aaa', fontSize: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 24, height: 10, background: '#1D428A', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '70%', height: '100%', background: 'rgba(255,199,44,0.25)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: 'rgba(255,199,44,0.7)' }} />
              </div>
              Block color = team primary · Fill = Coach Win %
            </div>
            <div>· Hover any block for coach stats</div>
            <div>· Click team name to highlight</div>
          </div>

          {/* Franchise tooltip */}
          {franchiseTip && (() => {
            const fs    = FRANCHISE_STATS[franchiseTip.franchise] || {};
            const color = TEAM_COLORS[franchiseTip.franchise] || '#333';
            return (
              <div style={{
                position: 'fixed', left: franchiseTip.x + 14, top: franchiseTip.y - 10,
                background: '#fff', border: `2px solid ${color}`,
                borderRadius: 10, padding: '12px 16px',
                pointerEvents: 'none', zIndex: 9999, minWidth: 230,
                boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
                fontFamily: "'Barlow Condensed', Arial Narrow, sans-serif",
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 2 }}>{franchiseTip.franchise}</div>
                <div style={{ width: '100%', height: 3, background: color, borderRadius: 2, marginBottom: 10, opacity: 0.7 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px', fontSize: 13 }}>
                  <div style={{ color: '#888', fontWeight: 600 }}>COACHES (ALL-TIME)</div>
                  <div style={{ color: '#111', fontWeight: 700 }}>{franchiseTip.numCoaches}</div>
                  <div style={{ color: '#888', fontWeight: 600 }}>REG. SEASON WIN %</div>
                  <div style={{ color: '#111', fontWeight: 700 }}>{fs.winPct ?? '—'}</div>
                  <div style={{ color: '#888', fontWeight: 600 }}>PLAYOFF APPEARANCES</div>
                  <div style={{ color: '#111', fontWeight: 700 }}>{fs.playoffs ?? '—'}</div>
                  <div style={{ color: '#888', fontWeight: 600 }}>CONF. FINALS</div>
                  <div style={{ color: '#111', fontWeight: 700 }}>{fs.confFinals ?? '—'}</div>
                  <div style={{ color: '#888', fontWeight: 600 }}>FINALS APPEARANCES</div>
                  <div style={{ color: '#111', fontWeight: 700 }}>{fs.finals ?? '—'}</div>
                  <div style={{ color: '#888', fontWeight: 600 }}>CHAMPIONSHIPS</div>
                  <div style={{ fontWeight: 800, color: fs.champs > 0 ? '#b8860b' : '#bbb', fontSize: 14 }}>
                    {fs.champs > 0 ? '🏆'.repeat(Math.min(fs.champs, 10)) + (fs.champs > 10 ? ` ×${fs.champs}` : '') : '—'}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Coach tooltip */}
          {tooltip && (
            <div style={{
              position: 'fixed', left: tooltip.x + 14, top: tooltip.y - 10,
              background: '#ffffff', border: `1.5px solid ${TEAM_COLORS[tooltip.block.franchise] || '#ccc'}`,
              borderRadius: 8, padding: '10px 14px',
              pointerEvents: 'none', zIndex: 9999, minWidth: 190,
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 2 }}>{tooltip.block.coach}</div>
              <div style={{ fontSize: 12, color: TEAM_COLORS[tooltip.block.franchise] || '#888', marginBottom: 6, fontWeight: 700 }}>
                {tooltip.block.franchise}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                <span style={{ color: '#444' }}>{tooltip.block.start}–{tooltip.block.end}</span>
                &nbsp;·&nbsp;{tooltip.block.end - tooltip.block.start} {tooltip.block.end - tooltip.block.start === 1 ? 'season' : 'seasons'}
              </div>
              <div style={{ fontSize: 13, color: '#333', marginTop: 4 }}>
                <span style={{ color: '#2e7d32', fontWeight: 700 }}>{tooltip.block.wins}W</span>
                <span style={{ color: '#ccc' }}> – </span>
                <span style={{ color: '#c62828', fontWeight: 700 }}>{tooltip.block.losses}L</span>
                <span style={{ color: '#888', fontSize: 11 }}>&nbsp;
                  ({((tooltip.block.wins / (tooltip.block.wins + tooltip.block.losses)) * 100).toFixed(1)}% win)
                </span>
              </div>
              {(() => {
                const rings = coachChamps(tooltip.block.coach, tooltip.block.franchise, tooltip.block.start, tooltip.block.end);
                return rings > 0 ? (
                  <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: '#b8860b' }}>
                    {'🏆'.repeat(rings)}{rings > 1 ? ` ${rings} championships` : ' 1 championship'}
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </>
      )}

      {/* ══ Coach Stats tab ════════════════════════════════════════════════════ */}
      {activeTab === 'coaches' && <CoachesTab coachData={coachData} />}

      {/* ══ Compare tab ════════════════════════════════════════════════════════ */}
      {activeTab === 'compare' && <CompareTab coachData={coachData} />}

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
