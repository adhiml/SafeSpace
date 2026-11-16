import api from '../api/client';

export interface UserProfileDto {
  _id: string;
  user_name: string;
  anonymous_name?: string;
  email?: string;
  role: 'student' | 'counsellor';
  gender?: string;
  faculty?: string;
  specialization?: string;
  display_title?: string;
}

/** Fields a user may change. Email is read-only; students and counsellors each have their own set. */
export type ProfileEdits = Partial<
  Pick<UserProfileDto, 'user_name' | 'anonymous_name' | 'gender' | 'faculty' | 'specialization' | 'display_title'>
>;

export const getMyProfile = async () => {
  const { data } = await api.get<UserProfileDto>('/users/me');
  return data;
};

export const changePassword = async (current_password: string, new_password: string) => {
  const { data } = await api.post<{ message: string }>('/users/me/password', { current_password, new_password });
  return data;
};

export const updateMyProfile = async (edits: ProfileEdits) => {
  const { data } = await api.patch<UserProfileDto>('/users/me', edits);
  return data;
};
