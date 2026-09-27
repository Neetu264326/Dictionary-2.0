import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApp from '../context/AppContext.jsx';
import useDebounce from '../hooks/useDebounce.js';
import { buildSuggestions } from '../utils/suggestions.js';
import { isValidQuery, normalizeQuery } from '../services/dictionaryApi.js';
import { relatedWords } from '../utils/wordUtils.js';
import SearchSuggestions from './SearchSuggestions.jsx';
import { SearchIcon, CloseIcon, ArrowRight, MicIcon } from './Icon.jsx';

const LISTBOX_ID = 'search-suggestions';

/**
 * The search input used in the hero, the navbar and the sticky result bar.
 * Handles autocomplete, keyboard navigation, clearing, loading and voice input.
 */
export default function SearchBar({
  variant = 'hero',
  placeholder = 'Search any English word…',
  showHint = true,
  autoFocus = false,
  loading = false,
  value: controlledValue,
  onChange,
  onSubmit,
  className = '',
  id = 'primary-search',
}) {
  const navigate = useNavigate();
  const { history, favorites, recent, data, pushToast } = useApp();

  const [innerValue, setInnerValue] = useState(controlledValue ?? '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [listening, setListening] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const inputRef = useRef(null);
  const shellRef = useRef(null);
  const recognitionRef = useRef(null);
  const skipBlurRef = useRef(false);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : innerValue;

  const setValue = useCallback(
    (next) => {
      if (!isControlled) setInnerValue(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const debounced = useDebounce(value, 170);
  const related = useMemo(() => (data ? relatedWords(data, 10) : []), [data]);

  const suggestions = useMemo(
    () => buildSuggestions(debounced, { history, favorites, recent, related }, 7),
    [debounced, history, favorites, recent, related]
  );

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Close when clicking outside the search shell.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => {
      if (shellRef.current && !shellRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const go = useCallback(
    (raw) => {
      const word = normalizeQuery(raw);
      if (!isValidQuery(word)) {
        setInvalid(true);
        pushToast('Type a word to start exploring.', { type: 'error' });
        inputRef.current?.focus();
        setTimeout(() => setInvalid(false), 450);
        return;
      }
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      if (onSubmit) onSubmit(word);
      else navigate(`/word/${encodeURIComponent(word)}`);
    },
    [navigate, onSubmit, pushToast]
  );

  const handleChange = (event) => {
    setValue(event.target.value);
    setOpen(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      if (open) {
        event.stopPropagation();
        setOpen(false);
        setActiveIndex(-1);
      }
      return;
    }
    if (event.key === 'ArrowDown' && suggestions.length) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index + 1) % suggestions.length);
      return;
    }
    if (event.key === 'ArrowUp' && suggestions.length) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const pick = activeIndex >= 0 ? suggestions[activeIndex]?.word : null;
      go(pick || value);
    }
  };

  const clear = () => {
    setValue('');
    setActiveIndex(-1);
    setOpen(true);
    inputRef.current?.focus();
  };

  const selectSuggestion = (word) => go(word);

  const toggleVoice = () => {
    const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechAPI) {
      pushToast('Voice search is not supported in this browser yet.', { type: 'info' });
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    try {
      const recognition = new SpeechAPI();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setValue(transcript);
          go(transcript);
        }
      };
      recognition.onerror = () => pushToast("We couldn't hear that. Try again.", { type: 'error' });
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      setListening(true);
      recognition.start();
    } catch {
      setListening(false);
      pushToast('Voice search is unavailable right now.', { type: 'error' });
    }
  };

  const showSuggestions = open && (suggestions.length > 0 || value.trim().length > 0);
  const activeDesc = showSuggestions && activeIndex >= 0 ? `${LISTBOX_ID}-option-${activeIndex}` : undefined;

  return (
    <div
      ref={shellRef}
      className={`search-shell search-${variant} ${invalid ? 'is-invalid' : ''} ${className}`.trim()}
    >
      <form
        className="search-box"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          go(value);
        }}
      >
        <span className="search-ring" aria-hidden="true" />
        <span className="search-icon" aria-hidden="true">
          <SearchIcon size={19} />
        </span>

        <label className="sr-only" htmlFor={id}>
          Search the dictionary
        </label>
        <input
          ref={inputRef}
          id={id}
          data-search-input
          className="search-input"
          type="search"
          name="q"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          enterKeyHint="search"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            if (skipBlurRef.current) return;
            setOpen(false);
          }}
          onMouseDown={() => {
            skipBlurRef.current = true;
            setTimeout(() => {
              skipBlurRef.current = false;
            }, 0);
          }}
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={LISTBOX_ID}
          aria-autocomplete="list"
          aria-activedescendant={activeDesc}
          aria-label="Search any English word"
        />

        <span className="search-actions">
          {loading && (
            <span className="search-spinner" role="status" aria-label="Searching">
              <span />
            </span>
          )}

          {!loading && value && (
            <button type="button" className="search-clear" onClick={clear} aria-label="Clear search">
              <CloseIcon size={16} />
            </button>
          )}

          <button
            type="button"
            className={`search-voice ${listening ? 'is-listening' : ''}`.trim()}
            onClick={toggleVoice}
            aria-label="Search by voice"
            title="Search by voice"
          >
            <MicIcon size={17} />
            <span className="voice-dot" aria-hidden="true" />
          </button>

          {showHint && variant === 'hero' && (
            <kbd className="search-kbd" aria-hidden="true">
              Enter ↵
            </kbd>
          )}

          <button type="submit" className="search-submit" aria-label="Search dictionary">
            <span>{variant === 'hero' ? 'Search' : ''}</span>
            <ArrowRight size={17} />
          </button>
        </span>
      </form>

      <SearchSuggestions
        suggestions={suggestions}
        open={showSuggestions}
        activeIndex={activeIndex}
        query={value.trim()}
        listboxId={LISTBOX_ID}
        onSelect={selectSuggestion}
        onHover={setActiveIndex}
      />
    </div>
  );
}
