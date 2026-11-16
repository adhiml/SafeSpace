import api from '../api/client';
import { PeerPost, StressReviewResult } from '../types';

export const reviewPostStress = async (postId: string, action: 'affirm' | 'correct', score?: number) => {
  const { data } = await api.patch<StressReviewResult<PeerPost>>(`/posts/${postId}/stress-review`, { action, score });
  return data;
};

export const getPosts = async () => {
  const { data } = await api.get<PeerPost[]>('/posts');
  return data;
};

export const createPost = async (content: string, tags?: string[]) => {
  const { data } = await api.post<PeerPost>('/posts', { content, tags });
  return data;
};

export const meTooPost = async (postId: string) => {
  const { data } = await api.post<PeerPost>(`/posts/${postId}/me-too`);
  return data;
};

export const undoMeTooPost = async (postId: string) => {
  const { data } = await api.delete<PeerPost>(`/posts/${postId}/me-too`);
  return data;
};

export const viewPost = async (postId: string) => {
  const { data } = await api.post<PeerPost>(`/posts/${postId}/view`);
  return data;
};

export const deletePost = async (postId: string) => {
  const { data } = await api.delete<{ _id: string }>(`/posts/${postId}`);
  return data;
};
