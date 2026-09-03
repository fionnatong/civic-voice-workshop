export const SESSION_STORAGE_KEY = "civic-voice-session";

export function getStoredSession(storage) {
  try {
    const value = storage.getItem(SESSION_STORAGE_KEY);
    if (!value) return null;
    const session = JSON.parse(value);
    return session?.user ? session : null;
  } catch {
    storage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function storeSession(storage, session) {
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(storage) {
  storage.removeItem(SESSION_STORAGE_KEY);
}
