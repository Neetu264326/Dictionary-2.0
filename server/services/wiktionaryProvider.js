import { ApiError } from '../middleware/errorHandler.js';

/**
 * ---------------------------------------------------------------------------
 * Wiktionary fallback provider
 * ---------------------------------------------------------------------------
 * The Free Dictionary API is the configured primary source. When it is
 * unreachable (network restrictions, outage, rate limit) this provider steps
 * in and returns the exact same normalized shape, so the frontend never knows
 * which upstream produced the data.
 *
 * Source: MediaWiki `action=parse` (wikitext) — parsed here, server side.
 * ---------------------------------------------------------------------------
 */

const API = 'https://en.wiktionary.org/w/api.php';
const FILE_PATH = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
const USER_AGENT = 'Dictionary-2.0/1.0 (educational vocabulary reference)';

const POS_TITLES = new Set([
  'noun', 'nouns', 'proper noun', 'proper nouns', 'verb', 'verbs', 'adjective', 'adjectives',
  'adverb', 'adverbs', 'pronoun', 'pronouns', 'preposition', 'prepositions', 'conjunction',
  'conjunctions', 'determiner', 'determiners', 'numeral', 'numerals', 'particle', 'particles',
  'interjection', 'interjections', 'exclamation', 'exclamations', 'auxiliary verb',
  'auxiliary verbs', 'contraction', 'contractions', 'phrase', 'phrases', 'idiom', 'idioms',
  'proverb', 'proverbs', 'symbol', 'symbols', 'letter', 'letters', 'prefix', 'prefixes',
  'suffix', 'suffixes', 'participle', 'participles', 'article', 'articles', 'adposition',
  'adpositions', 'number', 'numbers', 'combining form', 'combining forms',
]);

const LEMMA_TEMPLATES = new Set(['bor', 'der', 'inh', 'l', 'link', 'm', 'term', 'cog']);
const COMPOUND_TEMPLATES = new Set(['affix', 'prefix', 'suffix', 'suf', 'pre', 'compound', 'doublet', 'confix']);
const EXAMPLE_TEMPLATES = ['ux', 'uxi', 'usage example', '例子', '例句', 'zh-x', 'en-simple-x'];
const TEXT_WRAPPERS = new Set(['n-g', 'gloss', 'non-gloss']);

/* -------------------------------------------------------------------------- */
/* Request throttling — Wikimedia rate limits bursty clients                    */
/* -------------------------------------------------------------------------- */

const MIN_INTERVAL = 500;
let lastRequestAt = 0;
let chain = Promise.resolve();

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(done, ms);
    function done() {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }
    function onAbort() {
      clearTimeout(timer);
      const error = new Error('The operation was aborted.');
      error.name = 'AbortError';
      reject(error);
    }
    if (signal?.aborted) return onAbort();
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/** Serializes requests and enforces a minimum gap between them. */
function enqueue(task) {
  const run = chain.then(async () => {
    const wait = lastRequestAt + MIN_INTERVAL - Date.now();
    if (wait > 0) await delay(wait);
    lastRequestAt = Date.now();
    return task();
  });
  chain = run.catch(() => {});
  return run;
}

/* -------------------------------------------------------------------------- */
/* Inline rendering                                                           */
/* -------------------------------------------------------------------------- */

function decodeEntities(text) {
  return String(text)
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&#x0*27;/gi, "'")
    .replace(/&amp;/g, '&');
}

function expandLemma(name, inner) {
  // NOTE: `inner` is everything after `{{name|`, so parts[0] is the first argument.
  const parts = inner.split('|');
  const isGloss = (value) =>
    Boolean(value) &&
    !value.includes('=') &&
    !value.includes('{') &&
    !value.includes('}') &&
    Boolean(value.trim());

  if (name === 'bor' || name === 'der' || name === 'inh') {
    const term = parts[2];
    if (!term) return '';
    const gloss = parts.slice(3).find(isGloss);
    return gloss ? `${term} (${gloss})` : term;
  }
  if (LEMMA_TEMPLATES.has(name)) {
    const term = parts[1];
    if (!term) return '';
    const gloss = parts.slice(2).find(isGloss);
    return gloss ? `${term} (${gloss})` : term;
  }
  if (COMPOUND_TEMPLATES.has(name)) return parts[1] || '';
  if (name === 'w' || name === 'wikipedia') return parts[1] || parts[0] || '';
  if (name === 'coin') {
    if (!parts[1]) return '';
    return /^Q\d+$/i.test(parts[1]) ? 'coined' : `coined by ${parts[1]}`;
  }
  if (name === 'etydate') return parts[0] ? `First attested in ${parts[0]}` : '';
  if (name === 'lb' || name === 'context' || name === 'qualifier') return '';
  return '';
}

