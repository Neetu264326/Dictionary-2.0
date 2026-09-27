import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import useApp from '../context/AppContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import SearchBar from '../components/SearchBar.jsx';
import WordDashboard from '../components/WordDashboard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { titleCase } from '../utils/formatWord.js';
import { BookIcon, ChevronUp } from '../components/Icon.jsx';

export default function WordPage() {
  const { word } = useParams();
  const { search, status, data, error, isLoading, query } = useApp();
  const firstRun = useRef(true);

  const heading = status === 'success' && data ? titleCase(data.word) : word ? titleCase(word) : '';

  useDocumentTitle(heading);

  useEffect(() => {
    if (!word) return;
    search(word);
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [word, search]);

  return (
    <div className="page page-word">
      <div className="sticky-search">
        <div className="container sticky-search-inner">
          <Link to="/" className="sticky-back" aria-label="Back to explore">
            <ChevronUp size={16} className="rotate-left" />
            <span>Explore</span>
          </Link>
          <SearchBar
            variant="sticky"
            id="word-search"
            placeholder={`Search another word${query ? ` — current: ${query}` : '…'}`}
            loading={isLoading}
            showHint={false}
          />
        </div>
      </div>

      <div className="container word-body">
        {status === 'loading' && <LoadingState />}

        {status === 'error' && (
          <ErrorState
            title={error?.code === 'EMPTY_QUERY' ? 'Type a word to search.' : "Hmm, we couldn't find that word."}
            message={
              error?.message ||
              'Check the spelling or try another word.'
            }
            onRetry={status === 'error' && query ? () => search(query, { force: true, fresh: true }) : undefined}
          />
        )}

        {status === 'success' && data && <WordDashboard entry={data} />}

        {status === 'idle' && (
          <EmptyState
            icon={<BookIcon size={26} />}
            title="Looking up a word."
            message="Use the search bar above, or head back to explore the word of the day."
            actionLabel="Back to explore"
            actionTo="/"
          />
        )}
      </div>
    </div>
  );
}
