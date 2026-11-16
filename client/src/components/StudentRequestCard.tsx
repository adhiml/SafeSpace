import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { Avatar } from './Avatar';
import { Appointment, User } from '../types';
import { deriveStatus, statusStyles } from '../constants/appointmentStatus';
import { palette, spacing } from '../utils/theme';

/** Student identity to display for a card, respecting anonymity. */
const studentFor = (item: Appointment) => {
  if (item.is_anonymous) {
    return { name: 'Anonymous student', subtitle: 'Identity hidden' };
  }
  const ref = item.student_user_id as User | string;
  return { name: typeof ref !== 'string' ? ref.user_name : 'Student', subtitle: 'Student' };
};

interface Props {
  item: Appointment;
  /** Extra content under the notes, e.g. approve/decline buttons and a footer. */
  children?: React.ReactNode;
}

/** The counsellor's view of a student's appointment. Shared by the Consultations page and Home. */
export const StudentRequestCard: React.FC<Props> = ({ item, children }) => {
  const tone = statusStyles[deriveStatus(item)];
  const student = studentFor(item);
  const showAsAnon = item.is_anonymous;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.badge, { backgroundColor: tone.bg }]}>
          <Icon source={tone.icon} size={11} color={tone.text} />
          <Text style={[styles.badgeText, { color: tone.text }]}>{tone.label}</Text>
        </View>

        <View
          style={[
            styles.identityTag,
            { backgroundColor: showAsAnon ? palette.accentSoft : palette.borderSoft },
          ]}
        >
          <Icon
            source={showAsAnon ? 'shield-outline' : 'account-outline'}
            size={10}
            color={showAsAnon ? palette.accentDark : palette.textSoft}
          />
          <Text
            style={[styles.identityText, { color: showAsAnon ? palette.accentDark : palette.textSoft }]}
          >
            {showAsAnon ? 'Anonymous' : 'Standard'}
          </Text>
        </View>
      </View>

      <View style={styles.studentRow}>
        <View style={styles.avatar}>
          <Avatar size={30} />
        </View>
        <View style={styles.flexShrink}>
          <Text style={styles.studentName} numberOfLines={1}>
            {student.name}
          </Text>
          <Text style={styles.studentTitle} numberOfLines={1}>
            {student.subtitle}
          </Text>
        </View>
      </View>

      {/* Notes the student wrote */}
      <View style={styles.notesBox}>
        <Icon source="note-text-outline" size={12} color={palette.textFaint} />
        <Text style={styles.notesText} numberOfLines={3}>
          {item.session_details?.trim() || 'No notes provided.'}
        </Text>
      </View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  flexShrink: { flex: 1 },
  card: {
    flex: 1,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    borderRadius: 18,
    padding: 14,
    marginBottom: spacing.md,
    shadowColor: palette.text,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  badgeText: { fontSize: 10, fontWeight: '800' },
  identityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  identityText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },

  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.surfaceAlt,
  },
  studentName: { fontSize: 13, fontWeight: '700', color: palette.text },
  studentTitle: { fontSize: 11, color: palette.textFaint, marginTop: 1 },

  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  notesText: { flex: 1, fontSize: 11, lineHeight: 15, color: palette.textSoft },
});
