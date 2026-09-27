/**
 * Editorial timeline rendering of etymology.
 * The origin paragraph is split into beats so it reads like a short history.
 */
export default function WordOrigin({ origin }) {
  if (!origin || !String(origin).trim()) return null;

  const sentences = String(origin)
    .match(/[^.!?]+[.!?]*/g)
    ?.map((part) => part.trim())
    .filter(Boolean);

  const beats = sentences && sentences.length ? sentences : [String(origin).trim()];
  const labels = ['Root', 'Evolution', 'Influence', 'Recorded usage', 'Modern sense'];

  return (
    <section className="origin" aria-labelledby="origin-title">
      <header className="panel-head">
        <div className="panel-headings">
          <p className="panel-eyebrow">Etymology</p>
          <h2 className="panel-title" id="origin-title">
            Word origin
          </h2>
        </div>
      </header>

      <ol className="timeline">
        {beats.map((beat, index) => (
          <li className="timeline-item" key={index}>
            <span className="timeline-marker" aria-hidden="true">
              <span className="timeline-dot" />
              {index < beats.length - 1 && <span className="timeline-line" />}
            </span>
            <div className="timeline-body">
              <span className="timeline-label">{labels[index] || 'Later'}</span>
              <p>{beat}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
