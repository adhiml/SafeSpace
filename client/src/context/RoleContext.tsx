import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PROFILES, ROLE_USER_IDS } from '../constants/roleUsers';
import { setActiveDemoUserId } from '../api/demoUserId';
import * as userService from '../services/userService';
import { AppRole, RoleProfile } from '../types';

/** What the server stores, mapped onto the app's profile shape. */
const fromServer = (u: userService.UserProfileDto): Partial<RoleProfile> => ({
  user_name: u.user_name,
  anonymous_name: u.anonymous_name,
  email: u.email,
  gender: u.gender,
  faculty: u.faculty,
  specialization: u.specialization,
  displayTitle: u.display_title || undefined,
});

/** The fields the profile screen can save, in the app's naming. */
export type ProfileFormValues = Partial<
  Pick<RoleProfile, 'user_name' | 'anonymous_name' | 'gender' | 'faculty' | 'specialization' | 'displayTitle'>
>;

interface RoleContextValue {
  role: AppRole | null;
  profile: RoleProfile | null;
  userId: string | null;
  setRole: (role: AppRole) => void;
  switchRole: (role: AppRole) => void;
  clearRole: () => void;
  /** Saves profile text to the server so every screen and other users see it. Throws on validation errors. */
  saveProfile: (values: ProfileFormValues) => Promise<void>;
  isCounsellor: boolean;
  isStudent: boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<RoleProfile | null>(null);

  const applyRole = useCallback((nextRole: AppRole) => {
    const base = { ...DEFAULT_PROFILES[nextRole] };
    setRoleState(nextRole);
    setProfile(base);
    setActiveDemoUserId(ROLE_USER_IDS[nextRole]);
  }, []);

  const setRole = useCallback(
    (nextRole: AppRole) => {
      applyRole(nextRole);
    },
    [applyRole]
  );

  const switchRole = useCallback(
    (nextRole: AppRole) => {
      applyRole(nextRole);
    },
    [applyRole]
  );

  const clearRole = useCallback(() => {
    setRoleState(null);
    setProfile(null);
  }, []);

  // The server is the source of truth: load the saved profile whenever a role is chosen,
  // so edits survive restarts and role switches (the defaults above are only a first paint).
  useEffect(() => {
    if (!role) return;
    let cancelled = false;
    userService
      .getMyProfile()
      .then((user) => {
        if (!cancelled) setProfile((prev) => (prev ? { ...prev, ...fromServer(user) } : prev));
      })
      .catch(() => undefined); // offline: keep the defaults
    return () => {
      cancelled = true;
    };
  }, [role]);

  const saveProfile = useCallback(async (values: ProfileFormValues) => {
    const user = await userService.updateMyProfile({
      user_name: values.user_name,
      anonymous_name: values.anonymous_name,
      gender: values.gender,
      faculty: values.faculty,
      specialization: values.specialization,
      display_title: values.displayTitle,
    });
    setProfile((prev) => (prev ? { ...prev, ...fromServer(user) } : prev));
  }, []);

  const value = useMemo(
    () => ({
      role,
      profile,
      userId: role ? ROLE_USER_IDS[role] : null,
      setRole,
      switchRole,
      clearRole,
      saveProfile,
      isCounsellor: role === 'counsellor1' || role === 'counsellor2',
      isStudent: role === 'student1' || role === 'student2',
    }),
    [role, profile, setRole, switchRole, clearRole, saveProfile]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
};
