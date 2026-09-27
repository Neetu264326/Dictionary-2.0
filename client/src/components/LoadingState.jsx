/**
 * Skeleton screens shaped like the final result dashboard.
 * Uses a shimmer so the wait feels intentional rather than broken.
 */
export default function LoadingState() {
  return (
    <div className="results-skeleton" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading the dictionary entry…</span>

      <div className="card sk-card">
        <div className="sk sk-title" />
        <div className="sk sk-phonetic" />
        <div className="sk-row">
          <div className="sk sk-chip" />
          <div className="sk sk-chip" />
          <div className="sk sk-chip is-wide" />
        </div>
        <div className="sk sk-actions" />
      </div>

      <div className="card sk-card">
        <div className="sk sk-label" />
        <div className="sk sk-line" />
        <div className="sk sk-line is-short" />
      </div>

      <div className="results-grid">
        <div className="card sk-card">
          <div className="sk sk-label" />
          {[0, 1, 2].map((index) => (
            <div className="sk-block" key={index}>
              <div className="sk sk-line" />
              <div className="sk sk-line" />
              <div className="sk sk-line is-short" />
            </div>
          ))}
        </div>

        <div className="card sk-card">
          <div className="sk sk-label" />
          {[0, 1, 2, 3].map((index) => (
            <div className="sk sk-metric" key={index}>
              <div className="sk sk-line is-mid" />
              <div className="sk sk-bar" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
