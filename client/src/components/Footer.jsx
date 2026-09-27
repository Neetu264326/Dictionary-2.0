import { Link } from 'react-router-dom';
import useApp from '../context/AppContext.jsx';
import { SparkIcon } from './Icon.jsx';

export default function Footer() {
  const { history, favorites } = useApp();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            <SparkIcon size={15} />
          </span>
          <div>
            <strong>DICTIONARY 2.0</strong>
            <p>Words, meanings, and discoveries.</p>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer">
          <Link to="/">Explore</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/history">History</Link>
        </nav>

        <div className="footer-meta">
          <p>
            {favorites.length} saved · {history.length} searched
          </p>
          <p>Built with React + Node.js</p>
          <p>© 2026 Dictionary 2.0</p>
        </div>
      </div>
    </footer>
  );
}
