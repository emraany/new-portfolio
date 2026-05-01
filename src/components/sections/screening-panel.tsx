'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import DarkroomImage from '@/components/animations/darkroom-image';
import type { Project } from '@/data/projects';

/* Centered image lightbox — opens when clicking the panel's poster */
function ImageLightbox({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="image-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(2px)',
            zIndex: 'calc(var(--z-cursor) - 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close image"
            className="cursor-target"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: '1px solid rgba(201,183,152,0.4)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'none',
              color: 'var(--color-accent)',
              zIndex: 1,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: 'min(900px, 90vw)',
              width: '100%',
              aspectRatio: '16 / 10',
              maxHeight: '82vh',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,183,152,0.12)',
            }}
          >
            <Image
              src={`/posters/${project.slug}.png`}
              alt={`${project.title} — full view`}
              fill
              sizes="min(900px, 90vw)"
              style={{ objectFit: 'cover', objectPosition: 'top' }}
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ScreeningPanelProps {
  project: Project | null;
  onClose: () => void;
}

/* Simple circle close button — matches the lightbox X */
function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close screening panel"
      className="cursor-target"
      style={{
        background: 'none',
        border: '1px solid rgba(201,183,152,0.4)',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'none',
        color: 'var(--color-accent)',
        flexShrink: 0,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
  const [mounted, setMounted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgHovered, setImgHovered] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!project) setLightboxOpen(false);
  }, [project]);

  if (!mounted) return null;

  return createPortal(
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
                {project.year}
                {project.genre && <>&nbsp;&middot;&nbsp;{project.genre}</>}
                {project.rating && <>&nbsp;&middot;&nbsp;RATED&nbsp;{project.rating}</>}
              </p>

              {/* Poster image — click to expand */}
              <DarkroomImage>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  onMouseEnter={() => setImgHovered(true)}
                  onMouseLeave={() => setImgHovered(false)}
                  aria-label={`Expand ${project.title} image`}
                  className="cursor-target"
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 10',
                    backgroundColor: 'var(--color-bg)',
                    overflow: 'hidden',
                    padding: '10px',
                    boxSizing: 'border-box',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    display: 'block',
                    font: 'inherit',
                    color: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image
                      src={`/posters/${project.slug}.png`}
                      alt={`${project.title} project poster`}
                      fill
                      sizes="(max-width: 768px) 100vw, 520px"
                      style={{ objectFit: 'contain' }}
                      onError={() => {/* silently use bg color fallback */}}
                    />
                  </div>
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
                  {/* Expand affordance on hover */}
                  <motion.div
                    animate={{ opacity: imgHovered ? 1 : 0 }}
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                      <rect x="1" y="1" width="34" height="34" rx="17" stroke="rgba(201,183,152,0.7)" strokeWidth="1.5" />
                      <polyline points="13,13 10,10 14,10" stroke="rgba(201,183,152,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      <polyline points="23,13 26,10 22,10" stroke="rgba(201,183,152,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      <polyline points="13,23 10,26 14,26" stroke="rgba(201,183,152,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      <polyline points="23,23 26,26 22,26" stroke="rgba(201,183,152,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </motion.div>
                </button>
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
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-secondary)',
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
              {project.productionNotes && (
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
              )}

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
                    className="cursor-target"
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
                    className="cursor-target"
                    style={ticketButtonStyle('secondary')}
                  >
                    Source Code
                  </a>
                )}
                {project.videoUrl && (
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-target"
                    style={ticketButtonStyle('secondary')}
                  >
                    Watch Demo
                  </a>
                )}
              </div>
            </div>
          </motion.aside>

          <ImageLightbox
            project={lightboxOpen ? project : null}
            onClose={() => setLightboxOpen(false)}
          />
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
