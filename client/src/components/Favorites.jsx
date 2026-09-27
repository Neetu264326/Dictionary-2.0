import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApp from '../context/AppContext.jsx';
import { formatDateShort } from '../utils/formatWord.js';
import { HeartIcon, TrashIcon, ArrowUpRight, CopyIcon } from './Icon.jsx';

/**
 * Saved words dashboard — reusable as a home panel or the full /favorites page.
 * `allowNotes` enables the personal-vocabulary note editor.
 */
export default function Favorites({ limit, showClear = true, showEmpty = true, allowNotes = false }) {
  const navigate = useNavigate();
  const { favorites, removeFavorite, clearFavorites, getNote, setNote } = useApp();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');

  const items = typeof limit === 'number' ? favorites.slice(0, limit) : favorites;

  const startEdit = (word) => {
    setEditing(word);
    setDraft(getNote(word) || '');
  };

  const saveNote = (word) => {
    setNote(word, draft);
    setEditing(null);
  };

  return (
    <div className="favorites">
      {showClear && items.length > 0 && (
        <div className="list-actions">
          <span className="list-count">
            {favorites.length} saved
          </span>
          <button type="button" className="text-btn" onClick={clearFavorites}>
            <TrashIcon size={14} /> Clear all
          </button>
        </div>
      )}

      {items.length === 0 ? (
        showEmpty ? (
          <p className="list-empty">
            <HeartIcon size={16} /> Nothing saved yet — tap ♡ on any word to keep it here.
          </p>
        ) : null
      ) : (
        <ul className="fav-list">
          {items.map((item) => {
            const note = getNote(item.word);
            return (
              <li className="fav-item" key={item.word.toLowerCase()}>
                <button
                  type="button"
                  className="fav-open"
                  onClick={() => navigate(`/word/${encodeURIComponent(item.word)}`)}
                >
                  <span className="fav-item-top">
                    <span className="fav-item-word">{item.word}</span>
                    <ArrowUpRight size={15} className="fav-item-arrow" />
                  </span>
                  {item.phonetic && <span className="fav-item-phonetic">{item.phonetic}</span>}
                  {item.definition && <span className="fav-item-def">{item.definition}</span>}
                  {note && <span className="fav-item-note">Note: {note}</span>}
                  <span className="fav-item-date">
                    {item.partOfSpeech ? `${item.partOfSpeech} · ` : ''}
                    saved {formatDateShort(item.addedAt)}
                  </span>
                </button>

                <div className="fav-item-tools">
                  <button
                    type="button"
                    className="fav-tool"
                    onClick={() => (editing === item.word ? setEditing(null) : startEdit(item.word))}
                    aria-label={`Add a note to ${item.word}`}
                    title="Personal note"
                  >
                    <CopyIcon size={14} />
                  </button>
                  <button
                    type="button"
                    className="fav-remove"
                    onClick={() => removeFavorite(item.word)}
                    aria-label={`Remove ${item.word} from favorites`}
                    title="Remove"
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>

                {allowNotes && editing === item.word && (
                  <div className="note-editor">
                    <label className="sr-only" htmlFor={`note-${item.word}`}>
                      Personal note for {item.word}
                    </label>
                    <textarea
                      id={`note-${item.word}`}
                      value={draft}
                      maxLength={240}
                      rows={2}
                      autoFocus
                      placeholder="My note: use this word in my next essay."
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          saveNote(item.word);
                        }
                        if (event.key === 'Escape') setEditing(null);
                      }}
                    />
                    <div className="note-actions">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => saveNote(item.word)}>
                        Save note
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
