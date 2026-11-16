import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity, TextInput, Switch } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { InfoTip } from '../../components/InfoTip';
import { StressReview, hasStressTag } from '../../components/stress/StressReview';
import * as journalService from '../../services/journalService';
import { Journal, StudentStackParamList } from '../../types';
import { colors, spacing, radius, palette } from '../../utils/theme';

type Props = NativeStackScreenProps<StudentStackParamList, 'JournalEditor'>;

export const JournalEditorScreen: React.FC<Props> = ({ navigation, route }) => {
  const { journalId } = route.params || {};

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false); // opt-in AI analysis for this journal
  const [saved, setSaved] = useState<Journal | null>(null); // set after save when analysis is shown

  // Load existing journal
  useEffect(() => {
    if (!journalId) return;

    journalService.getJournals().then((list) => {
      const j = list.find((x) => x._id === journalId);
      if (j) {
        setTitle(j.title);
        setContent(j.content);
        setTags(j.tags || []);
        setConsent(!!j.is_sentiment_enabled);
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
        is_sentiment_enabled: consent,
      };

      const result = journalId
        ? await journalService.updateJournal(journalId, payload)
        : await journalService.createJournal(payload);

      // Show the AI reading so the student can confirm or correct it; otherwise just leave.
      if (consent && hasStressTag(result.stress_analysis)) {
        setSaved(result);
      } else {
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <ScreenContainer title="entry saved.">
        <View style={styles.analysisCard}>
          <Text style={styles.analysisHeading}>How this entry reads</Text>
          <Text style={styles.analysisSub}>
            {saved.stress_analysis?.status === 'success'
              ? `Sentiment: ${saved.stress_analysis.sentiment}`
              : 'The AI is reading your entry. You can leave this page; the result will be waiting on your journal.'}
          </Text>
          <StressReview
            analysis={saved.stress_analysis}
            info="Only you can see this result."
            onRefresh={async () => {
              const list = await journalService.getJournals();
              const fresh = list.find((j) => j._id === saved._id);
              if (fresh) setSaved(fresh);
            }}
            onReview={async (action, score) => {
              const res = await journalService.reviewJournalStress(saved._id, action, score);
              setSaved(res.item);
            }}
          />
        </View>
        <PrimaryButton label="Done" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

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

      {/* Opt-in AI analysis */}
      <View style={styles.consentRow}>
        <View style={styles.consentLabel}>
          <Text style={styles.consentTitle}>Analyze this entry with AI</Text>
          <InfoTip
            title="Private AI analysis"
            text="Optional. Your entry is read by SafeSpace's own AI model running on our server. It is never sent to outside AI services. Only you can see the result, and you can correct it any time. Turn this off and nothing is analyzed."
          />
        </View>
        <Switch value={consent} onValueChange={setConsent} trackColor={{ true: colors.primary }} />
      </View>

      {/* Save */}
      <PrimaryButton label="Save entry" onPress={save} loading={loading} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  consentTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  consentLabel: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  analysisCard: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  analysisHeading: { fontSize: 16, fontWeight: '700', color: colors.text },
  analysisSub: { fontSize: 13, color: colors.textMuted },
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