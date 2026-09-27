import { useEffect, useState } from 'react';
import useTheme from '../hooks/useTheme.js';
import { SunIcon, MoonIcon, MonitorIcon } from './Icon.jsx';

const ORDER = ['light', 'dark', 'system'];

const LABELS = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'Theme follows your system',
};

const ICONS = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
};

export default function ThemeToggle({ compact = false }) {
  const { theme, resolved, set } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycle = () => {
    const index = ORDER.indexOf(theme);
    set(ORDER[(index + 1) % ORDER.length]);
  };

  const Icon = mounted ? ICONS[theme] || MonitorIcon : MonitorIcon;

  return (
    <button
      type="button"
      className={`theme-toggle ${compact ? 'is-compact' : ''} ${resolved === 'dark' ? 'is-dark' : ''}`.trim()}
      onClick={cycle}
      aria-label={`${LABELS[theme] || 'Change theme'} — click to switch`}
      title={LABELS[theme]}
      data-theme-choice={theme}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb">
          <Icon size={14} />
        </span>
      </span>
      {!compact && <span className="theme-toggle-label">{theme}</span>}
    </button>
  );
}
