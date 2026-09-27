import { timeAgo } from '../utils/formatWord.js';
import { SearchIcon, SparkIcon, HeartIcon, ClockIcon, LayersIcon } from './Icon.jsx';

const SOURCE_META = {
  history: { label: 'recent search', Icon: ClockIcon },
  favorite: { label: 'saved word', Icon: HeartIcon },
  recent: { label: 'recently viewed', Icon: LayersIcon },
  related: { label: 'related', Icon: SparkIcon },
  lexicon: { label: 'dictionary', Icon: SearchIcon },
};

/**
 * Autocomplete dropdown — fully keyboard driven (↑ ↓ Enter Escape).
 */
export default function SearchSuggestions({
  suggestions = [],
  open,
  activeIndex,
  query,
  listboxId,
  onSelect,
  onHover,
}) {
  if (!open) return null;

  const showEmpty = suggestions.length === 0;

  return (
    <div className="suggestions" id={listboxId}>
      {!showEmpty && (
        <p className="suggestions-label">
          <SparkIcon size={13} />
          Suggestions
          <span className="suggestions-hint">↑ ↓ to navigate · Enter to open · Esc to close</span>
        </p>
      )}

      {showEmpty ? (
        <div className="suggestion is-empty" role="presentation">
          <SearchIcon size={16} />
          <span>
            No matches yet — press <strong>Enter</strong> to look up “{query}”.
          </span>
        </div>
      ) : (
        <ul className="suggestions-list" role="listbox" aria-label="Search suggestions">
          {suggestions.map((item, index) => {
            const meta = SOURCE_META[item.source] || SOURCE_META.lexicon;
            const MetaIcon = meta.Icon;
            const timeLabel = item.at ? timeAgo(item.at) : '';
            return (
              <li
                key={`${item.word}-${item.source}`}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`suggestion ${index === activeIndex ? 'is-active' : ''}`.trim()}
                onMouseEnter={() => onHover?.(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelect?.(item.word)}
              >
                <span className="suggestion-icon">
                  <MetaIcon size={15} />
                </span>
                <span className="suggestion-word">{item.word}</span>
                <span className="suggestion-meta">
                  {timeLabel ? <time>{timeLabel}</time> : <span>{meta.label}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
