import { AppRole, RoleProfile } from '../types';

export const ROLE_USER_IDS: Record<AppRole, string> = {
  counsellor: 'counsellor_001',
  student1: 'user_001',
  student2: 'user_002',
};

export const DEFAULT_PROFILES: Record<AppRole, RoleProfile> = {
  counsellor: {
    userId: 'counsellor_001',
    user_name: 'Morgan Lee',
    displayTitle: 'Dr.',
    specialization: 'Academic stress & anxiety',
    faculty: 'Student Wellness Centre',
    profile_picture: '',
  },
  student1: {
    userId: 'user_001',
    user_name: 'Jamie Chen',
    anonymous_name: 'Anonymous2048',
    faculty: 'Computer Science',
    profile_picture: '',
  },
  student2: {
    userId: 'user_002',
    user_name: 'Sam Rivera',
    anonymous_name: 'Anonymous7312',
    faculty: 'Psychology',
    profile_picture: '',
  },
};

export const isStudentRole = (role: AppRole | null): role is 'student1' | 'student2' =>
  role === 'student1' || role === 'student2';

export const getRoleLabel = (role: AppRole): string => {
  switch (role) {
    case 'counsellor':
      return 'Counsellor View';
    case 'student1':
      return 'Student 1 View';
    case 'student2':
      return 'Student 2 View';
  }
};
