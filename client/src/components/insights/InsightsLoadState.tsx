import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { PrimaryButton } from '../PrimaryButton';
import { colors, spacing } from '../../utils/theme';

interface InsightsLoadStateProps {
  error: boolean;
  onRetry: () => void;
}

/** Shown until the first successful load: a spinner, or a retry prompt if that load failed. */
export const InsightsLoadState: React.FC<InsightsLoadStateProps> = ({ error, onRetry }) => (
  <View style={styles.centered}>
    {error ? (
      <>
        <Text style={styles.text}>Couldn't load insights.</Text>
        <PrimaryButton label="Try again" onPress={onRetry} />
      </>
    ) : (
      <>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.text}>Loading insights…</Text>
      </>
    )}
  </View>
);

const styles = StyleSheet.create({
  centered: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm },
  text: { color: colors.textMuted, fontSize: 15, textAlign: 'center' },
});
