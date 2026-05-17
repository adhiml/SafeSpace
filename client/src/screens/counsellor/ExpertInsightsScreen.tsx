import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as peerService from '../../services/peerService';
import { PeerPost, User } from '../../types';
import { colors, radius, spacing } from '../../utils/theme';

/** Counsellor peer-support channel — professional tips & resources */
export const ExpertInsightsScreen: React.FC = () => {
  const [posts, setPosts] = useState<PeerPost[]>([]);
  const [content, setContent] = useState('');

  const load = async () => {
    const all = await peerService.getPosts();
    setPosts(all.filter((p) => p.tags?.includes('expert') || p.tags?.includes('counsellor')));
  };

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [])
  );

  const submit = async () => {
    if (!content.trim()) return;
    try {
      await peerService.createPost(content.trim(), ['expert', 'counsellor']);
      setContent('');
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <ScreenContainer title="Expert Insights">
      <Card>
        <Text style={styles.hint}>Share professional guidance for the student community</Text>
        <TextInput mode="outlined" multiline value={content} onChangeText={setContent} style={styles.input} />
        <PrimaryButton label="Publish insight" onPress={submit} />
      </Card>
      <FlatList
        data={posts}
        keyExtractor={(i) => i._id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.author}>
              {typeof item.user_id === 'object' ? (item.user_id as User).user_name : 'Counsellor'}
            </Text>
            <Text>{item.content}</Text>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No expert posts yet.</Text>}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hint: { color: colors.textMuted, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface, marginBottom: spacing.sm },
  author: { fontWeight: '700', color: colors.secondary, marginBottom: spacing.xs },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.lg },
});
