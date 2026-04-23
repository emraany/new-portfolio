'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import DarkroomImage from '@/components/animations/darkroom-image';
import type { Project } from '@/data/projects';

interface ScreeningPanelProps {
  project: Project | null;
  onClose: () => void;
}

/* SVG crosshair close button */
function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close screening panel"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-accent)',
        flexShrink: 0,
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="10" x2="22" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="22" y1="10" x2="10" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        {/* Reticle tick marks */}
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <line x1="16" y1="26" x2="16" y2="30" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <line x1="2" y1="16" x2="6" y2="16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <line x1="26" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/* Inline styles for the ticket button pattern */
function ticketButtonStyle(variant: 'primary' | 'secondary'): React.CSSProperties {
  return {
    border: '1px solid var(--color-accent)',
    color: variant === 'primary' ? 'var(--color-bg)' : 'var(--color-accent)',
    backgroundColor: variant === 'primary' ? 'var(--color-accent)' : 'transparent',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: 'var(--tracking-wide)',
    padding: '10px 24px',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 200ms, color 200ms',
    whiteSpace: 'nowrap' as const,
  };
}

const FILM_STRIP_INLINE: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='34'%3E%3Crect x='2' y='7' width='8' height='20' rx='2' ry='2' fill='%23000000'/%3E%3C/svg%3E\")",
  backgroundColor: 'var(--color-bg)',
  backgroundRepeat: 'repeat-y',
  backgroundSize: '12px 34px',
  width: '12px',
  flexShrink: 0,
  alignSelf: 'stretch',
};

const MONO_LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-xs)',
  letterSpacing: 'var(--tracking-wide)',
  color: 'var(--color-accent)',
  textTransform: 'uppercase' as const,
  marginBottom: '8px',
};

export default function ScreeningPanel({ project, onClose }: ScreeningPanelProps) {
  if (!project) return null;

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 'calc(var(--z-modal) - 1)',
            }}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            role="dialog"
            aria-label={`${project.title} — project details`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(520px, 100vw)',
              backgroundColor: 'var(--color-surface)',
              zIndex: 'var(--z-modal)',
              display: 'flex',
              flexDirection: 'row',
              overflowY: 'hidden',
            }}
          >
            {/* Film-strip left border */}
            <div style={FILM_STRIP_INLINE} aria-hidden="true" />

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {/* Header row: title + close button */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  {project.title}
                </h2>
                <CloseButton onClick={onClose} />
              </div>

              {/* Metadata row */}
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-wide)',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                }}
              >
                {project.year}&nbsp;&middot;&nbsp;{project.genre}&nbsp;&middot;&nbsp;RATED&nbsp;{project.rating}
              </p>

              {/* Poster image */}
              <DarkroomImage>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '2/3',
                    backgroundColor: 'var(--color-bg)',
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={`/posters/${project.slug}.jpg`}
                    alt={`${project.title} project poster`}
                    fill
                    sizes="(max-width: 768px) 100vw, 520px"
                    style={{ objectFit: 'cover' }}
                    onError={() => {/* silently use bg color fallback */}}
                  />
                  {/* Grain overlay */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E\")",
                      backgroundRepeat: 'repeat',
                      backgroundSize: '200px 200px',
                      opacity: 0.04,
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </DarkroomImage>

              {/* Logline */}
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--text-base)',
                  margin: 0,
                  lineHeight: 'var(--leading-body)',
                }}
              >
                &ldquo;{project.logline}&rdquo;
              </p>

              {/* Synopsis */}
              <div>
                <p style={MONO_LABEL}>Synopsis</p>
                <p
                  style={{
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--leading-body)',
                    margin: 0,
                  }}
                >
                  {project.synopsis}
                </p>
              </div>

              {/* Starring */}
              <div>
                <p style={MONO_LABEL}>Starring</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {project.starring.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        padding: '4px 10px',
                        borderRadius: '2px',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Production Notes */}
              <div>
                <p style={MONO_LABEL}>Production Notes</p>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--leading-body)',
                    margin: 0,
                  }}
                >
                  {project.productionNotes}
                </p>
              </div>

              {/* Award badge */}
              {project.award && (
                <div>
                  <span
                    style={{
                      border: '1px solid var(--color-accent)',
                      color: 'var(--color-accent)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      letterSpacing: 'var(--tracking-wide)',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      display: 'inline-block',
                    }}
                  >
                    {project.award}
                  </span>
                </div>
              )}

              {/* Ticket buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '4px', paddingBottom: '8px' }}>
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={ticketButtonStyle('primary')}
                  >
                    View Live
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={ticketButtonStyle('secondary')}
                  >
                    Source Code
                  </a>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
