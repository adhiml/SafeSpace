import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
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

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr'];
const SLOT_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

const studentLabel = (a: Appointment) => {
  if (a.is_anonymous) return 'Anonymous student';
  const s = a.student_user_id;
  return typeof s === 'object' && s !== null ? s.user_name : 'Student';
};

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  // Generate date strip (-2 days to +5 days)
  const dateStrip = useMemo(() => {
    const dates: Date[] = [];
    const base = new Date();
    for (let i = -2; i <= 5; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  // Filter appointments for schedule timeline based on selected date
  const selectedDayAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const apptDate = new Date(a.appointment_datetime);
      return isSameDay(apptDate, selectedDate) && a.status !== 'cancelled';
    });
  }, [appointments, selectedDate]);

  const handleStatus = async (id: string, status: Appointment['status']) => {
    try {
      await consultationService.updateAppointmentStatus(id, status);
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Update failed');
    }
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateStrip}
          contentContainerStyle={styles.dateStripContent}
        >
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
                  {WEEKDAYS[date.getDay()]}
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
        </ScrollView>

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

        {/* Schedule Timeline Grid */}
        <View style={styles.timelineContainer}>
          {SLOT_HOURS.map((hour) => {
            const slotAppointments = selectedDayAppointments.filter((a) => {
              const apptHour = new Date(a.appointment_datetime).getHours();
              return apptHour === hour;
            });

            const hourFormatted = `${hour.toString().padStart(2, '0')}:00`;

            return (
              <View key={hour} style={styles.timelineRow}>
                {/* Left Hour Axis */}
                <View style={styles.timeAxis}>
                  <Text style={styles.timeText}>{hourFormatted}</Text>
                </View>

                {/* Vertical Timeline Divider Line */}
                <View style={styles.verticalTimelineLine} />

                {/* Right Content Area */}
                <View style={styles.timelineContent}>
                  {slotAppointments.length === 0 ? (
                    <View style={styles.emptySlotContainer}>
                      <View style={styles.timelineDot} />
                      <View style={styles.slotDashedLine} />
                    </View>
                  ) : (
                    slotAppointments.map((appt) => {
                      const uiStatus = deriveStatus(appt);
                      const isPending = appt.status === 'pending';

                      return (
                        <View key={appt._id} style={styles.apptCard}>
                          <View style={styles.apptCardHeader}>
                            <View style={styles.titleRow}>
                              <Text style={styles.studentName}>
                                {studentLabel(appt)}
                              </Text>
                              {appt.is_anonymous && (
                                <View style={styles.anonTag}>
                                  <Icon source="shield-check" size={12} color={colors.primary} />
                                  <Text style={styles.anonTagText}>Anon</Text>
                                </View>
                              )}
                            </View>

                            <View style={[styles.statusBadge, { backgroundColor: getStatusBg(uiStatus) }]}>
                              <Text style={[styles.statusBadgeText, { color: getStatusText(uiStatus) }]}>
                                {uiStatus}
                              </Text>
                            </View>
                          </View>

                          {appt.session_details ? (
                            <Text style={styles.sessionDetails} numberOfLines={2}>
                              {appt.session_details}
                            </Text>
                          ) : null}

                          {/* Quick Action Buttons for Pending Items */}
                          {isPending && (
                            <View style={styles.actionRow}>
                              <TouchableOpacity
                                style={styles.approveBtn}
                                activeOpacity={0.8}
                                onPress={() => handleStatus(appt._id, 'approved')}
                              >
                                <Text style={styles.approveBtnText}>Approve</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.declineBtn}
                                activeOpacity={0.8}
                                onPress={() => handleStatus(appt._id, 'cancelled')}
                              >
                                <Text style={styles.declineBtnText}>Decline</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

// Helper status colors using theme palette
const getStatusBg = (status: string) => {
  switch (status) {
    case 'upcoming': return palette.okBg;
    case 'active': return palette.activeBg;
    case 'pending': return palette.warnBg;
    case 'cancelled': return palette.cancelledBg;
    default: return palette.borderSoft;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'upcoming': return palette.okText;
    case 'active': return palette.activeText;
    case 'pending': return palette.warnText;
    case 'cancelled': return palette.cancelledText;
    default: return palette.textMuted;
  }
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
    marginHorizontal: -spacing.md,
    marginBottom: spacing.md,
  },
  dateStripContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  dateChip: {
    width: 52,
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
  emptySlotContainer: {
    height: 32,
    justifyContent: 'center',
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.border,
    position: 'absolute',
    left: -spacing.sm - 3,
    top: 6,
  },
  slotDashedLine: {
    height: 1,
    backgroundColor: palette.borderSoft,
    width: '100%',
  },
  apptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.xs,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  apptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  anonTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  anonTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs + 4,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  sessionDetails: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  approveBtnText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '700',
  },
  declineBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: palette.cancelledText,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  declineBtnText: {
    color: palette.cancelledText,
    fontSize: 12,
    fontWeight: '600',
  },
});