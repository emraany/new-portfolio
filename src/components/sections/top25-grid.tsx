'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { tmdbPosterUrl } from '@/lib/tmdb';
import type { Top25Film } from '@/data/top25';

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const filled = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - filled - half;

  return (
    <span
      aria-label={`${rating} out of 5`}
      style={{
        color: 'var(--color-accent)',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        letterSpacing: '2px',
      }}
    >
      {'●'.repeat(filled)}
      {half ? '◐' : ''}
      {'○'.repeat(empty)}
    </span>
  );
}

// ─── Individual Film Card ─────────────────────────────────────────────────────

function FilmCard({ film }: { film: Top25Film }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Poster wrapper */}
      <div
        onClick={() => {
          if (film.influenceNote) setOpen((v) => !v);
        }}
        style={{
          position: 'relative',
          aspectRatio: '2/3',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          cursor: film.influenceNote ? 'pointer' : 'default',
        }}
      >
        {/* Poster image */}
        {film.posterPath ? (
          <img
            src={tmdbPosterUrl(film.posterPath, 'w342')}
            alt={film.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          /* Placeholder when no posterPath */
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
                fontSize: '10px',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}
            >
              {film.title}
            </span>
          </div>
        )}

        {/* Rank badge — top-left overlay */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--color-accent)',
            background: 'rgba(10,10,10,0.75)',
            padding: '2px 6px',
            lineHeight: 1.4,
            letterSpacing: '0.05em',
          }}
        >
          {String(film.rank).padStart(2, '0')}
        </div>

        {/* Influence note panel — slides up from bottom on click */}
        <AnimatePresence>
          {open && film.influenceNote && (
            <motion.div
              key="note"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(10,10,10,0.92)',
                padding: '12px',
                borderTop: '1px solid var(--color-accent)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {film.influenceNote}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap indicator for cards with notes */}
        {film.influenceNote && !open && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--color-accent)',
              opacity: 0.8,
            }}
          />
        )}
      </div>

      {/* Title */}
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-primary)',
          margin: 0,
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={film.title}
      >
        {film.title}
      </p>

      {/* Year and rating row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--color-text-secondary)',
          }}
        >
          {film.year}
        </span>
        <StarRating rating={film.myRating} />
      </div>
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

interface Top25GridProps {
  films: Top25Film[];
}

export default function Top25Grid({ films }: Top25GridProps) {
  return (
    <>
      {/* Responsive grid via inline style — media queries not available inline,
          so we use a CSS class approach with a style tag rendered once */}
      <style>{`
        .top25-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .top25-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .top25-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
      `}</style>

      <div className="top25-grid">
        {films.map((film) => (
          <FilmCard key={film.rank} film={film} />
        ))}
      </div>
    </>
  );
}
