import { titleCase } from '../utils/formatWord.js';

function Highlight({ text, word }) {
  if (!word || !text) return text;
  const pattern = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  const parts = String(text).split(pattern);
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === word.toLowerCase() ? <mark key={index}>{part}</mark> : <span key={index}>{part}</span>
      )}
    </>
  );
}

/**
 * Editorial example quote pulled from the dictionary entry.
 */
export default function ExampleCard({ example, word = '', index = 1, partOfSpeech }) {
  if (!example) return null;

  return (
    <figure className="example-card">
      <span className="example-mark" aria-hidden="true">
        {String(index).padStart(2, '0')}
      </span>
      <blockquote>
        <p>
          <Highlight text={example} word={word} />
        </p>
      </blockquote>
      {(partOfSpeech || word) && (
        <figcaption>
          {partOfSpeech ? titleCase(partOfSpeech) : ''}
          {partOfSpeech && word ? ' · ' : ''}
          {word ? `“${word}”` : ''}
        </figcaption>
      )}
    </figure>
  );
}
