// Shared static data — imported by App.jsx, CoachesTab.jsx, CompareTab.jsx

export const MIN_YEAR = 1946;
export const MAX_YEAR = 2026;

export const TEAM_COLORS = {
  'Atlanta Hawks': '#E03A3E', 'Boston Celtics': '#007A33', 'Brooklyn Nets': '#444444',
  'Charlotte Hornets': '#1D1160', 'Chicago Bulls': '#CE1141', 'Cleveland Cavaliers': '#860038',
  'Dallas Mavericks': '#00538C', 'Denver Nuggets': '#0E2240', 'Detroit Pistons': '#C8102E',
  'Golden State Warriors': '#1D428A', 'Houston Rockets': '#CE1141', 'Indiana Pacers': '#002D62',
  'Los Angeles Clippers': '#C8102E', 'Los Angeles Lakers': '#552583', 'Memphis Grizzlies': '#5D76A9',
  'Miami Heat': '#98002E', 'Milwaukee Bucks': '#00471B', 'Minnesota Timberwolves': '#0C2340',
  'New Orleans Pelicans': '#0C2340', 'New York Knicks': '#006BB6', 'Oklahoma City Thunder': '#007AC1',
  'Orlando Magic': '#0077C0', 'Philadelphia 76ers': '#006BB6', 'Phoenix Suns': '#1D1160',
  'Portland Trail Blazers': '#E03A3E', 'Sacramento Kings': '#5A2D81', 'San Antonio Spurs': '#333333',
  'Toronto Raptors': '#CE1141', 'Utah Jazz': '#002B5C', 'Washington Wizards': '#002B5C',
};

export const TEAM_ACCENT = {
  'Atlanta Hawks': '#C1D32F', 'Boston Celtics': '#BA9653', 'Brooklyn Nets': '#FFFFFF',
  'Charlotte Hornets': '#00788C', 'Chicago Bulls': '#FFFFFF', 'Cleveland Cavaliers': '#FDBB30',
  'Dallas Mavericks': '#B8C4CA', 'Denver Nuggets': '#FEC524', 'Detroit Pistons': '#1D428A',
  'Golden State Warriors': '#FFC72C', 'Houston Rockets': '#C4CED4', 'Indiana Pacers': '#FDBB30',
  'Los Angeles Clippers': '#1D428A', 'Los Angeles Lakers': '#FDB927', 'Memphis Grizzlies': '#12173F',
  'Miami Heat': '#F9A01B', 'Milwaukee Bucks': '#EEE1C6', 'Minnesota Timberwolves': '#236192',
  'New Orleans Pelicans': '#C8102E', 'New York Knicks': '#F58426', 'Oklahoma City Thunder': '#EF3B24',
  'Orlando Magic': '#C4CED4', 'Philadelphia 76ers': '#ED174C', 'Phoenix Suns': '#E56020',
  'Portland Trail Blazers': '#FFFFFF', 'Sacramento Kings': '#63727A', 'San Antonio Spurs': '#C4CED4',
  'Toronto Raptors': '#000000', 'Utah Jazz': '#F9A01B', 'Washington Wizards': '#E31837',
};

export const CHAMPIONSHIPS = {
  'Boston Celtics': 18, 'Los Angeles Lakers': 17, 'Golden State Warriors': 7,
  'Chicago Bulls': 6, 'San Antonio Spurs': 5, 'Miami Heat': 3, 'Detroit Pistons': 3,
  'Philadelphia 76ers': 3, 'Milwaukee Bucks': 2, 'New York Knicks': 2,
  'Houston Rockets': 2, 'Cleveland Cavaliers': 1, 'Dallas Mavericks': 1,
  'Washington Wizards': 1, 'Atlanta Hawks': 1, 'Sacramento Kings': 1,
  'Portland Trail Blazers': 1, 'Toronto Raptors': 1, 'Denver Nuggets': 1,
  'Oklahoma City Thunder': 0, 'Indiana Pacers': 0, 'Phoenix Suns': 0,
  'Utah Jazz': 0, 'Brooklyn Nets': 0, 'Los Angeles Clippers': 0,
  'Minnesota Timberwolves': 0, 'New Orleans Pelicans': 0, 'Memphis Grizzlies': 0,
  'Orlando Magic': 0, 'Charlotte Hornets': 0,
};

