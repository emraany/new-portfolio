'use client';

import FocusPull from '@/components/animations/focus-pull';

/* ----------------------------------------------------------------
   Hero Section
   Full-viewport film-styled hero with marquee filmstrip and
   focus-reticle scroll indicator.
   ---------------------------------------------------------------- */

export default function Hero() {
  return (
    <>
      {/* Keyframe definitions injected as a style tag for this component */}
      <style>{`
        @keyframes reticle-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.1); }
        }

        .hero-reticle {
          animation: reticle-pulse 2.4s ease-in-out infinite;
        }

        /* Hover states for badges */
        .hero-ticket-btn:hover {
          background-color: var(--color-accent);
          color: var(--color-bg);
        }
      `}</style>

      <section
        id="hero"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          paddingTop: 'var(--section-pad-y)',
          paddingBottom: 'var(--section-pad-y)',
          paddingLeft: 'var(--section-pad-x)',
          paddingRight: 'var(--section-pad-x)',
          overflow: 'hidden',
        }}
      >
        {/* Frame line at top */}
        <div className="frame-line" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />

        {/* Central content stack */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-6)',
            textAlign: 'center',
            zIndex: 'var(--z-content)' as unknown as number,
            width: '100%',
          }}
        >
          {/* "a film by" attribution */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontVariant: 'small-caps',
              letterSpacing: 'var(--tracking-wide)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              margin: 0,
            }}
          >
            a portfolio by
          </p>

          {/* Main name — wrapped in FocusPull */}
          <FocusPull delay={200}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                letterSpacing: 'var(--tracking-tight)',
                color: 'var(--color-text-primary)',
                fontSize: 'clamp(3.5rem, 10vw, 6rem)',
                lineHeight: 'var(--leading-tight)',
                margin: 0,
              }}
            >
              EMRAAN YUSUF
            </h1>
          </FocusPull>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontVariant: 'small-caps',
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-lg)',
              letterSpacing: 'var(--tracking-wide)',
              margin: 0,
            }}
          >
            SOFTWARE ENGINEER · ML RESEARCHER
          </p>

          {/* Location badge */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                border: '1px solid var(--color-accent)',
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wide)',
                padding: '2px 10px',
                fontVariant: 'small-caps',
              }}
            >
              DALLAS, TX
            </span>
          </div>
        </div>

        {/* Frame line at bottom */}
        <div className="frame-line" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
      </section>
    </>
  );
}
