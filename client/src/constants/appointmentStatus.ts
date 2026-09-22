import { Appointment } from '../types';
import { palette } from '../utils/theme';

export type UiStatus = 'upcoming' | 'pending' | 'past' | 'active' | 'cancelled';
export type StatusFilter = 'all' | UiStatus;

const SESSION_DURATION_MS = 60 * 60 * 1000; // appointments are booked in fixed 1-hour slots

export const deriveStatus = (appointment: Appointment): UiStatus => {
  if (appointment.status === 'cancelled') return 'cancelled';

  if (appointment.status === 'pending') return 'pending';

  if (appointment.status === 'approved') {
    const start = new Date(appointment.appointment_datetime).getTime();
    const end = start + SESSION_DURATION_MS;
    const now = Date.now();

    if (now >= start && now < end) return 'active';
    if (now < start) return 'upcoming';
    return 'past';
  }

  return 'past';
};

export const STATUS_FILTERS: { key: StatusFilter; label: string; color: string }[] = [
  { key: 'all', label: 'All Status', color: palette.accent },
  { key: 'active', label: 'Active', color: palette.activeDot },
  { key: 'upcoming', label: 'Upcoming', color: palette.okText },
  { key: 'pending', label: 'Pending', color: palette.warnText },
  { key: 'past', label: 'Past', color: palette.textFaint },
  { key: 'cancelled', label: 'Cancelled', color: palette.cancelledText },
];

export const statusStyles: Record<
  UiStatus,
  { bg: string; text: string; dot: string; icon: string; label: string }
> = {
  upcoming: {
    bg: palette.okBg,
    text: palette.okText,
    dot: palette.okDot,
    icon: 'check-circle-outline',
    label: 'Upcoming',
  },
  active: {
    bg: palette.activeBg,
    text: palette.activeText,
    dot: palette.activeDot,
    icon: 'message-video', // or "chat-outline" / "circle-slice-8"
    label: 'Active',
  },
  pending: {
    bg: palette.warnBg,
    text: palette.warnText,
    dot: palette.warnDot,
    icon: 'clock-outline',
    label: 'Pending',
  },
  past: {
    bg: palette.borderSoft,
    text: palette.textMuted,
    dot: palette.pastDot,
    icon: 'history',
    label: 'Past',
  },
  cancelled: {
    bg: palette.cancelledBg,
    text: palette.cancelledText,
    dot: palette.cancelledDot,
    icon: 'close-circle-outline',
    label: 'Cancelled',
  },
};
