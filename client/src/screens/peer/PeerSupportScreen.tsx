import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { Card } from "../../components/Card";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import * as peerService from "../../services/peerService";
import { PeerPost, User } from "../../types";
import { colors, radius, spacing } from "../../utils/theme";
import { tags } from "../../utils/constants";
import { formatDateTime } from "../../utils/date";
import { AppointmentCard } from "../../components/AppointmentCard";

const displayName = (user: User | string) =>
  typeof user === "object" ? user.anonymous_name || user.user_name : "Peer";

export const PeerSupportScreen: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [posts, setPosts] = useState<PeerPost[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const filteredPost =
    activeTag === null
      ? posts
      : posts.filter((post) => post.tags?.includes(activeTag));

  const load = async () => {
    const data = await peerService.getPosts();
    setPosts(data);
  };

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, []),
  );

  const submit = async () => {
    if (!content.trim()) return;
    try {
      setLoading(true);
      await peerService.createPost(content.trim(), selectedTags);
      setContent("");
      setSelectedTags([]);
      await load();
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  const meToo = async (id: string) => {
    try {
      await peerService.meTooPost(id);
      await load();
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed");
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <ScreenContainer title="Peer Support">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingVertical: 10 }}
      >
        {tags.map((tag, index) => {
          const isActive = tag === activeTag;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveTag(activeTag === tag ? null : tag)}
              style={styles.headerTag}
            >
              <Text
                style={[
                  styles.headerTagText,
                  isActive && styles.activeHeaderTagText,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <PrimaryButton
        label="New Post"
        onPress={() => setIsPanelOpen((prev) => !prev)}
      />
      {/* Foldable Post Write Up Section --- */}
      {isPanelOpen && (
        <Card>
          <Text style={styles.foldableHeading}>New Post Entry</Text>
          <TextInput
            label="Share your thoughts"
            value={content}
            onChangeText={setContent}
            mode="outlined"
            multiline
            style={styles.input}
          />

          <Text style={styles.foldableHeading}>Add Tags</Text>
          <View style={styles.chips}>
            {tags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[styles.chipText, isActive && styles.chipTextActive]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <PrimaryButton
            label={loading ? "Posting..." : "Post"}
            onPress={submit}
          />
        </Card>
      )}

      <FlatList
        data={filteredPost}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.author}>{displayName(item.user_id)}</Text>
            <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>
            {item.tags?.length > 0 && (
              <View style={styles.postTags}>
                {item.tags.map((tag) => (
                  <View key={tag} style={styles.postTag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={styles.body}>{item.content}</Text>
            <PrimaryButton
              label={`Me too (${item.me_too_count})`}
              onPress={() => meToo(item._id)}
              mode="outlined"
            />
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No posts yet. Be the first to share.</Text>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  input: { backgroundColor: "#ffffffc6", marginBottom: spacing.sm },
  author: {
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  postTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  postTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tagText: { fontSize: 11, color: colors.primary, fontWeight: "600" },
  body: { color: colors.text, lineHeight: 22, marginBottom: spacing.sm },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  date: { fontSize: 13, color: colors.primary, fontWeight: "600", marginBottom: 5 },
  // --- Header Tags Style ---
  headerTagText: { fontSize: 16 },
  activeHeaderTagText: { fontWeight: "bold" },
  headerTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 15,
    backgroundColor: "#ffffffc6",
  },
  // --- Foldable Panel Styles ---
  foldableHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
    marginVertical: 4,
  },
  foldableSub: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 12 },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  actionButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  halfBtn: {
    flex: 1,
  },
});
