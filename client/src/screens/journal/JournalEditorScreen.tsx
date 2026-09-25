import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as journalService from '../../services/journalService';
import { StudentStackParamList } from '../../types';
import { colors, spacing, radius, palette } from '../../utils/theme';

type Props = NativeStackScreenProps<StudentStackParamList, 'JournalEditor'>;

export const JournalEditorScreen: React.FC<Props> = ({ navigation, route }) => {
  const { journalId } = route.params || {};

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing journal
  useEffect(() => {
    if (!journalId) return;

    journalService.getJournals().then((list) => {
      const j = list.find((x) => x._id === journalId);
      if (j) {
        setTitle(j.title);
        setContent(j.content);
        setTags(j.tags || []);
      }
    });
  }, [journalId]);

  // Add tag
  const addTag = () => {
    const cleaned = tagInput.trim().toLowerCase();

    if (!cleaned || tags.includes(cleaned)) return;

    setTags((prev) => [...prev, cleaned]);
    setTagInput('');
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // Save
  const save = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing fields', 'Title and content are required.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        content: content.trim(),
        tags,
      };

      if (journalId) {
        await journalService.updateJournal(journalId, payload);
      } else {
        await journalService.createJournal(payload);
      }

      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer title={journalId ? 'edit journal.' : 'new journal.'}>

      {/* Title */}
      <TextInput
        placeholder="Title"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
        style={styles.titleInput}
      />

      {/* Tags Input */}
      <View style={styles.tagInputRow}>
        <TextInput
          placeholder="Add tag"
          placeholderTextColor={colors.textMuted}
          value={tagInput}
          onChangeText={setTagInput}
          style={styles.tagInput}
          onSubmitEditing={addTag}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTag}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Tags Display */}
      <View style={styles.tagsContainer}>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => removeTag(tag)}
            style={styles.tag}
          >
            <Text style={styles.tagText}>#{tag} ✕</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <TextInput
        placeholder="Share your thoughts..."
        placeholderTextColor={colors.textMuted}
        value={content}
        onChangeText={setContent}
        multiline={true}
        style={styles.contentInput}
      />

      {/* Save */}
      <PrimaryButton label="Save entry" onPress={save} loading={loading} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  titleInput: {
    marginBottom: spacing.md,
    backgroundColor: palette.surfaceAlt,
    fontSize: 14,
    padding: 20,
    color: palette.text,
    borderRadius: 14,
    textAlignVertical: "top",
    marginVertical: spacing.sm,
  },
  contentInput: {
    marginBottom: spacing.md,
    backgroundColor: palette.surfaceAlt,
    fontSize: 14,
    padding: 20,
    color: palette.text,
    borderRadius: 14,
    textAlignVertical: "top",
    marginVertical: spacing.sm,
    minHeight: 400
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  addBtn: {
    width: 45,
    height: 45,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: spacing.sm,
  },

  tagInput: {
    flex: 1,
    marginBottom: spacing.md,
    backgroundColor: palette.surfaceAlt,
    fontSize: 14,
    padding: 20,
    color: palette.text,
    borderRadius: 14,
    textAlignVertical: "top",
    marginVertical: spacing.sm
  },

  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },

  tagText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 600,
  },
});