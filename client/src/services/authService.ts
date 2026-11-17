import api from '../api/client';
import { UserProfileDto } from './userService';

export interface AccountInfo {
  state: 'active' | 'expired' | 'unverified';
  verified_until: string | null;
  days_left: number | null; // days until the verification runs out
  renew_soon: boolean; // true during the last two weeks, when renewing early is offered
}

export interface AuthResult {
  token: string;
  user: UserProfileDto;
  account: AccountInfo;
}

/** What the sign-up form sends. Students and counsellors fill in different fields. */
export interface RegisterPayload {
  email: string;
  password: string;
  user_name: string;
  gender: string;
  anonymous_name?: string;
  faculty?: string;
  year_of_study?: string;
  specialization?: string;
}

// The new user is always signed in. If email verification is required they simply land on the
// "enter your code" screen, because their account state is "unverified".
export const register = async (payload: RegisterPayload) => {
  const { data } = await api.post<AuthResult>('/auth/register', payload);
  return data;
};

export const login = async (email: string, password: string) => {
  const { data } = await api.post<AuthResult>('/auth/login', { email, password });
  return data;
};

export const getSession = async () => {
  const { data } = await api.get<{ user: UserProfileDto; account: AccountInfo }>('/auth/me');
  return data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

/** Permanently deletes the account and all its data. The password confirms it is really the owner. */
export const deleteAccount = async (password: string) => {
  const { data } = await api.delete<{ message: string }>('/auth/me', { data: { password } });
  return data;
};

export interface CodeSent {
  message: string; // e.g. "We sent a code to 22***@siswa.um.edu.my."
  expires_in_minutes: number;
  resend_after_seconds: number;
}

/** Emails a 6-digit verification code to the signed-in user. */
export const sendCode = async () => {
  const { data } = await api.post<CodeSent>('/auth/send-code');
  return data;
};

/** Checks the code. Throws with the server's message (wrong code, expired, too many tries...). */
export const verifyCode = async (code: string) => {
  const { data } = await api.post<{ user: UserProfileDto; account: AccountInfo }>('/auth/verify', { code });
  return data;
};

export interface NotificationSettings {
  mood_checkin: boolean;
  approval: boolean;
  messages: boolean;
  appointment_reminder: boolean;
  recommendation_feedback: boolean;
  new_requests: boolean;
}

export const getNotificationSettings = async () => {
  const { data } = await api.get<NotificationSettings>('/users/me/notification-settings');
  return data;
};

export const updateNotificationSettings = async (patch: Partial<NotificationSettings>) => {
  const { data } = await api.patch<NotificationSettings>('/users/me/notification-settings', patch);
  return data;
};
