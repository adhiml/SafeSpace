import { Platform } from 'react-native';

const DEFAULT_PORT = 5000;

/**
 * Resolves the API base URL for the current device.
 * `localhost` only works on web/iOS simulator — not on Android emulator or a physical phone.
 */
export const resolveApiBaseUrl = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (fromEnv && !isLocalhost(fromEnv)) {
    return fromEnv.replace(/\/$/, '');
  }

  // Android emulator: localhost = the emulator itself; 10.0.2.2 = host machine
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_PORT}/api`;
  }

  if (Platform.OS === 'web' || Platform.OS === 'ios') {
    return fromEnv?.replace(/\/$/, '') || `http://localhost:${DEFAULT_PORT}/api`;
  }

  return fromEnv?.replace(/\/$/, '') || `http://localhost:${DEFAULT_PORT}/api`;
};

const isLocalhost = (url: string) =>
  url.includes('localhost') || url.includes('127.0.0.1');

export const apiConnectionHint = (): string => {
  if (Platform.OS === 'android') {
    return 'Android emulator: use http://10.0.2.2:5000/api. Physical phone: use your PC LAN IP in client/.env';
  }
  if (Platform.OS === 'ios') {
    return 'iOS simulator: http://localhost:5000/api. Physical iPhone: use your PC LAN IP in client/.env';
  }
  return 'Web: http://localhost:5000/api — ensure the server is running (cd server && npm run dev)';
};
