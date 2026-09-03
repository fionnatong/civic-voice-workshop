import { describe, expect, it } from "vitest";
import {
  clearSession,
  getStoredSession,
  SESSION_STORAGE_KEY,
  storeSession,
} from "./session.js";

function createStorage(initialValue = null) {
  const values = new Map(initialValue ? [[SESSION_STORAGE_KEY, initialValue]] : []);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

describe("session storage", () => {
  it("restores a previously stored session", () => {
    const storage = createStorage();
    const session = { user: { name: "Aisha Rahman", role: "citizen" } };

    storeSession(storage, session);

    expect(getStoredSession(storage)).toEqual(session);
  });

  it("clears a session on sign out", () => {
    const storage = createStorage(JSON.stringify({ user: { role: "admin" } }));

    clearSession(storage);

    expect(getStoredSession(storage)).toBeNull();
  });

  it("discards malformed stored data", () => {
    const storage = createStorage("not valid json");

    expect(getStoredSession(storage)).toBeNull();
    expect(storage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });
});
