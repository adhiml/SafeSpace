import { AFFIRMATIONS, STRESS_RELIEF_ACTIVITIES } from './constants';

export interface RecommendationCard {
  id: string;
  title: string;
  description: string;
  type: 'activity' | 'affirmation' | 'stress-tip';
}

export const getRecommendations = (stressLevel: number): RecommendationCard[] => {
  const activities = STRESS_RELIEF_ACTIVITIES.slice(0, 2).map((a, i) => ({
    id: `activity-${i}`,
    title: a.title,
    description: a.description,
    type: 'activity' as const,
  }));

  const affirmations = AFFIRMATIONS.slice(0, 2).map((text, i) => ({
    id: `affirmation-${i}`,
    title: 'Daily Affirmation',
    description: text,
    type: 'affirmation' as const,
  }));

  const stressTips: RecommendationCard[] = [];
  if (stressLevel >= 4) {
    stressTips.push({
      id: 'stress-high',
      title: 'High stress detected',
      description: 'Consider booking a counselling session or talking to a peer in the support feed.',
      type: 'stress-tip',
    });
  } else if (stressLevel >= 3) {
    stressTips.push({
      id: 'stress-mid',
      title: 'Moderate stress',
      description: 'Try a short break and log your journal to track patterns over time.',
      type: 'stress-tip',
    });
  } else {
    stressTips.push({
      id: 'stress-low',
      title: 'You are managing well',
      description: 'Keep up healthy habits — consistency helps maintain balance.',
      type: 'stress-tip',
    });
  }

  return [...activities, ...affirmations, ...stressTips];
};