/** Converts wiki markup into readable plain text. */
export function renderInline(raw) {
  if (!raw) return '';
  let text = String(raw);

  text = text.replace(/<!--.*?-->/gs, ' ');
  text = text.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, ' ');
  text = text.replace(/<ref[^>]*\/>/gi, ' ');

  // Expand the handful of templates whose content matters for readability.
  text = text.replace(/\{\{([a-z0-9-]+)\|((?:[^{}]|\{\{[^{}]*\}\})*)\}\}/gi, (match, name, inner) => {
    const key = name.toLowerCase();
    if (key === 'ety') return '';
    if (TEXT_WRAPPERS.has(key)) return inner;
    if (LEMMA_TEMPLATES.has(key) || COMPOUND_TEMPLATES.has(key) || key === 'w' || key === 'wikipedia' || key === 'coin' || key === 'etydate') {
      return expandLemma(key, inner);
    }
    return match;
  });

  // Drop every remaining template (innermost first so nested ones resolve).
  let previous;
  let guard = 0;
  do {
    previous = text;
    text = text.replace(/\{\{[^{}]*\}\}/g, ' ');
    guard += 1;
  } while (text !== previous && guard < 20);

  // File / category / thesaurus links carry no meaning here.
  text = text.replace(/\[\[(?:category|thesaurus|help|wiktionary|file|image|media|layout)[^\]]*\]\]/gi, ' ');

  // [[target|display]] and [[target]]
  for (let i = 0; i < 3; i += 1) {
    text = text.replace(/\[\[([^\[\]|]*\|)?([^\[\]|]*)\]\]/g, '$2');
  }

  text = text.replace(/'{2,5}/g, '');
  text = text.replace(/<\/?[a-z][^>]*>/gi, '');
  text = text.replace(/^-{2,}\s*/g, '');
  text = text.replace(/\s+/g, ' ').trim();
  text = decodeEntities(text);
  text = text.replace(/\s+([,.;:!?])/g, '$1').trim();
  return text;
}

function findTemplate(text, names) {
  const pattern = new RegExp(`\\{\\{\\s*(${names.join('|')})\\|((?:[^{}]|\\{\\{[^{}]*\\}\\})*)\\}\\}`, 'i');
  const match = pattern.exec(text);
  if (!match) return null;
  return { name: match[1].toLowerCase(), args: match[2].split('|') };
}

function stripNested(value) {
  return String(value)
    .replace(/\{\{([a-z0-9-]+)\|((?:[^{}]|\{\{[^{}]*\}\})*)\}\}/gi, (match, name, inner) => {
      const key = name.toLowerCase();
      if (LEMMA_TEMPLATES.has(key) || COMPOUND_TEMPLATES.has(key)) return expandLemma(key, inner);
      return match;
    })
    .replace(/\{\{[^{}]*\}\}/g, '')
    .trim();
}

