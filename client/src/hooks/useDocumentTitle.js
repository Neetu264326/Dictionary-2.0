import { useEffect } from 'react';

const BASE_TITLE = 'Dictionary 2.0';

function applyTitle(title) {
  document.title = title ? `${title} — ${BASE_TITLE}` : `${BASE_TITLE} — Discover the meaning behind every word`;
}

/**
 * Sets document.title for the lifetime of the component and restores the
 * default when it unmounts.
 */
export default function useDocumentTitle(title = '') {
  useEffect(() => {
    applyTitle(title);
    return () => applyTitle('');
  }, [title]);
}
