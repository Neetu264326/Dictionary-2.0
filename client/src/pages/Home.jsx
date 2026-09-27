import { Link, useNavigate } from 'react-router-dom';
import useApp from '../context/AppContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import HeroSearch from '../components/HeroSearch.jsx';
import WordOfTheDay from '../components/WordOfTheDay.jsx';
import QuickStats from '../components/QuickStats.jsx';
import Panel from '../components/Panel.jsx';
import SearchHistory from '../components/SearchHistory.jsx';
import Favorites from '../components/Favorites.jsx';
import RecentlyViewed from '../components/RecentlyViewed.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { normalizeQuery, isValidQuery } from '../services/dictionaryApi.js';
import { BookIcon, LayersIcon } from '../components/Icon.jsx';

export default function Home() {
  const navigate = useNavigate();
  const { isLoading, history, favorites, recent, pushToast } = useApp();
  useDocumentTitle('');

  const handleSearch = (raw) => {
    const word = normalizeQuery(raw);
    if (!isValidQuery(word)) {
      pushToast('Type a word to start exploring.', { type: 'error' });
      return;
    }
    navigate(`/word/${encodeURIComponent(word)}`);
  };

  const firstVisit = history.length === 0 && favorites.length === 0 && recent.length === 0;

  return (
    <div className="page page-home">
      <HeroSearch loading={isLoading} onSubmit={handleSearch} />

      <div className="container home-body">
        <section className="home-top" aria-label="Daily word and statistics">
          <WordOfTheDay />
          <QuickStats />
        </section>

        {firstVisit ? (
          <EmptyState
            icon={<BookIcon size={26} />}
            title="Your vocabulary workspace is ready."
            message="Search your first word to begin building definitions, favorites and a search trail."
            actionLabel="Start with serendipity"
            onAction={() => handleSearch('serendipity')}
          />
        ) : (
          <>
            <section className="home-panels" aria-label="Your activity">
              <Panel
                title="Recent searches"
                eyebrow="Continue"
                action={
                  <Link className="text-btn" to="/history">
                    View all
                  </Link>
                }
              >
                <SearchHistory limit={6} showClear={false} />
              </Panel>

              <Panel
                title="Saved words"
                eyebrow="Your shelf"
                action={
                  <Link className="text-btn" to="/favorites">
                    View all
                  </Link>
                }
              >
                <Favorites limit={4} showClear={false} />
              </Panel>
            </section>

            {recent.length > 0 && (
              <Panel title="Recently viewed" eyebrow="Lightweight recap" className="home-recent">
                <RecentlyViewed limit={8} showHeader={false} />
              </Panel>
            )}
          </>
        )}
      </div>
    </div>
  );
}
