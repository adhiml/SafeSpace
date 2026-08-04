import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/Card';
import { FloatingButton } from '../../components/FloatingButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { CollapsiblePreview } from '../../components/CollapsiblePreview';
import * as journalService from '../../services/journalService';
import { Journal, StudentStackParamList } from '../../types';
import { colors, spacing, radius } from '../../utils/theme';
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
    <ScreenContainer title="Journal" scroll={false} floatingAction={
      <FloatingButton
        onPress={() => navigation.navigate('JournalEditor', {})}
      />
    }>

      <FlatList
      style={{ flex: 1 }}
        data={journals}
        keyExtractor={(item) => item._id}
        scrollEnabled={true}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{flex: 1, marginRight: spacing.md}}>
                <Text style={styles.title}>{item.title}</Text></View>
              <View style={{ flexDirection: "row", columnGap: 5, alignItems: "center" }}>
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

            {/* Date */}
            <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>

            {/* Tags */}
            <View style={styles.tagsRow}>
              {item.tags?.map((tag) => (
                <Text key={tag} style={[styles.tag, styles.postTag]}>
                  {tag}
                </Text>
              ))}
            </View>

            {/* Preview */}
            <CollapsiblePreview>
              {(isExpanded) => (
                <>
                  <Text
                    numberOfLines={isExpanded ? undefined : 4}
                    style={styles.preview}
                  >
                    {item.content}
                  </Text>

                  {/* {isExpanded && item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.attachedImage} />
                  )} */}
                </>
              )}
            </CollapsiblePreview>
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
    textAlign: "justify",
    lineHeight: 20
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: "wrap",
    marginTop: 5,
    gap: 6,
  },
  postTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tag: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600"
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  date: { 
    fontSize: 13, 
    color: colors.textMuted, 
    fontWeight: "500", 
    marginTop: 5 
  },
  floatingButton: {
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    right: 30,
    elevation: 5, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});