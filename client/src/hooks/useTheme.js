import { useCallback, useEffect, useState } from 'react';
import { read, write, STORAGE_KEYS } from '../utils/storage.js';

/**
 * Theme controller with a tiny module-level store so every hook instance
 * (navbar, footer, settings…) stays in sync without prop drilling.
 *
 * Supported values: 'light' | 'dark' | 'system'
 */

const VALID = new Set(['light', 'dark', 'system']);

let stored = read(STORAGE_KEYS.theme, 'system');
if (!VALID.has(stored)) stored = 'system';

let current = stored;
const listeners = new Set();

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
}

export function resolveTheme(theme = current) {
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';
  return systemPrefersDark() ? 'dark' : 'light';
}

function apply(theme) {
  const resolved = resolveTheme(theme);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#080B18' : '#F7F8FC');
  listeners.forEach((listener) => listener(theme, resolved));
}

export function setTheme(theme) {
  const next = VALID.has(theme) ? theme : 'system';
  if (next === current) return;
  current = next;
  write(STORAGE_KEYS.theme, next);
  apply(next);
}

export function toggleTheme() {
  const resolved = resolveTheme(current);
  setTheme(resolved === 'dark' ? 'light' : 'dark');
}

// Apply immediately on module load (index.html already did a first pass).
apply(current);

// Follow OS changes while the preference is "system".
if (typeof window !== 'undefined' && window.matchMedia) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => {
    if (current === 'system') apply('system');
  };
  if (media.addEventListener) media.addEventListener('change', onChange);
  else if (media.addListener) media.addListener(onChange);
}

export default function useTheme() {
  const [theme, setLocal] = useState(current);
  const [resolved, setResolved] = useState(() => resolveTheme(current));

  useEffect(() => {
    const listener = (next, nextResolved) => {
      setLocal(next);
      setResolved(nextResolved);
    };
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  const set = useCallback((next) => setTheme(next), []);
  const toggle = useCallback(() => toggleTheme(), []);

  return { theme, resolved, set, toggle };
}
