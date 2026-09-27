import { LEXICON_SET } from './lexicon.js';

/* -------------------------------------------------------------------------- */
/* Syllable estimation (heuristic — clearly labelled as an app estimate)       */
/* -------------------------------------------------------------------------- */

export function countSyllables(raw = '') {
  const word = String(raw).toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;

  let groups = (word.match(/[aeiouy]+/g) || []).length;
  if (/[^aeiouy]e$/.test(word) && groups > 1) groups -= 1;
  return Math.max(1, groups);
}

/* -------------------------------------------------------------------------- */
/* Difficulty + usage estimates                                                */
/* -------------------------------------------------------------------------- */

export function estimateDifficulty({ syllables = 1, length = 1 } = {}) {
  if (length <= 5 && syllables <= 2) return 'Beginner';
  if (syllables >= 5 || length >= 13 || (syllables >= 4 && length >= 10)) return 'Advanced';
  return 'Intermediate';
}

export function estimateCommonUsage({ length = 1, syllables = 1, inLexicon = false } = {}) {
  if (inLexicon) return 'High';
  if (length <= 6 && syllables <= 2) return 'Medium';
  return 'Low';
}

export const DIFFICULTY_RANK = { Beginner: 1, Intermediate: 2, Advanced: 3 };
export const USAGE_RANK = { Low: 1, Medium: 2, High: 3 };

/* -------------------------------------------------------------------------- */
/* Normalized entry analysis                                                   */
/* -------------------------------------------------------------------------- */

export function analyzeWord(entry) {
  if (!entry) return null;

  const word = String(entry.word || '').trim();
  const meanings = Array.isArray(entry.meanings) ? entry.meanings : [];

  let definitions = 0;
  let examples = 0;
  const synonyms = new Set();
  const antonyms = new Set();

  meanings.forEach((meaning) => {
    (meaning.definitions || []).forEach((def) => {
      definitions += 1;
      if (def.example) examples += 1;
      (def.synonyms || []).forEach((s) => synonyms.add(s));
      (def.antonyms || []).forEach((a) => antonyms.add(a));
    });
    (meaning.synonyms || []).forEach((s) => synonyms.add(s));
    (meaning.antonyms || []).forEach((a) => antonyms.add(a));
  });

  const length = word.replace(/[^A-Za-zÀ-ÿ]/g, '').length;
  const syllables = countSyllables(word);
  const inLexicon = LEXICON_SET.has(word.toLowerCase());
  const partOfSpeeches = meanings.map((m) => m.partOfSpeech).filter(Boolean);

  return {
    word,
    phonetic: entry.phonetic || '',
    audio: entry.audio || '',
    origin: entry.origin || '',
    length,
    characters: word.length,
    syllables,
    partsOfSpeech: partOfSpeeches,
    uniquePartsOfSpeech: [...new Set(partOfSpeeches)],
    definitions,
    examples,
    synonymList: [...synonyms],
    antonymList: [...antonyms],
    difficulty: estimateDifficulty({ syllables, length }),
    commonUsage: estimateCommonUsage({ length, syllables, inLexicon }),
    hasAudio: Boolean(entry.audio),
    hasOrigin: Boolean(entry.origin),
    provider: entry.provider || 'free',
  };
}

