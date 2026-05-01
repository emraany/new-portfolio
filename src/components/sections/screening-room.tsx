// No 'use client' — this is a React Server Component

import { fetchLetterboxdFeed, type LetterboxdEntry } from '@/lib/rss';
import { tmdbPosterUrl, searchFilm, getFilmById } from '@/lib/tmdb';
import { top10Films } from '@/data/top10';
import RecommendationForm from './screening-room-form';
import Top10Grid from '@/components/screening-room/top10';
import SectionHeader from '@/components/ui/section-header';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiaryEntryWithPoster extends LetterboxdEntry {
  posterPath: string | null;
}

// ─── Star Rating display (server-safe) ───────────────────────────────────────

// 5-pointed star path in a 20×20 viewBox, centered at (10,10)
const STAR = 'M10,1 L12.06,7.17 L18.56,7.22 L13.33,11.08 L15.29,17.28 L10,13.5 L4.71,17.28 L6.67,11.08 L1.44,7.22 L7.94,7.17 Z';

function StarIcon({ type }: { type: 'full' | 'half' | 'empty' }) {
  const accent = 'var(--color-accent)';
  return (
    <svg width="11" height="11" viewBox="0 0 20 20" aria-hidden="true" style={{ display: 'block' }}>
      {type === 'half' && (
        <defs>
          <clipPath id="sr-half">
            <rect x="0" y="0" width="10" height="20" />
          </clipPath>
        </defs>
      )}
      {/* outline */}
      <path d={STAR} fill="none" stroke={accent} strokeWidth="1.5" strokeLinejoin="round" />
      {/* fill */}
      {type === 'full' && <path d={STAR} fill={accent} />}
      {type === 'half' && <path d={STAR} fill={accent} clipPath="url(#sr-half)" />}
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - filled - (half ? 1 : 0);

  return (
    <span aria-label={`${rating} out of 5`} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {Array.from({ length: filled }, (_, i) => <StarIcon key={`f${i}`} type="full" />)}
      {half && <StarIcon type="half" />}
      {Array.from({ length: empty }, (_, i) => <StarIcon key={`e${i}`} type="empty" />)}
    </span>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SubsectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-accent)',
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        fontVariant: 'small-caps',
        marginBottom: '24px',
        marginTop: 0,
      }}
    >
      {children}
    </p>
  );
}

// ─── Horizontal scroll strip ──────────────────────────────────────────────────

function ScrollStrip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '16px',
        scrollSnapType: 'x mandatory',
        paddingBottom: '16px',
        // Custom scrollbar styling via inline style is limited; relies on globals.css
      }}
    >
      {children}
    </div>
  );
}

// ─── Recently Watched subsection ──────────────────────────────────────────────

function RecentlyWatched({ entries }: { entries: DiaryEntryWithPoster[] }) {
  if (entries.length === 0) {
    return (
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
        }}
      >
        Fetching from Letterboxd...
      </p>
    );
  }

  return (
    <ScrollStrip>
      <style>{`
        .recent-card { flex-shrink: 0; width: 140px; scroll-snap-align: start; }
        .recent-card__poster { aspect-ratio: 2/3; background: var(--color-surface); overflow: hidden; width: 140px; }
        @media (max-width: 480px) {
          .recent-card,
          .recent-card__poster { width: 110px; }
        }
      `}</style>
      {entries.map((entry, i) => (
        <div key={`${entry.title}-${i}`} className="recent-card">
          <div className="recent-card__poster">
              {entry.posterPath ? (
                <img
                  src={tmdbPosterUrl(entry.posterPath, 'w342')}
                  alt={entry.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    boxSizing: 'border-box',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      textAlign: 'center',
                      lineHeight: 1.4,
                    }}
                  >
                    {entry.title}
                  </span>
                </div>
              )}
          </div>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              margin: '8px 0 4px',
            }}
            title={entry.title}
          >
            {entry.title}
          </p>

          {entry.rating !== null && (
            <div style={{ marginBottom: '4px' }}>
              <StarRating rating={entry.rating} />
            </div>
          )}

          {entry.watchDate && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--color-text-muted)',
                margin: 0,
              }}
            >
              {entry.watchDate}
            </p>
          )}
        </div>
      ))}
    </ScrollStrip>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div
      style={{
        height: '1px',
        background: 'var(--color-border)',
        margin: '48px 0',
      }}
    />
  );
}

// ─── Main Server Component ────────────────────────────────────────────────────

export default async function ScreeningRoom() {
  const diary = await fetchLetterboxdFeed('diary');

  // Enrich diary entries with TMDB poster paths
  const diaryWithPosters: DiaryEntryWithPoster[] = await Promise.all(
    diary.slice(0, 10).map(async (entry): Promise<DiaryEntryWithPoster> => {
      const film = await searchFilm(entry.title);
      return { ...entry, posterPath: film?.poster_path ?? null };
    })
  );

  // Enrich top 10 films with poster paths from TMDB (skip fetch if posterPath already set)
  const top10WithPosters = await Promise.all(
    top10Films.map(async (film) => {
      if (film.posterPath) return film;
      const detail = await getFilmById(film.tmdbId);
      return { ...film, posterPath: detail?.poster_path ?? undefined };
    })
  );


  return (
    <section
      id="screening-room"
      className="screening-room-section"
      style={{
        paddingTop: 'var(--space-24)',
        paddingBottom: 'var(--space-24)',
        paddingLeft: 'var(--section-pad-x)',
        paddingRight: 'var(--section-pad-x)',
        background: 'var(--color-bg)',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .screening-room-section {
            padding-top: var(--space-12) !important;
            padding-bottom: var(--space-12) !important;
          }
        }
      `}</style>
      <SectionHeader label="THE SCREENING ROOM" heading="[My Engagement with Film]" />

      {/* ── Subsection 1: My Top 10 ── */}
      <div style={{ marginBottom: '0' }}>
        <SubsectionLabel>My Top 10</SubsectionLabel>
        <Top10Grid films={top10WithPosters} />
      </div>

      <Divider />

      {/* ── Subsection 2: Recently Watched ── */}
      <div>
        <SubsectionLabel>Recently Watched</SubsectionLabel>
        <RecentlyWatched entries={diaryWithPosters} />
      </div>

      <Divider />

      {/* ── Subsection 3: What Should I Watch? ── */}
      <div>
        <RecommendationForm />
      </div>
    </section>
  );
}
