import React, { useCallback, useMemo, useState } from "react";
import {Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View,} from "react-native";
import { Text, Icon } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenContainer } from "../../components/ScreenContainer";
import * as consultationService from "../../services/consultationService";
import { Appointment, StudentStackParamList, User } from "../../types";
import { FloatingButton } from '../../components/FloatingButton';
import { palette, spacing } from "../../utils/theme";
import { WEEKDAYS, MONTHS } from "../../utils/date";
import { Avatar } from "../../components/Avatar";
import { StatusFilter, STATUS_FILTERS, deriveStatus, statusStyles} from "../../constants/appointmentStatus";

interface Counsellor {
  id: string;
  name: string;
  initials?: string;
  title: string;
  profile_picture?: string;
}

const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16];

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

/** The five selectable days, starting today. */
const buildDateStrip = () => {
  const today = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
};

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
export const ConsultationScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  const dateStrip = useMemo(buildDateStrip, []);

  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(dateStrip[0]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  // Booking sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<Date>(dateStrip[0]);
  const [bookingHour, setBookingHour] = useState(9);
  const [bookingIsAnonymous, setBookingIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  /** Helper to map counsellor reference (string ID or populated User object) */
  const counsellorFor = useCallback(
    (ref: User | string): Counsellor => {
      if (typeof ref !== "string") {
        const specialization = (ref as User & { specialization?: string }).specialization;
        const initials = (ref as User & { initials?: string }).initials || ref.user_name
          ? ref.user_name
            .trim()
            .split(/\s+/)
            .map((word) => word[0]?.toUpperCase())
            .join("")
          : "";
        return {
          id: ref._id,
          name: ref.user_name,
          initials: initials,
          title: specialization || "Student Wellness Centre",
          profile_picture: ref.profile_picture,
        };
      }
      return (
        counsellors.find((c) => c.id === ref) ?? {
          id: ref,
          name: "Counsellor",
          title: "Student Wellness Centre",
        }
      );
    },
    [counsellors]
  );

  const load = async () => {
    try {
      const [appointmentsData, counsellorsData] = await Promise.all([
        consultationService.getAppointments(),
        consultationService.getCounsellors(), // Calls the service function!
      ]);

      setAppointments(appointmentsData);
      setCounsellors(counsellorsData);

      if (counsellorsData.length > 0 && !selectedCounsellorId) {
        setSelectedCounsellorId(counsellorsData[0].id);
      }
    } catch (error) {
      console.error('Failed to load consultation screen data:', error);
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

  const openSheet = () => {
    setBookingDate(selectedDate);
    setBookingHour(9);
    if (!selectedCounsellorId && counsellors.length > 0) {
      setSelectedCounsellorId(counsellors[0].id);
    }
    setSheetOpen(true);
  };

  const book = async () => {
    // if (!details.trim()) {
    //   Alert.alert(
    //     "Add some details",
    //     "Tell your counsellor what you would like to discuss.",
    //   );
    //   return;
    // }
    try {
      setLoading(true);
      const datetime = new Date(bookingDate);
      datetime.setHours(bookingHour, 0, 0, 0);

      await consultationService.createAppointment({
        counsellor_user_id: selectedCounsellorId,
        appointment_datetime: datetime.toISOString(),
        session_details: notes,
        is_anonymous: bookingIsAnonymous,
      });

      setNotes("");
      setSheetOpen(false);
      setSelectedDate(bookingDate);
      await load();
      Alert.alert("Request sent", "Your counsellor will confirm the slot.");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const openChat = (appointmentId: string, isAnonymous: boolean) => {
    navigation.navigate("Consult", {
      appointmentId,
      title: "Counselling Chat",
      isAnonymous,
    });
  };

  const filterLabel =
    STATUS_FILTERS.find((f) => f.key === statusFilter)?.label ?? "All Status";

  const cancelAppointment = async (id: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await consultationService.updateAppointmentStatus(id, 'cancelled');
              await load();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer title="consultation.">
      <Pressable
        style={styles.flex}
        onPress={() => filterOpen && setFilterOpen(false)}
      >
        <Text style={styles.subtitle}>Reflect on your emotional trends</Text>

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
                Nothing booked for this date.
              </Text>
              <Text style={styles.emptySub}>
                Tap the + button to request a session.
              </Text>
            </View>
          ) : (
            visible.map((item, index) => {
              const status = deriveStatus(item);
              const tone = statusStyles[status];
              const counsellor = counsellorFor(item.counsellor_user_id);
              const showAsAnon = item.is_anonymous;
              const start = new Date(item.appointment_datetime);

              return (
                <View key={item._id} style={styles.timelineRow}>
                  {/* Timeline rail */}
                  <View style={styles.rail}>
                    <View style={[styles.railDot, { backgroundColor: tone.dot }]} />
                    {index < visible.length - 1 && <View style={styles.railLine} />}
                  </View>

                  {/* Card */}
                  <View style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={[styles.badge, { backgroundColor: tone.bg }]}>
                        <Icon source={tone.icon} size={11} color={tone.text} />
                        <Text style={[styles.badgeText, { color: tone.text }]}>
                          {tone.label}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.identityTag,
                          {
                            backgroundColor: showAsAnon
                              ? palette.accentSoft
                              : palette.borderSoft,
                          },
                        ]}
                      >
                        <Icon
                          source={showAsAnon ? "shield-outline" : "account-outline"}
                          size={10}
                          color={showAsAnon ? palette.accentDark : palette.textSoft}
                        />
                        <Text
                          style={[
                            styles.identityText,
                            {
                              color: showAsAnon
                                ? palette.accentDark
                                : palette.textSoft,
                            },
                          ]}
                        >
                          {showAsAnon ? "Anonymous" : "Standard"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.counsellorRow}>
                      <View style={styles.avatar}>
                        <Avatar uri={counsellor.profile_picture} size={30} />
                      </View>
                      <View style={styles.flexShrink}>
                        <Text style={styles.counsellorName} numberOfLines={1}>
                          {counsellor.name}
                        </Text>
                        <Text style={styles.counsellorTitle} numberOfLines={1}>
                          {counsellor.title}
                        </Text>
                      </View>
                    </View>

                    {item.session_details?.trim() ? (
                      <View style={styles.notesBox}>
                        <Icon source="note-text-outline" size={12} color={palette.textFaint} />
                        <Text style={styles.notesText} numberOfLines={3}>
                          {item.session_details}
                        </Text>
                      </View>
                    ) : <View style={styles.notesBox}>
                        <Icon source="note-text-outline" size={12} color={palette.textFaint} />
                        <Text style={styles.notesText} numberOfLines={3}>
                          No notes provided.
                        </Text>
                      </View>}

                    <View style={styles.cardFooter}>
                      <View style={styles.timeRow}>
                        <Icon source="clock-outline" size={14} color={palette.accent} />
                        <Text style={styles.timeText}>
                          {slotLabel(start.getHours())}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", columnGap: 5, alignItems: "center" }}>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          activeOpacity={0.8}
                          onPress={() => cancelAppointment(item._id)}
                        >
                          <Icon
                            source="delete-outline"
                            size={15}
                            color={palette.accent}
                          />
                        </TouchableOpacity>
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
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </Pressable>

      {/* Floating action button */}
      <FloatingButton onPress={openSheet}></FloatingButton>

      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Book session</Text>
            <TouchableOpacity
              style={styles.sheetClose}
              onPress={() => setSheetOpen(false)}
            >
              <Icon source="close" size={16} color={palette.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>
              {counsellors.length > 1
                ? "Select counsellor"
                : "Your counsellor"}
            </Text>
            <View style={styles.counsellorList}>
              {counsellors.map((c) => {
                const active = c.id === selectedCounsellorId;
                return (
                  <TouchableOpacity
                    key={c.id}
                    activeOpacity={0.85}
                    onPress={() => setSelectedCounsellorId(c.id)}
                    style={[styles.optionRow, active && styles.optionRowActive]}
                  >
                    <View style={styles.flexShrink}>
                      <Text
                        style={[
                          styles.optionTitle,
                          active && styles.optionTitleActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                      <Text
                        style={[
                          styles.optionSub,
                          active && styles.optionSubActive,
                        ]}
                      >
                        {c.title}
                      </Text>
                    </View>
                    {active && (
                      <Icon source="check-circle" size={16} color={palette.white} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Select date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.sheetDateRow}
            >
              {dateStrip.map((date) => {
                const active = isSameDay(date, bookingDate);
                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    activeOpacity={0.85}
                    onPress={() => setBookingDate(date)}
                    style={[styles.sheetDate, active && styles.sheetDateActive]}
                  >
                    <Text
                      style={[
                        styles.sheetDateDay,
                        active && styles.sheetDateTextActive,
                      ]}
                    >
                      {WEEKDAYS[date.getDay()]}
                    </Text>
                    <Text
                      style={[
                        styles.sheetDateNum,
                        active && styles.sheetDateTextActive,
                      ]}
                    >
                      {MONTHS[date.getMonth()]} {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.fieldLabel}>
              Select a 1-hour slot (9:00 AM – 5:00 PM)
            </Text>
            <View style={styles.slotGrid}>
              {SLOT_HOURS.map((hour) => {
                const active = hour === bookingHour;
                return (
                  <TouchableOpacity
                    key={hour}
                    activeOpacity={0.85}
                    onPress={() => setBookingHour(hour)}
                    style={[styles.slot, active && styles.slotActive]}
                  >
                    <Text
                      style={[styles.slotText, active && styles.slotTextActive]}
                    >
                      {slotLabel(hour)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Booking identity</Text>
            <View style={styles.segment}>
              <TouchableOpacity
                style={[
                  styles.segmentItem,
                  bookingIsAnonymous && styles.segmentItemAnon,
                ]}
                onPress={() => setBookingIsAnonymous(true)}
              >
                <Icon
                  source="shield-outline"
                  size={14}
                  color={bookingIsAnonymous ? palette.white : palette.textSoft}
                />
                <Text
                  style={[
                    styles.segmentText,
                    bookingIsAnonymous && styles.segmentTextActive,
                  ]}
                >
                  Anonymous
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentItem,
                  !bookingIsAnonymous && styles.segmentItemStandard,
                ]}
                onPress={() => setBookingIsAnonymous(false)}
              >
                <Icon
                  source="account-outline"
                  size={14}
                  color={!bookingIsAnonymous ? palette.white : palette.textSoft}
                />
                <Text
                  style={[
                    styles.segmentText,
                    !bookingIsAnonymous && styles.segmentTextActive,
                  ]}
                >
                  Standard
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Session Notes (Optional)</Text>
            <View style={styles.textAreaOutline}>
              <TextInput
                style={[
                  styles.textArea,
                  { padding: 12, borderRadius: 14, minHeight: 70, textAlignVertical: "top" },
                ]}
                placeholder="Share anything; your concerns, topics to discuss, or questions for your counsellor."
                placeholderTextColor={palette.textFaint}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <TouchableOpacity
              style={[styles.submit, loading && styles.submitDisabled]}
              activeOpacity={0.9}
              disabled={loading}
              onPress={book}
            >
              <Text style={styles.submitText}>
                {loading ? "Sending…" : "Submit booking request"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

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

  anonBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: palette.accentWash,
    borderWidth: 1,
    borderColor: palette.accentSoft,
    borderRadius: 18,
    padding: 14,
  },
  anonLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10 },
  anonIcon: {
    padding: 8,
    backgroundColor: palette.accentSoft,
    borderRadius: 12,
  },
  anonTitle: { fontSize: 12, fontWeight: "700", color: palette.text },
  anonSub: { fontSize: 10, color: palette.textMuted, marginTop: 1 },

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  badgeText: { fontSize: 10, fontWeight: "800" },
  identityTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  identityText: { fontSize: 9, fontWeight: "800", textTransform: "uppercase" },

  counsellorRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: palette.surfaceAlt,
    resizeMode: "cover",
  },
  counsellorName: { fontSize: 13, fontWeight: "700", color: palette.text },
  counsellorTitle: { fontSize: 11, color: palette.textFaint, marginTop: 1 },

  notesBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  notesText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    color: palette.textSoft,
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

  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.action,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: palette.action,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    zIndex: 30,
  },

  backdrop: { flex: 1, backgroundColor: palette.overlay },
  sheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    maxHeight: "88%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: palette.text },
  sheetClose: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: palette.borderSoft,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.textSoft,
    marginBottom: 8,
    marginTop: spacing.sm,
  },

  counsellorList: { gap: 8 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 12,
  },
  optionRowActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  optionTitle: { fontSize: 13, fontWeight: "700", color: palette.textSoft },
  optionTitleActive: { color: palette.white },
  optionSub: { fontSize: 11, color: palette.textMuted, marginTop: 1 },
  optionSubActive: { color: palette.whiteMuted },

  sheetDateRow: { flexDirection: "row" },
  sheetDate: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
    marginRight: 8,
    alignItems: "center",
  },
  sheetDateActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  sheetDateDay: { fontSize: 10, color: palette.textMuted },
  sheetDateNum: { fontSize: 12, fontWeight: "700", color: palette.textSoft },
  sheetDateTextActive: { color: palette.white },

  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slot: {
    width: "48%",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: "center",
  },
  slotActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  slotText: { fontSize: 10, fontWeight: "600", color: palette.textSoft },
  slotTextActive: { color: palette.white },

  segment: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: palette.borderSoft,
    borderRadius: 14,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  segmentItemAnon: { backgroundColor: palette.accent },
  segmentItemStandard: { backgroundColor: palette.text },
  segmentText: { fontSize: 12, fontWeight: "600", color: palette.textSoft },
  segmentTextActive: { color: palette.white, fontWeight: "700" },

  textArea: { backgroundColor: palette.surfaceAlt, fontSize: 13 },
  textAreaOutline: { borderRadius: 14 },

  submit: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: palette.accent,
    alignItems: "center",
    shadowColor: palette.accent,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: palette.white, fontWeight: "700", fontSize: 13 },
})