export const COACH_CHAMPS = {
  'R. Auerbach':    9,
  'B. Russell':     2,
  'T. Heinsohn':    2,
  'B. Fitch':       1,
  'K. Jones':       2,
  'P. Riley':       5,
  'P. Jackson':     11,
  'C. Daly':        2,
  'L. Costello':    1,
  'D. Nelson':      0,
  'A. Hannum':      2,
  'B. Sharman':     1,
  'J. Kundla':      5,
  'R. Tomjanovich': 2,
  'G. Popovich':    5,
  'L. Brown':       1,
  'E. Spoelstra':   3,
  'S. Kerr':        4,
  'T. Lue':         1,
  'B. Hill':        0,
  'S. Van Gundy':   1,
  'F. Vogel':       1,
  'N. Nurse':       1,
  'R. Carlisle':    1,
  'J. Mazzulla':    1,
  'I. Udoka':       0,
  'D. Casey':       0,
  'B. Stevens':     0,
  'D. Rivers':      0,
  'M. Budenholzer': 1,
  'M. Malone':      1,
  'B. Cunningham':  1,
  'A. Attles':      1,
  'J. Ramsay':      1,
  'L. Harrison':    1,
  'E. Gottlieb':    1,
  'D. Moe':         0,
  'K. Loughery':    0,
};

/** Championships a coach won during a specific stint (franchise + years). */
export function coachChamps(coach, franchise, start, end) {
  if (coach === 'P. Riley') {
    const lakersRings = franchise === 'Los Angeles Lakers' ? 4 : 0;
    const miamiRings  = (franchise === 'Miami Heat' && start <= 2006 && end >= 2006) ? 1 : 0;
    return lakersRings + miamiRings;
  }
  if (coach === 'P. Jackson') {
    const bullsRings  = franchise === 'Chicago Bulls' ? 6 : 0;
    const lakersRings = franchise === 'Los Angeles Lakers' ? 5 : 0;
    return bullsRings + lakersRings;
  }
  if (coach === 'A. Hannum') {
    if (franchise === 'Atlanta Hawks') return 1;
    if (franchise === 'Philadelphia 76ers') return 1;
    return 0;
  }
  if (coach === 'L. Brown') {
    return franchise === 'Detroit Pistons' ? 1 : 0;
  }
  if (coach === 'S. Van Gundy') {
    return (franchise === 'Miami Heat' && start <= 2006 && end >= 2006) ? 1 : 0;
  }
  return COACH_CHAMPS[coach] ?? 0;
}

/**
 * Historical team names sourced from NBA.com/stats/history.
 * Each entry: { from: season_year, to: season_year_inclusive, name: string }
 * season_year = first calendar year of the season (e.g. 2007 = 2007-08).
 * Only franchises that changed names are listed; others use their current name.
 */
