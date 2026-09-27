import { Link } from 'react-router-dom';
import useApp from '../context/AppContext.jsx';
import { BookIcon, HeartIcon, ClockIcon, FlameIcon } from './Icon.jsx';

export default function QuickStats() {
  const { recent, favorites, history, streak } = useApp();

  const stats = [
    { label: 'Words explored', value: recent.length, Icon: BookIcon, to: '/history' },
    { label: 'Saved favorites', value: favorites.length, Icon: HeartIcon, to: '/favorites' },
    { label: 'Searches', value: history.length, Icon: ClockIcon, to: '/history' },
    { label: 'Day streak', value: streak.days, Icon: FlameIcon, to: '/history' },
  ];

  return (
    <section className="quick-stats" aria-label="Quick stats">
      <div className="stats-grid">
        {stats.map(({ label, value, Icon, to }) => (
          <Link to={to} className="stat-card card" key={label}>
            <span className="stat-icon" aria-hidden="true">
              <Icon size={17} />
            </span>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </Link>
        ))}
      </div>

      <div className="stat-banner card">
        <p className="panel-eyebrow">Your progress</p>
        <p className="stat-banner-text">
          {favorites.length > 0
            ? `You have ${favorites.length} word${favorites.length === 1 ? '' : 's'} saved and a ${streak.days}-day exploration streak.`
            : 'Save words you love and keep a daily exploration streak going.'}
        </p>
        <div className="stat-banner-actions">
          <Link className="btn btn-ghost btn-sm" to="/favorites">
            View favorites
          </Link>
          <Link className="btn btn-ghost btn-sm" to="/history">
            Search trail
          </Link>
        </div>
      </div>
    </section>
  );
}
