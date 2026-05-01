'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { tmdbPosterUrl } from '@/lib/tmdb';

interface SearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

interface SelectedFilm {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}


export default function RecommendationForm() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SelectedFilm | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // TMDB search
  useEffect(() => {
    if (!debouncedQuery.trim() || selected) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    setSearching(true);

    fetch(`/api/tmdb-search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data: SearchResult[]) => {
        if (!cancelled) {
          setSearchResults(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, selected]);

  const selectFilm = useCallback((film: SearchResult) => {
    setSelected(film);
    setQuery(film.title);
    setSearchResults([]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(null);
    setQuery('');
    setSearchResults([]);
    setSubmitSuccess(false);
    setSubmitError('');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selected) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: selected.id,
          title: selected.title,
          poster_path: selected.poster_path ?? '',
          note: note.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? 'Submission failed');
      }

      setSubmitSuccess(true);
      setSelected(null);
      setQuery('');
      setNote('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }, [selected, note]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-sm)',
    padding: 'var(--space-3) var(--space-4)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color var(--duration-base) var(--ease-film)',
  };

  if (submitSuccess) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-accent)',
          margin: 0,
          letterSpacing: 'var(--tracking-wide)',
        }}
      >
        [ YOUR RECOMMENDATION HAS BEEN SENT! ]
      </motion.p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Form area */}
      <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Search box */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-accent)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-2)',
            }}
          >
            SEARCH FOR A FILM
          </label>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (selected) clearSelection();
              }}
              placeholder="Search for a film..."
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
              aria-label="Search for a film to recommend"
              aria-autocomplete="list"
              aria-expanded={searchResults.length > 0}
            />
            {searching && (
              <span
                style={{
                  position: 'absolute',
                  right: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                ...
              </span>
            )}
          </div>

          {/* Dropdown results */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-accent)',
                  borderTop: 'none',
                }}
                role="listbox"
              >
                {searchResults.map((film) => (
                  <button
                    key={film.id}
                    role="option"
                    aria-selected={selected?.id === film.id}
                    onClick={() => selectFilm(film)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(200,169,110,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    {film.poster_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tmdbPosterUrl(film.poster_path, 'w342')}
                        alt={film.title}
                        style={{ width: '32px', height: '48px', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '32px',
                          height: '48px',
                          background: 'var(--color-bg)',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div>
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-primary)',
                          margin: 0,
                          lineHeight: 1.3,
                        }}
                      >
                        {film.title}
                      </p>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.625rem',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {film.release_date ? film.release_date.slice(0, 4) : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected film display */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              style={{
                border: '1px solid var(--color-accent)',
                padding: 'var(--space-3)',
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'flex-start',
              }}
            >
              {selected.poster_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tmdbPosterUrl(selected.poster_path, 'w342')}
                  alt={selected.title}
                  style={{ width: '48px', height: '72px', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div
                  style={{
                    width: '48px',
                    height: '72px',
                    background: 'var(--color-bg)',
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-accent)',
                    margin: '0 0 var(--space-1)',
                    lineHeight: 1.3,
                  }}
                >
                  {selected.title}
                </p>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {selected.release_date ? selected.release_date.slice(0, 4) : ''}
                </span>
              </div>
              <button
                onClick={clearSelection}
                aria-label="Clear selection"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  padding: 0,
                  letterSpacing: 'var(--tracking-wide)',
                }}
              >
                [ X ]
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Note textarea */}
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-accent)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-2)',
            }}
          >
            WHY SHOULD I WATCH THIS? (OPTIONAL)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why should I watch this?"
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '80px',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          />
        </div>

        {/* Submit error */}
        {submitError && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-accent-red)',
              margin: 0,
            }}
          >
            {submitError}
          </p>
        )}

        {/* Submit button — ticket style */}
        <button
          onClick={handleSubmit}
          disabled={!selected || submitting}
          style={{
            alignSelf: 'flex-start',
            background: 'none',
            border: '1px solid var(--color-accent)',
            color: selected && !submitting ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            padding: 'var(--space-3) var(--space-6)',
            cursor: selected && !submitting ? 'pointer' : 'not-allowed',
            transition: 'background var(--duration-base), color var(--duration-base)',
            borderColor: selected && !submitting ? 'var(--color-accent)' : 'var(--color-border)',
          }}
          onMouseEnter={(e) => {
            if (selected && !submitting) {
              e.currentTarget.style.background = 'var(--color-accent)';
              e.currentTarget.style.color = 'var(--color-bg)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color =
              selected && !submitting ? 'var(--color-accent)' : 'var(--color-text-muted)';
          }}
        >
          {submitting ? '[ SUBMITTING... ]' : '[ RECOMMEND IT ]'}
        </button>
      </div>

    </div>
  );
}
