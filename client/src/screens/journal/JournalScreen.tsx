import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as journalService from '../../services/journalService';
import { Journal, RootStackParamList } from '../../types';
import { colors, spacing } from '../../utils/theme';

export const JournalScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [journals, setJournals] = useState<Journal[]>([]);

  const load = async () => {
    const data = await journalService.getJournals();
    setJournals(data);
  };

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [])
  );

  const remove = (id: string) => {
    Alert.alert('Delete entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await journalService.deleteJournal(id);
          await load();
        },
      },
    ]);
  };

  return (
    <ScreenContainer title="Journal">
      <PrimaryButton label="New journal entry" onPress={() => navigation.navigate('JournalEditor', {})} />
      <FlatList
        data={journals}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('JournalEditor', { journalId: item._id })}>
            <Card>
              <Text style={styles.title}>{item.title}</Text>
              <Text numberOfLines={2} style={styles.preview}>{item.content}</Text>
              {item.is_sentiment_enabled && (
                <Text style={styles.sentiment}>Sentiment: {(item.sentiment_score * 100).toFixed(0)}%</Text>
              )}
              <PrimaryButton label="Delete" onPress={() => remove(item._id)} mode="text" color={colors.stressed} />
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Start journaling to track your thoughts.</Text>}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  preview: { color: colors.textMuted, marginTop: spacing.xs },
  sentiment: { marginTop: spacing.xs, color: colors.secondary, fontSize: 12 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.lg },
});
