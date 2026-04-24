'use client';

import { useState, useEffect, useCallback } from 'react';
import { tmdbPosterUrl } from '@/lib/tmdb';
import type { Recommendation } from '@/lib/supabase';
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

function timeAgo(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months === 1) return '1 month ago';
    return `${months} months ago`;
  } catch {
    return '';
  }
}

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
  const [pastRecs, setPastRecs] = useState<Recommendation[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load past recommendations on mount
  useEffect(() => {
    fetch('/api/recommendations')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setPastRecs(data as Recommendation[]);
      })
      .catch(() => {});
  }, []);

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

      const created = (await res.json()) as Recommendation;
      setPastRecs((prev) => [created, ...prev]);
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

      {/* Box-office window frame */}
      <div
        style={{
          border: '1px solid var(--color-border)',
          padding: '32px',
          background: 'var(--color-surface)',
          maxWidth: '600px',
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Search input */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type="text"
              value={query}
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
            placeholder="Why should I watch this?"
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

      {/* Past recommendations strip */}
      {pastRecs.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            From Other Visitors
          </p>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              paddingBottom: '16px',
              scrollSnapType: 'x mandatory',
            }}
          >
            {pastRecs.map((rec) => (
              <div
                key={rec.id ?? `${rec.tmdb_id}-${rec.created_at ?? ''}`}
                style={{
                  flexShrink: 0,
                  width: '120px',
                  scrollSnapAlign: 'start',
                }}
              >
                {/* Poster */}
                <div
                  style={{
                    aspectRatio: '2/3',
                    background: 'var(--color-surface)',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}
                >
                  {rec.poster_path ? (
                    <img
                      src={tmdbPosterUrl(rec.poster_path, 'w342')}
                      alt={rec.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : null}
                </div>

                {/* Title */}
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    margin: '0 0 4px',
                  }}
                >
                  {rec.title}
                </p>

                {/* Note */}
                {rec.note && (
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      margin: '0 0 4px',
                    }}
                    title={rec.note}
                  >
                    {rec.note}
                  </p>
                )}

                {/* Timestamp */}
                {rec.created_at && (
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      margin: 0,
                    }}
                  >
                    {timeAgo(rec.created_at)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
