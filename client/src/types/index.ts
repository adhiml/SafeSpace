// handles backend data
export type AppRole = 'counsellor' | 'student1' | 'student2';

export type UserRole = 'student' | 'counsellor';

export interface RoleProfile {
  userId: string;
  user_name: string;
  anonymous_name?: string;
  faculty?: string;
  profile_picture?: string;
  displayTitle?: string;
  specialization?: string;
}

export interface User {
  _id: string;
  user_name: string;
  anonymous_name?: string;
  email?: string;
  role: UserRole;
  profile_picture?: string;
  gender?: string;
  faculty?: string;
  created_at?: string;
}

export interface MoodEntry {
  _id: string;
  user_id: string;
  mood_level: number;
  stress_level: number;
  stress_causes: string[];
  created_at: string;
}

export interface MoodAnalytics {
  trend: {
    date: string;
    mood: number;
    stress: number;
    causes: Record<string, number>;
  }[];
  weekly: {
    weekStart: string;
    avgMood: number;
    avgStress: number;
    causes: Record<string, number>;
  }[];
  monthly: {
    month: string;
    avgMood: number;
    avgStress: number;
    causes: Record<string, number>;
  }[];
}

// export interface CounsellorAnalytics {
//   studentCount: number;
//   totalEntries: number;
//   averages: { mood: number; stress: number };
//   topStressCauses: { cause: string; count: number }[];
//   studentWellbeing: {
//     studentId: string;
//     entryCount: number;
//     avgStress: number;
//     avgMood: number;
//   }[];
//   trend: { date: string; mood_level: number; stress_level: number }[];
// }

export interface CounsellorAnalytics {
  studentCount: number;
  totalEntries: number;
  daily: {
    date: string;
    mood: number;
    stress: number;
    causes: Record<string, number>;
  }[];
  weekly: {
    weekStart: string;
    avgMood: number;
    avgStress: number;
    causes: Record<string, number>;
  }[];
  monthly: {
    month: string;
    avgMood: number;
    avgStress: number;
    causes: Record<string, number>;
  }[];
}

export interface Journal {
  _id: string;
  user_id: string;
  title: string;
  content: string;
  is_sentiment_enabled: boolean;
  sentiment_score: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PeerPost {
  _id: string;
  user_id: User | string;
  content: string;
  sentiment_score: number;
  tags: string[];
  me_too_count: number;
  created_at?: string;
}

export interface PeerComment {
  _id: string;
  post_id: string;
  user_id: User | string;
  content: string;
  created_at: string;
}

export interface Appointment {
  _id: string;
  student_user_id: User | string;
  counsellor_user_id: User | string;
  appointment_datetime: string;
  session_details: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  is_anonymous: boolean;
  created_at: string;
}

export interface ChatMessage {
  _id: string;
  appointment_id: string;
  sender_id: User | string;
  message: string;
  sent_at: string;
}

export interface Notification {
  _id: string;
  user_id: string;
  appointment_id?: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export type MoodLabel = 'Stressed' | 'Anxious' | 'Calm' | 'Okay' | 'Happy';

export type StudentTabParamList = {
  Home: undefined;
  PeerSupport: undefined;
  Journal: undefined;
  Consultation: undefined;
  Insights: undefined;
};

export type CounsellorTabParamList = {
  Home: undefined;
  ExpertInsights: undefined;
  Chat: undefined;
  Insights: undefined;
};

export type StudentStackParamList = {
  StudentTabs: undefined;
  Settings: undefined;
  Profile: undefined;
  Notifications: undefined;
  MoodCheckIn: undefined;
  StressCauses: { moodLevel: number; stressLevel: number };
  JournalEditor: { journalId?: string };
  Chat: { appointmentId: string; title: string; isAnonymous?: boolean };
};

export type CounsellorStackParamList = {
  CounsellorTabs: undefined;
  Settings: undefined;
  Profile: undefined;
  Notifications: undefined;
  Chat: { appointmentId: string; title: string; isAnonymous?: boolean };
};

export type SharedStackParamList = {
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Chat: { appointmentId: string; title: string; isAnonymous?: boolean };
};

export type RootStackParamList = {
  RoleSelect: undefined;
  StudentRoot: undefined;
  CounsellorRoot: undefined;
};
