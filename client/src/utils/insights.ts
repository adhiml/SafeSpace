import { MoodAnalytics } from '../types';
import { colors, palette } from './theme';

export type ViewMode = 'weekly' | 'monthly';
export type Unit = 'week' | 'month';
export type UnitShort = 'wk' | 'mo';
export type Audience = 'student' | 'counsellor';

export const MODES: { key: ViewMode; label: string; unit: Unit; unitShort: UnitShort }[] = [
  { key: 'weekly', label: 'Weekly', unit: 'week', unitShort: 'wk' },
  { key: 'monthly', label: 'Monthly', unit: 'month', unitShort: 'mo' },
];

/** Changes smaller than this read as "steady". */
export const STEADY_THRESHOLD = 0.1;

/**
 * The shape both the student (`MoodAnalytics`) and counsellor (`CounsellorAnalytics`, with
 * `daily` passed as `trend`) endpoints can be reduced to.
 */
export interface AnalyticsSource {
  trend: MoodAnalytics['trend'];
  weekly: MoodAnalytics['weekly'];
  monthly: MoodAnalytics['monthly'];
}

export interface Period {
  id: string; // weekStart ("YYYY-MM-DD") or month ("YYYY-MM")
  label: string; // "Nov 10 – 16" / "November 2026"
  start: string; // inclusive, YYYY-MM-DD
  end: string; // inclusive, YYYY-MM-DD
  avgMood: number;
  avgStress: number;
  causes: Record<string, number>;
  daysLogged: number;
}

export interface RhythmPoint {
  label: string;
  mood: number | null;
  stress: number | null;
}

export interface Badge {
  text: string;
  bg: string;
  color: string;
}

export interface Takeaway {
  key: string;
  arrow: '↑' | '↓' | '→';
  lead: string;
  rest: string;
  bg: string;
  color: string;
}

type TrendPoint = AnalyticsSource['trend'][number];

// ==========================================
// COPY — wording that differs between a student's own view and the counsellor's population view
// ==========================================
export const COPY = {
  student: {
    mood: 'Mood',
    stress: 'Stress',
    maxTriggers: 3,
    countNoun: { one: 'time', many: 'times' },
    daysMeta: (n: number) => `${n} ${n === 1 ? 'day' : 'days'} logged`,
    checkIns: 'your check-ins',
  },
  counsellor: {
    mood: 'Student mood',
    stress: 'Student stress',
    maxTriggers: 5,
    countNoun: { one: 'report', many: 'reports' },
    daysMeta: (n: number) => `${n} ${n === 1 ? 'day' : 'days'} with check-ins`,
    checkIns: 'all students’ check-ins',
  },
} as const;

export const rhythmInfo = (audience: Audience, mode: ViewMode) => {
  const who = COPY[audience].checkIns;
  return mode === 'weekly'
    ? `One pair of bars per day, Sunday to Saturday, averaging ${who} for that day. Days without a check-in are left blank.`
    : `One pair of bars per 7-day block of the month, averaging ${who} in that block. Blocks without a check-in are left blank.`;
};

// ==========================================
// DATE HELPERS
// Backend keys are plain strings (weekStart = "YYYY-MM-DD" on a Sunday, month = "YYYY-MM"),
// so they are parsed manually to keep the device timezone from shifting the day.
// ==========================================
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (n: number) => String(n).padStart(2, '0');
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (key: string, n: number) => {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
};
const shortMonth = (index: number) => MONTH_NAMES[index].slice(0, 3);

const formatRange = (startKey: string, endKey: string) => {
  const start = parseKey(startKey);
  const end = parseKey(endKey);
  const from = `${shortMonth(start.getMonth())} ${start.getDate()}`;
  const to =
    start.getMonth() === end.getMonth()
      ? `${end.getDate()}`
      : `${shortMonth(end.getMonth())} ${end.getDate()}`;
  return `${from} – ${to}`;
};

const countDays = (trend: TrendPoint[], start: string, end: string) =>
  trend.filter((t) => t.date >= start && t.date <= end).length;

const average = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

