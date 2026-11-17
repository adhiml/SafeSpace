import * as SecureStore from 'expo-secure-store';

// The login token lives in the phone's secure storage (Keychain / Keystore), not in plain
// storage. A copy is kept in memory so requests don't wait on the disk.
const KEY = 'safespace_session_token';
let token: string | null = null;

export const getToken = () => token;

export const setToken = async (next: string | null) => {
  token = next;
  try {
    if (next) await SecureStore.setItemAsync(KEY, next);
    else await SecureStore.deleteItemAsync(KEY);
  } catch {
    // Secure storage isn't available (e.g. on web): the session just lasts until the app closes.
  }
};

export const loadToken = async () => {
  try {
    token = await SecureStore.getItemAsync(KEY);
  } catch {
    token = null;
  }
  return token;
};

// The API client reports two situations the app must react to; RoleContext fills these in.
interface SessionHandlers {
  onUnauthorized?: () => void; // the server no longer accepts our token
  onAccountBlocked?: () => void; // the account is frozen (verification expired or missing)
}
export const sessionHandlers: SessionHandlers = {};
