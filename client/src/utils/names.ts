import { User } from '../types';

/** "22***@siswa.um.edu.my": enough to recognise the address without showing all of it. */
export const maskEmail = (email: string) => `${email.slice(0, 2)}***${email.slice(email.indexOf('@'))}`;

/** "Dr. Morgan Lee" for counsellors who have a title, plain name for everyone else. */
export const nameWithTitle = (user: Pick<User, 'user_name' | 'display_title'>) =>
  user.display_title ? `${user.display_title} ${user.user_name}` : user.user_name;
