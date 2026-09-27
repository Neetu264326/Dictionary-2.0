import { useNavigate } from 'react-router-dom';
import useApp from '../context/AppContext.jsx';
import { timeAgo } from '../utils/formatWord.js';
import { ClockIcon, TrashIcon, CloseIcon } from './Icon.jsx';

/**
 * Recently searched words — click to reopen, ✕ to remove one, plus clear-all.
 */
export default function SearchHistory({ limit, showClear = true, showEmpty = true }) {
  const navigate = useNavigate();
  const { history, removeHistory, clearHistory } = useApp();

  const items = typeof limit === 'number' ? history.slice(0, limit) : history;

  return (
    <div className="history">
      {showClear && items.length > 0 && (
        <div className="list-actions">
          <span className="list-count">
            {history.length} entr{history.length === 1 ? 'y' : 'ies'}
          </span>
          <button type="button" className="text-btn" onClick={clearHistory}>
            <TrashIcon size={14} /> Clear all
          </button>
        </div>
      )}

      {items.length === 0 ? (
        showEmpty ? (
          <p className="list-empty">
            <ClockIcon size={16} /> No searches yet — your trail starts with your first word.
          </p>
        ) : null
      ) : (
        <ul className="history-list">
          {items.map((item) => (
            <li className="history-item" key={`${item.word}-${item.at}`}>
              <button
                type="button"
                className="history-open"
                onClick={() => navigate(`/word/${encodeURIComponent(item.word)}`)}
              >
                <span className="history-word">{item.word}</span>
                <time className="history-time" dateTime={new Date(item.at).toISOString()}>
                  {timeAgo(item.at)}
                </time>
              </button>
              <button
                type="button"
                className="history-remove"
                onClick={() => removeHistory(item.word)}
                aria-label={`Remove ${item.word} from history`}
              >
                <CloseIcon size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
