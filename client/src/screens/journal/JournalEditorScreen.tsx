import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Switch, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as journalService from '../../services/journalService';
import { RootStackParamList } from '../../types';
import { colors, spacing } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'JournalEditor'>;

export const JournalEditorScreen: React.FC<Props> = ({ navigation, route }) => {
  const { journalId } = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sentiment, setSentiment] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!journalId) return;
    journalService.getJournals().then((list) => {
      const j = list.find((x) => x._id === journalId);
      if (j) {
        setTitle(j.title);
        setContent(j.content);
        setSentiment(j.is_sentiment_enabled);
      }
    });
  }, [journalId]);

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing fields', 'Title and content are required.');
      return;
    }
    try {
      setLoading(true);
      if (journalId) {
        await journalService.updateJournal(journalId, {
          title,
          content,
          is_sentiment_enabled: sentiment,
        });
      } else {
        await journalService.createJournal({
          title,
          content,
          is_sentiment_enabled: sentiment,
        });
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
      <TextInput label="Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
      <TextInput
        label="Content"
        value={content}
        onChangeText={setContent}
        mode="outlined"
        multiline
        numberOfLines={8}
        style={styles.input}
      />
      <Switch value={sentiment} onValueChange={setSentiment} />
      <PrimaryButton label="Save entry" onPress={save} loading={loading} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  input: { marginBottom: spacing.md, backgroundColor: colors.surface },
});
