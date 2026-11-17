import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { DEFAULT_PROFILES, ROLE_USER_IDS } from '../constants/roleUsers';
import { setActiveDemoUserId } from '../api/demoUserId';
import { loadToken, sessionHandlers, setToken } from '../api/session';
import * as authService from '../services/authService';
import * as userService from '../services/userService';
import { AppRole, RoleProfile } from '../types';

/** What the server stores, mapped onto the app's profile shape. */
const fromServer = (u: userService.UserProfileDto): Partial<RoleProfile> => ({
  user_name: u.user_name,
  anonymous_name: u.anonymous_name,
  email: u.email,
  gender: u.gender,
  faculty: u.faculty,
  year_of_study: u.year_of_study,
  specialization: u.specialization,
  displayTitle: u.display_title || undefined,
});

const profileFromServer = (u: userService.UserProfileDto): RoleProfile => ({
  userId: u._id,
  _id: u._id,
  role: u.role,
  ...fromServer(u),
} as RoleProfile);

// A real account is either a student or a counsellor. The AppRole values below are only used to
// say which of the two it is; the real identity is the signed-in user's id.
const roleForKind = (kind: 'student' | 'counsellor'): AppRole => (kind === 'counsellor' ? 'counsellor1' : 'student1');

/** The fields the profile screen can save, in the app's naming. */
export type ProfileFormValues = Partial<
  Pick<
    RoleProfile,
    'user_name' | 'anonymous_name' | 'gender' | 'faculty' | 'year_of_study' | 'specialization' | 'displayTitle'
  >
>;

interface RoleContextValue {
  role: AppRole | null;
  profile: RoleProfile | null;
  userId: string | null;
  /** Real (non-demo) signed-in account state: active, expired (read-only) or unverified. */
  account: authService.AccountInfo | null;
  /** True while the saved login is being checked at app start. */
  restoring: boolean;
  /** Development only: act as one of the seeded demo accounts. */
  setRole: (role: AppRole) => void;
  switchRole: (role: AppRole) => void;
  /** Called after a successful login or sign-up. */
  signIn: (result: authService.AuthResult) => Promise<void>;
  signOut: () => Promise<void>;
  /** Forget the login on this phone without telling the server (used after the account was deleted). */
  endSession: () => Promise<void>;
  /** Re-reads the account state (e.g. after verifying the email). */
  refreshAccount: () => Promise<void>;
  /** Saves profile text to the server so every screen and other users see it. Throws on validation errors. */
  saveProfile: (values: ProfileFormValues) => Promise<void>;
  isCounsellor: boolean;
  isStudent: boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<RoleProfile | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null); // set for real accounts only
  const [account, setAccount] = useState<authService.AccountInfo | null>(null);
  const [restoring, setRestoring] = useState(true);

  const clearSession = useCallback(() => {
    setRoleState(null);
    setProfile(null);
    setSessionUserId(null);
    setAccount(null);
  }, []);

  const applySignedInUser = useCallback((user: userService.UserProfileDto, info: authService.AccountInfo) => {
    setSessionUserId(user._id);
    setRoleState(roleForKind(user.role));
    setProfile(profileFromServer(user));
    setAccount(info);
  }, []);

  // ---- development role picker (seeded demo accounts, no login)
  const applyDemoRole = useCallback(
    (nextRole: AppRole) => {
      void setToken(null);
      setSessionUserId(null);
      setAccount(null);
      setRoleState(nextRole);
      setProfile({ ...DEFAULT_PROFILES[nextRole] });
      setActiveDemoUserId(ROLE_USER_IDS[nextRole]);
    },
    []
  );

  // ---- real accounts
  const signIn = useCallback(
    async (result: authService.AuthResult) => {
      await setToken(result.token);
      applySignedInUser(result.user, result.account);
    },
    [applySignedInUser]
  );

  const signOut = useCallback(async () => {
    try {
      await authService.logout(); // tells the server to forget this login
    } catch {
      // offline or already expired: signing out locally is still the right result
    }
    await setToken(null);
    clearSession();
  }, [clearSession]);

  const endSession = useCallback(async () => {
    await setToken(null);
    clearSession();
  }, [clearSession]);

  const refreshAccount = useCallback(async () => {
    try {
      const { user, account: info } = await authService.getSession();
      applySignedInUser(user, info);
    } catch {
      // ignore: a 401 is handled by the API client, a network error just leaves things as they are
    }
  }, [applySignedInUser]);

  // At app start: if a login is saved on this phone, check it with the server.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await loadToken();
      if (token) {
        try {
          const { user, account: info } = await authService.getSession();
          if (!cancelled) applySignedInUser(user, info);
        } catch {
          await setToken(null); // saved login is no longer valid
        }
      }
      if (!cancelled) setRestoring(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [applySignedInUser]);

  // The API client tells us when the server rejects our login or the account becomes read-only.
  useEffect(() => {
    sessionHandlers.onUnauthorized = () => {
      void setToken(null);
      clearSession();
    };
    sessionHandlers.onAccountBlocked = () => {
      void refreshAccount();
    };
  }, [clearSession, refreshAccount]);

  // Coming back to the app is when verification most likely changed.
  useEffect(() => {
    if (!sessionUserId) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshAccount();
    });
    return () => sub.remove();
  }, [sessionUserId, refreshAccount]);

  // Demo accounts: load the saved profile from the server so edits survive restarts.
  useEffect(() => {
    if (!role || sessionUserId) return;
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
  }, [role, sessionUserId]);

  const saveProfile = useCallback(async (values: ProfileFormValues) => {
    const user = await userService.updateMyProfile({
      user_name: values.user_name,
      anonymous_name: values.anonymous_name,
      gender: values.gender,
      faculty: values.faculty,
      year_of_study: values.year_of_study,
      specialization: values.specialization,
      display_title: values.displayTitle,
    });
    setProfile((prev) => (prev ? { ...prev, ...fromServer(user) } : prev));
  }, []);

  const value = useMemo(
    () => ({
      role,
      profile,
      userId: sessionUserId ?? (role ? ROLE_USER_IDS[role] : null),
      account,
      restoring,
      setRole: applyDemoRole,
      switchRole: applyDemoRole,
      signIn,
      signOut,
      endSession,
      refreshAccount,
      saveProfile,
      isCounsellor: role === 'counsellor1' || role === 'counsellor2',
      isStudent: role === 'student1' || role === 'student2',
    }),
    [role, profile, sessionUserId, account, restoring, applyDemoRole, signIn, signOut, endSession, refreshAccount, saveProfile]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
};
