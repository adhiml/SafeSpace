import api from '../api/client';
import { Journal } from '../types';

export const createJournal = async (payload: {
  title: string;
  content: string;
  is_sentiment_enabled?: boolean;
  tags: string[];
}) => {
  const { data } = await api.post<Journal>('/journals', payload);
  return data;
};

export const getJournals = async () => {
  const { data } = await api.get<Journal[]>('/journals');
  return data;
};

export const updateJournal = async (
  id: string,
  payload: Partial<{ title: string; content: string; is_sentiment_enabled: boolean, tags: string[] }>
) => {
  const { data } = await api.put<Journal>(`/journals/${id}`, payload);
  return data;
};

export const deleteJournal = async (id: string) => {
  const { data } = await api.delete(`/journals/${id}`);
  return data;
};
