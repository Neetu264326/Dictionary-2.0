import useApp from '../context/AppContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Panel from '../components/Panel.jsx';
import Favorites from '../components/Favorites.jsx';
import EmptyState from '../components/EmptyState.jsx';
import RecentlyViewed from '../components/RecentlyViewed.jsx';
import { HeartIcon } from '../components/Icon.jsx';

export default function FavoritesPage() {
  const { favorites, recent } = useApp();
  useDocumentTitle('Favorites');

  return (
    <div className="page page-sub">
      <header className="page-head container">
        <p className="badge">
          <HeartIcon size={14} />
          YOUR SHELF
        </p>
        <h1 className="page-title">Favorites</h1>
        <p className="page-lede">
          Words you saved, with pronunciation, a short meaning and the date you kept them.
          {favorites.length > 0 && ` ${favorites.length} saved.`}
        </p>
      </header>

      <div className="container sub-body">
        {favorites.length === 0 ? (
          <EmptyState
            icon={<HeartIcon size={28} />}
            title="Your vocabulary shelf is empty."
            message="Save words you love and they'll appear here."
            actionLabel="Start exploring"
            actionTo="/"
          />
        ) : (
          <Panel
            title="Saved words"
            eyebrow={`${favorites.length} entr${favorites.length === 1 ? 'y' : 'ies'}`}
          >
            <Favorites allowNotes />
          </Panel>
        )}

        {recent.length > 0 && (
          <Panel title="Recently viewed" eyebrow="Also worth revisiting">
            <RecentlyViewed limit={12} showHeader={false} />
          </Panel>
        )}
      </div>
    </div>
  );
}
