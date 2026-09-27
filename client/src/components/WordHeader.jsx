import PronunciationButton from './PronunciationButton.jsx';
import FavoriteButton from './FavoriteButton.jsx';
import CopyButton from './CopyButton.jsx';
import ShareButton from './ShareButton.jsx';
import { analyzeWord, quickMeaning } from '../utils/wordUtils.js';

export function buildCopyText(entry) {
  if (!entry) return '';
  const analysis = analyzeWord(entry);
  const lines = [`${entry.word}${entry.phonetic ? ` ${entry.phonetic}` : ''}`];
  const meaning = entry.meanings?.[0];
  if (meaning?.partOfSpeech) lines.push(`(${meaning.partOfSpeech})`);
  const definition = quickMeaning(entry, 240);
  if (definition) lines.push(definition);
  lines.push('');
  lines.push(`Look it up on Dictionary 2.0 — ${typeof window !== 'undefined' ? window.location.origin : ''}`);
  return lines.join('\n');
}

/**
 * Result header: word, phonetic, audio, part-of-speech chips and actions.
 */
export default function WordHeader({ entry, as: Heading = 'h2' }) {
  if (!entry) return null;

  const analysis = analyzeWord(entry);
  const shareText = buildCopyText(entry);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/word/${encodeURIComponent(entry.word)}` : '';

  return (
    <header className="word-header card">
      <div className="word-header-main">
        <div className="word-identity">
          <Heading className="word-title" tabIndex={-1} data-word-title>
            {entry.word}
          </Heading>

          {entry.phonetic && <p className="phonetic">{entry.phonetic}</p>}

          <div className="word-tags">
            {analysis.uniquePartsOfSpeech.slice(0, 4).map((pos) => (
              <span key={pos} className="tag">
                {pos}
              </span>
            ))}
            <span className="tag tag-ghost">
              {analysis.syllables} syllable{analysis.syllables === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className="word-header-side">
          <PronunciationButton audio={entry.audio} word={entry.word} phonetic={entry.phonetic} />
        </div>
      </div>

      <div className="word-actions">
        <FavoriteButton entry={entry} showLabel />

        <CopyButton text={shareText} toastMessage="Word copied" />

        <ShareButton word={entry.word} text={`“${entry.word}” — ${quickMeaning(entry, 90)}`} url={url} />

        <span className="word-source">
          Source · {entry.provider === 'free' ? 'Free Dictionary API' : entry.provider}
        </span>
      </div>
    </header>
  );
}
