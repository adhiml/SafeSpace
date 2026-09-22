import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, List, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SwitchRoleModal } from '../../components/SwitchRoleModal';
import { getRoleLabel } from '../../constants/roleUsers';
import { useRole } from '../../context/RoleContext';
import { AppRole, SharedStackParamList } from '../../types';
import { colors, palette, radius, spacing } from '../../utils/theme';
import { Avatar } from "../../components/Avatar";

interface SettingsScreenProps {
  onSwitchRole: (role: AppRole) => void;
}

type NavigationProp = NativeStackNavigationProp<SharedStackParamList>;

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onSwitchRole }) => {
  const { role, profile, isCounsellor } = useRole();
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  if (!role || !profile) return null;

  const displayName = isCounsellor
    ? `${profile.displayTitle || 'Dr.'} ${profile.user_name}`
    : profile.user_name;

  const subDetail = isCounsellor
    ? profile.specialization || 'Counseling Specialist'
    : profile.faculty || 'Student';

  // Get Initials for fallback avatar
  // const getInitials = (nameStr: string) => {
  //   return nameStr
  //     .split(' ')
  //     .map((part) => part[0])
  //     .join('')
  //     .substring(0, 2)
  //     .toUpperCase();
  // };

  return (
    <ScreenContainer title="Settings" hideHeaderActions scroll={false}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>


        <View style={styles.avatarContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatarFallback}>
              <Avatar uri={profile.profile_picture} size={100} />
            </View>
            <View style={styles.editBadge}>
              <List.Icon icon="account-edit-outline" color="colors.primary" />
            </View>
          </TouchableOpacity>
          <Text style={styles.previewTitle}>{displayName}</Text>
          <Text style={styles.previewSub}>{subDetail}</Text>
        </View>

        {/* 2. Account Details Section */}
        <Text style={styles.sectionHeader}>ACCOUNT INFORMATION</Text>
        <Card style={styles.sectionCard}>
          <Divider />
          {!isCounsellor && profile.anonymous_name ? (
            <>
              <List.Item
                title="Anonymous Name"
                description={profile.anonymous_name}
                left={(props) => <List.Icon {...props} icon="incognito" color={colors.secondary} />}
              />
              <Divider />
            </>
          ) : null}
          {profile.gender ? (
            <>
              <List.Item
                title="Gender"
                description={profile.gender}
                left={(props) => <List.Icon {...props} icon="gender-male-female" color={colors.secondary} />}
              />
              <Divider />
            </>
          ) : null}
          <List.Item
            title={isCounsellor ? 'Specialization' : 'Faculty'}
            description={subDetail}
            left={(props) => <List.Icon {...props} icon="school-outline" color={colors.secondary} />}
          />
        </Card>

        {/* 3. Dev / Switch Role Section */}
        <Text style={styles.sectionHeader}>DEVELOPER OPTIONS</Text>
        <Card style={styles.sectionCard}>
          <List.Item
            title="Current Role Environment"
            description={getRoleLabel(role)}
            left={(props) => <List.Icon {...props} icon="badge-account-outline" color={colors.secondary} />}
            right={() => (
              <View style={styles.roleTag}>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Text style={styles.roleTagText}>Switch Dev Role</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </Card>

        {/* Role Modal Component */}
        <SwitchRoleModal
          visible={modalVisible}
          currentRole={role}
          onClose={() => setModalVisible(false)}
          onSelect={(r) => {
            setModalVisible(false);
            onSwitchRole(r);
          }}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.lg,
  },
  profileHeaderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  previewSub: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  profileSub: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  profileEmail: {
    fontSize: 12,
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
  editBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 20,     // Circular shape (width / 2)
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.surfaceAlt,
    borderColor: palette.white,
    borderWidth: 2,
  },
});