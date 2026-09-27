import { LEXICON, LEXICON_SET } from './lexicon.js';

/**
 * Ranks autocomplete candidates.
 * Local signals (history, favourites, recently viewed, related words) always
 * outrank the bundled lexicon so suggestions feel personal.
 */
export function buildSuggestions(query = '', pools = {}, limit = 7) {
  const q = String(query).trim().toLowerCase().replace(/\s+/g, ' ');
  const seen = new Map();

  const add = (raw, source, at = 0) => {
    if (!raw) return;
    const word = String(raw).trim();
    if (!word) return;
    const key = word.toLowerCase();
    if (seen.has(key)) return;
    seen.set(key, { word, source, at: at || 0 });
  };

  (pools.related || []).forEach((w) => add(w, 'related'));
  (pools.history || []).forEach((h) => add(h?.word ?? h, 'history', h?.at));
  (pools.favorites || []).forEach((f) => add(f?.word ?? f, 'favorite', f?.addedAt));
  (pools.recent || []).forEach((r) => add(r?.word ?? r, 'recent', r?.at));
  LEXICON.forEach((w) => add(w, 'lexicon'));

  const candidates = [...seen.values()];

  if (!q) {
    return candidates
      .filter((item) => item.source !== 'lexicon')
      .sort((a, b) => b.at - a.at)
      .slice(0, limit);
  }

  const scored = [];
  for (const item of candidates) {
    const word = item.word.toLowerCase();
    let score = -1;

    if (word === q) score = 140;
    else if (word.startsWith(q)) score = 100 + Math.max(0, 30 - word.length);
    else if (word.includes(` ${q}`)) score = 80;
    else if (word.includes(q)) score = 55 - Math.min(30, word.indexOf(q));
    else if (q.startsWith(word) && word.length >= 3) score = 30;
    else continue;

    if (item.source !== 'lexicon') score += 25;
    if (item.source === 'related') score += 12;
    if (LEXICON_SET.has(q)) score -= 5;

    scored.push({ ...item, score });
  }

  scored.sort((a, b) => b.score - a.score || a.word.length - b.word.length);
  return scored.slice(0, limit).map(({ word, source, at }) => ({ word, source, at }));
}
