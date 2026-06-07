import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as consultationService from '../../services/consultationService';
import { Notification } from '../../types';
import { colors, spacing } from '../../utils/theme';

export const NotificationsScreen: React.FC = () => {
  const [items, setItems] = useState<Notification[]>([]);

  useFocusEffect(
    useCallback(() => {
      consultationService.getNotifications().then(setItems).catch(() => setItems([]));
    }, [])
  );

  return (
    <ScreenContainer title="Notifications">
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.message}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontWeight: '700', color: colors.text },
  body: { color: colors.textMuted, marginTop: spacing.xs },
  date: { fontSize: 11, color: colors.textMuted, marginTop: spacing.sm },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
