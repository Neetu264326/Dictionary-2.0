import WordChips from './WordChips.jsx';

function collect(entry, kind) {
  const set = new Set();
  (entry?.meanings || []).forEach((meaning) => {
    (meaning[kind] || []).forEach((word) => set.add(word));
    (meaning.definitions || []).forEach((def) => (def[kind] || []).forEach((word) => set.add(word)));
  });
  return [...set];
}

export default function SynonymList({ entry, onSelect }) {
  const words = collect(entry, 'synonyms');
  if (!words.length) return null;

  return (
    <div className="chip-section">
      <h3 className="chip-label">SYNONYMS</h3>
      <WordChips words={words} tone="violet" onSelect={onSelect} />
    </div>
  );
}
