import { quickMeaning } from '../utils/wordUtils.js';
import { SparkIcon } from './Icon.jsx';

/**
 * Prominent, concise definition block.
 * Explicitly labelled as selected from dictionary data — never presented as
 * an AI-generated summary.
 */
export default function QuickMeaning({ entry }) {
  if (!entry) return null;
  const text = quickMeaning(entry, 220);
  if (!text) return null;

  const pos = entry.meanings?.[0]?.partOfSpeech;

  return (
    <section className="quick-meaning card" aria-label="Quick meaning">
      <div className="qm-head">
        <span className="qm-label">
          <SparkIcon size={14} />
          QUICK MEANING
        </span>
        {pos && <span className="qm-pos">{pos}</span>}
      </div>
      <p className="qm-text">{text}</p>
      <p className="qm-note">Selected from the dictionary entry — no generative model involved.</p>
    </section>
  );
}
