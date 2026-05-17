import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { MoodEntry } from '../types';
import * as moodService from '../services/moodService';

interface MoodContextValue {
  latestMood: MoodEntry | null;
  setLatestMood: (entry: MoodEntry | null) => void;
  refreshMoods: () => Promise<void>;
  needsCheckIn: boolean;
  setNeedsCheckIn: (value: boolean) => void;
}

const MoodContext = createContext<MoodContextValue | undefined>(undefined);

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [latestMood, setLatestMood] = useState<MoodEntry | null>(null);
  const [needsCheckIn, setNeedsCheckIn] = useState(true);

  const refreshMoods = useCallback(async () => {
    try {
      const moods = await moodService.getMoods();
      if (moods.length > 0) {
        setLatestMood(moods[0]);
        const today = new Date().toDateString();
        const loggedToday = new Date(moods[0].created_at).toDateString() === today;
        setNeedsCheckIn(!loggedToday);
      } else {
        setNeedsCheckIn(true);
      }
    } catch {
      setNeedsCheckIn(true);
    }
  }, []);

  const value = useMemo(
    () => ({
      latestMood,
      setLatestMood,
      refreshMoods,
      needsCheckIn,
      setNeedsCheckIn,
    }),
    [latestMood, refreshMoods, needsCheckIn]
  );

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
};

export const useMood = () => {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error('useMood must be used within MoodProvider');
  return ctx;
};
