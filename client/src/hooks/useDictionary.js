import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchWord, normalizeQuery, isValidQuery, ApiError } from '../services/dictionaryApi.js';

const MESSAGES = {
  EMPTY_QUERY: 'Type a word to start exploring.',
  NOT_FOUND: "Hmm, we couldn't find that word. Check the spelling or try another.",
};

function friendly(error) {
  if (error instanceof ApiError) {
    return MESSAGES[error.code] || error.message || 'Unable to load this word. Please try again.';
  }
  return 'Unable to load this word. Please try again.';
}

/**
 * Dictionary lookup state machine.
 *
 * status: 'idle' | 'loading' | 'success' | 'error'
 *
 * Stale responses are discarded with a generation counter instead of aborting
 * the underlying request — that keeps request de-duplication intact (React 18
 * StrictMode double-invokes effects in development).
 */
export default function useDictionary({ onSuccess, onError } = {}) {
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');

  const generationRef = useRef(0);
  const mountedRef = useRef(true);
  const lastKeyRef = useRef('');
  const statusRef = useRef('idle');
  const dataRef = useRef(null);
  const successRef = useRef(onSuccess);
  const errorRef = useRef(onError);

  successRef.current = onSuccess;
  errorRef.current = onError;
  statusRef.current = status;
  dataRef.current = data;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
    };
  }, []);

  const search = useCallback(async (rawWord, options = {}) => {
    const { fresh = false, force = false } = options;
    const word = normalizeQuery(rawWord);

    if (!isValidQuery(word)) {
      generationRef.current += 1;
      setStatus('error');
      setError({ message: MESSAGES.EMPTY_QUERY, code: 'EMPTY_QUERY' });
      return null;
    }

    const key = word.toLowerCase();
    if (!force && !fresh && key === lastKeyRef.current && statusRef.current === 'success') {
      return dataRef.current;
    }

    const generation = generationRef.current + 1;
    generationRef.current = generation;

    setQuery(word);
    setStatus('loading');
    setError(null);

    try {
      const entry = await fetchWord(word, { fresh });
      if (!mountedRef.current || generationRef.current !== generation) return null;
      setData(entry);
      setStatus('success');
      setError(null);
      lastKeyRef.current = key;
      successRef.current?.(entry);
      return entry;
    } catch (err) {
      if (!mountedRef.current || generationRef.current !== generation) return null;
      const message = friendly(err);
      setData(null);
      setStatus('error');
      setError({ message, code: err?.code || 'SERVER_ERROR' });
      lastKeyRef.current = '';
      errorRef.current?.(err);
      return null;
    }
  }, []);

  const retry = useCallback(() => (query ? search(query, { force: true, fresh: true }) : null), [query, search]);

  const reset = useCallback(() => {
    generationRef.current += 1;
    setQuery('');
    setData(null);
    setError(null);
    setStatus('idle');
    lastKeyRef.current = '';
  }, []);

  const isLoading = status === 'loading';
  const hasResult = Boolean(data) && status === 'success';

  return useMemo(
    () => ({ query, data, error, status, isLoading, hasResult, search, retry, reset }),
    [query, data, error, status, isLoading, hasResult, search, retry, reset]
  );
}
