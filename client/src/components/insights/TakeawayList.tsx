import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '../Card';
import { Takeaway, Unit } from '../../utils/insights';
import { colors, palette, spacing } from '../../utils/theme';

interface TakeawayListProps {
  items: Takeaway[];
  unit: Unit;
}

/** Mood / stress change vs the previous period, or a nudge to keep logging. */
export const TakeawayList: React.FC<TakeawayListProps> = ({ items, unit }) => {
  if (!items.length) {
    return (
      <Card style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.iconText, { color: colors.primary }]}>✦</Text>
        </View>
        <Text style={[styles.text, styles.hint]}>
          Keep logging! Once there is another {unit} on record, you’ll see how things are changing here.
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <Card key={item.key} style={styles.row}>
          <View
            style={[styles.icon, { backgroundColor: item.bg }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Text style={[styles.iconText, { color: item.color }]}>{item.arrow}</Text>
          </View>
          <Text style={styles.text}>
            <Text style={styles.lead}>{item.lead}</Text> {item.rest}
          </Text>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 0 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 16, fontWeight: '800' },
  text: { flex: 1, fontSize: 14, lineHeight: 20, color: palette.textSoft },
  lead: { fontWeight: '700', color: colors.text },
  hint: { color: colors.textMuted },
});
