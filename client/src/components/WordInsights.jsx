import { analyzeWord, DIFFICULTY_RANK, USAGE_RANK } from '../utils/wordUtils.js';

const toPct = (rank, max) => Math.round((rank / max) * 100);

function Row({ label, value, pct, tone = 'violet', hint }) {
  return (
    <div className="insight-row">
      <div className="insight-top">
        <span className="insight-label">{label}</span>
        <span className="insight-value">{value}</span>
      </div>
      {typeof pct === 'number' && (
        <span className="meter" aria-hidden="true">
          <span className={`meter-fill tone-${tone}`} style={{ width: `${pct}%` }} />
        </span>
      )}
      {hint && <span className="insight-hint">{hint}</span>}
    </div>
  );
}

/**
 * Analytical sidebar: derived metrics with an explicit "app estimate" note.
 */
export default function WordInsights({ entry }) {
  const analysis = analyzeWord(entry);
  if (!analysis) return null;

  const difficultyPct = toPct(DIFFICULTY_RANK[analysis.difficulty] || 2, 3);
  const usagePct = toPct(USAGE_RANK[analysis.commonUsage] || 2, 3);
  const usageTone = analysis.commonUsage === 'High' ? 'cyan' : analysis.commonUsage === 'Low' ? 'amber' : 'violet';

  return (
    <div className="insights">
      <section className="insight-card card" aria-labelledby="insights-title">
        <header className="insight-head">
          <p className="panel-eyebrow">Analysis</p>
          <h2 className="panel-title" id="insights-title">
            Word insights
          </h2>
        </header>

        <div className="insight-list">
          <Row label="Difficulty" value={analysis.difficulty} pct={difficultyPct} />
          <Row label="Word length" value={`${analysis.length} letters`} />
          <Row label="Syllables" value={analysis.syllables} pct={Math.min(100, analysis.syllables * 18)} />
          <Row
            label="Parts of speech"
            value={analysis.uniquePartsOfSpeech.length || 1}
            hint={analysis.uniquePartsOfSpeech.slice(0, 3).join(' · ')}
          />
          <Row label="Common usage" value={analysis.commonUsage} pct={usagePct} tone={usageTone} />
        </div>

        <p className="insight-disclaimer">
          Estimates derived from this entry’s metadata — an application-level heuristic, not an
          authoritative linguistic classification.
        </p>
      </section>

      <section className="insight-card card" aria-labelledby="profile-title">
        <header className="insight-head">
          <p className="panel-eyebrow">Statistics</p>
          <h2 className="panel-title" id="profile-title">
            Word profile
          </h2>
        </header>

        <div className="profile-grid">
          {[
            { label: 'Length', value: analysis.length },
            { label: 'Characters', value: analysis.characters },
            { label: 'Syllables', value: analysis.syllables },
            { label: 'Parts of speech', value: analysis.uniquePartsOfSpeech.length },
            { label: 'Definitions', value: analysis.definitions },
            { label: 'Examples', value: analysis.examples },
          ].map((item) => (
            <div className="profile-cell" key={item.label}>
              <span className="profile-value">{item.value}</span>
              <span className="profile-label">{item.label}</span>
            </div>
          ))}
        </div>

        <ul className="profile-flags">
          <li className={analysis.hasAudio ? 'is-on' : ''}>{analysis.hasAudio ? 'Audio available' : 'No audio'}</li>
          <li className={analysis.hasOrigin ? 'is-on' : ''}>
            {analysis.hasOrigin ? 'Etymology included' : 'No etymology'}
          </li>
          <li className={analysis.synonymList.length ? 'is-on' : ''}>
            {analysis.synonymList.length} synonym{analysis.synonymList.length === 1 ? '' : 's'}
          </li>
        </ul>
      </section>
    </div>
  );
}
