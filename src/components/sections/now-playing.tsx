'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { featuredProject } from '@/data/projects';
import ScreeningPanel from '@/components/sections/screening-panel';

/* ----------------------------------------------------------------
   Inline ticket button — Phase 6 will extract this to a shared
   component. Defined locally until then.
   ---------------------------------------------------------------- */

interface TicketButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
}

function TicketButton({ children, onClick, href, target, rel }: TicketButtonProps) {
  const base: React.CSSProperties = {
    border: '1px solid var(--color-accent)',
    color: 'var(--color-accent)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: 'var(--tracking-wide)',
    padding: '10px 24px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    display: 'inline-block',
    background: 'transparent',
    textDecoration: 'none',
    transition: 'background-color 200ms, color 200ms',
    whiteSpace: 'nowrap',
  };

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        style={base}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.backgroundColor = 'var(--color-accent)';
          el.style.color = 'var(--color-bg)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.backgroundColor = 'transparent';
          el.style.color = 'var(--color-accent)';
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      style={{ ...base, border: '1px solid var(--color-accent)' }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.backgroundColor = 'var(--color-accent)';
        el.style.color = 'var(--color-bg)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.backgroundColor = 'transparent';
        el.style.color = 'var(--color-accent)';
      }}
    >
      {children}
    </button>
  );
}

/* ----------------------------------------------------------------
   NowPlaying
   ---------------------------------------------------------------- */

export default function NowPlaying() {
  const [panelOpen, setPanelOpen] = useState(false);
  const featured = featuredProject;

  return (
    <>
      <section
        id="now-playing"
        aria-label="Now Playing — featured project"
        style={{
          paddingTop: 'var(--space-16)',
          paddingBottom: 'var(--space-16)',
          paddingLeft: 'var(--space-8)',
          paddingRight: 'var(--space-8)',
        }}
      >
        {/* Frame line */}
        <div className="frame-line" style={{ marginBottom: 'var(--space-8)' }} />

        {/* Section label */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wide)',
            color: 'var(--color-accent)',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-6)',
          }}
        >
          Now Playing
        </p>

        {/* Widescreen image area */}
        <motion.div
          initial={{ scale: 1.05 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            backgroundColor: 'var(--color-surface)',
            overflow: 'hidden',
            marginBottom: 'var(--space-8)',
          }}
        >
          <Image
            src={`/posters/${featured.slug}.jpg`}
            alt={`${featured.title} project screenshot`}
            fill
            preload
            sizes="(max-width: 768px) 100vw, calc(100vw - 80px)"
            style={{ objectFit: 'cover' }}
          />

          {/* Film grain overlay */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'repeat',
              backgroundSize: '300px 300px',
              opacity: 0.05,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </motion.div>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: 'var(--color-text-primary)',
            letterSpacing: 'var(--tracking-tight)',
            lineHeight: 'var(--leading-tight)',
            marginBottom: 'var(--space-3)',
          }}
        >
          {featured.title}
        </h2>

        {/* Metadata */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wide)',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-5)',
          }}
        >
          {featured.year}&nbsp;&middot;&nbsp;{featured.genre}&nbsp;&middot;&nbsp;Rated&nbsp;{featured.rating}
        </p>

        {/* Logline */}
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-lg)',
            lineHeight: 'var(--leading-body)',
            maxWidth: '640px',
            marginBottom: 'var(--space-5)',
          }}
        >
          &ldquo;{featured.logline}&rdquo;
        </p>

        {/* Starring */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wide)',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            marginBottom: featured.award ? 'var(--space-5)' : 'var(--space-6)',
          }}
        >
          <span style={{ color: 'var(--color-accent)' }}>Starring:</span>&nbsp;
          {featured.starring.join(' · ')}
        </p>

        {/* Award badge */}
        {featured.award && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <span
              style={{
                border: '1px solid var(--color-accent)',
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wide)',
                padding: '4px 16px',
                borderRadius: '999px',
                display: 'inline-block',
              }}
            >
              {featured.award}
            </span>
          </div>
        )}

        {/* Ticket buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <TicketButton onClick={() => setPanelOpen(true)}>
            Open Screening Panel
          </TicketButton>
          {featured.liveUrl && (
            <TicketButton
              href={featured.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Live
            </TicketButton>
          )}
        </div>
      </section>

      {/* Screening Panel */}
      <ScreeningPanel
        project={panelOpen ? featured : null}
        onClose={() => setPanelOpen(false)}
      />
    </>
  );
}
