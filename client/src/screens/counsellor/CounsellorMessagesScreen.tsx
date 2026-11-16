import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, Icon } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenContainer } from "../../components/ScreenContainer";
import * as consultationService from "../../services/consultationService";
import { Appointment, CounsellorStackParamList } from "../../types";
import { palette, spacing } from "../../utils/theme";
import { WEEKDAYS, nextWorkdays } from "../../utils/date";
import { StudentRequestCard } from "../../components/StudentRequestCard";
import { DevChatButton } from "../../components/DevChatButton";
import {
  StatusFilter,
  STATUS_FILTERS,
  deriveStatus,
  statusStyles,
} from "../../constants/appointmentStatus";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const hourLabel = (hour: number) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${suffix}`;
};

const slotLabel = (hour: number) => `${hourLabel(hour)} - ${hourLabel(hour + 1)}`;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** The next five selectable weekdays (Mon–Fri only), starting today. */
const buildDateStrip = () => nextWorkdays(5);

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
export const CounsellorMessagesScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<CounsellorStackParamList>>();

  const dateStrip = useMemo(buildDateStrip, []);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(dateStrip[0]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const load = async () => {
    try {
      const data = await consultationService.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, []),
  );

  const visible = useMemo(
    () =>
      appointments
        .filter((a) => isSameDay(new Date(a.appointment_datetime), selectedDate))
        .filter(
          (a) => statusFilter === "all" || deriveStatus(a) === statusFilter,
        )
        .sort(
          (a, b) =>
            new Date(a.appointment_datetime).getTime() -
            new Date(b.appointment_datetime).getTime(),
        ),
    [appointments, selectedDate, statusFilter],
  );

  const openChat = (appointmentId: string, isAnonymous: boolean) => {
    // This screen IS the "Consult" tab, so a plain navigate("Consult") would
    // just re-select this same tab. Go through the parent stack, which has
    // its own, separately-registered "Consult" screen pointing at ChatScreen.
    navigation.getParent()?.navigate("Consult", {
      appointmentId,
      title: "Counselling Chat",
      isAnonymous,
    });
  };

  const filterLabel =
    STATUS_FILTERS.find((f) => f.key === statusFilter)?.label ?? "All Status";

  const declineAppointment = async (id: string) => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await consultationService.updateAppointmentStatus(id, "cancelled");
              await load();
            } catch (error) {
              Alert.alert("Error", "Failed to cancel appointment");
            }
          },
        },
      ]
    );
  };

  const approveAppointment = async (id: string) => {
    try {
      await consultationService.updateAppointmentStatus(id, "approved");
      await load();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to approve appointment");
      await load(); // another request for this slot may have just been confirmed
    }
  };

  return (
    <ScreenContainer title="consultation." >
      <Pressable
        style={styles.flex}
        onPress={() => filterOpen && setFilterOpen(false)}
      >
        <Text style={styles.subtitle}>Manage your upcoming and pending sessions</Text>
        <DevChatButton
          onOpen={(appointmentId) =>
            navigation.getParent()?.navigate("Consult", { appointmentId, title: "Dev chatroom", isAnonymous: false })
          }
        />

        {/* Date strip */}
        <View style={styles.dateStrip}>
          {dateStrip.map((date) => {
            const active = isSameDay(date, selectedDate);
            return (
              <TouchableOpacity
                key={date.toISOString()}
                activeOpacity={0.85}
                onPress={() => setSelectedDate(date)}
                style={[styles.dateCell, active && styles.dateCellActive]}
              >
                <Text style={[styles.dateNum, active && styles.dateTextActive]}>
                  {date.getDate()}
                </Text>
                <Text style={[styles.dateDay, active && styles.dateTextActive]}>
                  {WEEKDAYS[date.getDay()]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section header + status filter */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Consultations</Text>
          <View>
            <TouchableOpacity
              style={styles.filterButton}
              activeOpacity={0.8}
              onPress={() => setFilterOpen((o) => !o)}
            >
              <Text style={styles.filterButtonText}>{filterLabel}</Text>
              <Icon source="chevron-down" size={14} color={palette.textSoft} />
            </TouchableOpacity>

            {filterOpen && (
              <View style={styles.dropdown}>
                {STATUS_FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setStatusFilter(f.key);
                      setFilterOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownText, { color: f.color }]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Timeline */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {visible.length === 0 ? (
            <View style={styles.empty}>
              <Icon source="calendar-remove-outline" size={32} color={palette.pastDot} />
              <Text style={styles.emptyText}>
                Nothing scheduled for this date.
              </Text>
              <Text style={styles.emptySub}>
                New requests will appear here.
              </Text>
            </View>
          ) : (
            visible.map((item, index) => {
              const status = deriveStatus(item);
              const tone = statusStyles[status];
              const isPending = item.status === "pending";
              const start = new Date(item.appointment_datetime);

              return (
                <View key={item._id} style={styles.timelineRow}>
                  {/* Timeline rail */}
                  <View style={styles.rail}>
                    <View style={[styles.railDot, { backgroundColor: tone.dot }]} />
                    {index < visible.length - 1 && <View style={styles.railLine} />}
                  </View>

                  {/* Card */}
                  <StudentRequestCard item={item}>
                    {isPending && (
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.approveBtn}
                          activeOpacity={0.85}
                          onPress={() => approveAppointment(item._id)}
                        >
                          <Text style={styles.approveBtnText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.declineBtn}
                          activeOpacity={0.85}
                          onPress={() => declineAppointment(item._id)}
                        >
                          <Text style={styles.declineBtnText}>Decline</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <View style={styles.cardFooter}>
                      <View style={styles.timeRow}>
                        <Icon source="clock-outline" size={14} color={palette.accent} />
                        <Text style={styles.timeText}>
                          {slotLabel(start.getHours())}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", columnGap: 5, alignItems: "center" }}>
                        {!isPending && (
                          <TouchableOpacity
                            style={styles.deleteButton}
                            activeOpacity={0.8}
                            onPress={() => declineAppointment(item._id)}
                          >
                            <Icon
                              source="delete-outline"
                              size={15}
                              color={palette.accent}
                            />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={styles.chatButton}
                          activeOpacity={0.8}
                          onPress={() => openChat(item._id, item.is_anonymous)}
                        >
                          <Icon
                            source="message-text-outline"
                            size={14}
                            color={palette.accent}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </StudentRequestCard>
                </View>
              );
            })
          )}
        </ScrollView>
      </Pressable>
    </ScreenContainer>
  );
};

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexShrink: { flex: 1 },

  subtitle: {
    fontSize: 12,
    color: palette.textFaint,
  },

  dateStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginVertical: spacing.lg,
  },
  dateCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.borderSoft,
  },
  dateCellActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
    shadowColor: palette.accent,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  dateNum: { fontSize: 16, fontWeight: "700", color: palette.textSoft },
  dateDay: { fontSize: 11, color: palette.textMuted, marginTop: 2 },
  dateTextActive: { color: palette.white },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: palette.borderSoft,
    paddingBottom: 8,
    marginBottom: spacing.sm,
    zIndex: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: palette.textFaint,
    textTransform: "uppercase",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: palette.borderSoft,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.textSoft,
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: 34,
    width: 140,
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    paddingVertical: 4,
    shadowColor: palette.shadowStrong,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    zIndex: 50,
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 8 },
  dropdownText: { fontSize: 12, fontWeight: "700" },

  listContent: { paddingBottom: 96 },

  timelineRow: { flexDirection: "row", gap: 12 },
  rail: { alignItems: "center", paddingTop: 10, width: 14 },
  railDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: palette.white,
  },
  railLine: {
    flex: 1,
    width: 2,
    backgroundColor: palette.borderSoft,
    marginVertical: 4,
  },




  actionRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: palette.action,
    paddingVertical: spacing.xs + 2,
    borderRadius: 10,
    alignItems: "center",
  },
  approveBtnText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: "700",
  },
  declineBtn: {
    flex: 1,
    backgroundColor: palette.cancelledBg,
    paddingVertical: spacing.xs + 2,
    borderRadius: 10,
    alignItems: "center",
  },
  declineBtnText: {
    color: palette.cancelledText,
    fontSize: 12,
    fontWeight: "700",
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.surfaceAlt,
  },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  timeText: { fontSize: 11, fontWeight: "600", color: palette.textSoft },
  chatButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: palette.accentWash,
  },
  deleteButton: {
    padding: 7,
    borderRadius: 12,
    backgroundColor: palette.dangerSoft,
  },

  empty: { alignItems: "center", paddingVertical: 48, gap: 6 },
  emptyText: { fontSize: 13, fontWeight: "600", color: palette.textFaint },
  emptySub: { fontSize: 11, color: palette.textFaint },
});
