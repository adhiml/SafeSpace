// Lists used by sign-up and the profile screen. The server keeps a matching copy in
// server/utils/options.js and rejects anything else, so change both together.
export const FACULTIES = [
  'Built Environment',
  'Languages and Linguistics',
  'Pharmacy',
  'Engineering',
  'Education',
  'Dentistry',
  'Business and Economics',
  'Medicine',
  'Science',
  'Computer Science and Information Technology',
  'Arts and Social Sciences',
  'Creative Arts',
  'Law',
  'Sport & Exercise Sciences',
];

export const YEARS_OF_STUDY = ['1', '2', '3', '4', '5', 'Postgraduate'];
export const GENDERS = ['Female', 'Male', 'Prefer not to say'];

export type UserKind = 'student' | 'counsellor';

/** The university email ending each kind of user must register with. */
export const EMAIL_DOMAIN: Record<UserKind, string> = {
  student: '@siswa.um.edu.my',
  counsellor: '@um.edu.my',
};
