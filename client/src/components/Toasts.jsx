import useApp from '../context/AppContext.jsx';
import { CheckIcon, AlertIcon, InfoIcon, CloseIcon } from './Icon.jsx';

const ICONS = {
  success: CheckIcon,
  error: AlertIcon,
  info: InfoIcon,
};

/**
 * Lightweight toast stack. Auto-dismisses and is fully aria-live.
 */
export default function Toasts() {
  const { toasts, dismissToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="toast-stack" role="region" aria-label="Notifications">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || CheckIcon;
        return (
          <div key={toast.id} className={`toast toast-${toast.type}`} role="status" aria-live="polite">
            <span className="toast-icon">
              <Icon size={16} />
            </span>
            <span className="toast-text">{toast.message}</span>
            <button type="button" className="toast-close" onClick={() => dismissToast(toast.id)} aria-label="Dismiss">
              <CloseIcon size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
