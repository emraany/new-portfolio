'use client';

import { tmdbPosterUrl } from '@/lib/tmdb';
import type { LetterboxdEntry } from '@/lib/rss';

interface TMDBPosterData {
  poster_path: string | null;
}

interface RecentlyWatchedProps {
  entries: LetterboxdEntry[];
  posterMap: Record<string, TMDBPosterData | null>;
}

function StarDisplay({ rating }: { rating: number | null }) {
  if (rating === null) return null;

  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  return (
    <span
      style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}
      aria-label={`${rating} out of 5 stars`}
    >
      <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: 'var(--color-accent)', letterSpacing: '1px' }}>
        {'★'.repeat(full)}
      </span>
      {half && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-accent)', lineHeight: 1 }}>
          .5
        </span>
      )}
    </span>
  );
}

function WatchedCard({
  entry,
  posterData,
}: {
  entry: LetterboxdEntry;
  posterData: TMDBPosterData | null;
}) {
  const posterSrc =
    posterData?.poster_path ? tmdbPosterUrl(posterData.poster_path, 'w342') : null;

  return (
    <a
      href={entry.filmUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        width: '120px',
        scrollSnapAlign: 'start',
        textDecoration: 'none',
      }}
    >
      {/* Poster */}
      <div
        style={{
          width: '120px',
          height: '180px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {posterSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterSrc}
            alt={entry.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-3)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              {entry.title}
            </span>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div style={{ marginTop: 'var(--space-2)', gap: 'var(--space-1)', display: 'flex', flexDirection: 'column' }}>
        <StarDisplay rating={entry.rating} />
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-primary)',
            margin: 0,
            lineHeight: 1.3,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {entry.title}
        </p>
        {entry.watchDate && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {entry.watchDate}
          </span>
        )}
      </div>
    </a>
  );
}

export default function RecentlyWatched({ entries, posterMap }: RecentlyWatchedProps) {
  if (!entries.length) {
    return (
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
        }}
      >
        No recent entries found.
      </p>
    );
  }

  return (
    <div
      style={{
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        display: 'flex',
        gap: 'var(--space-4)',
        paddingBottom: 'var(--space-4)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {entries.map((entry, i) => (
        <WatchedCard
          key={`${entry.title}-${i}`}
          entry={entry}
          posterData={posterMap[entry.title] ?? null}
        />
      ))}
    </div>
  );
}
