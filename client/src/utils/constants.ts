import { MoodLabel } from '../types';

export const MOOD_LABELS: Record<number, MoodLabel> = {
  1: 'Stressed',
  2: 'Anxious',
  3: 'Calm',
  4: 'Okay',
  5: 'Happy',
};

export const MOOD_COLORS: Record<number, string> = {
  1: '#E57373',
  2: '#FFB74D',
  3: '#81C784',
  4: '#64B5F6',
  5: '#5CB88F',
};

export const MOOD_EMOJIS: Record<number, string> = {
  1: '😣',
  2: '😰',
  3: '😌',
  4: '🙂',
  5: '😊',
};

export const STRESS_CAUSES = [
  'Academic workload',
  'Exams',
  'Deadlines',
  'Financial pressure',
  'Social isolation',
  'Family expectations',
  'Sleep issues',
  'Health concerns',
  'Relationship stress',
  'Future uncertainty',
];

export const STRESS_RELIEF_ACTIVITIES = [
  { title: '5-Minute Breathing', description: 'Box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.' },
  { title: 'Short Walk', description: 'A 10-minute walk outdoors can lower cortisol levels.' },
  { title: 'Stretch Break', description: 'Gentle neck and shoulder stretches at your desk.' },
  { title: 'Mindful Tea', description: 'Prepare a warm drink and focus on each sip slowly.' },
  { title: 'Gratitude Note', description: 'Write three small things you appreciate today.' },
];

export const AFFIRMATIONS = [
  'You are doing your best, and that is enough.',
  'One step at a time — progress matters more than perfection.',
  'It is okay to ask for help; strength includes reaching out.',
  'Your feelings are valid, and they will pass.',
  'You deserve rest as much as you deserve success.',
];

export { resolveApiBaseUrl as API_BASE_URL } from './apiConfig';