export const FRANCHISE_NAME_HISTORY = {
  'Atlanta Hawks': [
    { from: 1949, to: 1950, name: 'Tri-Cities Blackhawks' },
    { from: 1951, to: 1954, name: 'Milwaukee Hawks' },
    { from: 1955, to: 1967, name: 'St. Louis Hawks' },
    { from: 1968,           name: 'Atlanta Hawks' },
  ],
  'Brooklyn Nets': [
    { from: 1976, to: 1976, name: 'New York Nets' },
    { from: 1977, to: 2011, name: 'New Jersey Nets' },
    { from: 2012,           name: 'Brooklyn Nets' },
  ],
  'Charlotte Hornets': [
    // Bobcats expansion franchise (our DB uses CHA/CHO)
    { from: 2004, to: 2013, name: 'Charlotte Bobcats' },
    { from: 2014,           name: 'Charlotte Hornets' },
  ],
  'Detroit Pistons': [
    { from: 1948, to: 1956, name: 'Fort Wayne Pistons' },
    { from: 1957,           name: 'Detroit Pistons' },
  ],
  'Golden State Warriors': [
    { from: 1946, to: 1961, name: 'Philadelphia Warriors' },
    { from: 1962, to: 1970, name: 'San Francisco Warriors' },
    { from: 1971,           name: 'Golden State Warriors' },
  ],
  'Houston Rockets': [
    { from: 1967, to: 1970, name: 'San Diego Rockets' },
    { from: 1971,           name: 'Houston Rockets' },
  ],
  'Los Angeles Clippers': [
    { from: 1970, to: 1977, name: 'Buffalo Braves' },
    { from: 1978, to: 1983, name: 'San Diego Clippers' },
    { from: 1984,           name: 'Los Angeles Clippers' },
  ],
  'Los Angeles Lakers': [
    { from: 1948, to: 1959, name: 'Minneapolis Lakers' },
    { from: 1960,           name: 'Los Angeles Lakers' },
  ],
  'Memphis Grizzlies': [
    { from: 1995, to: 2000, name: 'Vancouver Grizzlies' },
    { from: 2001,           name: 'Memphis Grizzlies' },
  ],
  'New Orleans Pelicans': [
    // Original Charlotte Hornets franchise that relocated
    { from: 1988, to: 2001, name: 'Charlotte Hornets' },
    { from: 2002, to: 2004, name: 'New Orleans Hornets' },
    { from: 2005, to: 2006, name: 'New Orleans/Oklahoma City Hornets' },
    { from: 2007, to: 2012, name: 'New Orleans Hornets' },
    { from: 2013,           name: 'New Orleans Pelicans' },
  ],
  'Oklahoma City Thunder': [
    { from: 1967, to: 2007, name: 'Seattle SuperSonics' },
    { from: 2008,           name: 'Oklahoma City Thunder' },
  ],
  'Philadelphia 76ers': [
    { from: 1949, to: 1962, name: 'Syracuse Nationals' },
    { from: 1963,           name: 'Philadelphia 76ers' },
  ],
  'Sacramento Kings': [
    { from: 1948, to: 1956, name: 'Rochester Royals' },
    { from: 1957, to: 1971, name: 'Cincinnati Royals' },
    { from: 1972, to: 1974, name: 'Kansas City-Omaha Kings' },
    { from: 1975, to: 1984, name: 'Kansas City Kings' },
    { from: 1985,           name: 'Sacramento Kings' },
  ],
  'Utah Jazz': [
    { from: 1974, to: 1978, name: 'New Orleans Jazz' },
    { from: 1979,           name: 'Utah Jazz' },
  ],
  'Washington Wizards': [
    { from: 1961, to: 1961, name: 'Chicago Packers' },
    { from: 1962, to: 1962, name: 'Chicago Zephyrs' },
    { from: 1963, to: 1972, name: 'Baltimore Bullets' },
    { from: 1973, to: 1973, name: 'Capital Bullets' },
    { from: 1974, to: 1996, name: 'Washington Bullets' },
    { from: 1997,           name: 'Washington Wizards' },
  ],
};

/**
 * Returns the correct historical team name for a franchise in a given season.
 * e.g. getHistoricalName('Oklahoma City Thunder', 2005) → 'Seattle SuperSonics'
 */
export function getHistoricalName(franchise, seasonYear) {
  const history = FRANCHISE_NAME_HISTORY[franchise];
  if (!history) return franchise;
  for (const entry of history) {
    if (seasonYear >= entry.from && (entry.to == null || seasonYear <= entry.to)) {
      return entry.name;
    }
  }
  return franchise;
}

