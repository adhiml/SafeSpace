import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as consultationService from '../../services/consultationService';
import { Appointment, CounsellorStackParamList } from '../../types';
import { colors, spacing } from '../../utils/theme';

type Tab = 'anonymous' | 'named';

export const CounsellorMessagesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CounsellorStackParamList>>();
  const [tab, setTab] = useState<Tab>('anonymous');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useFocusEffect(
    useCallback(() => {
      consultationService.getAppointments().then(setAppointments).catch(() => setAppointments([]));
    }, [])
  );

  const filtered = appointments.filter((a) =>
    tab === 'anonymous' ? a.is_anonymous : !a.is_anonymous
  );

  return (
    <ScreenContainer title="Messages">
      <View style={styles.tabs}>
        <PrimaryButton
          label="Anonymous"
          mode={tab === 'anonymous' ? 'contained' : 'outlined'}
          onPress={() => setTab('anonymous')}
        />
        <PrimaryButton
          label="Non-Anonymous"
          mode={tab === 'named' ? 'contained' : 'outlined'}
          onPress={() => setTab('named')}
        />
      </View>
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No {tab} conversations</Text>
      ) : (
        filtered.map((a) => (
          <Card key={a._id}>
            <Text style={styles.title}>
              {a.is_anonymous
                ? 'Anonymous student'
                : typeof a.student_user_id === 'object'
                  ? a.student_user_id.user_name
                  : 'Student'}
            </Text>
            <Text style={styles.muted}>{a.status} · {new Date(a.appointment_datetime).toLocaleDateString()}</Text>
            <PrimaryButton
              label="Open chat"
              onPress={() => {
                console.log("Counselor open chat button pressed");
                console.log("ID checking:", a._id);
                navigation.getParent()?.navigate('Chat', {
                  appointmentId: a._id,
                  title: a.is_anonymous ? 'Anonymous chat' : 'Student chat',
                  isAnonymous: a.is_anonymous,
                })
              }}
            />
          </Card>
        ))
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  title: { fontWeight: '700', color: colors.text },
  muted: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
