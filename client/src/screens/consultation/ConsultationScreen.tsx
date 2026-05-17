import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as consultationService from '../../services/consultationService';
import { Appointment, RootStackParamList, User } from '../../types';
import { colors, spacing } from '../../utils/theme';

export const ConsultationScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [counsellors, setCounsellors] = useState<User[]>([]);
  const [details, setDetails] = useState('');
  const [selectedCounsellor, setSelectedCounsellor] = useState<string>();
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [appts, couns] = await Promise.all([
      consultationService.getAppointments(),
      consultationService.getCounsellors(),
    ]);
    setAppointments(appts);
    setCounsellors(couns);
    if (couns.length && !selectedCounsellor) setSelectedCounsellor(couns[0]._id);
  };

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [])
  );

  const book = async () => {
    const counsellorId = selectedCounsellor || 'counsellor_001';
    try {
      setLoading(true);
      const datetime = new Date(Date.now() + 86400000).toISOString();
      await consultationService.createAppointment({
        counsellor_user_id: counsellorId,
        appointment_datetime: datetime,
        session_details: details,
        is_anonymous: true,
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

  const counsellorName = (c: User | string) =>
    typeof c === 'object' ? c.user_name : 'Counsellor';

  return (
    <ScreenContainer title="Consultation">
      <Card>
        <Text style={styles.label}>Book a session</Text>
        {counsellors.map((c) => (
          <PrimaryButton
            key={c._id}
            label={c.user_name + (selectedCounsellor === c._id ? ' ✓' : '')}
            mode={selectedCounsellor === c._id ? 'contained' : 'outlined'}
            onPress={() => setSelectedCounsellor(c._id)}
          />
        ))}
        <TextInput
          label="Session details"
          value={details}
          onChangeText={setDetails}
          mode="outlined"
          multiline
          style={styles.input}
        />
        <PrimaryButton label="Request appointment" onPress={book} loading={loading} />
      </Card>
      <Text style={styles.section}>Your appointments</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.status}>{item.status.toUpperCase()}</Text>
            <Text>{new Date(item.appointment_datetime).toLocaleString()}</Text>
            <Text style={styles.muted}>With {counsellorName(item.counsellor_user_id)}</Text>
            <PrimaryButton
              label="Open chat"
              onPress={() =>
                navigation.navigate('Chat', {
                  appointmentId: item._id,
                  title: 'Counselling chat',
                })
              }
            />
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.muted}>No appointments yet.</Text>}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  label: { fontWeight: '700', marginBottom: spacing.sm, color: colors.text },
  input: { marginVertical: spacing.sm, backgroundColor: colors.surface },
  section: { fontWeight: '700', fontSize: 16, marginBottom: spacing.sm, color: colors.text },
  status: { color: colors.primary, fontWeight: '700' },
  muted: { color: colors.textMuted, marginTop: 4 },
});
