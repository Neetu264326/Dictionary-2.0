import { ApiError } from '../middleware/errorHandler.js';
import { lookupWiktionary } from './wiktionaryProvider.js';

const DEFAULT_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const DEFAULT_TIMEOUT = 8000;
const FALLBACK_TIMEOUT = 10000;
const BREAKER_COOLDOWN = 10 * 60 * 1000;
const CACHE_TTL = 10 * 60 * 1000;
const CACHE_LIMIT = 400;

/**
 * ---------------------------------------------------------------------------
 * Provider registry
 * ---------------------------------------------------------------------------
 * The frontend only ever sees the normalized shape produced below. Adding a
 * dictionary provider means registering another entry here and selecting it
 * with DICTIONARY_PROVIDER / DICTIONARY_FALLBACK — no frontend changes.
 *
 * Resolution order:
 *   1. primary provider   (default: Free Dictionary API)
 *   2. fallback provider  (default: Wiktionary) — used when the primary is
 *      unreachable, rate limited, times out, or has no entry for the word.
 * ---------------------------------------------------------------------------
 */

const OUTAGE_CODES = new Set(['NETWORK_ERROR', 'UPSTREAM_TIMEOUT', 'UPSTREAM_ERROR', 'RATE_LIMITED', 'MALFORMED_RESPONSE']);
const DEFINITIVE_CODES = new Set(['NOT_FOUND', 'INVALID_INPUT']);

function pickPhonetics(entry) {
  const list = Array.isArray(entry.phonetics) ? entry.phonetics : [];
  const withAudio = list.find((item) => item && typeof item.audio === 'string' && item.audio.trim());
  const withText = list.find((item) => item && typeof item.text === 'string' && item.text.trim());

  return {
    phonetic:
      (typeof entry.phonetic === 'string' && entry.phonetic.trim()) ||
      (withText && withText.text) ||
      '',
    audio: withAudio ? withAudio.audio : '',
  };
}

/** Converts a Free Dictionary payload into the shared normalized shape. */
export function normalize(rawPayload, word, provider = 'free') {
  const entry = Array.isArray(rawPayload) ? rawPayload.find((item) => item && item.meanings) : rawPayload;

  if (!entry || !Array.isArray(entry.meanings) || entry.meanings.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', `We couldn't find the word "${word}".`);
  }

  const { phonetic, audio } = pickPhonetics(entry);

  const meanings = entry.meanings
    .filter(Boolean)
    .map((meaning) => ({
      partOfSpeech: meaning.partOfSpeech || 'unknown',
      definitions: (Array.isArray(meaning.definitions) ? meaning.definitions : [])
        .filter(Boolean)
        .map((def) => ({
          definition: typeof def.definition === 'string' ? def.definition : '',
          example: typeof def.example === 'string' ? def.example : '',
          synonyms: Array.isArray(def.synonyms) ? [...new Set(def.synonyms)] : [],
          antonyms: Array.isArray(def.antonyms) ? [...new Set(def.antonyms)] : [],
        })),
      synonyms: Array.isArray(meaning.synonyms) ? [...new Set(meaning.synonyms)] : [],
      antonyms: Array.isArray(meaning.antonyms) ? [...new Set(meaning.antonyms)] : [],
    }))
    .filter((meaning) => meaning.definitions.length > 0);

  if (meanings.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', `We couldn't find a definition for "${word}".`);
  }

  const sourceUrls = Array.isArray(entry.sourceUrls)
    ? entry.sourceUrls.filter((url) => typeof url === 'string')
    : [];

  return {
    word: typeof entry.word === 'string' && entry.word ? entry.word : word,
    phonetic,
    audio,
    origin: typeof entry.origin === 'string' ? entry.origin : '',
    meanings,
    sources: sourceUrls,
    provider,
  };
}

