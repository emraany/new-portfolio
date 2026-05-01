'use client';

import { useState, useEffect, useCallback } from 'react';
import { tmdbPosterUrl } from '@/lib/tmdb';
import type { TMDBFilm } from '@/lib/tmdb';

// ─── Ticket Button ────────────────────────────────────────────────────────────

interface TicketButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  children: React.ReactNode;
}

function TicketButton({ onClick, type = 'button', disabled, children }: TicketButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-target"
      style={{
        border: '1px solid var(--color-accent)',
        color: hovered && !disabled ? 'var(--color-bg)' : 'var(--color-accent)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        letterSpacing: 'var(--tracking-wide)',
        padding: '10px 24px',
        textTransform: 'uppercase',
        background: hovered && !disabled ? 'var(--color-accent)' : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 200ms',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

// ─── Time Ago Helper ──────────────────────────────────────────────────────────

// ─── Main Form Component ──────────────────────────────────────────────────────

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY ?? '';
const TMDB_SEARCH_BASE = 'https://api.themoviedb.org/3/search/movie';

export default function RecommendationForm() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBFilm[]>([]);
  const [selectedFilm, setSelectedFilm] = useState<TMDBFilm | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced TMDB search
  const doSearch = useCallback((q: string) => {
    if (!q.trim() || !TMDB_KEY) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const url = `${TMDB_SEARCH_BASE}?query=${encodeURIComponent(q)}&api_key=${TMDB_KEY}&page=1`;
    fetch(url)
      .then((r) => r.json())
      .then((data: unknown) => {
        const d = data as { results?: TMDBFilm[] };
        const top5 = (d.results ?? []).slice(0, 5);
        setResults(top5);
        setShowDropdown(top5.length > 0);
      })
      .catch(() => {
        setResults([]);
        setShowDropdown(false);
      });
  }, []);

  useEffect(() => {
    if (selectedFilm) return; // don't re-search once selected
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, selectedFilm, doSearch]);

  function handleSelect(film: TMDBFilm) {
    setSelectedFilm(film);
    setQuery(film.title);
    setResults([]);
    setShowDropdown(false);
  }

  function handleClear() {
    setSelectedFilm(null);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedFilm) return;

    setSubmitting(true);
    setError(null);

    try {
      const body = {
        tmdb_id: selectedFilm.id,
        title: selectedFilm.title,
        poster_path: selectedFilm.poster_path ?? '',
        note: note.trim() || null,
      };

      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error ?? 'Submission failed');
      }

      await res.json();
      setSubmitted(true);
      setSelectedFilm(null);
      setQuery('');
      setNote('');

      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  const noApiKey = !TMDB_KEY;

  return (
    <div>
      {/* Section label */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-accent)',
          letterSpacing: 'var(--tracking-wide)',
          textTransform: 'uppercase',
          fontVariant: 'small-caps',
          marginBottom: '24px',
        }}
      >
        What Should I Watch?
      </p>

      {/* Helper text */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          marginBottom: '24px',
          lineHeight: 1.5,
        }}
      >
        Your recommendation goes straight into a list I check on Letterboxd — I&apos;ll be sure to watch it.
      </p>

      {/* Box-office window frame */}
      <style>{`
        .reco-box {
          border: 1px solid var(--color-border);
          padding: 32px;
          background: var(--color-surface);
          max-width: 600px;
        }
        @media (max-width: 600px) {
          .reco-box { padding: 16px; }
        }
      `}</style>
      <div className="reco-box">
        <form onSubmit={handleSubmit}>
          {/* Search input */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type="text"
              value={query}
              className="cursor-target"
              onChange={(e) => {
                setQuery(e.target.value);
                if (selectedFilm) setSelectedFilm(null);
              }}
              onFocus={() => {
                if (results.length > 0) setShowDropdown(true);
              }}
              placeholder={noApiKey ? 'Search unavailable (no API key)' : 'Search for a film...'}
              disabled={noApiKey}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderColor: showDropdown ? 'var(--color-accent)' : 'var(--color-border)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                padding: '12px 16px',
                outline: 'none',
                transition: 'border-color 200ms',
                boxSizing: 'border-box',
              }}
            />

            {/* Results dropdown */}
            {showDropdown && results.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-accent)',
                  borderTop: 'none',
                  zIndex: 'var(--z-modal)' as React.CSSProperties['zIndex'],
                  maxHeight: '280px',
                  overflowY: 'auto',
                }}
              >
                {results.map((film) => (
                  <button
                    key={film.id}
                    type="button"
                    onClick={() => handleSelect(film)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '10px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'var(--color-border)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >
                    {/* Poster thumb */}
                    <div
                      style={{
                        width: '40px',
                        height: '60px',
                        flexShrink: 0,
                        background: 'var(--color-bg)',
                        overflow: 'hidden',
                      }}
                    >
                      {film.poster_path ? (
                        <img
                          src={tmdbPosterUrl(film.poster_path, 'w342')}
                          alt={film.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : null}
                    </div>

                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {film.title}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-secondary)',
                          marginTop: '2px',
                        }}
                      >
                        {film.release_date ? film.release_date.slice(0, 4) : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected film card */}
          {selectedFilm && (
            <div
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                border: '1px solid var(--color-accent)',
                padding: '16px',
                marginBottom: '16px',
                background: 'var(--color-bg)',
              }}
            >
              {selectedFilm.poster_path && (
                <img
                  src={tmdbPosterUrl(selectedFilm.poster_path, 'w342')}
                  alt={selectedFilm.title}
                  style={{ width: '60px', height: '90px', objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {selectedFilm.title}
                </div>
                {selectedFilm.release_date && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-secondary)',
                      marginTop: '4px',
                    }}
                  >
                    {selectedFilm.release_date.slice(0, 4)}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  padding: '0',
                  letterSpacing: 'var(--tracking-wide)',
                }}
              >
                CLEAR
              </button>
            </div>
          )}

          {/* Note textarea */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="cursor-target"
            placeholder="Leave a note with your recommendation? (No spoilers!)"
            rows={3}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              padding: '12px 16px',
              outline: 'none',
              resize: 'vertical',
              marginBottom: '16px',
              boxSizing: 'border-box',
            }}
          />

          {/* Error */}
          {error && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-accent-red)',
                marginBottom: '12px',
              }}
            >
              {error}
            </p>
          )}

          {/* Success */}
          {submitted && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-accent)',
                marginBottom: '12px',
                letterSpacing: 'var(--tracking-wide)',
              }}
            >
              RECOMMENDATION SUBMITTED. THANK YOU.
            </p>
          )}

          {/* Submit button */}
          <TicketButton
            type="submit"
            disabled={!selectedFilm || submitting || noApiKey}
          >
            {submitting ? 'Submitting...' : 'Recommend It'}
          </TicketButton>
        </form>
      </div>

    </div>
  );
}
