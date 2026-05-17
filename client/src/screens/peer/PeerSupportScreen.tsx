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

const displayName = (user: User | string) =>
  typeof user === 'object' ? user.anonymous_name || user.user_name : 'Peer';

export const PeerSupportScreen: React.FC = () => {
  const [posts, setPosts] = useState<PeerPost[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await peerService.getPosts();
    setPosts(data);
  };

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [])
  );

  const submit = async () => {
    if (!content.trim()) return;
    try {
      setLoading(true);
      await peerService.createPost(content.trim(), ['support', 'stress']);
      setContent('');
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  const meToo = async (id: string) => {
    try {
      await peerService.meTooPost(id);
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <ScreenContainer title="Peer Support">
      <Card>
        <TextInput
          label="Share with peers"
          value={content}
          onChangeText={setContent}
          mode="outlined"
          multiline
          style={styles.input}
        />
        <PrimaryButton label="Post" onPress={submit} loading={loading} />
      </Card>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.author}>{displayName(item.user_id)}</Text>
            {item.tags?.length > 0 && (
              <View style={styles.tags}>
                {item.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
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
        ListEmptyComponent={<Text style={styles.empty}>No posts yet. Be the first to share.</Text>}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  input: { backgroundColor: colors.surface, marginBottom: spacing.sm },
  author: { fontWeight: '700', color: colors.primary, marginBottom: spacing.xs },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tagText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  body: { color: colors.text, lineHeight: 22, marginBottom: spacing.sm },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.lg },
});
