/**
 * A single numbered definition card.
 * `delay` produces the sequential entrance used when results first appear.
 */
export default function DefinitionCard({ index = 1, partOfSpeech, definition, example, delay = 0 }) {
  if (!definition) return null;

  return (
    <article className="def-card" style={{ '--delay': `${delay}ms` }}>
      <div className="def-head">
        <span className="def-num">{String(index).padStart(2, '0')}</span>
        {partOfSpeech && <span className="def-pos">{partOfSpeech}</span>}
      </div>
      <p className="def-text">{definition}</p>
      {example && <p className="def-example">“{example}”</p>}
    </article>
  );
}
