import axios from 'axios';
import { resolveApiBaseUrl, apiConnectionHint } from '../utils/apiConfig';

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      const hint = apiConnectionHint();
      const base = resolveApiBaseUrl();
      return Promise.reject(
        new Error(`Network error — cannot reach ${base}. Is the server running? ${hint}`)
      );
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