function cleanTerms(args, offset = 0) {
  return args
    .slice(offset)
    .map(stripNested)
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => !value.includes('='))
    .filter((value) => !/^(thesaurus|category):/i.test(value))
    .filter((value) => /^[A-Za-zÀ-ɏ][A-Za-zÀ-ɏ0-9'’ -]*$/.test(value))
    .filter((value) => value.length <= 40);
}

/* -------------------------------------------------------------------------- */
/* Section parsing                                                            */
/* -------------------------------------------------------------------------- */

function collectHeadings(lines) {
  const headings = [];
  lines.forEach((line, index) => {
    const level3 = /^(={3})([^=].*?)\1\s*$/.exec(line);
    if (level3) {
      headings.push({ level: 3, title: level3[2].trim(), index });
      return;
    }
    const level4 = /^(={4})([^=].*?)\1\s*$/.exec(line);
    if (level4) headings.push({ level: 4, title: level4[2].trim(), index });
  });
  return headings;
}

function extractExample(inner) {
  const template = findTemplate(inner, EXAMPLE_TEMPLATES);
  if (!template) {
    // Plain prose after "#:" is a usable example sentence.
    if (inner && !inner.trim().startsWith('{{')) return renderInline(inner);
    return '';
  }
  const args = template.args;
  if (template.name === 'usage example' || template.name === 'en-simple-x') {
    const textArg = args.find((value) => value.startsWith('text='));
    if (textArg) return renderInline(textArg.slice(5));
  }
  const body = args[2] ?? args[1] ?? '';
  return renderInline(body);
}

function pushUnique(target, values) {
  values.forEach((value) => {
    const key = value.toLowerCase();
    if (!target.some((item) => item.toLowerCase() === key)) target.push(value);
  });
}

/** Collects ====Synonyms==== / ====Antonyms==== bullet lists for a section. */
function collectBullets(lines, start, end, bucket) {
  for (let i = start; i < end; i += 1) {
    const line = lines[i];
    if (!/^[*]\s+/.test(line)) continue;

    const body = stripNested(line.replace(/^\*+\s+/, ''));
    if (/^(see also|compare|cf\.?|synonym of|antonym of)\b/i.test(body)) continue;

    renderInline(body)
      .split(',')
      .map((value) => value.trim())
      .filter((value) => /^[A-Za-zÀ-ɏ][A-Za-zÀ-ɏ0-9'’ -]*$/.test(value))
      .filter((value) => value.length <= 40)
      .forEach((value) => pushUnique(bucket, [value]));
  }
}

function parsePosBlock(lines, start, end) {
  const meanings = [];
  let current = null;
  let subsection = '';

  for (let i = start; i < end; i += 1) {
    const line = lines[i];

    const sub4 = /^(={4})([^=].*?)\1\s*$/.exec(line);
    if (sub4) {
      subsection = sub4[2].trim().toLowerCase();
      current = null;
      continue;
    }
    const sub5 = /^(={5})([^=].*?)\1\s*$/.exec(line);
    if (sub5) {
      subsection = sub5[2].trim().toLowerCase();
      current = null;
      continue;
    }

    if (subsection === 'usage notes' || subsection === 'derived terms' || subsection === 'see also') {
      continue;
    }

    const definition = /^#\s+(.+)/.exec(line);
    if (definition && !/^#[:*]/.test(line)) {
      const text = renderInline(definition[1]);
      if (text) {
        current = { definition: text, example: '', synonyms: [], antonyms: [] };
        meanings.push(current);
      }
      continue;
    }

    if (current && /^#:\s+/.test(line)) {
      const inner = line.replace(/^#:\s+/, '');

      const syn = findTemplate(inner, ['syn', 'syns', 'synonym']);
      if (syn) {
        pushUnique(current.synonyms, cleanTerms(syn.args, 2));
        continue;
      }
      const ant = findTemplate(inner, ['ant', 'ants', 'antonym']);
      if (ant) {
        pushUnique(current.antonyms, cleanTerms(ant.args, 2));
        continue;
      }
      const example = extractExample(inner);
      if (example && !current.example) current.example = example;
      continue;
    }
  }

  return meanings;
}

function extractPronunciation(text) {
  const ipa = /\{\{\s*IPA\|en\|([^|}]+)[^}]*\}\}/i.exec(text);
  const enpr = /\{\{\s*enPR\|([^|}]+)[^}]*\}\}/i.exec(text);

  let phonetic = '';
  if (ipa) phonetic = ipa[1].trim();
  else if (enpr) phonetic = `/${enpr[1].trim()}/`;
  if (phonetic && !/^\/.*\/$/.test(phonetic) && !/^\[.*\]$/.test(phonetic)) phonetic = `/${phonetic}/`;

  const audios = [...text.matchAll(/\{\{\s*audio(?:\/en)?\|en\|([^|}]+\.(?:ogg|mp3|wav|flac))[^}]*\}\}/gi)].map(
    (match) => match[1].trim()
  );
  const preferred = audios.find((file) => /^en-us-/i.test(file)) || audios[0] || '';
  const audio = preferred ? `${FILE_PATH}${encodeURIComponent(preferred)}` : '';

  return { phonetic, audio };
}

/**
 * Parses MediaWiki wikitext into the normalized dictionary shape.
 * Returns null when the page has no English section (i.e. not our word).
 */
