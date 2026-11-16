import api from '../api/client';
import { Appointment, ChatMessage, Notification, User } from '../types';

export interface Counsellor {
  id: string;
  name: string;
  title: string;
  faculty?: string;
}

export const getCounsellors = async (): Promise<Counsellor[]> => {
  const { data } = await api.get<Counsellor[]>('/counsellors');
  return data;
};

export const getAppointments = async () => {
  const { data } = await api.get<Appointment[]>('/appointments');
  return data;
};

export const createAppointment = async (payload: {
  counsellor_user_id?: string;
  appointment_datetime: string;
  session_details?: string;
  is_anonymous?: boolean;
}) => {
  const { data } = await api.post<Appointment>('/appointments', payload);
  return data;
};

export const updateAppointmentStatus = async (
  id: string,
  status: Appointment['status']
) => {
  const { data } = await api.patch<Appointment>(`/appointments/${id}/status`, { status });
  return data;
};

export const getAppointmentDetails = async (id: string) => {
  const { data } = await api.get<Appointment>(`/appointments/${id}`);
  return data;
};

export const completeAppointment = async (id: string) =>
  updateAppointmentStatus(id, 'completed');

export const sendMessage = async (appointment_id: string, message: string) => {
  const { data } = await api.post<ChatMessage>('/messages', { appointment_id, message });
  return data;
};

export const getMessages = async (appointmentId: string) => {
  const { data } = await api.get<ChatMessage[]>(`/messages/${appointmentId}`);
  return data;
};

export const getNotifications = async () => {
  const { data } = await api.get<Notification[]>('/notifications');
  return data;
};

export const markNotificationRead = async (id: string) => {
  const { data } = await api.patch<Notification>(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await api.patch<{ updated: number }>('/notifications/read-all');
  return data;
};

/** Development only: the one always-open chatroom (Jamie Chen <-> Morgan Lee). */
export const getDevRoom = async () => {
  const { data } = await api.get<Appointment>('/appointments/dev-room');
  return data;
};

/** Times (ISO strings) this counsellor already has a confirmed session. Contains no student details. */
export const getBookedSlots = async (counsellorId: string, from: Date, to: Date) => {
  const { data } = await api.get<string[]>(`/counsellors/${counsellorId}/booked-slots`, {
    params: { from: from.toISOString(), to: to.toISOString() },
  });
  return data;
};
