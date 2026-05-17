import React, { useCallback, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as consultationService from '../../services/consultationService';
import { ChatMessage, RootStackParamList, User } from '../../types';
import { colors, spacing } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const senderName = (u: User | string) => (typeof u === 'object' ? u.user_name : 'User');

export const ChatScreen: React.FC<Props> = ({ route }) => {
  const { appointmentId } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  const load = async () => {
    const data = await consultationService.getMessages(appointmentId);
    setMessages(data);
  };

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [appointmentId])
  );

  const send = async () => {
    if (!text.trim()) return;
    await consultationService.sendMessage(appointmentId, text.trim());
    setText('');
    await load();
  };

  return (
    <ScreenContainer title="Chat" scroll={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={styles.bubble}>
              <Text style={styles.sender}>{senderName(item.sender_id)}</Text>
              <Text>{item.message}</Text>
            </View>
          )}
        />
        <View style={styles.composer}>
          <TextInput value={text} onChangeText={setText} mode="outlined" placeholder="Type a message" style={styles.input} />
          <PrimaryButton label="Send" onPress={send} />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { flex: 1 },
  bubble: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  sender: { fontWeight: '700', color: colors.primary, marginBottom: 4, fontSize: 12 },
  composer: { paddingTop: spacing.sm },
  input: { marginBottom: spacing.sm, backgroundColor: colors.surface },
});
