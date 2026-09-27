import { ShareIcon, LinkIcon } from './Icon.jsx';
import useApp from '../context/AppContext.jsx';
import { writeClipboard } from './CopyButton.jsx';

export default function ShareButton({ word, text, url, label = 'Share', className = '' }) {
  const { pushToast } = useApp();

  const resolvedUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = text || (word ? `${word} — Dictionary 2.0` : 'Dictionary 2.0');

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: shareText, text: shareText, url: resolvedUrl });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
        // some browsers reject sharing — fall through to copy
      }
    }
    const ok = await writeClipboard(resolvedUrl);
    pushToast(ok ? 'Link copied' : 'Unable to copy the link.', { type: ok ? 'success' : 'error' });
  };

  return (
    <button type="button" className={`action-btn ${className}`.trim()} onClick={handleShare} aria-label={`${label} this word`}>
      {typeof navigator !== 'undefined' && navigator.share ? <ShareIcon size={16} /> : <LinkIcon size={16} />}
      <span>{label}</span>
    </button>
  );
}
