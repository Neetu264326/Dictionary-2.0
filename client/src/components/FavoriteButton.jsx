import { HeartIcon } from './Icon.jsx';
import useApp from '../context/AppContext.jsx';

/**
 * ♡ / ♥ toggle with a pop animation. Works with a normalized dictionary entry
 * or a stored favourite record (`{ word }` is the only required field).
 */
export default function FavoriteButton({ entry, size = 'md', showLabel = false, className = '' }) {
  const { isFavorite, toggleFavorite } = useApp();
  const word = entry?.word || '';
  const active = isFavorite(word);

  if (!word) return null;

  return (
    <button
      type="button"
      className={`fav-btn fav-${size} ${active ? 'is-active' : ''} ${className}`.trim()}
      onClick={() => toggleFavorite(entry)}
      aria-pressed={active}
      aria-label={active ? `Remove ${word} from favorites` : `Add ${word} to favorites`}
      title={active ? 'Remove from favorites' : 'Save to favorites'}
    >
      <span className="fav-heart" key={active ? 'on' : 'off'}>
        <HeartIcon filled={active} size={size === 'sm' ? 16 : 20} />
      </span>
      {showLabel && <span>{active ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
