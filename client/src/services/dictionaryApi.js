/**
 * Centralized API service for Dictionary 2.0.
 *
 * The frontend ONLY ever speaks the normalized contract produced by the
 * Express server — never the upstream provider directly. Swapping providers
 * therefore requires zero changes here.
 *
 * Extras: request de-duplication + a small in-memory cache so repeated
 * searches never hit the network twice.
 */

const RAW_BASE = import.meta.env.VITE_API_URL || '';
const BASE = String(RAW_BASE).replace(/\/+$/, '');

const CACHE_TTL = 30 * 60 * 1000;
const CACHE_LIMIT = 80;

const cache = new Map();
const inFlight = new Map();

export class ApiError extends Error {
  constructor(message, { code = 'UNKNOWN', status = 0 } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export function normalizeQuery(value = '') {
  return String(value).trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isValidQuery(value = '') {
  const cleaned = normalizeQuery(value);
  return cleaned.length > 0 && cleaned.length <= 64 && /[a-zÀ-ÿ]/i.test(cleaned);
}

function readCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return hit.data;
}

function writeCache(key, data) {
  cache.set(key, { data, at: Date.now() });
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

export function clearApiCache() {
  cache.clear();
}

/**
 * Fetches a normalized dictionary entry.
 * Identical concurrent requests share a single network call.
 */
export async function fetchWord(rawWord, { fresh = false, signal } = {}) {
  const word = normalizeQuery(rawWord);
  if (!word) {
    throw new ApiError('Please provide a word to look up.', { code: 'EMPTY_QUERY', status: 400 });
  }

  if (!fresh) {
    const cached = readCache(word);
    if (cached) return cached;
  }

  if (inFlight.has(word)) return inFlight.get(word);

  const request = (async () => {
    const url = `${BASE}/api/dictionary/${encodeURIComponent(word)}`;
    let response;
    try {
      response = await fetch(url, {
        signal,
        headers: { Accept: 'application/json' },
      });
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      throw new ApiError('Unable to reach the dictionary service right now.', {
        code: 'NETWORK_ERROR',
        status: 0,
      });
    }

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message = payload?.error?.message || 'Something went wrong while looking up this word.';
      const code = payload?.error?.code || 'SERVER_ERROR';
      throw new ApiError(message, { code, status: response.status });
    }

    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.meanings)) {
      throw new ApiError('The dictionary returned an unexpected response.', {
        code: 'MALFORMED_RESPONSE',
        status: 502,
      });
    }

    writeCache(word, payload);
    return payload;
  })();

  inFlight.set(word, request);
  try {
    return await request;
  } finally {
    inFlight.delete(word);
  }
}

/** Lightweight health probe used by the footer/dev banner. */
export async function fetchHealth() {
  try {
    const response = await fetch(`${BASE}/api/health`, { headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
