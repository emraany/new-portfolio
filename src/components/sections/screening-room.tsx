// No 'use client' — this is a React Server Component

import { fetchLetterboxdFeed, type LetterboxdEntry } from '@/lib/rss';
import { tmdbPosterUrl, searchFilm } from '@/lib/tmdb';
import { top25Films, type Top25Film } from '@/data/top25';
import DarkroomImage from '@/components/animations/darkroom-image';
import RecommendationForm from './screening-room-form';
import Top25Grid from './top25-grid';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiaryEntryWithPoster extends LetterboxdEntry {
  posterPath: string | null;
}

// ─── Star Rating display (server-safe) ───────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  // Letterboxd rates out of 5; show up to 5 filled/half/empty dots
  const filled = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - filled - half;

  return (
    <span
      aria-label={`${rating} out of 5`}
      style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px' }}
    >
      {'●'.repeat(filled)}
      {half ? '◐' : ''}
      {'○'.repeat(empty)}
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
      {entries.map((entry, i) => (
        <div
          key={`${entry.title}-${i}`}
          style={{
            flexShrink: 0,
            width: '140px',
            scrollSnapAlign: 'start',
          }}
        >
          <DarkroomImage>
            <div
              style={{
                aspectRatio: '2/3',
                background: 'var(--color-surface)',
                overflow: 'hidden',
                width: '140px',
              }}
            >
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
          </DarkroomImage>

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

// ─── Coming Soon subsection ───────────────────────────────────────────────────

function ComingSoon({ entries }: { entries: LetterboxdEntry[] }) {
  return (
    <>
      <SubsectionLabel>Coming Soon to a Screening Room Near You</SubsectionLabel>

      {entries.length === 0 ? (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
          }}
        >
          Watchlist loading...
        </p>
      ) : (
        <ScrollStrip>
          {entries.map((entry, i) => (
            <div
              key={`${entry.title}-${i}`}
              style={{
                flexShrink: 0,
                width: '100px',
                scrollSnapAlign: 'start',
              }}
            >
              <div
                style={{
                  aspectRatio: '2/3',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--color-text-secondary)',
                    textAlign: 'center',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}
                >
                  {entry.title}
                </span>
              </div>
            </div>
          ))}
        </ScrollStrip>
      )}
    </>
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
  // Fetch RSS feeds in parallel — failures return empty arrays
  const [diary, watchlist] = await Promise.all([
    fetchLetterboxdFeed('diary'),
    fetchLetterboxdFeed('watchlist'),
  ]);

  // Enrich diary entries with TMDB poster paths (top 10 only)
  const diaryWithPosters: DiaryEntryWithPoster[] = await Promise.all(
    diary.slice(0, 10).map(async (entry): Promise<DiaryEntryWithPoster> => {
      const film = await searchFilm(entry.title);
      return { ...entry, posterPath: film?.poster_path ?? null };
    })
  );

  // Cast top25Films to include posterPath (already typed as optional)
  const filmsForGrid: Top25Film[] = top25Films;

  return (
    <section
      id="screening-room"
      style={{
        padding: 'var(--space-24) var(--space-8)',
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {/* Section header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '16px' }} />
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            margin: '0 0 4px',
          }}
        >
          The Screening Room
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            letterSpacing: 'var(--tracking-wide)',
            margin: 0,
          }}
        >
          [what I watch when I'm not shipping]
        </p>
        <div style={{ height: '1px', background: 'var(--color-border)', marginTop: '16px' }} />
      </div>

      {/* ── Subsection 1: My Top 25 ── */}
      <div style={{ marginBottom: '0' }}>
        <SubsectionLabel>My Top 25</SubsectionLabel>
        <Top25Grid films={filmsForGrid} />
      </div>

      <Divider />

      {/* ── Subsection 2: Recently Watched ── */}
      <div>
        <SubsectionLabel>Recently Watched</SubsectionLabel>
        <RecentlyWatched entries={diaryWithPosters} />
      </div>

      <Divider />

      {/* ── Subsection 3: Coming Soon ── */}
      <div>
        <ComingSoon entries={watchlist} />
      </div>

      <Divider />

      {/* ── Subsection 4: What Should I Watch? ── */}
      <div>
        <RecommendationForm />
      </div>
    </section>
  );
}
