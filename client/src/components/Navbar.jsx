import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import useApp from '../context/AppContext.jsx';
import { MenuIcon, CloseIcon, HeartIcon, ClockIcon, CompassIcon, SparkIcon } from './Icon.jsx';

const LINKS = [
  { to: '/', label: 'Explore', Icon: CompassIcon, end: true },
  { to: '/favorites', label: 'Favorites', Icon: HeartIcon },
  { to: '/history', label: 'History', Icon: ClockIcon },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading } = useApp();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const closeAndGo = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="Dictionary 2.0 home">
          <span className="brand-mark" aria-hidden="true">
            <SparkIcon size={16} />
          </span>
          <span className="brand-text">
            Dictionary <strong>2.0</strong>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`.trim()}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-search">
          <SearchBar
            variant="navbar"
            id="navbar-search"
            placeholder="Search a word…"
            showHint={false}
            loading={isLoading}
          />
        </div>

        <div className="nav-actions">
          <ThemeToggle compact />
          <button
            type="button"
            className="hamburger"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-drawer"
          >
            {open ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      <div className={`drawer-overlay ${open ? 'is-open' : ''}`.trim()} onClick={() => setOpen(false)} aria-hidden="true" />

      <nav
        id="mobile-drawer"
        className={`drawer ${open ? 'is-open' : ''}`.trim()}
        aria-label="Mobile"
        aria-hidden={!open}
      >
        <div className="drawer-head">
          <span className="brand-text">
            Dictionary <strong>2.0</strong>
          </span>
          <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="drawer-search">
          <SearchBar
            variant="drawer"
            id="drawer-search"
            placeholder="Search any English word…"
            showHint={false}
            onSubmit={(word) => closeAndGo(`/word/${encodeURIComponent(word)}`)}
          />
        </div>

        <ul className="drawer-links">
          {LINKS.map(({ to, label, Icon }) => (
            <li key={to}>
              <button
                type="button"
                className={`drawer-link ${location.pathname === to ? 'is-active' : ''}`.trim()}
                onClick={() => closeAndGo(to)}
              >
                <Icon size={18} />
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="drawer-foot">
          <ThemeToggle />
          <p>Search smarter. Understand deeper.</p>
        </div>
      </nav>
    </header>
  );
}
