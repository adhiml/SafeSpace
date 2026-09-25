import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Text, Icon } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Card } from "../../components/Card";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import * as peerService from "../../services/peerService";
import { PeerPost } from "../../types";
import { colors, palette, radius, spacing } from "../../utils/theme";
import { tags } from "../../utils/constants";
import { timeAgo } from "../../utils/date";
import { useRole } from "../../context/RoleContext";
import { FloatingButton } from "../../components/FloatingButton";

export const PeerSupportScreen: React.FC = () => {
  const { userId } = useRole();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [posts, setPosts] = useState<PeerPost[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
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

  const meToo = async (post: PeerPost) => {
    if (userId && post.me_too_users?.includes(userId)) return;
    try {
      await peerService.meTooPost(post._id);
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

  const isOwnPost = (post: PeerPost) => {
    const authorId =
      typeof post.user_id === "object" ? post.user_id._id : post.user_id;
    return !!userId && authorId === userId;
  };

  const toggleExpand = async (post: PeerPost) => {
    const isExpanding = !expandedIds.has(post._id);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(post._id)) {
        next.delete(post._id);
      } else {
        next.add(post._id);
      }
      return next;
    });

    if (isExpanding) {
      try {
        const updated = await peerService.viewPost(post._id);
        setPosts((prev) =>
          prev.map((p) =>
            p._id === post._id ? { ...p, views: updated.views } : p,
          ),
        );
      } catch {
        // view tracking is best-effort
      }
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete post?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await peerService.deletePost(id);
            setPosts((prev) => prev.filter((p) => p._id !== id));
          } catch (e) {
            Alert.alert(
              "Error",
              e instanceof Error ? e.message : "Failed to delete",
            );
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer title="peer support." floatingAction={
      <FloatingButton
        onPress={() => setIsPanelOpen((prev) => !prev)}
      />}>

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
              style={[styles.headerTag, isActive && styles.headerActiveTag]}
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


      {/* Foldable Post Write Up Section --- */}
      {isPanelOpen && (
        <Card style={styles.card}>
          <View style = {styles.sheetHeader}>
            <Text style={styles.fieldLabel}>New Post Entry</Text>
            <TouchableOpacity
              style={styles.sheetClose}
              onPress={() => setIsPanelOpen((prev) => !prev)}
            >
              <Icon source="close" size={16} color={palette.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.textAreaOutline}>
            <TextInput
              placeholder="Share your thoughts"
              placeholderTextColor={palette.textFaint}
              value={content}
              numberOfLines={2}
              onChangeText={setContent}
              multiline
              style={styles.textArea}
            />
          </View>

          <Text style={styles.fieldLabel}>Add Tags</Text>
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
        </Card>)}
      <FlatList
        data={filteredPost}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const expanded = expandedIds.has(item._id);
          const own = isOwnPost(item);
          const hasMeToo = !!userId && item.me_too_users?.includes(userId);
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => toggleExpand(item)}
            >
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.tagGroup}>
                    {item.tags?.slice(0, 2).map((tag) => (
                      <View key={tag} style={styles.badgeTag}>
                        <Text style={styles.badgeTagText}>{tag}</Text>
                      </View>
                    ))}
                    {own && (
                      <View style={styles.badgeYou}>
                        <Text style={styles.badgeYouText}>YOU</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.timestamp}>
                    {timeAgo(item.created_at)}
                  </Text>
                </View>

                <View style={styles.userProfileRow}>
                  <View style={styles.avatarCircle}>
                    <Ionicons
                      name="person"
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.userHandle}>@Anonymous Peer</Text>
                </View>

                <Text
                  style={[styles.preview, expanded && styles.expanded]}
                  numberOfLines={expanded ? undefined : 2}
                >
                  {item.content}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.viewsCount}>
                    <Ionicons
                      name="eye-outline"
                      size={14}
                      color={colors.textMuted}
                    />
                    <Text style={styles.viewsCountText}>
                      {item.views ?? 0} views
                    </Text>
                  </View>

                  <View style={styles.actionsGroup}>
                    {own && (
                      <TouchableOpacity
                        style={styles.btnDelete}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(item._id);
                        }}
                      >
                        <Text style={styles.btnDeleteText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.btnMeToo, hasMeToo && styles.btnMeTooActive]}
                      disabled={hasMeToo}
                      onPress={() => {
                        meToo(item);
                      }}
                    >
                      <Ionicons
                        name={hasMeToo ? "heart" : "heart-outline"}
                        size={13}
                        color={hasMeToo ? palette.white : colors.primary}
                      />
                      <Text
                        style={[
                          styles.btnMeTooText,
                          hasMeToo && styles.btnMeTooTextActive,
                        ]}
                      >
                        {item.me_too_count} Me too
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No posts yet. Be the first to share.</Text>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  input: { backgroundColor: "#ffffffc6", marginBottom: spacing.sm },
  empty:
  {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  // --- Header Tags Style ---
  headerTagText: { fontSize: 14 },
  activeHeaderTagText: {  color: "#fff", fontWeight: "600" },
  headerActiveTag: {
    backgroundColor: colors.primary, 
    borderColor: palette.surfaceAlt,
  },
  headerTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 15,
    backgroundColor: palette.surfaceAlt,
  },
  foldableHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
    marginVertical: 4,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: palette.surfaceAlt, },
  chipText: { color: colors.text, fontSize: 13 },
  chipTextActive: { color: "#fff", fontWeight: "600" },

  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.textSoft,
    marginBottom: 8,
    marginTop: spacing.sm,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetClose: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: palette.borderSoft,
  },
  textArea: {
    backgroundColor: palette.surfaceAlt,
    fontSize: 14,
    padding: 20,
    color: palette.text,
    borderRadius: 14,
    minHeight: 70,
    textAlignVertical: "top",
    marginVertical: spacing.sm,
  },
  textAreaOutline: { borderRadius: 14 },
  preview: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: "justify",
    lineHeight: 20
  },
  expanded: {
    color: colors.text,
  },

  // --- Post Card ---
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  tagGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
  badgeTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeTagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: colors.primary,
    textTransform: "uppercase",
  },
  badgeYou: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeYouText: { fontSize: 10, fontWeight: "700", color: colors.secondary },
  timestamp: { fontSize: 12, color: colors.textMuted },

  userProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.sm,
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  userHandle: { fontSize: 13, fontWeight: "700", color: colors.primary },

  body: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.surfaceAlt,
  },
  viewsCount: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewsCountText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  actionsGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnDelete: {
    backgroundColor: palette.dangerSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  btnDeleteText: {
    fontSize: 11,
    fontWeight: "700",
    color: palette.cancelledText,
  },
  btnMeToo: {
    backgroundColor: "#f7ddd6c4",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  btnMeTooActive: {
    backgroundColor: colors.primary,
  },
  btnMeTooText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  btnMeTooTextActive: { color: palette.white },
});
