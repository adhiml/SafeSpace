// import React, { useCallback, useState } from 'react';
// import { Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
// import { Text } from 'react-native-paper';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { Card } from '../../components/Card';
// import { PrimaryButton } from '../../components/PrimaryButton';
// import { ScreenContainer } from '../../components/ScreenContainer';
// import * as journalService from '../../services/journalService';
// import { Journal, StudentStackParamList } from '../../types';
// import { colors, spacing } from '../../utils/theme';

// export const JournalScreen: React.FC = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
//   const [journals, setJournals] = useState<Journal[]>([]);

//   const load = async () => {
//     const data = await journalService.getJournals();
//     setJournals(data);
//   };

//   useFocusEffect(
//     useCallback(() => {
//       load().catch(() => undefined);
//     }, [])
//   );

//   const remove = (id: string) => {
//     Alert.alert('Delete entry', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           await journalService.deleteJournal(id);
//           await load();
//         },
//       },
//     ]);
//   };

//   return (
//     <ScreenContainer title="Journal">
//       <PrimaryButton label="New journal entry" onPress={() => navigation.navigate('JournalEditor', {})} />
//       <FlatList
//         data={journals}
//         keyExtractor={(item) => item._id}
//         scrollEnabled={false}
//         renderItem={({ item }) => (
//           <TouchableOpacity onPress={() => navigation.navigate('JournalEditor', { journalId: item._id })}>
//             <Card>
//               <Text style={styles.title}>{item.title}</Text>
//               <Text numberOfLines={2} style={styles.preview}>{item.content}</Text>
//               <PrimaryButton label="Delete" onPress={() => remove(item._id)} mode="text" color={colors.stressed} />
//             </Card>
//           </TouchableOpacity>
//         )}
//         ListEmptyComponent={<Text style={styles.empty}>Start journaling to track your thoughts.</Text>}
//       />
//     </ScreenContainer>
//   );
// };

// const styles = StyleSheet.create({
//   title: { fontSize: 16, fontWeight: '700', color: colors.text },
//   preview: { color: colors.textMuted, marginTop: spacing.xs },
//   empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.lg },
// });

import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as journalService from '../../services/journalService';
import { Journal, StudentStackParamList } from '../../types';
import { colors, spacing } from '../../utils/theme';
// import { 
//   Plus,
//   Save,
//   BookOpen,
//   Heart,
//   Brain,
//   Zap,
//   Moon,
//   Smile,
//   X,
//   Search,
//   Calendar,
//   Tag
// } from 'lucide-react-native';

// const predefinedTags = [
//   { name: 'gratitude', icon: Heart, color: 'bg-pink-100 text-pink-700' },
//   { name: 'stress', icon: Zap, color: 'bg-red-100 text-red-700' },
//   { name: 'sleep', icon: Moon, color: 'bg-purple-100 text-purple-700' },
//   { name: 'work', icon: Brain, color: 'bg-blue-100 text-blue-700' },
//   { name: 'relationships', icon: Smile, color: 'bg-green-100 text-green-700' },
//   { name: 'health', icon: Heart, color: 'bg-orange-100 text-orange-700' }
// ];

export const JournalScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
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

      <PrimaryButton
        label="New journal entry"
        onPress={() => navigation.navigate('JournalEditor', {})}
      />

      <FlatList
        data={journals}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('JournalEditor', { journalId: item._id })
            }
          >
            <Card>

              {/* Title */}
              <Text style={styles.title}>{item.title}</Text>

              {/* Preview */}
              <Text numberOfLines={2} style={styles.preview}>
                {item.content}
              </Text>

              {/* Tags */}
              <View style={styles.tagsRow}>
                {item.tags?.map((tag) => (
                  <Text key={tag} style={styles.tag}>
                    #{tag}
                  </Text>
                ))}
              </View>

              {/* Delete */}
              <PrimaryButton
                label="Delete"
                onPress={() => remove(item._id)}
                mode="text"
                color={colors.stressed}
              />
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Start journaling to track your thoughts.
          </Text>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  preview: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    gap: 6,
  },

  tag: {
    fontSize: 12,
    color: colors.primary,
  },

  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});