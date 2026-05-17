import api from '../api/client';
import { Appointment, ChatMessage, Notification, User } from '../types';

export const getCounsellors = async () => {
  const { data } = await api.get<User[]>('/counsellors');
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
