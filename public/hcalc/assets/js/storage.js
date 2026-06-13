// Tiny safe localStorage wrapper
const PREFIX = 'hcalc:';

export const Storage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v === null ? fallback : JSON.parse(v);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch {}
  }
};
