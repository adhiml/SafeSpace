import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRole } from '../../context/RoleContext';
import * as consultationService from '../../services/consultationService';
import { Appointment } from '../../types';
import { deriveStatus } from "../../constants/appointmentStatus";
import { colors, palette, radius, spacing } from '../../utils/theme';
import { Card } from '../../components/Card';
import { StudentRequestCard } from '../../components/StudentRequestCard';
import { currentWorkWeek, isWeekend } from '../../utils/date';

// Indexed by Date.getDay() (0 = Sunday)
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const CounsellorHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile } = useRole();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // Monday–Friday of this week (the coming week on a weekend)
  const dateStrip = useMemo(() => currentWorkWeek(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    isWeekend(new Date()) ? dateStrip[0] : new Date()
  );

  const load = async () => {
    try {
      const data = await consultationService.getAppointments();
      setAppointments(data || []);
    } catch {
      // Ignore load errors silently or handle gracefully
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  // Derive stats
  const pendingCount = useMemo(() => {
    return appointments.filter((a) => a.status === 'pending').length;
  }, [appointments]);

  const todaySessionsCount = useMemo(() => {
    const today = new Date();
    return appointments.filter((a) => {
      const status = deriveStatus(a);
      const apptDate = new Date(a.appointment_datetime);
      return (
        isSameDay(apptDate, today) &&
        (status === 'upcoming' || status === 'active' || status === 'past')
      );
    }).length;
  }, [appointments]);

  const completedThisWeekCount = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return appointments.filter((a) => {
      const status = deriveStatus(a);
      const apptDate = new Date(a.appointment_datetime);
      return status === 'past' && apptDate >= startOfWeek;
    }).length;
  }, [appointments]);

  // Only confirmed sessions belong on the home schedule (requests are handled in Consultations)
  const selectedDayAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const confirmed = a.status === 'approved' || a.status === 'completed';
        return confirmed && isSameDay(new Date(a.appointment_datetime), selectedDate);
      })
      .sort(
        (a, b) =>
          new Date(a.appointment_datetime).getTime() - new Date(b.appointment_datetime).getTime()
      );
  }, [appointments, selectedDate]);

  const openChat = (appt: Appointment) => {
    navigation.getParent()?.navigate('Consult', {
      appointmentId: appt._id,
      title: 'Counselling Chat',
      isAnonymous: appt.is_anonymous,
    });
  };

  const name = profile
    ? `${profile.displayTitle || 'Dr.'} ${profile.user_name}`
    : 'Counsellor';

  return (
    <ScreenContainer title="tenang." isHome>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>Welcome, {name}</Text>
            <Text style={styles.subtext}>Here is your overview for today</Text>
          </View>
        </View>

        {/* Quick Stats Section */}
        <Card style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Overview Stats</Text>
            <TouchableOpacity
              style={styles.consultNavBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Consult')}
            >
              <Text style={styles.consultNavText}>Consultations</Text>
              <Icon source="arrow-right" size={14} color={palette.white} />
            </TouchableOpacity>
          </View>

          {/* Quick Stats Scrollable Strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollContent}
          >
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.statBadge, { backgroundColor: palette.warnBg }]}>
                  <Icon source="clock-outline" size={16} color={palette.warnText} />
                </View>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[styles.statNumber, { color: palette.warnText }]}>
                  {pendingCount}
                </Text>
                <Text style={styles.statSubText}>Requests</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.statBadge, { backgroundColor: palette.accentWash }]}>
                  <Icon source="calendar-today" size={16} color={palette.accent} />
                </View>
                <Text style={styles.statLabel}>Today</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[styles.statNumber, { color: palette.accent }]}>
                  {todaySessionsCount}
                </Text>
                <Text style={styles.statSubText}>Sessions</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.statBadge, { backgroundColor: palette.okBg }]}>
                  <Icon source="check-circle-outline" size={16} color={palette.okText} />
                </View>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[styles.statNumber, { color: palette.okText }]}>
                  {completedThisWeekCount}
                </Text>
                <Text style={styles.statSubText}>This Week</Text>
              </View>
            </View>
          </ScrollView>
        </Card>

        {/* Calendar Strip Selector */}
        <Text style={styles.sectionTitleStyle}>Select Date</Text>
        <View style={styles.dateStrip}>
          {dateStrip.map((date) => {
            const active = isSameDay(date, selectedDate);
            const isTodayDate = isSameDay(date, new Date());

            return (
              <TouchableOpacity
                key={date.toISOString()}
                activeOpacity={0.85}
                onPress={() => setSelectedDate(date)}
                style={[styles.dateChip, active && styles.dateChipActive]}
              >
                <Text style={[styles.dateDay, active && styles.dateTextActive]}>
                  {DAY_ABBR[date.getDay()]}
                </Text>
                <Text style={[styles.dateNum, active && styles.dateTextActive]}>
                  {date.getDate()}
                </Text>
                {isTodayDate && (
                  <View
                    style={[
                      styles.todayDot,
                      { backgroundColor: active ? palette.white : palette.action },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Schedule Timeline Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleStyle}>
            Schedule ({selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
          </Text>
          {isSameDay(selectedDate, new Date()) && (
            <View style={styles.todayPill}>
              <Text style={styles.todayPillText}>Today</Text>
            </View>
          )}
        </View>

        {/* Confirmed sessions only: no rows for unbooked hours */}
        <View style={styles.timelineContainer}>
          {selectedDayAppointments.length === 0 ? (
            <Text style={styles.emptyText}>No confirmed sessions on this day.</Text>
          ) : (
            selectedDayAppointments.map((appt) => {
              const hour = new Date(appt.appointment_datetime).getHours();

              return (
                <View key={appt._id} style={styles.timelineRow}>
                  {/* Left Hour Axis */}
                  <View style={styles.timeAxis}>
                    <Text style={styles.timeText}>{hour.toString().padStart(2, '0')}:00</Text>
                  </View>

                  {/* Vertical Timeline Divider Line */}
                  <View style={styles.verticalTimelineLine} />

                  {/* Right Content Area */}
                  <View style={styles.timelineContent}>
                    {/* Same card as the Consultations page, without its footer; tap to open the chat */}
                    <TouchableOpacity activeOpacity={0.85} onPress={() => openChat(appt)}>
                      <StudentRequestCard item={appt} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  headerRow: {
    marginBottom: spacing.md,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitleStyle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  consultNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.full,
  },
  consultNavText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '600',
  },
  statsScrollContent: {
    paddingRight: spacing.xs,
    gap: spacing.xs + 2,
  },
  statCard: {
    width: 111,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '800',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  statSubText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '800',
    marginTop: 2,
  },
  dateStrip: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dateChip: {
    flex: 1,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  dateNum: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  dateTextActive: {
    color: palette.white,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  todayPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  todayPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  timelineContainer: {
    marginTop: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timeAxis: {
    width: 44,
    paddingTop: 0,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  verticalTimelineLine: {
    width: 1,
    backgroundColor: palette.border,
    marginRight: spacing.sm,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
});