import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Panel from './Panel.jsx';
import WordHeader from './WordHeader.jsx';
import QuickMeaning from './QuickMeaning.jsx';
import MeaningSection from './MeaningSection.jsx';
import WordInsights from './WordInsights.jsx';
import ExampleCard from './ExampleCard.jsx';
import SynonymList from './SynonymList.jsx';
import AntonymList from './AntonymList.jsx';
import WordOrigin from './WordOrigin.jsx';
import WordChips from './WordChips.jsx';
import { relatedWords } from '../utils/wordUtils.js';

function collectExamples(entry, limit = 4) {
  const seen = new Set();
  const out = [];
  (entry.meanings || []).forEach((meaning) => {
    (meaning.definitions || []).forEach((def) => {
      if (!def.example) return;
      const key = def.example.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ example: def.example, partOfSpeech: meaning.partOfSpeech });
    });
  });
  return out.slice(0, limit);
}

/**
 * The full results dashboard — a single composed view used by /word/:word.
 */
export default function WordDashboard({ entry }) {
  const navigate = useNavigate();
  const examples = useMemo(() => collectExamples(entry), [entry]);
  const related = useMemo(() => relatedWords(entry, 12), [entry]);
  const hasSynonyms = useMemo(() => {
    const set = new Set();
    (entry.meanings || []).forEach((m) => {
      (m.synonyms || []).forEach((s) => set.add(s));
      (m.definitions || []).forEach((d) => (d.synonyms || []).forEach((s) => set.add(s)));
    });
    return set.size > 0;
  }, [entry]);

  const go = (word) => navigate(`/word/${encodeURIComponent(word)}`);

  return (
    <div className="dashboard anim-fade-up">
      <WordHeader entry={entry} as="h1" />

      <QuickMeaning entry={entry} />

      <div className="dash-grid">
        <Panel
          title="Definitions"
          eyebrow="Sense by sense"
          className="dash-main"
          action={<span className="panel-meta">{entry.meanings.length} part{entry.meanings.length === 1 ? '' : 's'} of speech</span>}
        >
          <MeaningSection entry={entry} />
        </Panel>

        <div className="dash-side">
          <WordInsights entry={entry} />
        </div>
      </div>

      <div className="dash-grid">
        <Panel title="Examples" eyebrow="In context" className="dash-main">
          {examples.length ? (
            <div className="examples-grid">
              {examples.map((item, index) => (
                <ExampleCard
                  key={`${item.example}-${index}`}
                  index={index + 1}
                  example={item.example}
                  word={entry.word}
                  partOfSpeech={item.partOfSpeech}
                />
              ))}
            </div>
          ) : (
            <p className="list-empty">No example sentences are recorded for this entry yet.</p>
          )}
        </Panel>

        <Panel
          title="Synonyms & antonyms"
          eyebrow="Neighbours"
          className="dash-side"
          action={hasSynonyms ? undefined : <span className="panel-meta">none recorded</span>}
        >
          <div className="chip-groups">
            <SynonymList entry={entry} onSelect={go} />
            <AntonymList entry={entry} onSelect={go} />
            {!hasSynonyms && !(entry.meanings || []).some((m) => (m.antonyms || []).length) && (
              <p className="list-empty">This entry has no recorded synonyms or antonyms.</p>
            )}
            {related.length > 0 && (
              <div className="chip-section">
                <h3 className="chip-label">RELATED WORDS</h3>
                <WordChips words={related} tone="ghost" limit={12} />
              </div>
            )}
          </div>
        </Panel>
      </div>

      {entry.origin && (
        <div className="card origin-card">
          <WordOrigin origin={entry.origin} />
        </div>
      )}
    </div>
  );
}
