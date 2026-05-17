import api from '../api/client';
import { MoodAnalytics, MoodEntry } from '../types';

export const createMood = async (payload: {
  mood_level: number;
  stress_level: number;
  stress_causes?: string[];
}) => {
  const { data } = await api.post<MoodEntry>('/moods', payload);
  return data;
};

export const getMoods = async () => {
  const { data } = await api.get<MoodEntry[]>('/moods');
  return data;
};

export const getMoodAnalytics = async () => {
  const { data } = await api.get<MoodAnalytics>('/moods/analytics');
  return data;
};
