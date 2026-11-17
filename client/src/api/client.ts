import axios from 'axios';
import { getActiveDemoUserId } from './demoUserId';
import { getToken, sessionHandlers } from './session';
import { resolveApiBaseUrl, apiConnectionHint } from '../utils/apiConfig';

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000, // AI analysis runs in the background, so no request waits on the model
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  } else if (__DEV__) {
    // Development only: the seeded demo accounts, picked with "Continue as Developer".
    config.headers['X-Demo-User-Id'] = getActiveDemoUserId();
  }
  return config;
});

// api.interceptors.request.use((config) => {
//   const token = getAuthToken();

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   } else {
//     config.headers['X-Demo-User-Id'] = getActiveDemoUserId();
//   }

//   return config;
// });

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
    const { status, data } = error.response;
    // Our login was rejected -> go back to the login screen. Frozen account -> refresh its state.
    if (status === 401 && getToken()) sessionHandlers.onUnauthorized?.();
    if (status === 403 && typeof data?.code === 'string' && data.code.startsWith('EMAIL_')) sessionHandlers.onAccountBlocked?.();

    const message = data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