const providers = {
  free: {
    name: 'free',
    timeout: () => Number(process.env.DICTIONARY_TIMEOUT_MS) || DEFAULT_TIMEOUT,
    async fetch(word, signal) {
      const base = process.env.DICTIONARY_API_URL || DEFAULT_API_URL;
      const url = `${base}/${encodeURIComponent(word)}`;

      const response = await fetch(url, {
        signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Dictionary-2.0/1.0',
        },
      });

      if (response.status === 404) {
        throw new ApiError(404, 'NOT_FOUND', `We couldn't find the word "${word}".`);
      }
      if (response.status === 429) {
        throw new ApiError(429, 'RATE_LIMITED', 'The dictionary service is busy. Please try again shortly.');
      }
      if (!response.ok) {
        throw new ApiError(502, 'UPSTREAM_ERROR', 'The dictionary provider returned an unexpected response.');
      }

      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new ApiError(502, 'MALFORMED_RESPONSE', 'The dictionary provider returned malformed data.');
      }

      if (!Array.isArray(payload) || payload.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', `We couldn't find the word "${word}".`);
      }

      return normalize(payload, word, 'free');
    },
  },

  wiktionary: {
    name: 'wiktionary',
    timeout: () => FALLBACK_TIMEOUT,
    async fetch(word, signal) {
      return lookupWiktionary(word, signal);
    },
  },
};

let primary = process.env.DICTIONARY_PROVIDER || 'free';
let fallback = process.env.DICTIONARY_FALLBACK || 'wiktionary';

/* -------------------------------------------------------------------------- */
/* Circuit breaker — stops waiting on a dead upstream                          */
/* -------------------------------------------------------------------------- */

let primaryDownUntil = 0;

function markPrimaryDown() {
  primaryDownUntil = Date.now() + BREAKER_COOLDOWN;
}

function primaryIsDown() {
  return Date.now() < primaryDownUntil;
}

function resetPrimary() {
  primaryDownUntil = 0;
}

/* -------------------------------------------------------------------------- */
/* Response cache                                                              */
/* -------------------------------------------------------------------------- */

const cache = new Map();

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

export function clearCache() {
  cache.clear();
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Validates and sanitizes raw user input.
 * Accepts letters, spaces, hyphens and apostrophes (up to 64 characters).
 * Returns the trimmed, collapsed and lowercased word — or an empty string.
 */
export function validateWord(raw) {
  if (typeof raw !== 'string') return '';

  const cleaned = raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^A-Za-zÀ-ɏ'’\- ]/g, '')
    .slice(0, 64)
    .toLowerCase();

  if (!cleaned || !/[a-zÀ-ɏ]/.test(cleaned)) return '';
  return cleaned;
}

/* -------------------------------------------------------------------------- */
/* Resolution                                                                  */
/* -------------------------------------------------------------------------- */

function runWithTimeout(provider, word, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return provider
    .fetch(word, controller.signal)
    .catch((error) => {
      if (error instanceof ApiError) throw error;
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new ApiError(504, 'UPSTREAM_TIMEOUT', 'The dictionary service took too long to respond.');
      }
      if (error instanceof TypeError || /fetch failed/i.test(error?.message || '')) {
        throw new ApiError(502, 'NETWORK_ERROR', 'Unable to reach the dictionary service right now.');
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Something went wrong while looking up this word.');
    })
    .finally(() => clearTimeout(timer));
}

function buildChain() {
  const order = [];
  const push = (key) => {
    if (key && providers[key] && !order.includes(key)) order.push(key);
  };

  const skipPrimary = primaryIsDown();
  if (skipPrimary) {
    push(fallback);
    push(primary);
  } else {
    push(primary);
    push(fallback);
  }
  return order;
}

/** Fetches a word, falling back when the active provider cannot answer. */
export async function lookupWord(word) {
  const cached = readCache(word);
  if (cached) return cached;

  const chain = buildChain();
  let lastError = null;

  for (const key of chain) {
    const provider = providers[key];
    const timeout = typeof provider.timeout === 'function' ? provider.timeout() : DEFAULT_TIMEOUT;

    try {
      const data = await runWithTimeout(provider, word, timeout);
      if (key === primary) resetPrimary();
      writeCache(word, data);
      return data;
    } catch (error) {
      lastError = error;

      if (key === primary && error instanceof ApiError && OUTAGE_CODES.has(error.code)) {
        markPrimaryDown();
      }

      // "Not found" and bad input are definitive answers — don't burn a
      // timeout on the next provider for them.
      if (error instanceof ApiError && DEFINITIVE_CODES.has(error.code)) break;
    }
  }

  throw lastError || new ApiError(500, 'SERVER_ERROR', 'Something went wrong while looking up this word.');
}

/**
 * Non-blocking health probe for the primary provider.
 * Called once at boot so a dead upstream opens the circuit breaker before the
 * first user request instead of making them wait for a timeout.
 */
export function warmup() {
  const provider = providers[primary];
  if (!provider) return;
  const timeout = Math.min(typeof provider.timeout === 'function' ? provider.timeout() : DEFAULT_TIMEOUT, 5000);

  runWithTimeout(provider, 'hello', timeout)
    .then(() => resetPrimary())
    .catch((error) => {
      if (error instanceof ApiError && OUTAGE_CODES.has(error.code)) {
        markPrimaryDown();
        console.warn(`  ! primary provider "${primary}" unavailable (${error.code}) — using fallback`);
      }
    });
}

/** Registers an additional provider (used when extending the platform). */
export function registerProvider(key, provider) {
  providers[key] = provider;
}

export function setActiveProvider(key) {
  if (providers[key]) primary = key;
}

export function setFallbackProvider(key) {
  if (providers[key]) fallback = key;
}

export function getProviders() {
  return Object.keys(providers);
}
