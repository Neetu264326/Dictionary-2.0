/**
 * Namespaced, failure-tolerant localStorage helpers.
 * Every read/write is wrapped so private mode or a full quota never crashes the app.
 */

const NAMESPACE = 'dict2:';

export const STORAGE_KEYS = {
  theme: 'theme',
  favorites: 'favorites',
  history: 'history',
  recent: 'recent',
  notes: 'notes',
  streak: 'streak',
  wotd: 'wotd',
  onboarded: 'onboarded',
};

export const LIMITS = {
  history: 30,
  recent: 24,
  favorites: 200,
};

export function storageAvailable() {
  try {
    const probe = `${NAMESPACE}__probe`;
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(NAMESPACE + key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(NAMESPACE + key);
  } catch {
    /* ignore */
  }
}

export function fullKey(key) {
  return NAMESPACE + key;
}
