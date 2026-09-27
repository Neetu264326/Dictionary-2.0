import SearchBar from './SearchBar.jsx';
import { SparkIcon } from './Icon.jsx';

/**
 * Homepage hero: editorial headline + floating search + CSS-only 3D stage.
 */
export default function HeroSearch({ loading = false, onSubmit }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-glow hero-glow-a" aria-hidden="true" />
      <div className="hero-glow hero-glow-b" aria-hidden="true" />

      <div className="hero-grid">
        <div className="hero-copy anim-fade-up">
          <p className="badge">
            <SparkIcon size={14} />
            DICTIONARY 2.0
          </p>

          <h1 id="hero-title" className="hero-title">
            Discover the meaning
            <br />
            behind every <span className="grad">word</span>.
          </h1>

          <p className="hero-sub">
            Explore definitions, pronunciation, examples, origins, synonyms and more — all in one
            intelligent vocabulary workspace.
          </p>

          <div className="hero-search">
            <SearchBar variant="hero" loading={loading} onSubmit={onSubmit} autoFocus={false} />
            <p className="hero-tip">
              Try <button type="button" className="inline-word" onClick={() => onSubmit?.('serendipity')}>serendipity</button>
              , <button type="button" className="inline-word" onClick={() => onSubmit?.('ephemeral')}>ephemeral</button> or{' '}
              <button type="button" className="inline-word" onClick={() => onSubmit?.('eloquent')}>eloquent</button>
              <span className="hero-tip-kbd">Press / to search anywhere</span>
            </p>
          </div>

          <ul className="hero-points">
            <li>100k+ entries</li>
            <li>Instant audio</li>
            <li>Word insights</li>
            <li>Offline favourites</li>
          </ul>
        </div>

        {/* Decorative CSS-only 3D stage */}
        <div className="hero-art" aria-hidden="true">
          <div className="art-stage">
            <span className="art-orb art-orb-1" />
            <span className="art-orb art-orb-2" />
            <span className="art-orb art-orb-3" />

            <span className="art-ring art-ring-1" />
            <span className="art-ring art-ring-2" />

            <span className="art-core">
              <span className="art-core-glyph">Aa</span>
              <span className="art-core-label">vocabulary</span>
            </span>

            <span className="art-letter art-letter-1">◇</span>
            <span className="art-letter art-letter-2">Q</span>
            <span className="art-letter art-letter-3">Ω</span>

            <div className="art-card art-card-1">
              <span className="art-card-tag">definition</span>
              <span className="art-card-word">eloquent</span>
              <span className="art-card-line" />
              <span className="art-card-line is-short" />
            </div>

            <div className="art-card art-card-2">
              <span className="art-card-tag is-cyan">/ɪˈfem.ər.əl/</span>
              <span className="art-card-word">ephemeral</span>
              <span className="art-card-line" />
            </div>

            <div className="art-panel art-panel-1">
              <span>WORD</span>
              <strong>2.0</strong>
            </div>

            <div className="art-chip art-chip-1">↗ syn</div>
            <div className="art-chip art-chip-2">◎ origin</div>
          </div>
        </div>
      </div>
    </section>
  );
}
