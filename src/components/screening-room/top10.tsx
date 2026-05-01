'use client';

import { FrameMarks } from '@/components/ui/frame-marks';
import { tmdbPosterUrl } from '@/lib/tmdb';
import type { Top10Film } from '@/data/top10';

interface Top10GridProps {
  films: Top10Film[];
}

function FilmCard({ film }: { film: Top10Film }) {
  const posterSrc = film.posterPath
    ? tmdbPosterUrl(film.posterPath, 'w342')
    : null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Poster frame */}
      <FrameMarks style={{ width: '100%', display: 'block' }}>
        <div
          style={{
            position: 'relative',
            aspectRatio: '2/3',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}
        >
          {/* Rank badge */}
          <span
            style={{
              position: 'absolute',
              top: 'var(--space-2)',
              left: 'var(--space-2)',
              zIndex: 2,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-accent)',
              background: 'rgba(0,0,0,0.7)',
              padding: '2px 5px',
              lineHeight: 1,
            }}
          >
            {String(film.rank).padStart(2, '0')}
          </span>

          {posterSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterSrc}
              alt={film.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                filter: 'saturate(1.2) contrast(1.05)',
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
                padding: 'var(--space-4)',
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
                {film.title}
              </span>
            </div>
          )}

        </div>
      </FrameMarks>

      {/* Below-poster info */}
      <div style={{ marginTop: 'var(--space-2)', paddingBottom: 'var(--space-3)' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-accent)',
            letterSpacing: '0.05em',
          }}
          aria-label={`Rank ${film.rank}`}
        >
          #{film.rank}
        </span>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-primary)',
            margin: 'var(--space-1) 0 0',
            lineHeight: 1.3,
          }}
        >
          {film.title}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            margin: 'var(--space-1) 0 0',
          }}
        >
          {film.year}
        </p>
      </div>
    </div>
  );
}

export default function Top10Grid({ films }: Top10GridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 'var(--space-4)',
      }}
      className="top10-grid"
    >
      <style>{`
        @media (max-width: 1024px) {
          .top10-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .top10-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .top10-grid {
            gap: var(--space-2) !important;
          }
        }
      `}</style>
      {films.map((film) => (
        <FilmCard key={film.tmdbId} film={film} />
      ))}
    </div>
  );
}