// ==========================================
// PERIODS
// ==========================================
export const toPeriods = (source: AnalyticsSource, mode: ViewMode): Period[] => {
  if (mode === 'weekly') {
    return source.weekly.map((w) => {
      const start = w.weekStart;
      const end = addDays(start, 6);
      return {
        id: start,
        label: formatRange(start, end),
        start,
        end,
        avgMood: w.avgMood,
        avgStress: w.avgStress,
        causes: w.causes,
        daysLogged: countDays(source.trend, start, end),
      };
    });
  }

  return source.monthly.map((m) => {
    const [year, month] = m.month.split('-').map(Number);
    const start = `${m.month}-01`;
    const end = `${m.month}-${pad(new Date(year, month, 0).getDate())}`;
    return {
      id: m.month,
      label: `${MONTH_NAMES[month - 1]} ${year}`,
      start,
      end,
      avgMood: m.avgMood,
      avgStress: m.avgStress,
      causes: m.causes,
      daysLogged: countDays(source.trend, start, end),
    };
  });
};

// ==========================================
// RHYTHM CHART DATA
// Weekly view → one point per day (Sun–Sat). Monthly view → one point per 7-day block.
// ==========================================
export const buildRhythm = (
  period: Period,
  mode: ViewMode,
  trend: TrendPoint[]
): RhythmPoint[] => {
  if (mode === 'weekly') {
    const byDate = new Map(trend.map((t) => [t.date, t]));
    return DAY_LABELS.map((label, i) => {
      const day = byDate.get(addDays(period.start, i));
      return { label, mood: day?.mood ?? null, stress: day?.stress ?? null };
    });
  }

  const inMonth = trend.filter((t) => t.date >= period.start && t.date <= period.end);
  const daysInMonth = Number(period.end.slice(8));
  const blocks = Math.ceil(daysInMonth / 7);

  return Array.from({ length: blocks }, (_, w) => {
    const from = w * 7 + 1;
    const to = Math.min(from + 6, daysInMonth);
    const days = inMonth.filter((t) => {
      const dayOfMonth = Number(t.date.slice(8));
      return dayOfMonth >= from && dayOfMonth <= to;
    });
    return {
      label: `Wk ${w + 1}`,
      mood: average(days.map((d) => d.mood)),
      stress: average(days.map((d) => d.stress)),
    };
  });
};

// ==========================================
// DELTAS
// ==========================================
const toneFor = (delta: number, upIsGood: boolean) => {
  if (Math.abs(delta) < STEADY_THRESHOLD) {
    return { bg: palette.pastBg, color: palette.textSoft, steady: true as const };
  }
  const good = delta > 0 === upIsGood;
  return {
    bg: good ? palette.okBg : colors.stressed,
    color: good ? palette.okText : palette.cancelledText,
    steady: false as const,
  };
};

export const deltaBadge = (
  delta: number | null,
  upIsGood: boolean,
  unit: Unit,
  unitShort: UnitShort
): Badge => {
  if (delta === null) {
    return { text: `First ${unit} logged`, bg: palette.pastBg, color: palette.textSoft };
  }
  const tone = toneFor(delta, upIsGood);
  if (tone.steady) {
    return { text: `→ Steady vs prev ${unitShort}`, bg: tone.bg, color: tone.color };
  }
  const arrow = delta > 0 ? '↑' : '↓';
  return {
    text: `${arrow} ${Math.abs(delta).toFixed(1)} vs prev ${unitShort}`,
    bg: tone.bg,
    color: tone.color,
  };
};

export const buildTakeaways = (
  current: Period,
  previous: Period | undefined,
  unit: Unit,
  audience: Audience
): Takeaway[] => {
  if (!previous) return [];

  const make = (key: string, label: string, delta: number, upIsGood: boolean): Takeaway => {
    const tone = toneFor(delta, upIsGood);
    const rest = `compared to the previous logged ${unit}.`;
    if (tone.steady) {
      return { key, arrow: '→', lead: `${label} is steady`, rest, bg: tone.bg, color: tone.color };
    }
    const up = delta > 0;
    return {
      key,
      arrow: up ? '↑' : '↓',
      lead: `${label} is ${up ? 'up' : 'down'} ${Math.abs(delta).toFixed(1)}`,
      rest,
      bg: tone.bg,
      color: tone.color,
    };
  };

  const copy = COPY[audience];
  return [
    make('mood', copy.mood, current.avgMood - previous.avgMood, true),
    make('stress', copy.stress, current.avgStress - previous.avgStress, false),
  ];
};
