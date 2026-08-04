import React, { useCallback, useState, useRef } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Text, TextInput, Switch, Surface } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppointmentCard } from "../../components/AppointmentCard";
import { Card } from "../../components/Card";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import * as consultationService from "../../services/consultationService";
import { Appointment, StudentStackParamList } from "../../types";
import { colors, spacing } from "../../utils/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Counsellor {
  id: string;
  name: string;
  title: string;
}

const AVAILABLE_COUNSELLORS: Counsellor[] = [
  {
    id: "counsellor_001",
    name: "Sarah Jenkins",
    title: "Mental Health Specialist",
  },
  {
    id: "counsellor_002",
    name: "Dr. Aaron Lim",
    title: "Academic & Stress Counselor",
  },
  {
    id: "counsellor_003",
    name: "Elena Rostova",
    title: "Crisis Interventionist",
  },
];

export const ConsultationScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const [activeIndex, setActiveIndex] = useState(0); // 0 = Chat Rooms, 1 = Book Session
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [details, setDetails] = useState("");
  const [selectedCounsellorId, setSelectedCounsellorId] =
    useState<string>("counsellor_001");
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const horizontalScrollRef = useRef<ScrollView>(null);

  const load = async () => {
    const data = await consultationService.getAppointments();
    setAppointments(data);
  };

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, []),
  );

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    horizontalScrollRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / SCREEN_WIDTH);
    if (
      currentIndex !== activeIndex &&
      currentIndex >= 0 &&
      currentIndex <= 1
    ) {
      setActiveIndex(currentIndex);
    }
  };

  const book = async () => {
    if (!details.trim()) {
      Alert.alert(
        "Required",
        "Please enter some details about what you would like to discuss.",
      );
      return;
    }
    try {
      setLoading(true);
      const datetime = new Date(Date.now() + 86400000).toISOString();
      await consultationService.createAppointment({
        counsellor_user_id: selectedCounsellorId,
        appointment_datetime: datetime,
        session_details: details,
        is_anonymous: anonymousMode,
      });
      setDetails("");
      await load();
      handleTabPress(0); // Smoothly slide back to chat rooms index
      Alert.alert("Requested", "Your appointment request has been sent.");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (appointmentId: string) => {
    navigation.navigate("Chat", {
      appointmentId,
      title: "Counselling Chat",
      isAnonymous: anonymousMode,
    });
  };

  const approved = appointments.filter(
    (a) => a.status === "approved" || a.status === "pending",
  );

  return (
    <ScreenContainer title="Consultation">
      {/* Top indicator header tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress(0)}
        >
          <Text
            style={[styles.tabText, activeIndex === 0 && styles.activeTabText]}
          >
            Chat Rooms
          </Text>
          <View
            style={[
              styles.indicator,
              activeIndex === 0 && styles.activeIndicator,
            ]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress(1)}
        >
          <Text
            style={[styles.tabText, activeIndex === 1 && styles.activeTabText]}
          >
            Book Session
          </Text>
          <View
            style={[
              styles.indicator,
              activeIndex === 1 && styles.activeIndicator,
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* Swipeable Viewport */}
      <ScrollView
        ref={horizontalScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.viewport}
      >
        {/* PAGE 1: CHAT ROOMS */}
        <View style={styles.pageWidth}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Surface style={styles.infoBanner} elevation={0}>
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchLabel}>
                    Global Anonymous Browsing
                  </Text>
                  <Text style={styles.hint}>
                    Hides real names in chat streams. Counselors see temporary
                    aliases instead.
                  </Text>
                </View>
                <Switch
                  value={anonymousMode}
                  onValueChange={setAnonymousMode}
                  color={colors.primary}
                />
              </View>
            </Surface>

            <Text style={styles.sectionHeading}>Active Chats</Text>

            <FlatList
              data={approved}
              keyExtractor={(i) => i._id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <AppointmentCard item={item} onOpenChat={handleOpenChat} />
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.muted}>No active sessions found.</Text>
                  <Text style={styles.mutedSub}>
                    Approved bookings appear here to access chat rooms.
                  </Text>
                </View>
              }
            />
          </ScrollView>
        </View>

        {/* PAGE 2: BOOKING COMPOSER */}
        <View style={styles.pageWidth}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Card style={styles.formCard}>
              <Text style={styles.label}>Book a Counselling Session</Text>
              <Text style={styles.description}>
                Select a counsellor and detail your concerns briefly below.
              </Text>

              <Text style={styles.selectLabel}>Choose a Counsellor</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.counsellorSelector}
              >
                {AVAILABLE_COUNSELLORS.map((counsellor) => {
                  const isSelected = selectedCounsellorId === counsellor.id;
                  return (
                    <TouchableOpacity
                      key={counsellor.id}
                      style={[
                        styles.counsellorCard,
                        isSelected && styles.selectedCounsellorCard,
                      ]}
                      onPress={() => setSelectedCounsellorId(counsellor.id)}
                    >
                      <Text
                        style={[
                          styles.counsellorName,
                          isSelected && styles.selectedCounsellorText,
                        ]}
                      >
                        {counsellor.name}
                      </Text>
                      <Text
                        style={[
                          styles.counsellorTitle,
                          isSelected && styles.selectedCounsellorSubtext,
                        ]}
                      >
                        {counsellor.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TextInput
                label="What is on your mind?"
                value={details}
                onChangeText={setDetails}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
                outlineColor="#E2E8F0"
                activeOutlineColor={colors.primary}
              />

              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchLabel}>Keep session anonymous</Text>
                  <Text style={styles.switchSublabel}>
                    Mask your student credentials from lists.
                  </Text>
                </View>
                <Switch
                  value={anonymousMode}
                  onValueChange={setAnonymousMode}
                  color={colors.primary}
                />
              </View>

              <PrimaryButton
                label="Submit Request"
                onPress={book}
                loading={loading}
              />
            </Card>
          </ScrollView>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    position: "relative",
  },
  tabText: { fontWeight: "600", color: '#ad9580', fontSize: 15 },
  activeTabText: { color: colors.primary },
  indicator: {
    position: "absolute",
    bottom: -1,
    left: "25%",
    right: "25%",
    height: 3,
    backgroundColor: "transparent",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  activeIndicator: {
    backgroundColor: colors.primary,
  },

  viewport: { flex: 1 },
  pageWidth: { width: SCREEN_WIDTH - spacing.md * 2 },

  formCard: { padding: spacing.md, borderRadius: 16, marginBottom: spacing.xl },
  label: { fontSize: 18, fontWeight: "700", color: "#1A202C", marginBottom: 4 },
  description: { fontSize: 13, color: "#718096", marginBottom: spacing.md },

  selectLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: spacing.xs,
  },
  counsellorSelector: { flexDirection: "row", marginBottom: spacing.md },
  counsellorCard: {
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: spacing.sm,
    marginRight: spacing.xs,
    width: 150,
  },
  selectedCounsellorCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  counsellorName: {
    fontWeight: "600",
    fontSize: 13,
    color: "#2D3748",
    marginBottom: 2,
  },
  counsellorTitle: { fontSize: 11, color: "#718096" },
  selectedCounsellorText: { color: "#FFFFFF" },
  selectedCounsellorSubtext: { color: "rgba(255, 255, 255, 0.8)" },

  input: { marginBottom: spacing.md, backgroundColor: "#FFFFFF" },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#F7FAFC",
    marginBottom: spacing.xs,
  },
  switchTextContainer: { flex: 1, marginRight: spacing.md },
  switchLabel: {
    fontWeight: "600",
    color: "#2D3748",
    fontSize: 14,
    marginBottom: 2,
  },
  switchSublabel: { fontSize: 12, color: "#718096" },

  infoBanner: {
    backgroundColor: "#ffffffc6",
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  hint: { fontSize: 12, color: "#4A5568", marginTop: 2, lineHeight: 16 },

  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: spacing.sm,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  muted: {
    color: "#4A5568",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 15,
  },
  mutedSub: {
    color: "#A0AEC0",
    textAlign: "center",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
});
