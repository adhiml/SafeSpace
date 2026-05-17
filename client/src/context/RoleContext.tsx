import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DEFAULT_PROFILES, ROLE_USER_IDS } from '../constants/roleUsers';
import { setActiveDemoUserId } from '../api/demoUserId';
import { AppRole, RoleProfile } from '../types';

interface RoleContextValue {
  role: AppRole | null;
  profile: RoleProfile | null;
  userId: string | null;
  setRole: (role: AppRole) => void;
  switchRole: (role: AppRole) => void;
  clearRole: () => void;
  updateProfile: (patch: Partial<RoleProfile>) => void;
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

  const updateProfile = useCallback((patch: Partial<RoleProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo(
    () => ({
      role,
      profile,
      userId: role ? ROLE_USER_IDS[role] : null,
      setRole,
      switchRole,
      clearRole,
      updateProfile,
      isCounsellor: role === 'counsellor',
      isStudent: role === 'student1' || role === 'student2',
    }),
    [role, profile, setRole, switchRole, clearRole, updateProfile]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
};
