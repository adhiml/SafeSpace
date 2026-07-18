import { MoodLabel } from '../types';

export const MOOD_LABELS: Record<number, MoodLabel> = {
  1: 'Stressed',
  2: 'Anxious',
  3: 'Neutral',
  4: 'Calm',
  5: 'Happy',
};

export const MOOD_COLORS: Record<number, string> = {
  1: '#fedde0', // stressed
  2: '#f8fad4', // anxious
  3: '#e5fbfc', // neutral
  4: '#edfdec', // calm
  5: '#f1eefd', // happy
};

export const MOOD_GIFS: Record<number, any> = {
  1: require('../../src/assets/gif/stressed.gif'),
  2: require('../../src/assets//gif/anxious.gif'),
  3: require('../../src/assets//gif/neutral.gif'),
  4: require('../../src/assets//gif/calm.gif'),
  5: require('../../src/assets//gif/happy.gif'),
};

export const MOOD_IMAGES: Record<number, any> = {
  1: require('../../src/assets/images/stressed.png'),
  2: require('../../src/assets/images/anxious.png'),
  3: require('../../src/assets/images/neutral.png'),
  4: require('../../src/assets/images/calm.png'),
  5: require('../../src/assets/images/happy.png'),
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

export const tags = [
  'Academic',
  'Financial',
  'Social',
  'Family',
  'Health',
  'Relationship',
  'Future',
  'Rant',
  'Gratitude',
  'stress',
  'support'
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
