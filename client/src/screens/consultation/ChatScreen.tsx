import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRole } from '../../context/RoleContext';
import * as consultationService from '../../services/consultationService';
import { Appointment, ChatMessage, CounsellorStackParamList, StudentStackParamList, User } from '../../types';
import { colors, palette, radius, spacing } from '../../utils/theme';

type Props = NativeStackScreenProps<
  StudentStackParamList & CounsellorStackParamList,
  'Consult'
>;

type SessionStatus = 'PENDING' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export const ChatScreen: React.FC<Props> = ({ route }) => {
  const { appointmentId, isAnonymous } = route.params;
  const { profile, userId, isCounsellor } = useRole();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('UPCOMING');
  const [manualEnded, setManualEnded] = useState<boolean>(false);

  // 1. Fetch Messages & Schedule Details
  const load = async () => {
    const [msgData, apptData] = await Promise.all([
      consultationService.getMessages(appointmentId),
      consultationService.getAppointmentDetails(appointmentId),
    ]);
    setMessages(msgData);
    setAppointment(apptData);
  };

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [appointmentId])
  );

  // 2. Evaluate Status Based on Appointment Schedule
  useEffect(() => {
    if (!appointment) return;

    const checkSchedule = () => {

      if (appointment.status === 'cancelled') {
        setSessionStatus('CANCELLED');
        return;
      }

      if (appointment.status === 'pending') {
        setSessionStatus('PENDING');
        return;
      }

      if (!appointment.start_time || !appointment.end_time) return; //not loaded yet

      const now = new Date().getTime();
      const startTime = new Date(appointment.start_time).getTime();
      const endTime = new Date(appointment.end_time).getTime();

      if (manualEnded || appointment.status === 'completed' || now >= endTime) {
        setSessionStatus('COMPLETED');
      } else if (now < startTime) {
        setSessionStatus('UPCOMING');
      } else {
        setSessionStatus('ACTIVE');
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 5000); // Poll status periodically
    return () => clearInterval(interval);
  }, [appointment, manualEnded]);

  // Format date string for upcoming view
  const formatStartTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const d = new Date(timeStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 3. End Chat Action
  const handleEndChat = () => {
    Alert.alert(
      'End Consultation',
      'Are you sure you want to end this chat? You will no longer be able to send messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Chat',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isCounsellor) {
                await consultationService.completeAppointment(appointmentId);
                setSessionStatus('COMPLETED');
              } else {
                await consultationService.updateAppointmentStatus(appointmentId, 'cancelled');
                setSessionStatus('CANCELLED');
              }
              setManualEnded(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to end the chat. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getSenderMeta = (msg: ChatMessage) => {
    const sender = msg.sender_id;
    const senderId = typeof sender === 'object' ? sender._id : sender;
    const isMe = senderId === userId;

    let label = 'User';
    if (isMe) {
      if (!isCounsellor && isAnonymous) label = profile?.anonymous_name || 'Anonymous';
      else if (isCounsellor) label = `${profile?.displayTitle || 'Dr.'} ${profile?.user_name}`;
      else label = profile?.user_name || 'You';
    } else if (typeof sender === 'object') {
      if (isCounsellor && isAnonymous) label = 'Anonymous student';
      else label = (sender as User).user_name;
    }

    return { isMe, label };
  };

  const send = async () => {
    try {
      if (!text.trim() || sessionStatus !== 'ACTIVE') return;
      const messageToSend = text.trim();
      setText('');
      await consultationService.sendMessage(appointmentId, messageToSend);
      await load();
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  return (
    <ScreenContainer title="chat." scroll={false} hideHeaderActions>
      {/* Dynamic Header Header Bar with End Chat Button when Active */}
      <View style={styles.sessionHeader}>
        <Text style={styles.statusLabel}>
          {sessionStatus === 'UPCOMING' && '🔒 Scheduled Session'}
          {sessionStatus === 'ACTIVE' && '🟢 Session in Progress'}
          {sessionStatus === 'COMPLETED' && '🔒 Session Completed'}
          {sessionStatus === 'CANCELLED' && '🔒 Session Cancelled'}
        </Text>

        {sessionStatus === 'ACTIVE' && (
          <Button
            mode="outlined"
            compact
            onPress={handleEndChat}
            textColor="#C0392B"
            style={styles.endChatButton}
            labelStyle={styles.endChatButtonLabel}
          >
            End Chat
          </Button>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const { isMe, label } = getSenderMeta(item);
            return (
              <View style={[styles.wrapper, isMe ? styles.alignRight : styles.alignLeft]}>
                <Text style={styles.sender}>{label}</Text>
                <View style={[styles.bubble, isMe ? styles.bubbleSent : styles.bubbleReceived]}>
                  <Text style={isMe ? styles.textSent : styles.textReceived}>
                    {item.message}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Dynamic Footer Controls */}
        {sessionStatus === 'PENDING' && (
          <View style={[styles.statusBanner, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
            <Text style={styles.statusBannerText}>
              Waiting for your counsellor to approve this request.
            </Text>
          </View>
        )}

        {sessionStatus === 'UPCOMING' && (
          <View style={[styles.statusBanner, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
            <Text style={styles.statusBannerText}>
              ⏳ Session opens at {formatStartTime(appointment?.start_time)}. Messages will be unlocked then.
            </Text>
          </View>
        )}

        {(sessionStatus === 'COMPLETED' || sessionStatus === 'CANCELLED') && (
          <View style={[styles.statusBanner, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
            <Text style={styles.statusBannerText}>
              {sessionStatus === 'CANCELLED'
                ? 'This appointment was cancelled. Chat history is viewable in read-only mode.'
                : 'Consultation has concluded. Chat history is viewable in read-only mode.'}
            </Text>
          </View>
        )}

        {sessionStatus === 'ACTIVE' && (
          <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              placeholderTextColor={colors.textMuted}
              mode="outlined"
              outlineColor="transparent"
              activeOutlineColor={colors.secondary}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              contentStyle={styles.inputContent}
              dense
            />
            <IconButton
              icon="send"
              mode="contained"
              containerColor={colors.secondary}
              iconColor={palette.white}
              size={20}
              onPress={send}
              style={styles.sendButton}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    marginHorizontal: -spacing.md,
    backgroundColor: colors.background
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    marginHorizontal: -spacing.md,
    minHeight: 44,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  endChatButton: {
    borderColor: '#E6B0AA',
    borderRadius: radius.full,
  },
  endChatButtonLabel: {
    fontSize: 11,
    marginVertical: 2,
    marginHorizontal: 4,
  },
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  wrapper: {
    maxWidth: '80%',
    marginBottom: spacing.xs,
  },
  alignRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  alignLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  sender: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
    paddingHorizontal: spacing.xs,
  },
  bubble: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  bubbleSent: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
    elevation: 1,
  },
  bubbleReceived: {
    backgroundColor: colors.surface,
    borderColor: palette.border,
    borderWidth: 1,
    borderBottomLeftRadius: 2,
  },
  textSent: {
    color: palette.white,
    fontSize: 14,
    lineHeight: 20,
  },
  textReceived: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    backgroundColor: palette.surfaceAlt,
    fontSize: 14,
  },
  inputContent: {
    paddingVertical: 0,
    height: 40,
  },
  inputOutline: {
    borderRadius: radius.full,
    borderColor: palette.border,
  },
  sendButton: {
    margin: 0,
    borderRadius: radius.full,
  },
  statusBanner: {
    backgroundColor: palette.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statusBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
});