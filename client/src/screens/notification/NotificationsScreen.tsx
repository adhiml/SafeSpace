import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useNotifications } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/date';
import { colors, palette, radius, spacing } from '../../utils/theme';

export const NotificationsScreen: React.FC = () => {
  const { items, unreadCount, refresh, markRead, markAllRead } = useNotifications();

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => undefined);
    }, [refresh])
  );

  return (
    <ScreenContainer title="Notifications" hideHeaderActions>
      {items.length > 0 && (
        <View style={styles.toolbar}>
          <Text style={styles.summary}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </Text>
          {unreadCount > 0 && (
            <Pressable onPress={markAllRead} hitSlop={8} accessibilityRole="button">
              <Text style={styles.markAll}>Mark all as read</Text>
            </Pressable>
          )}
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const unread = !item.is_read;
          return (
            <Pressable
              onPress={() => unread && markRead(item._id)}
              accessibilityLabel={`${unread ? 'Unread. ' : ''}${item.title}. ${item.message}`}
              style={[styles.card, unread ? styles.cardUnread : styles.cardRead]}
            >
              {unread && <View style={styles.unreadBar} />}
              <View style={styles.cardBody}>
                <View style={styles.titleRow}>
                  {unread && <View style={styles.dot} />}
                  <Text style={[styles.title, unread ? styles.titleUnread : styles.titleRead]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {unread && (
                    <View style={styles.newPill}>
                      <Text style={styles.newPillText}>New</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.body, unread && styles.bodyUnread]}>{item.message}</Text>
                <Text style={styles.date}>{timeAgo(item.created_at)}</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summary: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  markAll: { fontSize: 13, color: colors.secondary, fontWeight: '700' },

  card: {
    flexDirection: 'row',
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  // Unread: white, raised, with an accent bar. Read: flat and muted, so unread stands out.
  cardUnread: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.accentSoft,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardRead: {
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.borderSoft,
  },
  unreadBar: { width: 4, backgroundColor: colors.primary },
  cardBody: { flex: 1, padding: spacing.md },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.cancelledDot },
  title: { flex: 1, fontSize: 14, color: colors.text },
  titleUnread: { fontWeight: '800' },
  titleRead: { fontWeight: '500', color: colors.textMuted },
  newPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  newPillText: { fontSize: 10, fontWeight: '800', color: colors.primary },

  body: { color: colors.textMuted, marginTop: spacing.xs, fontSize: 13, lineHeight: 18 },
  bodyUnread: { color: palette.textSoft },
  date: { fontSize: 11, color: palette.textFaint, marginTop: spacing.sm },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
