import { StyleSheet, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { PrimaryButton } from './PrimaryButton';
import { Appointment } from '../types';
import { colors, spacing } from '../utils/theme';

interface AppointmentCardProps {
  item: Appointment;
  onOpenChat: (appointmentId: string) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ item, onOpenChat }) => {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { color: '#2E7D32', bg: '#E8F5E9' };
      case 'pending':
        return { color: '#EF6C00', bg: '#FFF3E0' };
      default:
        return { color: colors.textMuted, bg: '#F5F5F5' };
    }
  };

  const themeConfig = getStatusStyle(item.status);
  const formattedDate = new Date(item.appointment_datetime).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Surface style={styles.appointmentCard} elevation={1}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{formattedDate}</Text>
        <View style={[styles.badge, { backgroundColor: themeConfig.bg }]}>
          <Text style={[styles.badgeText, { color: themeConfig.color }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {item.session_details ? (
        <Text style={styles.cardDetails} numberOfLines={2}>
          {item.session_details}
        </Text>
      ) : null}

      <PrimaryButton
        label="Enter Chatroom"
        mode="contained"
        onPress={() => onOpenChat(item._id)}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  appointmentCard: {
    backgroundColor: "#ffffffc6",
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderTopWidth: 4,
    borderColor: colors.primaryLight,
  },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardDate: { fontWeight: '600', color: '#2D3748', fontSize: 14 },
  cardDetails: { fontSize: 13, color: '#4A5568', marginBottom: spacing.md, lineHeight: 18 },
  cardBtn: { borderRadius: 8 },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },

});