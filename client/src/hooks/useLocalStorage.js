import { useCallback, useEffect, useRef, useState } from 'react';
import { read, write, fullKey } from '../utils/storage.js';

/**
 * useState backed by localStorage.
 * - Hydrates synchronously on first render (no flash).
 * - Stays in sync across browser tabs via the `storage` event.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = read(key, undefined);
    return stored === undefined || stored === null ? initialValue : stored;
  });

  const keyRef = useRef(key);
  keyRef.current = key;

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        write(keyRef.current, resolved);
        return resolved;
      });
    },
    []
  );

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== fullKey(keyRef.current)) return;
      if (event.newValue === null) {
        setValue(initialValue);
        return;
      }
      try {
        setValue(JSON.parse(event.newValue));
      } catch {
        /* corrupted value — keep current state */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [value, set];
}