/** Concise definition pulled from the first meaningful definition with an example. */
export function quickMeaning(entry, max = 180) {
  if (!entry) return '';
  const meanings = entry.meanings || [];
  let best = '';
  for (const meaning of meanings) {
    for (const def of meaning.definitions || []) {
      if (!def.definition) continue;
      if (!best) best = def.definition;
      if (def.example) {
        best = def.definition;
        break;
      }
    }
    if (best && meanings.length) break;
  }
  const text = String(best || '').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

/** Related, searchable terms derived from synonyms and antonyms. */
export function relatedWords(entry, limit = 14) {
  const analysis = analyzeWord(entry);
  if (!analysis) return [];
  const seen = new Set();
  const out = [];
  [...analysis.synonymList, ...analysis.antonymList].forEach((word) => {
    const key = String(word).toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(word);
  });
  return out.slice(0, limit);
}

/** Longest definition — used as the "primary" sense in compact previews. */
export function primaryDefinition(entry, max = 150) {
  if (!entry) return '';
  const all = [];
  (entry.meanings || []).forEach((m) => (m.definitions || []).forEach((d) => all.push(d.definition)));
  if (!all.length) return '';
  const text = all.find(Boolean) || '';
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

/* -------------------------------------------------------------------------- */
/* Word of the Day — deterministic per calendar day                            */
/* -------------------------------------------------------------------------- */

export const WORD_OF_THE_DAY = [
  { word: 'serendipity', phonetic: '/ˌser.ənˈdɪp.ə.ti/', partOfSpeech: 'noun', definition: 'the occurrence of events by chance in a happy or beneficial way.', example: 'Finding that old manuscript was pure serendipity.', synonyms: ['chance', 'luck', 'fortuity'], antonyms: ['misfortune'] },
  { word: 'ephemeral', phonetic: '/ɪˈfem.ər.əl/', partOfSpeech: 'adjective', definition: 'lasting for a very short time.', example: 'An ephemeral moment of happiness.', synonyms: ['transient', 'fleeting'], antonyms: ['permanent'] },
  { word: 'eloquent', phonetic: '/ˈel.ə.kwənt/', partOfSpeech: 'adjective', definition: 'fluent or persuasive in speaking or writing.', example: 'Her eloquent speech moved the entire room.', synonyms: ['expressive', 'articulate'], antonyms: ['inarticulate'] },
  { word: 'resilient', phonetic: '/rɪˈzɪl.i.ənt/', partOfSpeech: 'adjective', definition: 'able to recover quickly from difficulties; tough.', example: 'A resilient community rebuilt within a year.', synonyms: ['tough', 'elastic'], antonyms: ['fragile'] },
  { word: 'luminous', phonetic: '/ˈluː.mɪ.nəs/', partOfSpeech: 'adjective', definition: 'full of or shedding light; bright, especially in the dark.', example: 'A luminous glow covered the harbor at dusk.', synonyms: ['radiant', 'glowing'], antonyms: ['dull'] },
  { word: 'mellifluous', phonetic: '/meˈlɪf.lu.əs/', partOfSpeech: 'adjective', definition: 'sweet or musical; pleasant to hear.', example: 'He had a mellifluous voice that calmed the crowd.', synonyms: ['dulcet', 'harmonious'], antonyms: ['harsh'] },
  { word: 'quixotic', phonetic: '/kwɪkˈsɒt.ɪk/', partOfSpeech: 'adjective', definition: 'exceedingly idealistic; unrealistic and impractical.', example: 'A quixotic plan to rewrite every law at once.', synonyms: ['idealistic', 'utopian'], antonyms: ['pragmatic'] },
  { word: 'petrichor', phonetic: '/ˈpet.rɪ.kɔːr/', partOfSpeech: 'noun', definition: 'a pleasant smell accompanying the first rain after a dry spell.', example: 'The petrichor rose from the warm pavement.', synonyms: ['earthiness'], antonyms: [] },
  { word: 'sonder', phonetic: '/ˈsɒn.dər/', partOfSpeech: 'noun', definition: 'the realization that each passer-by has a life as vivid as your own.', example: 'Riding the train filled him with sonder.', synonyms: ['empathy'], antonyms: [] },
  { word: 'galvanize', phonetic: '/ˈɡæl.və.naɪz/', partOfSpeech: 'verb', definition: 'to shock or excite someone into taking action.', example: 'The report galvanized the entire committee.', synonyms: ['spur', 'motivate'], antonyms: ['deter'] },
  { word: 'ethereal', phonetic: '/ɪˈθɪə.ri.əl/', partOfSpeech: 'adjective', definition: 'extremely delicate and light in a way that seems too perfect for this world.', example: 'An ethereal melody drifted through the hall.', synonyms: ['delicate', 'celestial'], antonyms: ['earthly'] },
  { word: 'ubiquitous', phonetic: '/juːˈbɪk.wɪ.təs/', partOfSpeech: 'adjective', definition: 'present, appearing, or found everywhere.', example: 'Smartphones became ubiquitous within a decade.', synonyms: ['omnipresent', 'universal'], antonyms: ['rare'] },
  { word: 'poignant', phonetic: '/ˈpɔɪn.jənt/', partOfSpeech: 'adjective', definition: 'evoking a keen sense of sadness or regret.', example: 'A poignant reminder of summers long past.', synonyms: ['moving', 'touching'], antonyms: ['cheerful'] },
  { word: 'laconic', phonetic: '/ləˈkɒn.ɪk/', partOfSpeech: 'adjective', definition: 'using very few words; terse.', example: 'His laconic reply ended the discussion.', synonyms: ['terse', 'concise'], antonyms: ['verbose'] },
  { word: 'palpable', phonetic: '/ˈpæl.pə.bəl/', partOfSpeech: 'adjective', definition: 'so intense as to be almost physically felt.', example: 'The tension in the room was palpable.', synonyms: ['tangible', 'evident'], antonyms: ['imperceptible'] },
  { word: 'reverie', phonetic: '/ˈrev.ər.i/', partOfSpeech: 'noun', definition: 'a state of dreamy meditation or absent-minded daydreaming.', example: 'She sank into a reverie about the coast.', synonyms: ['daydream', 'musing'], antonyms: [] },
  { word: 'zenith', phonetic: '/ˈzen.ɪθ/', partOfSpeech: 'noun', definition: 'the time at which something is most powerful or successful.', example: 'The empire reached its zenith in the third century.', synonyms: ['peak', 'pinnacle'], antonyms: ['nadir'] },
  { word: 'wistful', phonetic: '/ˈwɪst.fəl/', partOfSpeech: 'adjective', definition: 'having or showing a feeling of vague or regretful longing.', example: 'A wistful glance toward the empty swing.', synonyms: ['yearning', 'nostalgic'], antonyms: ['cheerful'] },
  { word: 'incandescent', phonetic: '/ˌɪn.kænˈdes.ənt/', partOfSpeech: 'adjective', definition: 'emitting light as a result of being heated; full of strong emotion.', example: 'An incandescent display of pure joy.', synonyms: ['brilliant', 'glowing'], antonyms: ['dim'] },
  { word: 'sanguine', phonetic: '/ˈsæŋ.ɡwɪn/', partOfSpeech: 'adjective', definition: 'optimistic or positive, especially in an apparently bad situation.', example: 'She stayed sanguine despite the delays.', synonyms: ['optimistic', 'hopeful'], antonyms: ['pessimistic'] },
  { word: 'meticulous', phonetic: '/məˈtɪk.jə.ləs/', partOfSpeech: 'adjective', definition: 'showing great attention to detail; very careful and precise.', example: 'Meticulous notes covered every page.', synonyms: ['precise', 'scrupulous'], antonyms: ['careless'] },
  { word: 'perennial', phonetic: '/pəˈren.i.əl/', partOfSpeech: 'adjective', definition: 'lasting or enduring for a long time; recurring every year.', example: 'A perennial favorite among young readers.', synonyms: ['enduring', 'recurring'], antonyms: ['ephemeral'] },
  { word: 'astute', phonetic: '/əˈstjuːt/', partOfSpeech: 'adjective', definition: 'having or showing sharp judgment; shrewd.', example: 'An astute observation about the market.', synonyms: ['shrewd', 'perceptive'], antonyms: ['naive'] },
  { word: 'candid', phonetic: '/ˈkæn.dɪd/', partOfSpeech: 'adjective', definition: 'truthful and straightforward; frank.', example: 'A candid conversation about expectations.', synonyms: ['frank', 'honest'], antonyms: ['evasive'] },
  { word: 'diligent', phonetic: '/ˈdɪl.ɪ.dʒənt/', partOfSpeech: 'adjective', definition: 'having or showing care and conscientiousness in one\'s work.', example: 'Diligent practice turned talent into mastery.', synonyms: ['industrious', 'thorough'], antonyms: ['lazy'] },
  { word: 'ephemera', phonetic: '/ɪˈfem.ər.ə/', partOfSpeech: 'noun', definition: 'things that exist or are enjoyed only for a short time.', example: 'The museum archived decades of paper ephemera.', synonyms: ['trifles'], antonyms: [] },
  { word: 'eloquence', phonetic: '/ˈel.ə.kwəns/', partOfSpeech: 'noun', definition: 'fluent, persuasive speaking or writing.', example: 'Her eloquence carried the vote.', synonyms: ['oratory', 'rhetoric'], antonyms: [] },
  { word: 'clarity', phonetic: '/ˈklær.ə.ti/', partOfSpeech: 'noun', definition: 'the quality of being coherent and intelligible.', example: 'The editor brought clarity to a dense argument.', synonyms: ['lucidity', 'coherence'], antonyms: ['obscurity'] },
];

const DAY_MS = 86400000;

export function dayKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dayOfYear(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / DAY_MS);
}

/** Stable for the whole calendar day — never reshuffles between refreshes. */
export function wordOfTheDay(date = new Date()) {
  const index = (dayOfYear(date) + new Date(date).getFullYear()) % WORD_OF_THE_DAY.length;
  const entry = WORD_OF_THE_DAY[index];
  return { ...entry, date: dayKey(date), index };
}

/* -------------------------------------------------------------------------- */
/* Vocabulary streak                                                           */
/* -------------------------------------------------------------------------- */

export function computeStreak(entries = [], today = dayKey()) {
  if (!Array.isArray(entries) || entries.length === 0) return { days: 0, current: false };

  const set = new Set(entries);
  if (!set.has(today)) {
    // Streak is only broken if yesterday is also missing.
    const yesterday = dayKey(new Date(Date.now() - DAY_MS));
    if (!set.has(yesterday)) return { days: 0, current: false };
  }

  let cursor = set.has(today) ? Date.now() : Date.now() - DAY_MS;
  let days = 0;
  // Safety cap: never loop more than 3650 days.
  for (let i = 0; i < 3650; i += 1) {
    const key = dayKey(new Date(cursor));
    if (!set.has(key)) break;
    days += 1;
    cursor -= DAY_MS;
  }
  return { days, current: set.has(today) };
}
