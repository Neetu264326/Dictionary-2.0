import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useApp from '../context/AppContext.jsx';
import { wordOfTheDay } from '../utils/wordUtils.js';
import { formatDateLong } from '../utils/formatWord.js';
import { ArrowRight, FlameIcon } from './Icon.jsx';

const PARTICLES = [
  { left: '12%', top: '22%', delay: '0s', px: '18px' },
  { left: '28%', top: '68%', delay: '1.1s', px: '-14px' },
  { left: '62%', top: '18%', delay: '0.6s', px: '10px' },
  { left: '78%', top: '58%', delay: '1.7s', px: '-18px' },
  { left: '48%', top: '78%', delay: '0.3s', px: '12px' },
  { left: '88%', top: '34%', delay: '2.2s', px: '-10px' },
];

const FLOAT_LETTERS = ['A', 'Z', 'Ω', 'Q', 'Æ'];

export default function WordOfTheDay() {
  const navigate = useNavigate();
  const { markWotdExplored, streak } = useApp();

  const entry = useMemo(() => wordOfTheDay(), []);

  const explore = () => {
    markWotdExplored();
    navigate(`/word/${encodeURIComponent(entry.word)}`);
  };

  const days = streak?.days || 0;

  return (
    <section className="wotd card" aria-labelledby="wotd-title">
      <div className="wotd-visual" aria-hidden="true">
        <span className="sphere" />
        <span className="sphere-ring" />
        {PARTICLES.map((particle, index) => (
          <span
            key={index}
            className="particle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              '--px': particle.px,
            }}
          />
        ))}
        {FLOAT_LETTERS.map((letter, index) => (
          <span
            key={letter}
            className="float-letter"
            style={{ left: `${14 + index * 17}%`, top: `${20 + (index % 3) * 26}%`, animationDelay: `${index * 0.7}s` }}
          >
            {letter}
          </span>
        ))}
      </div>

      <div className="wotd-body">
        <div className="wotd-top">
          <p className="wotd-eyebrow">WORD OF THE DAY</p>
          <time className="wotd-date" dateTime={entry.date}>
            {formatDateLong()}
          </time>
        </div>

        <h2 className="wotd-word" id="wotd-title">
          {entry.word}
        </h2>
        <p className="wotd-phonetic">{entry.phonetic}</p>
        <p className="wotd-def">
          <span className="wotd-pos">{entry.partOfSpeech}</span>
          {entry.definition}
        </p>
        <p className="wotd-example">“{entry.example}”</p>

        <div className="wotd-foot">
          <button type="button" className="btn btn-primary" onClick={explore}>
            Explore word <ArrowRight size={16} />
          </button>

          <div className="streak" title="Days in a row you explored the word of the day">
            <FlameIcon size={16} />
            <span className="streak-label">Vocabulary streak</span>
            <strong>{days} day{days === 1 ? '' : 's'}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
