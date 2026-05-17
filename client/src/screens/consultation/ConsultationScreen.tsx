import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as consultationService from '../../services/consultationService';
import { Appointment, StudentStackParamList } from '../../types';
import { colors, spacing } from '../../utils/theme';

type ConsultTab = 'chat' | 'appointment';

export const ConsultationScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const [tab, setTab] = useState<ConsultTab>('appointment');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [details, setDetails] = useState('');
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await consultationService.getAppointments();
    setAppointments(data);
  };

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [])
  );

  const book = async () => {
    try {
      setLoading(true);
      const datetime = new Date(Date.now() + 86400000).toISOString();
      await consultationService.createAppointment({
        counsellor_user_id: 'counsellor_001',
        appointment_datetime: datetime,
        session_details: details,
        is_anonymous: anonymousMode,
      });
      setDetails('');
      await load();
      Alert.alert('Requested', 'Your appointment request has been sent.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const approved = appointments.filter((a) => a.status === 'approved' || a.status === 'pending');

  return (
    <ScreenContainer title="Consultation">
      <View style={styles.tabs}>
        <PrimaryButton
          label="Chat"
          mode={tab === 'chat' ? 'contained' : 'outlined'}
          onPress={() => setTab('chat')}
        />
        <PrimaryButton
          label="Appointment"
          mode={tab === 'appointment' ? 'contained' : 'outlined'}
          onPress={() => setTab('appointment')}
        />
      </View>

      {tab === 'appointment' ? (
        <Card>
          <Text style={styles.label}>Book a counselling session</Text>
          <TextInput
            label="Session details"
            value={details}
            onChangeText={setDetails}
            mode="outlined"
            multiline
            style={styles.input}
          />
          <PrimaryButton
            label={anonymousMode ? 'Anonymous: ON' : 'Anonymous: OFF'}
            mode="outlined"
            onPress={() => setAnonymousMode((v) => !v)}
          />
          <PrimaryButton label="Request appointment" onPress={book} loading={loading} />
        </Card>
      ) : (
        <>
          <Card>
            <Text style={styles.label}>Anonymous mode (display only)</Text>
            <PrimaryButton
              label={anonymousMode ? 'Anonymous browsing: ON' : 'Anonymous browsing: OFF'}
              mode="outlined"
              onPress={() => setAnonymousMode((v) => !v)}
            />
            <Text style={styles.hint}>
              When ON, your name is hidden in chat — counsellor still sees session type.
            </Text>
          </Card>
          <FlatList
            data={approved}
            keyExtractor={(i) => i._id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Card>
                <Text style={styles.status}>{item.status.toUpperCase()}</Text>
                <Text>{new Date(item.appointment_datetime).toLocaleString()}</Text>
                <PrimaryButton
                  label="Open chat"
                  onPress={() =>
                    navigation.navigate('Chat', {
                      appointmentId: item._id,
                      title: 'Counselling chat',
                      isAnonymous: anonymousMode,
                    })
                  }
                />
              </Card>
            )}
            ListEmptyComponent={<Text style={styles.muted}>Book an appointment to start chatting.</Text>}
          />
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  label: { fontWeight: '700', marginBottom: spacing.sm, color: colors.text },
  input: { marginBottom: spacing.sm, backgroundColor: colors.surface },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  status: { color: colors.primary, fontWeight: '700' },
  muted: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
});
