import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRole } from '../../context/RoleContext';
import * as consultationService from '../../services/consultationService';
import { Appointment } from '../../types';
import { colors, radius, spacing } from '../../utils/theme';

const studentLabel = (a: Appointment) => {
  if (a.is_anonymous) return 'Anonymous student';
  const s = a.student_user_id;
  return typeof s === 'object' ? s.user_name : 'Student';
};

export const CounsellorHomeScreen: React.FC = () => {
  const { profile } = useRole();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const load = async () => {
    const data = await consultationService.getAppointments();
    setAppointments(data);
  };

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [])
  );

  const pending = appointments.filter((a) => a.status === 'pending');
  const upcoming = appointments.filter(
    (a) => a.status === 'approved' && new Date(a.appointment_datetime) >= new Date()
  );

  const handleStatus = async (id: string, status: Appointment['status']) => {
    try {
      await consultationService.updateAppointmentStatus(id, status);
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Update failed');
    }
  };

  const name = profile ? `${profile.displayTitle || 'Dr.'} ${profile.user_name}` : 'Counsellor';

  return (
    <ScreenContainer title="Home" isHome>
      <Text style={styles.welcome}>Welcome {name}</Text>

      <Text style={styles.section}>Appointment requests ({pending.length})</Text>
      {pending.length === 0 ? (
        <Text style={styles.muted}>No pending requests</Text>
      ) : (
        pending.map((a) => (
          <Card key={a._id}>
            <Text style={styles.cardTitle}>{studentLabel(a)}</Text>
            <Text style={styles.muted}>{new Date(a.appointment_datetime).toLocaleString()}</Text>
            <Text style={styles.body}>{a.session_details || 'No details'}</Text>
            <View style={styles.row}>
              <PrimaryButton label="Approve" onPress={() => handleStatus(a._id, 'approved')} />
              <PrimaryButton
                label="Decline"
                onPress={() => handleStatus(a._id, 'cancelled')}
                mode="outlined"
                color={colors.stressed}
              />
            </View>
          </Card>
        ))
      )}

      <Text style={styles.section}>Upcoming appointments</Text>
      {upcoming.length === 0 ? (
        <Text style={styles.muted}>No upcoming sessions</Text>
      ) : (
        upcoming.map((a) => (
          <Card key={a._id}>
            <Text style={styles.cardTitle}>{studentLabel(a)}</Text>
            <Text style={styles.muted}>{new Date(a.appointment_datetime).toLocaleString()}</Text>
          </Card>
        ))
      )}

      <Text style={styles.section}>Calendar overview</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {appointments.slice(0, 10).map((a) => (
          <View key={a._id} style={[styles.calCard, { borderColor: statusColor(a.status) }]}>
            <Text style={styles.calDate}>{new Date(a.appointment_datetime).toLocaleDateString()}</Text>
            <Text style={styles.calStatus}>{a.status}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
};

const statusColor = (s: string) => {
  if (s === 'approved') return colors.secondary;
  if (s === 'pending') return colors.anxious;
  return colors.border;
};

const styles = StyleSheet.create({
  welcome: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  section: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  cardTitle: { fontWeight: '700', color: colors.primary },
  body: { color: colors.text, marginVertical: spacing.xs },
  muted: { color: colors.textMuted, fontSize: 13 },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  calCard: {
    width: 120,
    padding: spacing.md,
    marginRight: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
  },
  calDate: { fontWeight: '600', fontSize: 12 },
  calStatus: { color: colors.textMuted, fontSize: 11, marginTop: 4, textTransform: 'capitalize' },
});
