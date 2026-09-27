import useDocumentTitle from '../hooks/useDocumentTitle.js';
import EmptyState from '../components/EmptyState.jsx';
import { CompassIcon } from '../components/Icon.jsx';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <div className="page page-sub">
      <div className="container sub-body">
        <EmptyState
          icon={<CompassIcon size={28} />}
          title="This page wandered off."
          message="The link may be outdated — head back to the dictionary and keep exploring."
          actionLabel="Back to explore"
          actionTo="/"
        />
      </div>
    </div>
  );
}
