/**
 * Inline SVG icon set — keeps the bundle small and the visual language
 * consistent (1.6px strokes, currentColor).
 */
import React from 'react';

const base = (props) => ({
  width: props.size || 20,
  height: props.size || 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: props.strokeWidth || 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
  className: props.className,
});

export const SearchIcon = (p) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></svg>
);

export const CloseIcon = (p) => (
  <svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>
);

export const ArrowRight = (p) => (
  <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export const ArrowUpRight = (p) => (
  <svg {...base(p)}><path d="M7 17 17 7M8 7h9v9" /></svg>
);

export const HeartIcon = ({ filled, ...p }) => (
  <svg {...base(p)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.5s-7.5-4.7-7.5-10A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.9c0 5.3-7.5 10-7.5 10Z" />
  </svg>
);

export const SunIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
);

export const MoonIcon = (p) => (
  <svg {...base(p)}><path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" /></svg>
);

export const MonitorIcon = (p) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8m-4-4v4" /></svg>
);

export const MenuIcon = (p) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);

export const CopyIcon = (p) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M6 15H5.5A1.5 1.5 0 0 1 4 13.5v-8A1.5 1.5 0 0 1 5.5 4h8A1.5 1.5 0 0 1 15 5.5V6" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...base(p)}><path d="m5 13 4.5 4.5L19 7" /></svg>
);

export const ShareIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" />
    <path d="m8.3 10.8 7.4-4M8.3 13.2l7.4 4" />
  </svg>
);

export const PlayIcon = (p) => (
  <svg {...base(p)}><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none" /></svg>
);

export const PauseIcon = (p) => (
  <svg {...base(p)}><path d="M9 5v14M15 5v14" strokeWidth="2.4" /></svg>
);

export const VolumeIcon = (p) => (
  <svg {...base(p)}>
    <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
    <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" />
  </svg>
);

export const SparkIcon = (p) => (
  <svg {...base(p)}>
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
    <path d="M18.5 3v3M20 4.5h-3" />
  </svg>
);

export const ClockIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></svg>
);

export const TrashIcon = (p) => (
  <svg {...base(p)}>
    <path d="M4.5 6.5h15M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
    <path d="M6.5 6.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.5" />
    <path d="M10.5 10v6M13.5 10v6" />
  </svg>
);

export const ChevronUp = (p) => (
  <svg {...base(p)}><path d="m6 14.5 6-6 6 6" /></svg>
);

export const ChevronDown = (p) => (
  <svg {...base(p)}><path d="m6 9.5 6 6 6-6" /></svg>
);

export const InfoIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8v.4" /></svg>
);

export const AlertIcon = (p) => (
  <svg {...base(p)}>
    <path d="M12 4.5 21 19.5H3L12 4.5Z" /><path d="M12 10v4M12 16.7v.3" />
  </svg>
);

export const BookIcon = (p) => (
  <svg {...base(p)}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" />
  </svg>
);

export const FlameIcon = (p) => (
  <svg {...base(p)}>
    <path d="M12 3.5s4.5 3.4 4.5 8a4.5 4.5 0 0 1-9 0c0-1.4.6-2.6 1.3-3.5.3 1 .9 1.8 1.7 2.1C10.9 7.4 12 5.4 12 3.5Z" />
    <path d="M7.8 13.4A6.5 6.5 0 0 0 12 20.5a6.5 6.5 0 0 0 4.2-7.1" />
  </svg>
);

export const CompassIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m14.8 9.2-1.6 4.2-4.2 1.6 1.6-4.2 4.2-1.6Z" />
  </svg>
);

export const LayersIcon = (p) => (
  <svg {...base(p)}>
    <path d="m12 3.5 8 4.3-8 4.3-8-4.3 8-4.3Z" />
    <path d="m4 12.4 8 4.3 8-4.3M4 16.4l8 4.3 8-4.3" />
  </svg>
);

export const MicIcon = (p) => (
  <svg {...base(p)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
  </svg>
);

export const LinkIcon = (p) => (
  <svg {...base(p)}>
    <path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.2 1.2" />
    <path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.2-1.2" />
  </svg>
);
