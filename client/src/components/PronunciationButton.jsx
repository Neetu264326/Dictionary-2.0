import { useCallback, useEffect, useRef, useState } from 'react';
import { VolumeIcon, PauseIcon, AlertIcon } from './Icon.jsx';
import useApp from '../context/AppContext.jsx';

/**
 * Premium audio control.
 * - Plays the provider audio when available.
 * - Animates a waveform while playing and resets cleanly afterwards.
 * - Never throws when audio is missing — it degrades to a friendly notice.
 */
export default function PronunciationButton({ audio, word = '', phonetic = '', variant = 'full' }) {
  const { pushToast } = useApp();
  const [state, setState] = useState('idle'); // idle | playing | unavailable
  const audioRef = useRef(null);

  const teardown = useCallback(() => {
    const element = audioRef.current;
    if (element) {
      element.onended = null;
      element.onerror = null;
      try {
        element.pause();
      } catch {
        /* ignore */
      }
    }
    audioRef.current = null;
    setState('idle');
  }, []);

  useEffect(() => teardown, [teardown]);

  const play = async () => {
    if (!audio) {
      setState('unavailable');
      pushToast('Pronunciation audio unavailable', { type: 'info' });
      return;
    }

    if (state === 'playing') {
      teardown();
      return;
    }

    try {
      if (!audioRef.current) {
        const element = new Audio();
        element.preload = 'auto';
        element.src = audio;
        element.onended = teardown;
        element.onerror = () => {
          teardown();
          setState('unavailable');
          pushToast('Pronunciation audio unavailable', { type: 'info' });
        };
        audioRef.current = element;
      }
      await audioRef.current.play();
      setState('playing');
    } catch {
      teardown();
      setState('unavailable');
      pushToast('Pronunciation audio unavailable', { type: 'info' });
    }
  };

  const available = Boolean(audio);
  const label = available
    ? `Play pronunciation of ${word}`
    : `Pronunciation audio unavailable for ${word}`;

  return (
    <button
      type="button"
      className={`pron-btn ${state === 'playing' ? 'is-playing' : ''} ${!available ? 'is-muted' : ''} pron-${variant}`.trim()}
      onClick={play}
      aria-label={label}
      aria-pressed={state === 'playing'}
      title={available ? 'Play pronunciation' : 'Pronunciation audio unavailable'}
    >
      <span className="pron-icon">
        {state === 'playing' ? <PauseIcon size={16} /> : available ? <VolumeIcon size={16} /> : <AlertIcon size={16} />}
      </span>
      <span className="pron-wave" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="wave-bar" style={{ animationDelay: `${i * 90}ms` }} />
        ))}
      </span>
      {variant === 'full' && (
        <span className="pron-text">
          {state === 'playing' ? 'Playing' : available ? phonetic || 'Pronounce' : 'Audio unavailable'}
        </span>
      )}
    </button>
  );
}
