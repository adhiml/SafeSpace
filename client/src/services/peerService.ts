import api from '../api/client';
import { PeerComment, PeerPost } from '../types';

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
