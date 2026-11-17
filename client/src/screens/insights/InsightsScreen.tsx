import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyInsights } from '../../components/insights/EmptyInsights';
import { InsightsDashboard } from '../../components/insights/InsightsDashboard';
import { InsightsLoadState } from '../../components/insights/InsightsLoadState';
import { useInsightsData } from '../../components/insights/useInsightsData';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as moodService from '../../services/moodService';
import { StudentStackParamList } from '../../types';

export const InsightsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const { data, error, reload } = useInsightsData(moodService.getMoodAnalytics);

  return (
    <ScreenContainer title="insights.">
      {data ? (
        <InsightsDashboard
          source={data}
          audience="student"
          renderEmpty={(unit) => (
            <EmptyInsights
              title="No check-ins yet"
              body={`Log how you’re feeling for a few days and your ${unit}ly averages, triggers and patterns will appear here.`}
              actionLabel="Log today’s check-in"
              onAction={() => navigation.navigate('MoodCheckIn')}
            />
          )}
        />
      ) : (
        <InsightsLoadState error={error} onRetry={reload} />
      )}
    </ScreenContainer>
  );
};
