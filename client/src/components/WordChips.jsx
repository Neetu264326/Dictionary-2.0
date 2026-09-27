import { useNavigate } from 'react-router-dom';

/**
 * Word chip cloud. Clicking a chip searches that word immediately.
 */
export default function WordChips({ words = [], onSelect, tone = 'violet', limit = 16 }) {
  const navigate = useNavigate();
  const list = words.slice(0, limit);

  if (!list.length) return null;

  const handle = (word) => {
    if (onSelect) onSelect(word);
    else navigate(`/word/${encodeURIComponent(word)}`);
  };

  return (
    <ul className={`word-chips tone-${tone}`}>
      {list.map((word) => (
        <li key={String(word).toLowerCase()}>
          <button type="button" className="word-chip" onClick={() => handle(word)}>
            {word}
          </button>
        </li>
      ))}
    </ul>
  );
}
