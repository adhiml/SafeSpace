// import React, { useEffect, useState } from 'react';
// import { Alert, StyleSheet } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { PrimaryButton } from '../../components/PrimaryButton';
// import { ScreenContainer } from '../../components/ScreenContainer';
// import * as journalService from '../../services/journalService';
// import { StudentStackParamList } from '../../types';
// import { colors, spacing } from '../../utils/theme';

// type Props = NativeStackScreenProps<StudentStackParamList, 'JournalEditor'>;

// export const JournalEditorScreen: React.FC<Props> = ({ navigation, route }) => {
//   const { journalId } = route.params;
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!journalId) return;
//     journalService.getJournals().then((list) => {
//       const j = list.find((x) => x._id === journalId);
//       if (j) {
//         setTitle(j.title);
//         setContent(j.content);
//       }
//     });
//   }, [journalId]);

//   const save = async () => {
//     if (!title.trim() || !content.trim()) {
//       Alert.alert('Missing fields', 'Title and content are required.');
//       return;
//     }
//     try {
//       setLoading(true);
//       if (journalId) {
//         await journalService.updateJournal(journalId, { title, content });
//       } else {
//         await journalService.createJournal({ title, content });
//       }
//       navigation.goBack();
//     } catch (e) {
//       Alert.alert('Error', e instanceof Error ? e.message : 'Save failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScreenContainer title={journalId ? 'Edit Journal' : 'New Journal'}>
//       <TextInput label="Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
//       <TextInput
//         label="Content"
//         value={content}
//         onChangeText={setContent}
//         mode="outlined"
//         multiline
//         numberOfLines={8}
//         style={styles.input}
//       />
//       <PrimaryButton label="Save entry" onPress={save} loading={loading} />
//     </ScreenContainer>
//   );
// };

// const styles = StyleSheet.create({
//   input: { marginBottom: spacing.md, backgroundColor: colors.surface },
// });

import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as journalService from '../../services/journalService';
import { StudentStackParamList } from '../../types';
import { colors, spacing } from '../../utils/theme';

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
    <ScreenContainer title={journalId ? 'Edit Journal' : 'New Journal'}>
      
      {/* Title */}
      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
      />

      {/* Content */}
      <TextInput
        label="Content"
        value={content}
        onChangeText={setContent}
        mode="outlined"
        multiline
        numberOfLines={8}
        style={styles.input}
      />

      {/* Tags Input */}
      <View style={styles.tagInputRow}>
        <TextInput
          label="Add tag"
          value={tagInput}
          onChangeText={setTagInput}
          mode="outlined"
          style={{ flex: 1 }}
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

      {/* Save */}
      <PrimaryButton label="Save entry" onPress={save} loading={loading} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },

  tagInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
  },

  tag: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  tagText: {
    fontSize: 12,
    color: colors.text,
  },
});