import { Link } from 'react-router-dom';
import { AlertIcon, SearchIcon } from './Icon.jsx';

/**
 * Polished failure card — never leaks upstream errors or stack traces.
 */
export default function ErrorState({
  title = "Hmm, we couldn't find that word.",
  message = 'Check the spelling or try another word.',
  onRetry,
  retryLabel = 'Try again',
  compact = false,
}) {
  return (
    <div className={`state-card state-error ${compact ? 'is-compact' : ''}`.trim()} role="alert">
      <span className="state-icon" aria-hidden="true">
        <AlertIcon size={26} />
      </span>
      <h2 className="state-title">{title}</h2>
      <p className="state-text">{message}</p>
      <div className="state-actions">
        {onRetry && (
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            {retryLabel}
          </button>
        )}
        <Link className="btn btn-ghost" to="/">
          <SearchIcon size={16} /> Back to search
        </Link>
      </div>
    </div>
  );
}
