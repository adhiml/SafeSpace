import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Divider, List, Switch, Text } from 'react-native-paper';
import * as authService from '../services/authService';
import { NotificationSettings } from '../services/authService';
import { colors, spacing } from '../utils/theme';
import { Card } from './Card';

interface Item {
  key: keyof NotificationSettings;
  title: string;
  description: string;
  icon: string;
}

const STUDENT_ITEMS: Item[] = [
  { key: 'mood_checkin', title: 'Daily mood check-in', description: "A reminder if you haven't logged your mood today", icon: 'emoticon-outline' },
  { key: 'approval', title: 'Counsellor approval', description: 'When your counsellor approves or declines a booking', icon: 'check-circle-outline' },
  { key: 'messages', title: 'Messages', description: 'New messages in your counselling chat', icon: 'message-text-outline' },
  { key: 'appointment_reminder', title: 'Upcoming appointment', description: 'A reminder about an hour before your session', icon: 'calendar-clock' },
  { key: 'recommendation_feedback', title: 'Personalized recommendations feedback', description: 'Asks whether a recommendation helped with a stress cause (coming soon)', icon: 'lightbulb-on-outline' },
];

const COUNSELLOR_ITEMS: Item[] = [
  { key: 'new_requests', title: 'New booking requests', description: 'When a student asks for a session', icon: 'calendar-plus' },
  { key: 'messages', title: 'Messages', description: 'New messages in a counselling chat', icon: 'message-text-outline' },
  { key: 'appointment_reminder', title: 'Upcoming appointment', description: 'A reminder about an hour before a session', icon: 'calendar-clock' },
];

/** One switch per kind of notification. Switching one off means it is never created for you. */
export const NotificationPreferences: React.FC<{ isCounsellor: boolean }> = ({ isCounsellor }) => {
  const [prefs, setPrefs] = useState<NotificationSettings | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    authService.getNotificationSettings().then(setPrefs).catch(() => setFailed(true));
  }, []);

  const toggle = async (key: keyof NotificationSettings, value: boolean) => {
    if (!prefs) return;
    const before = prefs;
    setPrefs({ ...prefs, [key]: value }); // show the change straight away
    try {
      setPrefs(await authService.updateNotificationSettings({ [key]: value }));
    } catch (e) {
      setPrefs(before); // put it back if the server said no
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    }
  };

  if (failed) return <Text style={styles.note}>Couldn't load your notification settings.</Text>;
  if (!prefs) return <Text style={styles.note}>Loading…</Text>;

  const items = isCounsellor ? COUNSELLOR_ITEMS : STUDENT_ITEMS;

  return (
    <Card style={styles.card}>
      {items.map((item, i) => (
        <React.Fragment key={item.key}>
          {i > 0 && <Divider />}
          <List.Item
            title={item.title}
            description={item.description}
            descriptionNumberOfLines={2}
            left={(props) => <List.Icon {...props} icon={item.icon} color={colors.secondary} />}
            right={() => (
              <Switch
                value={prefs[item.key]}
                onValueChange={(v) => toggle(item.key, v)}
                color={colors.primary}
                accessibilityLabel={item.title}
              />
            )}
          />
        </React.Fragment>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden', marginBottom: spacing.md },
  note: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.md, marginLeft: spacing.xs },
});
