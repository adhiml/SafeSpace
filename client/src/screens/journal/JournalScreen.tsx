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
import { Alert, FlatList, StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as journalService from '../../services/journalService';
import { Journal, StudentStackParamList } from '../../types';
import { colors, spacing } from '../../utils/theme';
import { formatDateTime } from "../../utils/date";

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
          <Card>
            <View style={{ flexDirection: "row", justifyContent:"space-between" , alignItems:"center"}}>
              <View>
                <Text style={styles.title}>{item.title}</Text></View>
              <View style={{ flexDirection: "row" , columnGap: 5, alignItems: "center"}}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('JournalEditor', { journalId: item._id })
                  }
                ><Image source={require('../../assets/icons/edit.png')}
                  style={{ width: 18, height: 18 }} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => remove(item._id)}
                ><Image source={require('../../assets/icons/trash.png')}
                  style={{ width: 18, height: 18 }} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>

            {/* Preview */}
            <Text numberOfLines={2} style={styles.preview}>
              {item.content}
            </Text>

            {/* Tags */}
            <View style={styles.tagsRow}>
              {item.tags?.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </Card>
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
  date: { fontSize: 13, color: colors.textMuted, fontWeight: "500", marginTop: 5 }
});