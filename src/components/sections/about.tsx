'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ----------------------------------------------------------------
   About Section — "The Logline"
   One-sentence logline, film-label stats row, bio, and a
   press-kit drawer that slides in from the right.
   ---------------------------------------------------------------- */

/* Inline perforation SVG for the drawer's left-edge film strip */
const PERF_SVG_DESKTOP = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='34'%3E%3Crect x='13' y='7' width='14' height='20' rx='3' ry='3' fill='%23000000'/%3E%3C/svg%3E")`;

export default function About() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <style>{`
        .about-ticket-btn {
          display: inline-block;
          border: 1px solid var(--color-accent);
          color: var(--color-accent);
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: var(--tracking-wide);
          padding: 10px 24px;
          text-transform: uppercase;
          background: transparent;
          cursor: pointer;
          transition: background-color 200ms, color 200ms;
          font-variant: small-caps;
        }
        .about-ticket-btn:hover {
          background-color: var(--color-accent);
          color: var(--color-bg);
        }

        .drawer-download-btn {
          display: inline-block;
          border: 1px solid var(--color-accent);
          color: var(--color-accent);
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: var(--tracking-wide);
          padding: 10px 24px;
          text-transform: uppercase;
          background: transparent;
          cursor: pointer;
          transition: background-color 200ms, color 200ms;
          text-decoration: none;
        }
        .drawer-download-btn:hover {
          background-color: var(--color-accent);
          color: var(--color-bg);
        }

        .drawer-close-btn {
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: border-color 200ms, color 200ms;
          flex-shrink: 0;
        }
        .drawer-close-btn:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
        }

        .stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-4) var(--space-6);
          border: 1px solid var(--color-border);
          gap: var(--space-1);
        }

        @media (max-width: 640px) {
          .stat-row {
            flex-direction: column;
          }
        }
      `}</style>

      <section
        id="about"
        style={{
          padding: 'var(--space-20) var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-10)',
          position: 'relative',
        }}
      >
        {/* Frame line at top */}
        <div className="frame-line" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />

        {/* Section label */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontVariant: 'small-caps',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wide)',
            color: 'var(--color-accent)',
            margin: 0,
            alignSelf: 'flex-start',
          }}
        >
          THE LOGLINE
        </p>

        {/* One-line logline quote */}
        <blockquote
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            maxWidth: '680px',
            lineHeight: 'var(--leading-tight)',
            margin: 0,
          }}
        >
          &ldquo;A software engineer who builds with precision, researches with curiosity, and ships with intent.&rdquo;
        </blockquote>

        {/* Film-label stats row */}
        <div
          className="stat-row"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 'var(--space-4)',
          }}
        >
          <div className="stat-box">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wide)',
                color: 'var(--color-text-muted)',
                fontVariant: 'small-caps',
              }}
            >
              Genre
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                fontVariant: 'small-caps',
                letterSpacing: '0.05em',
              }}
            >
              ML / Full-Stack
            </span>
          </div>

          <div className="stat-box">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wide)',
                color: 'var(--color-text-muted)',
                fontVariant: 'small-caps',
              }}
            >
              Runtime
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                fontVariant: 'small-caps',
                letterSpacing: '0.05em',
              }}
            >
              21 yrs
            </span>
          </div>

          <div className="stat-box">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wide)',
                color: 'var(--color-text-muted)',
                fontVariant: 'small-caps',
              }}
            >
              Rated
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                fontVariant: 'small-caps',
                letterSpacing: '0.05em',
              }}
            >
              PG-13
            </span>
          </div>
        </div>

        {/* Bio paragraph */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-body)',
            maxWidth: '640px',
            textAlign: 'center',
            margin: 0,
          }}
        >
          CS student at UT Dallas with a focus on machine learning and systems. I&apos;ve spent the last few years building research-grade ML pipelines, full-stack products, and everything in between. I care about writing clean code, shipping real things, and understanding why something works — not just that it does.
        </p>

        {/* VIEW PRESS KIT button */}
        <button
          className="about-ticket-btn"
          onClick={() => setDrawerOpen(true)}
          type="button"
          aria-label="Open press kit"
        >
          [ VIEW PRESS KIT ]
        </button>

        {/* Frame line at bottom */}
        <div className="frame-line" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
      </section>

      {/* Press Kit Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 'var(--z-modal)' as unknown as number,
              }}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              role="dialog"
              aria-label="Press Kit"
              aria-modal="true"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 'min(480px, 100vw)',
                backgroundColor: 'var(--color-surface)',
                zIndex: 'calc(var(--z-modal) + 1)' as unknown as number,
                display: 'flex',
                flexDirection: 'row',
                overflowY: 'auto',
              }}
            >
              {/* Film strip left edge */}
              <div
                aria-hidden="true"
                style={{
                  width: '40px',
                  flexShrink: 0,
                  backgroundColor: 'var(--color-bg)',
                  borderRight: '1px solid var(--color-border)',
                  backgroundImage: PERF_SVG_DESKTOP,
                  backgroundRepeat: 'repeat-y',
                  backgroundSize: '40px 34px',
                  backgroundPositionX: 'center',
                }}
              />

              {/* Drawer content */}
              <div
                style={{
                  flex: 1,
                  padding: 'var(--space-8) var(--space-6)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-8)',
                  overflowY: 'auto',
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 'var(--space-4)',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        letterSpacing: 'var(--tracking-wide)',
                        color: 'var(--color-accent)',
                        fontVariant: 'small-caps',
                        margin: 0,
                        marginBottom: 'var(--space-2)',
                      }}
                    >
                      PRESS KIT
                    </p>
                    <h2
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 'var(--text-2xl)',
                        color: 'var(--color-text-primary)',
                        margin: 0,
                        letterSpacing: 'var(--tracking-tight)',
                      }}
                    >
                      Emraan Yusuf
                    </h2>
                  </div>

                  {/* Focus reticle close button */}
                  <button
                    className="drawer-close-btn"
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close press kit"
                    type="button"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      {/* Outer circle */}
                      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="0.75" />
                      {/* × cross */}
                      <line x1="6" y1="6" x2="12" y2="12" stroke="currentColor" strokeWidth="1.25" />
                      <line x1="12" y1="6" x2="6" y2="12" stroke="currentColor" strokeWidth="1.25" />
                      {/* Crosshair ticks */}
                      <line x1="1" y1="9" x2="4" y2="9" stroke="currentColor" strokeWidth="0.75" />
                      <line x1="14" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="0.75" />
                      <line x1="9" y1="1" x2="9" y2="4" stroke="currentColor" strokeWidth="0.75" />
                      <line x1="9" y1="14" x2="9" y2="17" stroke="currentColor" strokeWidth="0.75" />
                    </svg>
                  </button>
                </div>

                {/* EXPERIENCE */}
                <DrawerSection label="EXPERIENCE">
                  <DrawerEntry
                    title="ML Research Lead"
                    sub="Placeholder Lab · 2025 – Present"
                    body="Placeholder — Emraan will fill in real details."
                  />
                  <DrawerEntry
                    title="ML Researcher"
                    sub="Placeholder Institute · 2024 – 2025"
                    body="Placeholder."
                  />
                </DrawerSection>

                {/* EDUCATION */}
                <DrawerSection label="EDUCATION">
                  <DrawerEntry
                    title="B.S. Computer Science"
                    sub="University of Texas at Dallas · 2022 – 2026"
                    body="Focus: Machine Learning & Intelligent Systems. Dean's List."
                  />
                </DrawerSection>

                {/* SKILLS SUMMARY */}
                <DrawerSection label="SKILLS">
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 'var(--leading-body)',
                      margin: 0,
                    }}
                  >
                    Python · PyTorch · TypeScript · React · Next.js · FastAPI · Node.js · PostgreSQL · Supabase · Hugging Face · Mapbox · Docker
                  </p>
                </DrawerSection>

                {/* Download resume */}
                <a
                  href="/resume.pdf"
                  className="drawer-download-btn"
                  download
                  aria-label="Download resume PDF"
                >
                  [ DOWNLOAD RESUME ]
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ----------------------------------------------------------------
   Sub-components for drawer sections
   ---------------------------------------------------------------- */

function DrawerSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          letterSpacing: 'var(--tracking-wide)',
          color: 'var(--color-accent)',
          fontVariant: 'small-caps',
          margin: 0,
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 'var(--space-2)',
        }}
      >
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {children}
      </div>
    </div>
  );
}

function DrawerEntry({
  title,
  sub,
  body,
}: {
  title: string;
  sub: string;
  body: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-primary)',
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          letterSpacing: '0.05em',
          color: 'var(--color-text-muted)',
        }}
      >
        {sub}
      </span>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--leading-body)',
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}
