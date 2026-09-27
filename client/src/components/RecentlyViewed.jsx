import { useNavigate } from 'react-router-dom';
import useApp from '../context/AppContext.jsx';
import { timeAgo } from '../utils/formatWord.js';
import { LayersIcon, CloseIcon } from './Icon.jsx';

/**
 * Compact cards for words opened recently — deliberately lighter than the
 * full definition cards used in results.
 */
export default function RecentlyViewed({ limit = 8, showHeader = true }) {
  const navigate = useNavigate();
  const { recent, removeRecent } = useApp();

  const items = typeof limit === 'number' ? recent.slice(0, limit) : recent;
  if (items.length === 0) return null;

  return (
    <div className="recent">
      {showHeader && (
        <div className="list-actions">
          <span className="list-count">
            <LayersIcon size={14} /> Recently viewed
          </span>
          <span className="list-count muted">{items.length}</span>
        </div>
      )}

      <ul className="recent-grid stagger">
        {items.map((item) => (
          <li className="recent-card" key={`${item.word}-${item.at}`}>
            <button
              type="button"
              className="recent-open"
              onClick={() => navigate(`/word/${encodeURIComponent(item.word)}`)}
            >
              <span className="recent-word">{item.word}</span>
              {item.phonetic && <span className="recent-phonetic">{item.phonetic}</span>}
              {item.definition && <span className="recent-def">{item.definition}</span>}
              <time className="recent-time" dateTime={new Date(item.at).toISOString()}>
                {timeAgo(item.at)}
              </time>
            </button>
            <button
              type="button"
              className="recent-remove"
              onClick={() => removeRecent(item.word)}
              aria-label={`Remove ${item.word} from recently viewed`}
            >
              <CloseIcon size={13} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