export const FRANCHISE_STATS = {
  'Atlanta Hawks':           { winPct: '.493', playoffs: 49, confFinals: 14, finals: 4,  champs: 1  },
  'Boston Celtics':          { winPct: '.597', playoffs: 62, confFinals: 39, finals: 23, champs: 18 },
  'Brooklyn Nets':           { winPct: '.423', playoffs: 24, confFinals: 2,  finals: 2,  champs: 0  },
  'Charlotte Hornets':       { winPct: '.428', playoffs: 10, confFinals: 0,  finals: 0,  champs: 0  },
  'Chicago Bulls':           { winPct: '.507', playoffs: 36, confFinals: 11, finals: 6,  champs: 6  },
  'Cleveland Cavaliers':     { winPct: '.475', playoffs: 25, confFinals: 8,  finals: 5,  champs: 1  },
  'Dallas Mavericks':        { winPct: '.504', playoffs: 25, confFinals: 6,  finals: 3,  champs: 1  },
  'Denver Nuggets':          { winPct: '.509', playoffs: 31, confFinals: 5,  finals: 1,  champs: 1  },
  'Detroit Pistons':         { winPct: '.475', playoffs: 43, confFinals: 17, finals: 7,  champs: 3  },
  'Golden State Warriors':   { winPct: '.488', playoffs: 38, confFinals: 18, finals: 12, champs: 7  },
  'Houston Rockets':         { winPct: '.518', playoffs: 35, confFinals: 8,  finals: 4,  champs: 2  },
  'Indiana Pacers':          { winPct: '.499', playoffs: 29, confFinals: 10, finals: 2,  champs: 0  },
  'Los Angeles Clippers':    { winPct: '.427', playoffs: 19, confFinals: 1,  finals: 0,  champs: 0  },
  'Los Angeles Lakers':      { winPct: '.592', playoffs: 65, confFinals: 43, finals: 32, champs: 17 },
  'Memphis Grizzlies':       { winPct: '.436', playoffs: 14, confFinals: 1,  finals: 0,  champs: 0  },
  'Miami Heat':              { winPct: '.525', playoffs: 26, confFinals: 10, finals: 7,  champs: 3  },
  'Milwaukee Bucks':         { winPct: '.528', playoffs: 37, confFinals: 10, finals: 3,  champs: 2  },
  'Minnesota Timberwolves':  { winPct: '.420', playoffs: 13, confFinals: 3,  finals: 0,  champs: 0  },
  'New Orleans Pelicans':    { winPct: '.455', playoffs: 9,  confFinals: 0,  finals: 0,  champs: 0  },
  'New York Knicks':         { winPct: '.490', playoffs: 46, confFinals: 17, finals: 8,  champs: 2  },
  'Oklahoma City Thunder':   { winPct: '.544', playoffs: 34, confFinals: 11, finals: 5,  champs: 2  },
  'Orlando Magic':           { winPct: '.471', playoffs: 18, confFinals: 4,  finals: 2,  champs: 0  },
  'Philadelphia 76ers':      { winPct: '.519', playoffs: 54, confFinals: 21, finals: 9,  champs: 3  },
  'Phoenix Suns':            { winPct: '.535', playoffs: 33, confFinals: 10, finals: 3,  champs: 0  },
  'Portland Trail Blazers':  { winPct: '.523', playoffs: 37, confFinals: 7,  finals: 3,  champs: 1  },
  'Sacramento Kings':        { winPct: '.456', playoffs: 30, confFinals: 8,  finals: 1,  champs: 1  },
  'San Antonio Spurs':       { winPct: '.594', playoffs: 39, confFinals: 14, finals: 6,  champs: 5  },
  'Toronto Raptors':         { winPct: '.474', playoffs: 13, confFinals: 2,  finals: 1,  champs: 1  },
  'Utah Jazz':               { winPct: '.532', playoffs: 31, confFinals: 6,  finals: 2,  champs: 0  },
  'Washington Wizards':      { winPct: '.441', playoffs: 30, confFinals: 5,  finals: 4,  champs: 1  },
};
