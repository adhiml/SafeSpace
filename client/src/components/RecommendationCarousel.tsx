import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { RecommendationCard } from '../utils/recommendations';
import { colors, radius, spacing } from '../utils/theme';

interface RecommendationCarouselProps {
  items: RecommendationCard[];
}

const typeColors = {
  activity: colors.secondaryLight,
  affirmation: colors.primaryLight,
  'stress-tip': '#FFF8E6',
};

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({ items }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
    {items.map((item) => (
      <View key={item.id} style={[styles.card, { backgroundColor: typeColors[item.type] }]}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </View>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  row: { paddingVertical: spacing.sm, gap: spacing.md },
  card: {
    width: 260,
    borderRadius: radius.md,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  cardDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
});
