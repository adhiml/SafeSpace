import { MoodAnalytics } from "../types";
import { TrendPoint } from "../types/chart";

export const toTrendPoints = (
  trend: MoodAnalytics["trend"]
): TrendPoint[] => {
  return trend.map((t) => ({
    date: t.date,
    mood: t.mood ?? 0,    // Fix: Use 'mood' to match backend response
    stress: t.stress ?? 0, // Fix: Use 'stress' to match backend response
  }));
};