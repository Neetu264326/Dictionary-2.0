import { Link } from 'react-router-dom';
import useApp from '../context/AppContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Panel from '../components/Panel.jsx';
import SearchHistory from '../components/SearchHistory.jsx';
import RecentlyViewed from '../components/RecentlyViewed.jsx';
import EmptyState from '../components/EmptyState.jsx';
import QuickStats from '../components/QuickStats.jsx';
import { SearchIcon, ClockIcon } from '../components/Icon.jsx';

export default function HistoryPage() {
  const { history, recent, favorites } = useApp();
  useDocumentTitle('History');

  return (
    <div className="page page-sub">
      <header className="page-head container">
        <p className="badge">
          <ClockIcon size={14} />
          YOUR TRAIL
        </p>
        <h1 className="page-title">Search history</h1>
        <p className="page-lede">
          Your vocabulary trail, stored locally on this device. Reopen any word with a single click.
        </p>
      </header>

      <div className="container sub-body">
        {history.length === 0 && recent.length === 0 ? (
          <EmptyState
            icon={<SearchIcon size={28} />}
            title="No searches yet."
            message="Search your first word to begin building your vocabulary trail."
            actionLabel="Start exploring"
            actionTo="/"
          />
        ) : (
          <>
            {history.length > 0 && (
              <Panel title="Recent searches" eyebrow={`${history.length} entr${history.length === 1 ? 'y' : 'ies'}`}>
                <SearchHistory />
              </Panel>
            )}

            <QuickStats />

            {recent.length > 0 && (
              <Panel title="Recently viewed" eyebrow="Lightweight recap">
                <RecentlyViewed limit={16} showHeader={false} />
              </Panel>
            )}

            {favorites.length > 0 && (
              <p className="sub-note">
                {favorites.length} word{favorites.length === 1 ? '' : 's'} on your shelf —{' '}
                <Link to="/favorites">review favorites</Link>.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
