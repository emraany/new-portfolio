'use client';

import { tmdbPosterUrl } from '@/lib/tmdb';
import type { LetterboxdEntry } from '@/lib/rss';

interface TMDBPosterData {
  poster_path: string | null;
}

interface ComingSoonProps {
  entries: LetterboxdEntry[];
  posterMap: Record<string, TMDBPosterData | null>;
}

function WatchlistCard({
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
        width: '90px',
        scrollSnapAlign: 'start',
        textDecoration: 'none',
      }}
    >
      <div
        style={{
          width: '90px',
          height: '135px',
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
              filter: 'saturate(0.5) brightness(0.7)',
              transition: 'filter var(--duration-develop) var(--ease-develop)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLImageElement).style.filter =
                'saturate(1) brightness(1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLImageElement).style.filter =
                'saturate(0.5) brightness(0.7)';
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
              padding: 'var(--space-2)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
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

      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.625rem',
          color: 'var(--color-text-secondary)',
          margin: 'var(--space-1) 0 0',
          lineHeight: 1.3,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {entry.title}
      </p>
    </a>
  );
}

export default function ComingSoon({ entries, posterMap }: ComingSoonProps) {
  return (
    <div>
      {/* Marquee header */}
      <div
        style={{
          overflow: 'hidden',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-2) 0',
          marginBottom: 'var(--space-6)',
          position: 'relative',
        }}
      >
        <div className="coming-soon-marquee" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-accent)',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                fontVariant: 'small-caps',
                whiteSpace: 'nowrap',
                paddingRight: 'var(--space-8)',
              }}
            >
              COMING SOON TO A SCREENING ROOM NEAR YOU
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .coming-soon-marquee {
          display: flex;
          animation: marquee-scroll 18s linear infinite;
          width: max-content;
        }
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .coming-soon-marquee {
            animation: none;
          }
        }
      `}</style>

      {!entries.length ? (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Watchlist is empty or unavailable.
        </p>
      ) : (
        <div
          style={{
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            display: 'flex',
            gap: 'var(--space-3)',
            paddingBottom: 'var(--space-4)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {entries.map((entry, i) => (
            <WatchlistCard
              key={`${entry.title}-${i}`}
              entry={entry}
              posterData={posterMap[entry.title] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
