/*
Structure
moodAnalyticsService.js
 ├── buildDailyStats
 ├── buildWeeklyStats
 ├── buildMonthlyStats
 ├── percentChange
 ├── generateWeeklyInsights
 ├── generateMonthlyInsights (later maybe)
 └── exports
*/

///////////////////////////////////// Daily Stats////////////////////////////////
const buildDailyStats = (entries) => {
  const map = {};

  entries.forEach((e) => {
    const date = new Date(e.created_at);
    
    // Extracts the local calendar YYYY-MM-DD regardless of server timezone shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;

    if (!map[key]) {
      map[key] = {
        date: key,
        moodSum: 0,
        stressSum: 0,
        count: 0,
        causes: {},
      };
    }

    map[key].moodSum += e.mood_level;
    map[key].stressSum += e.stress_level;
    map[key].count += 1;

    (e.stress_causes || []).forEach((c) => {
      map[key].causes[c] = (map[key].causes[c] || 0) + 1;
    });
  });

  return Object.values(map)
    .map((d) => ({
      date: d.date,
      mood: d.moodSum / d.count,
      stress: d.stressSum / d.count,
      causes: d.causes,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

/////////////////////////////////// Weekly Stats////////////////////////////////
const getWeekKey = (dateStr) => {
  const date = new Date(dateStr);
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay()); // Sunday-based week start

  return start.toISOString().split('T')[0];
};

const buildWeeklyStats = (dailyStats) => {
  const map = {};

  dailyStats.forEach((d) => {
    const weekKey = getWeekKey(d.date);

    if (!map[weekKey]) {
      map[weekKey] = {
        weekStart: weekKey,
        moodSum: 0,
        stressSum: 0,
        days: 0,
        causes: {},
      };
    }

    map[weekKey].moodSum += d.mood;
    map[weekKey].stressSum += d.stress;
    map[weekKey].days += 1;

    Object.entries(d.causes).forEach(([c, count]) => {
      map[weekKey].causes[c] = (map[weekKey].causes[c] || 0) + count;
    });
  });

  return Object.values(map).map((w) => ({
    weekStart: w.weekStart,
    avgMood: w.moodSum / w.days,
    avgStress: w.stressSum / w.days,
    causes: w.causes,
  }));
};

/////////////////////////////////// Monthly Stats////////////////////////////////

const getMonthKey = (dateStr) => dateStr.slice(0, 7); // YYYY-MM

const buildMonthlyStats = (dailyStats) => {
  const map = {};

  dailyStats.forEach((d) => {
    const monthKey = getMonthKey(d.date);

    if (!map[monthKey]) {
      map[monthKey] = {
        month: monthKey,
        moodSum: 0,
        stressSum: 0,
        days: 0,
        causes: {},
      };
    }

    map[monthKey].moodSum += d.mood;
    map[monthKey].stressSum += d.stress;
    map[monthKey].days += 1;

    Object.entries(d.causes).forEach(([c, count]) => {
      map[monthKey].causes[c] = (map[monthKey].causes[c] || 0) + count;
    });
  });

  return Object.values(map).map((m) => ({
    month: m.month,
    avgMood: m.moodSum / m.days,
    avgStress: m.stressSum / m.days,
    causes: m.causes,
  }));
};

////////////////////////////////// Insights ////////////////////////////////////////////

const percentChange = (current, previous) => {
  if (!previous) return 0;

  return ((current - previous) / previous) * 100;
};

// const generateWeeklyInsights = (weeklyStats) => {
//   if (weeklyStats.length < 2) return null;

//   const current = weeklyStats.at(-1);
//   const previous = weeklyStats.at(-2);

//   const moodChange = percentChange(current.avgMood, previous.avgMood);
//   const stressChange = percentChange(current.avgStress, previous.avgStress);

//   return {
//     happiestWeek:
//       weeklyStats.reduce((max, w) =>
//         w.avgMood > max.avgMood ? w : max
//       ),

//     moodChange,
//     stressChange: -stressChange, // inverse interpretation
//   };
// };

// const generateMonthlyInsights = (monthlyStats) => {
//   if (monthlyStats.length < 2) return null;

//   const current = monthlyStats.at(-1);
//   const previous = monthlyStats.at(-2);

//   return {
//     moodChange: percentChange(current.avgMood, previous.avgMood),
//     stressChange: percentChange(current.avgStress, previous.avgStress),
//   };
// };

module.exports = {
  buildDailyStats,
  buildWeeklyStats,
  buildMonthlyStats,
  // generateWeeklyInsights,
  percentChange,
  // generateMonthlyInsights,
};