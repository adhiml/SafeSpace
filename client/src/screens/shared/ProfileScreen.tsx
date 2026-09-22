import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, TextInput, List } from 'react-native-paper';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRole } from '../../context/RoleContext';
import { colors, palette, radius, spacing } from '../../utils/theme';
import * as ImagePicker from 'expo-image-picker';

export const ProfileScreen: React.FC = () => {
  const { role, profile, isCounsellor, updateProfile } = useRole();

  if (!profile || !role) return null;

  // Local state to prevent premature context updates while typing
  const [userName, setUserName] = useState(profile.user_name || '');
  const [displayTitle, setDisplayTitle] = useState(profile.displayTitle || 'Dr.');
  const [specialization, setSpecialization] = useState(profile.specialization || '');
  const [anonymousName, setAnonymousName] = useState(profile.anonymous_name || '');
  const [gender, setGender] = useState(profile.gender || '');
  const [email, setEmail] = useState(profile.email || '');
  const [profilePicture, setProfilePicture] = useState(profile.profile_picture || '');
  // const [password, setPassword] = useState(profile.password || '');
  const [faculty, setFaculty] = useState(profile.faculty || '');

  const liveDisplayName = isCounsellor
    ? `${displayTitle || 'Dr.'} ${userName}`
    : userName;

  // const specialization = profile.specialization || (isCounsellor ? 'Counseling Specialist' : '');
  // const faculty = profile.faculty || (isCounsellor ? '' : 'Student');

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if(!result.canceled && result.assets?.length) {
      const selectedImageUri = result.assets[0].uri;
      updateProfile({ profile_picture: selectedImageUri });
    }
  };

  const handleSave = () => {
    if (isCounsellor) {
      updateProfile({
        user_name: userName,
        displayTitle,
        specialization,
        profile_picture: profile.profile_picture,
        gender: profile.gender,
        email: profile.email,
        anonymous_name: profile.anonymous_name,
      });
    } else {
      updateProfile({
        user_name: userName,
        profile_picture: profile.profile_picture,
        gender: profile.gender,
        email: profile.email,
        anonymous_name: anonymousName,
        faculty,
      });
    }
  };

  return (
    <ScreenContainer title="edit." scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Avatar Header Preview */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              handlePickImage();
              console.log('Avatar pressed');
            }}>
            <View style={styles.avatarFallback}>
              <Avatar uri={profile.profile_picture} size={100} />
            </View>
            <View style={styles.editBadge}>
              <List.Icon icon="account-edit-outline" color="colors.primary" />
            </View>
          </TouchableOpacity>
          <Text style={styles.previewTitle}>{liveDisplayName}</Text>
          <Text style={styles.previewSub}>
            {isCounsellor ? specialization || 'Counseling Specialist' : faculty || 'Student'}
          </Text>
        </View>

        {/* Profile Inputs Card */}
        <Card style={styles.card}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            mode="outlined"
            value={userName}
            onChangeText={setUserName}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          {isCounsellor ? (
            <>
              <Text style={styles.label}>Title</Text>
              <TextInput
                mode="outlined"
                value={displayTitle}
                onChangeText={setDisplayTitle}
                style={styles.input}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />

              <Text style={styles.label}>Specialization</Text>
              <TextInput
                mode="outlined"
                value={specialization}
                onChangeText={setSpecialization}
                style={styles.input}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Anonymous Name</Text>
              <TextInput
                mode="outlined"
                value={anonymousName}
                onChangeText={setAnonymousName}
                style={styles.input}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />

              <Text style={styles.label}>Gender</Text>
              <TextInput
                mode="outlined"
                value={gender}
                onChangeText={setGender}
                style={styles.input}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />

              <Text style={styles.label}>Faculty</Text>
              <TextInput
                mode="outlined"
                value={faculty}
                onChangeText={setFaculty}
                style={styles.input}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
            </>
          )}

          <Text style={styles.readOnlyLabel}>Email (Read-only)</Text>
          <TextInput
            mode="outlined"
            value={profile.email || ''}
            disabled
            style={[styles.input, styles.disabledInput]}
          />
        </Card>

        <PrimaryButton
          label="Save Changes"
          onPress={handleSave}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
    marginTop: spacing.sm,
  },
  readOnlyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    marginTop: spacing.xs,
  },
  disabledInput: {
    backgroundColor: colors.background,
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
    borderWidth: 1,
  },
})