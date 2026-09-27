/**
 * Friendly placeholder for empty shelves — never leaves a blank region.
 */
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon = null,
  title,
  message,
  actionLabel,
  onAction,
  actionTo,
  compact = false,
}) {
  const action =
    actionLabel && (onAction || actionTo) ? (
      actionTo ? (
        <Link className="btn btn-primary" to={actionTo}>
          {actionLabel}
        </Link>
      ) : (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )
    ) : null;

  return (
    <div className={`state-card ${compact ? 'is-compact' : ''}`.trim()}>
      <span className="state-icon is-soft" aria-hidden="true">
        {icon}
      </span>
      <h2 className="state-title">{title}</h2>
      {message && <p className="state-text">{message}</p>}
      {action && <div className="state-actions">{action}</div>}
    </div>
  );
}
