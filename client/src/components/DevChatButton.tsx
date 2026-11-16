import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from "react-native-paper";
import * as consultationService from '../services/consultationService';
import { palette, radius } from '../utils/theme';

interface Props {
  onOpen: (appointmentId: string) => void;
}

/**
 * Development shortcut to the one always-open chatroom (Jamie Chen <-> Morgan Lee).
 * Renders nothing in a production build.
 */
export const DevChatButton: React.FC<Props> = ({ onOpen }) => {
  if (!__DEV__) return null;

  const open = async () => {
    try {
      const room = await consultationService.getDevRoom();
      onOpen(room._id);
    } catch (e) {
      Alert.alert('Dev chatroom', e instanceof Error ? e.message : 'Could not open the dev chatroom');
    }
  };

  return (
    
      <Pressable onPress={open} style={styles.devBox} accessibilityRole="button" accessibilityLabel="Open developer chatroom">
      <Icon source="dev-to" size={15} color={palette.text} />
      <Text style={styles.text}>DEV chatroom</Text>
    </Pressable>
  

  );
};

const styles = StyleSheet.create({
  devBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  text: { fontSize: 10, fontWeight: '800', color: palette.warnText, letterSpacing: 0.5 },
});
