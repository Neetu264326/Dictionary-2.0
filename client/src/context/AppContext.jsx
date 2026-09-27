import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import useDictionary from '../hooks/useDictionary.js';
import { STORAGE_KEYS, LIMITS } from '../utils/storage.js';
import { primaryDefinition, computeStreak, dayKey, wordOfTheDay } from '../utils/wordUtils.js';

const AppContext = createContext(null);

const EMPTY = [];

function dedupePush(list, item, keyFn, limit) {
  const key = keyFn(item);
  const next = [item, ...list.filter((entry) => keyFn(entry) !== key)];
  return next.slice(0, limit);
}

export function AppProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage(STORAGE_KEYS.favorites, EMPTY);
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.history, EMPTY);
  const [recent, setRecent] = useLocalStorage(STORAGE_KEYS.recent, EMPTY);
  const [notes, setNotes] = useLocalStorage(STORAGE_KEYS.notes, {});
  const [streak, setStreak] = useLocalStorage(STORAGE_KEYS.streak, EMPTY);
  const [toasts, setToasts] = useState([]);

  const timersRef = useRef(new Map());

  /* ------------------------------------------------------------------ toasts */
  const dismissToast = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (message, { type = 'success', duration = 2600 } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((list) => [...list.slice(-3), { id, message, type }]);
      const timer = setTimeout(() => dismissToast(id), duration);
      timersRef.current.set(id, timer);
      return id;
    },
    [dismissToast]
  );

  /* ---------------------------------------------------------------- favorites */
  const isFavorite = useCallback(
    (word) => Boolean(word) && favorites.some((item) => item.word.toLowerCase() === String(word).toLowerCase()),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (entry) => {
      if (!entry?.word) return false;
      const key = entry.word.toLowerCase();
      const exists = favorites.some((item) => item.word.toLowerCase() === key);

      if (exists) {
        setFavorites((list) => list.filter((item) => item.word.toLowerCase() !== key));
        pushToast('Removed from favorites', { type: 'info' });
        return false;
      }

      const record = {
        word: entry.word,
        phonetic: entry.phonetic || '',
        definition: primaryDefinition(entry, 120),
        partOfSpeech: entry.meanings?.[0]?.partOfSpeech || '',
        addedAt: Date.now(),
      };
      setFavorites((list) => dedupePush(list, record, (item) => item.word.toLowerCase(), LIMITS.favorites));
      pushToast('Added to favorites');
      return true;
    },
    [favorites, setFavorites, pushToast]
  );

  const removeFavorite = useCallback(
    (word) => {
      setFavorites((list) => list.filter((item) => item.word.toLowerCase() !== String(word).toLowerCase()));
      pushToast('Removed from favorites', { type: 'info' });
    },
    [setFavorites, pushToast]
  );

  const clearFavorites = useCallback(() => {
    setFavorites(EMPTY);
    pushToast('Favorites cleared', { type: 'info' });
  }, [setFavorites, pushToast]);

  /* ------------------------------------------------------------------ history */
  const pushHistory = useCallback(
    (word) => {
      if (!word) return;
      setHistory((list) => dedupePush(list, { word, at: Date.now() }, (item) => item.word.toLowerCase(), LIMITS.history));
    },
    [setHistory]
  );

  const removeHistory = useCallback(
    (word) => setHistory((list) => list.filter((item) => item.word.toLowerCase() !== String(word).toLowerCase())),
    [setHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory(EMPTY);
    pushToast('Search history cleared', { type: 'info' });
  }, [setHistory, pushToast]);

  /* --------------------------------------------------------------- recent */
  const pushRecent = useCallback(
    (entry) => {
      if (!entry?.word) return;
      const record = {
        word: entry.word,
        phonetic: entry.phonetic || '',
        definition: primaryDefinition(entry, 90),
        at: Date.now(),
      };
      setRecent((list) => dedupePush(list, record, (item) => item.word.toLowerCase(), LIMITS.recent));
    },
    [setRecent]
  );

  const removeRecent = useCallback(
    (word) => setRecent((list) => list.filter((item) => item.word.toLowerCase() !== String(word).toLowerCase())),
    [setRecent]
  );

  const clearRecent = useCallback(() => setRecent(EMPTY), [setRecent]);

  /* ------------------------------------------------------------------- notes */
  const setNote = useCallback(
    (word, note) => {
      if (!word) return;
      setNotes((map) => {
        const next = { ...map };
        const key = word.toLowerCase();
        if (!note || !note.trim()) delete next[key];
        else next[key] = note.trim().slice(0, 240);
        return next;
      });
      pushToast(note && note.trim() ? 'Note saved' : 'Note removed', { type: 'info' });
    },
    [setNotes, pushToast]
  );

  const getNote = useCallback((word) => (word ? notes[String(word).toLowerCase()] || '' : ''), [notes]);

  /* ------------------------------------------------------------------ streak */
  const today = dayKey();
  const computedStreak = useMemo(() => computeStreak(streak, today), [streak, today]);
  const wotd = useMemo(() => wordOfTheDay(), []);

  const markWotdExplored = useCallback(() => {
    setStreak((list) => (list.includes(today) ? list : [...list, today].slice(-400)));
  }, [setStreak, today]);

  /* ----------------------------------------------------------------- search */
  const onSuccess = useCallback(
    (entry) => {
      pushHistory(entry.word);
      pushRecent(entry);
    },
    [pushHistory, pushRecent]
  );

  const dictionary = useDictionary({ onSuccess });

  const value = useMemo(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
      history,
      pushHistory,
      removeHistory,
      clearHistory,
      recent,
      pushRecent,
      removeRecent,
      clearRecent,
      notes,
      setNote,
      getNote,
      streak: computedStreak,
      markWotdExplored,
      wotd,
      toasts,
      pushToast,
      dismissToast,
      ...dictionary,
    }),
    [
      favorites, isFavorite, toggleFavorite, removeFavorite, clearFavorites,
      history, pushHistory, removeHistory, clearHistory,
      recent, pushRecent, removeRecent, clearRecent,
      notes, setNote, getNote,
      computedStreak, markWotdExplored, wotd,
      toasts, pushToast, dismissToast, dictionary,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside <AppProvider>');
  return context;
}

export { AppContext };
