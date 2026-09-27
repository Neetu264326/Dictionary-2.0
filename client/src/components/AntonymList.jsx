import WordChips from './WordChips.jsx';

function collect(entry, kind) {
  const set = new Set();
  (entry?.meanings || []).forEach((meaning) => {
    (meaning[kind] || []).forEach((word) => set.add(word));
    (meaning.definitions || []).forEach((def) => (def[kind] || []).forEach((word) => set.add(word)));
  });
  return [...set];
}

export default function AntonymList({ entry, onSelect }) {
  const words = collect(entry, 'antonyms');
  if (!words.length) return null;

  return (
    <div className="chip-section">
      <h3 className="chip-label">ANTONYMS</h3>
      <WordChips words={words} tone="cyan" onSelect={onSelect} />
    </div>
  );
}
