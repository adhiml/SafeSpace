import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../../context/NotificationContext';
import { Notification } from '../../types';
import { colors, palette, radius, spacing } from '../../utils/theme';

const HIDDEN_Y = -180;
const VISIBLE_MS = 5000;

interface Props {
  /** Called when the banner is tapped (open the notifications list). */
  onOpen: () => void;
}

/** Slides down from the top when a new notification arrives while the app is open. */
export const NotificationBanner: React.FC<Props> = ({ onOpen }) => {
  const { banner, dismissBanner, markRead } = useNotifications();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(HIDDEN_Y)).current;
  const [shown, setShown] = useState<Notification | null>(null);

  const hide = useCallback(() => {
    Animated.timing(translateY, { toValue: HIDDEN_Y, duration: 200, useNativeDriver: true }).start(({ finished }) => {
      if (finished) {
        setShown(null);
        dismissBanner();
      }
    });
  }, [translateY, dismissBanner]);

  useEffect(() => {
    if (!banner) return;
    setShown(banner);
    Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    const timer = setTimeout(hide, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [banner, translateY, hide]);

  if (!shown) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingTop: insets.top + spacing.xs, transform: [{ translateY }] }]}
    >
      <Pressable
        style={styles.banner}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        onPress={() => {
          markRead(shown._id);
          hide();
          onOpen();
        }}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="notifications" size={18} color={palette.white} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title} numberOfLines={1}>{shown.title}</Text>
          <Text style={styles.message} numberOfLines={2}>{shown.message}</Text>
        </View>
        <Pressable onPress={hide} hitSlop={10} accessibilityLabel="Dismiss notification">
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    zIndex: 1000,
    elevation: 20,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: spacing.sm + 2,
    shadowColor: palette.shadowStrong,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: colors.text },
  message: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
});
