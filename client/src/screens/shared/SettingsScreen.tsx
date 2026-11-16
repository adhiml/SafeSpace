import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Icon, List, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/Card';
import { InfoTip } from '../../components/InfoTip';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SwitchRoleModal } from '../../components/SwitchRoleModal';
import { getRoleLabel } from '../../constants/roleUsers';
import { useNotifications } from '../../context/NotificationContext';
import { useRole } from '../../context/RoleContext';
import { SharedStackParamList } from '../../types';
import { colors, palette, radius, spacing } from '../../utils/theme';

type NavigationProp = NativeStackNavigationProp<SharedStackParamList>;

const AI_PRIVACY_INFO =
  "Journal entries are analyzed by SafeSpace's own AI model, on our server, only when you switch it on for that entry. Peer posts are always analyzed. Only you can see the results, and you can correct any estimate. Nothing is sent to outside AI services.";

interface InfoRowProps {
  title: string;
  value: string;
  icon: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ title, value, icon }) => (
  <List.Item
    title={title}
    description={value}
    left={(props) => <List.Icon {...props} icon={icon} color={colors.secondary} />}
  />
);

export const SettingsScreen: React.FC = () => {
  const { role, profile, isCounsellor, switchRole, clearRole } = useRole();
  const { unreadCount } = useNotifications();
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  if (!role || !profile) return null;

  const displayName = isCounsellor
    ? `${profile.displayTitle || 'Dr.'} ${profile.user_name}`
    : profile.user_name;

  // Shown under the name; the faculty / specialization has its own row below.
  const roleTitle = isCounsellor ? 'Counsellor' : 'Student';

  const accountRows: InfoRowProps[] = [
    ...(!isCounsellor && profile.anonymous_name
      ? [{ title: 'Anonymous Name', value: profile.anonymous_name, icon: 'incognito' }]
      : []),
    ...(profile.gender ? [{ title: 'Gender', value: profile.gender, icon: 'gender-male-female' }] : []),
    {
      title: isCounsellor ? 'Specialization' : 'Faculty',
      value: (isCounsellor ? profile.specialization : profile.faculty) || (isCounsellor ? 'Counselling Specialist' : 'Not set'),
      icon: 'school-outline',
    },
  ];

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'You will return to the role selection screen.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: clearRole },
    ]);
  };

  return (
    <ScreenContainer title="Settings" hideHeaderActions scroll={false}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.avatarContainer}>
          <Avatar size={100} />
          <View style={styles.nameRow}>
            <Text style={styles.previewTitle} numberOfLines={1}>
              {displayName}
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Profile')}
              hitSlop={10}
              style={({ pressed }) => [styles.editIcon, pressed && styles.editIconPressed]}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
            >
              <Icon source="pencil-outline" size={16} color={colors.primary} />
            </Pressable>
          </View>
          <Text style={styles.previewSub}>{roleTitle}</Text>
        </View>

        {/* Account */}
        <Text style={styles.sectionHeader}>ACCOUNT INFORMATION</Text>
        <Card style={styles.sectionCard}>
          {accountRows.map((row, i) => (
            <React.Fragment key={row.title}>
              {i > 0 && <Divider />}
              <InfoRow {...row} />
            </React.Fragment>
          ))}
        </Card>

        {/* Notifications and privacy */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS & PRIVACY</Text>
        <Card style={styles.sectionCard}>
          <List.Item
            title="Notifications"
            description={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            onPress={() => navigation.navigate('Notifications')}
            left={(props) => <List.Icon {...props} icon="bell-outline" color={colors.secondary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.textMuted} />}
          />
          {!isCounsellor && (
            <>
              <Divider />
              <List.Item
                title="AI analysis & privacy"
                description="How your writing is analyzed"
                left={(props) => <List.Icon {...props} icon="shield-check-outline" color={colors.secondary} />}
                right={() => (
                  <View style={styles.infoRight}>
                    <InfoTip title="AI analysis & privacy" text={AI_PRIVACY_INFO} />
                  </View>
                )}
              />
            </>
          )}
        </Card>

        {/* Security */}
                  <Text style={styles.sectionHeader}>SECURITY</Text>
                  <Card style={styles.securityCard}>
                    <List.Item
                      title="Change password"
                      description="Use a strong password you don't use elsewhere"
                      onPress={() => navigation.navigate('ChangePassword')}
                      left={(props) => <List.Icon {...props} icon="lock-outline" color={colors.secondary} />}
                      right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.textMuted} />}
                    />
                  </Card>

        {/* Development only: never shown in a production build */}
        {__DEV__ && (
          <>
            <Text style={styles.sectionHeader}>DEVELOPER OPTIONS</Text>
            <Card style={styles.sectionCard}>
              <List.Item
                title="Current Role Environment"
                description={getRoleLabel(role)}
                onPress={() => setModalVisible(true)}
                left={(props) => <List.Icon {...props} icon="badge-account-outline" color={colors.secondary} />}
                right={() => (
                  <View style={styles.roleTag}>
                    <Text style={styles.roleTagText}>Switch Dev Role</Text>
                  </View>
                )}
              />
            </Card>

            <SwitchRoleModal
              visible={modalVisible}
              currentRole={role}
              onClose={() => setModalVisible(false)}
              onSelect={(r) => {
                setModalVisible(false);
                switchRole(r);
              }}
            />
          </>
        )}

        <Pressable
          onPress={confirmSignOut}
          style={styles.signOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  previewTitle: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  previewSub: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  infoRight: {
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
  roleTag: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'center',
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    maxWidth: '100%',
  },
  editIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  editIconPressed: { opacity: 0.7, transform: [{ scale: 0.92 }] },
  signOut: {
    marginTop: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.full,
    alignItems: 'center',
    backgroundColor: palette.cancelledBg,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.cancelledText,
  },
  securityCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
});