export function parseWikitext(wikitext, requestedWord, title) {
  const lines = String(wikitext).split(/\r?\n/);

  const englishStart = lines.findIndex((line) => /^==\s*English\s*==\s*$/.test(line));
  if (englishStart === -1) return null;

  let englishEnd = lines.length;
  for (let i = englishStart + 1; i < lines.length; i += 1) {
    if (/^==[^=].*==\s*$/.test(lines[i])) {
      englishEnd = i;
      break;
    }
  }

  const section = lines.slice(englishStart, englishEnd);
  const headings = collectHeadings(section);

  const meanings = [];
  let origin = '';
  let phonetic = '';
  let audio = '';

  const shared = { synonyms: [], antonyms: [] };
  let etymologyCount = 0;

  /** Section body ends at the next heading of the same or higher rank. */
  const boundsFor = (heading, position) => {
    const next = headings.slice(position + 1).find((item) => item.level <= heading.level);
    return { start: heading.index + 1, end: next ? next.index : section.length };
  };

  headings.forEach((heading, position) => {
    const { start, end } = boundsFor(heading, position);
    const body = section.slice(start, end).join('\n');
    const key = heading.title.toLowerCase();

    // ===Etymology=== / ===Etymology 1=== — text only, never definitions.
    if (heading.level === 3 && /^etymology/.test(key)) {
      if (etymologyCount >= 2) return;
      const stop = headings.slice(position + 1).find((item) => item.level > 3);
      const etymologyEnd = stop ? stop.index : end;
      const text = renderInline(section.slice(start, etymologyEnd).join(' '));
      if (text.replace(/[^A-Za-zÀ-ɏ]/g, '').length >= 4) {
        origin = origin ? `${origin} ${text}` : text;
        etymologyCount += 1;
      }
      return;
    }

    if (heading.level === 3 && /^pronunciation/.test(key)) {
      const parsed = extractPronunciation(body);
      if (!phonetic) phonetic = parsed.phonetic;
      if (!audio) audio = parsed.audio;
      return;
    }

    if (key === 'synonyms' || key === 'antonyms') {
      collectBullets(section, start, end, key === 'synonyms' ? shared.synonyms : shared.antonyms);
      return;
    }

    if (!POS_TITLES.has(key)) return;
    // Parts of speech are ===Noun=== for single-etymology entries and
    // ====Noun==== when nested under ===Etymology N===.
    if (heading.level !== 3 && heading.level !== 4) return;

    const parsed = parsePosBlock(section, start, end);
    if (!parsed.length) return;

    const partOfSpeech = key
      .replace(/s$/, '')
      .replace(/^proper noun$/, 'proper noun');

    const existing = meanings.find((meaning) => meaning.partOfSpeech === partOfSpeech);
    if (existing) {
      existing.definitions.push(...parsed.map((item) => ({
        definition: item.definition,
        example: item.example,
        synonyms: item.synonyms,
        antonyms: item.antonyms,
      })));
      return;
    }

    meanings.push({
      partOfSpeech,
      definitions: parsed.map((item) => ({
        definition: item.definition,
        example: item.example,
        synonyms: item.synonyms,
        antonyms: item.antonyms,
      })),
      synonyms: [...new Set(parsed.flatMap((item) => item.synonyms))],
      antonyms: [...new Set(parsed.flatMap((item) => item.antonyms))],
    });
  });

  // Section-level synonym/antonym lists apply to every meaning in the entry.
  meanings.forEach((meaning) => {
    pushUnique(meaning.synonyms, shared.synonyms);
    pushUnique(meaning.antonyms, shared.antonyms);
    meaning.synonyms = [...new Set(meaning.synonyms)];
    meaning.antonyms = [...new Set(meaning.antonyms)];
    meaning.definitions.forEach((definition) => {
      pushUnique(definition.synonyms, shared.synonyms);
      pushUnique(definition.antonyms, shared.antonyms);
    });
  });

  if (meanings.length === 0) return null;

  const canonical = String(title || requestedWord);
  const word =
    canonical.toLowerCase() === String(requestedWord).toLowerCase() ? requestedWord : canonical;

  return {
    word,
    phonetic,
    audio,
    origin,
    meanings,
    sources: [`https://en.wiktionary.org/wiki/${encodeURIComponent(canonical.replace(/ /g, '_'))}`],
    provider: 'wiktionary',
  };
}

/** Fetches and parses a single entry from Wiktionary. */
export async function lookupWiktionary(word, signal) {
  const url = `${API}?action=parse&redirects=1&page=${encodeURIComponent(word)}&prop=wikitext&format=json&formatversion=2`;

  const gate = enqueue(async () => {
    const send = () =>
      fetch(url, {
        signal,
        headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      });

    let response;
    try {
      response = await send();
      if (response.status === 429) {
        // Wikimedia rate limits burst traffic — honour Retry-After when set.
        const retryAfter = Number(response.headers.get('retry-after')) || 0;
        await delay(Math.min(Math.max(retryAfter * 1000, 2500), 8000), signal);
        lastRequestAt = 0;
        response = await send();
      }
    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') throw error;
      throw new ApiError(502, 'NETWORK_ERROR', 'Unable to reach the dictionary service right now.');
    }
    return response;
  });

  const response = await gate;

  if (response.status === 429) {
    throw new ApiError(429, 'RATE_LIMITED', 'The dictionary service is busy. Please try again shortly.');
  }
  if (response.status === 404) {
    throw new ApiError(404, 'NOT_FOUND', `We couldn't find the word "${word}".`);
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

  if (payload?.error) {
    if (payload.error.code === 'missingtitle') {
      throw new ApiError(404, 'NOT_FOUND', `We couldn't find the word "${word}".`);
    }
    throw new ApiError(502, 'UPSTREAM_ERROR', 'The dictionary provider returned an unexpected response.');
  }

  const wikitext = payload?.parse?.wikitext;
  if (typeof wikitext !== 'string' || !wikitext) {
    throw new ApiError(404, 'NOT_FOUND', `We couldn't find the word "${word}".`);
  }

  const parsed = parseWikitext(wikitext, word, payload?.parse?.title);
  if (!parsed) {
    throw new ApiError(404, 'NOT_FOUND', `We couldn't find an English definition for "${word}".`);
  }
  return parsed;
}
