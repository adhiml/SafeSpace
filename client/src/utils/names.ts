import { User } from '../types';

/** "Dr. Morgan Lee" for counsellors who have a title, plain name for everyone else. */
export const nameWithTitle = (user: Pick<User, 'user_name' | 'display_title'>) =>
  user.display_title ? `${user.display_title} ${user.user_name}` : user.user_name;
