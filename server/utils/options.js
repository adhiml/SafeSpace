// Values shared by sign-up, profile editing and validation. The app keeps a matching copy
// in client/src/constants/options.ts, so change both together.
const FACULTIES = [
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

const YEARS_OF_STUDY = ['1', '2', '3', '4', '5', 'Postgraduate'];
const GENDERS = ['Female', 'Male', 'Prefer not to say'];

// The "@" is part of the suffix on purpose: "x@siswa.um.edu.my" must not count as a counsellor
// address, and "x@fake-um.edu.my" must not pass.
const STUDENT_DOMAIN = '@siswa.um.edu.my';
const COUNSELLOR_DOMAIN = '@um.edu.my';

/** Which kind of user an email address belongs to, judging by its domain alone. */
const roleForEmail = (email) => {
  if (email.endsWith(STUDENT_DOMAIN)) return 'student';
  if (email.endsWith(COUNSELLOR_DOMAIN)) return 'counsellor';
  return null;
};

module.exports = { FACULTIES, YEARS_OF_STUDY, GENDERS, STUDENT_DOMAIN, COUNSELLOR_DOMAIN, roleForEmail };
