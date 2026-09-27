import { useEffect, useRef, useState } from 'react';
import { CopyIcon, CheckIcon } from './Icon.jsx';
import useApp from '../context/AppContext.jsx';

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to legacy path */
    }
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export default function CopyButton({ text, label = 'Copy', className = '', toastMessage = 'Copied to clipboard' }) {
  const { pushToast } = useApp();
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    if (!text) return;
    const ok = await writeClipboard(text);
    if (ok) {
      setDone(true);
      pushToast(toastMessage);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setDone(false), 1800);
    } else {
      pushToast('Copy is not available in this browser.', { type: 'error' });
    }
  };

  return (
    <button
      type="button"
      className={`action-btn ${done ? 'is-done' : ''} ${className}`.trim()}
      onClick={handleCopy}
      aria-label={done ? 'Copied' : label}
      data-done={done ? 'true' : 'false'}
    >
      {done ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
      <span>{done ? 'Copied' : label}</span>
    </button>
  );
}

export { writeClipboard };
