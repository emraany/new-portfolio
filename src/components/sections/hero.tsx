'use client';

import FocusPull from '@/components/animations/focus-pull';

/* ----------------------------------------------------------------
   Hero Section
   Full-viewport film-styled hero with marquee filmstrip and
   focus-reticle scroll indicator.
   ---------------------------------------------------------------- */

const TECH_STACK = [
  'TypeScript',
  'Python',
  'React',
  'PyTorch',
  'Next.js',
  'SQL',
  'Framer Motion',
  'FastAPI',
  'Node.js',
  'Tailwind CSS',
  'PyTorch Geometric',
  'Hugging Face',
  'Mapbox',
  'Supabase',
  'PostgreSQL',
];

const marqueeContent = TECH_STACK.join('  ·  ');

export default function Hero() {
  return (
    <>
      {/* Keyframe definitions injected as a style tag for this component */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes reticle-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.1); }
        }

        .hero-marquee-inner {
          display: inline-flex;
          white-space: nowrap;
          animation: marquee-scroll 28s linear infinite;
          /* Use will-change for GPU compositing */
          will-change: transform;
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
          paddingTop: 'var(--space-20)',
          paddingBottom: 'var(--space-20)',
          paddingLeft: 'var(--space-8)',
          paddingRight: 'var(--space-8)',
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
            a film by
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
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-lg)',
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            Software Engineer · ML Researcher
          </p>

          {/* Pill badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)',
            }}
          >
            {/* NOW HIRING — red badge */}
            <span
              style={{
                display: 'inline-block',
                border: '1px solid var(--color-accent-red)',
                backgroundColor: 'var(--color-accent-red)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wide)',
                padding: '2px 10px',
                fontVariant: 'small-caps',
              }}
            >
              NOW HIRING
            </span>

            {/* DALLAS, TX — amber outline badge */}
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

        {/* Marquee filmstrip */}
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--space-16)',
            left: 0,
            right: 0,
            overflow: 'hidden',
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
            padding: '10px 0',
            zIndex: 'var(--z-content)' as unknown as number,
          }}
        >
          {/* Two copies of content for seamless loop */}
          <span className="hero-marquee-inner">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-accent)',
                letterSpacing: '0.08em',
              }}
            >
              {marqueeContent}&nbsp;&nbsp;·&nbsp;&nbsp;{marqueeContent}&nbsp;&nbsp;·&nbsp;&nbsp;
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-accent)',
                letterSpacing: '0.08em',
              }}
            >
              {marqueeContent}&nbsp;&nbsp;·&nbsp;&nbsp;{marqueeContent}&nbsp;&nbsp;·&nbsp;&nbsp;
            </span>
          </span>
        </div>

        {/* Focus reticle scroll indicator */}
        <div
          className="hero-reticle"
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 'var(--space-5)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 'var(--z-content)' as unknown as number,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
        >
          {/* SVG crosshair reticle */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
          >
            {/* Outer circle */}
            <circle
              cx="14"
              cy="14"
              r="11"
              stroke="var(--color-accent)"
              strokeWidth="1"
              opacity="0.8"
            />
            {/* Horizontal crosshair line */}
            <line
              x1="3"
              y1="14"
              x2="11"
              y2="14"
              stroke="var(--color-accent)"
              strokeWidth="1"
              opacity="0.8"
            />
            <line
              x1="17"
              y1="14"
              x2="25"
              y2="14"
              stroke="var(--color-accent)"
              strokeWidth="1"
              opacity="0.8"
            />
            {/* Vertical crosshair line */}
            <line
              x1="14"
              y1="3"
              x2="14"
              y2="11"
              stroke="var(--color-accent)"
              strokeWidth="1"
              opacity="0.8"
            />
            <line
              x1="14"
              y1="17"
              x2="14"
              y2="25"
              stroke="var(--color-accent)"
              strokeWidth="1"
              opacity="0.8"
            />
            {/* Center dot */}
            <circle
              cx="14"
              cy="14"
              r="1.5"
              fill="var(--color-accent)"
            />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              letterSpacing: 'var(--tracking-wide)',
              color: 'var(--color-text-muted)',
              fontVariant: 'small-caps',
            }}
          >
            scroll
          </span>
        </div>

        {/* Frame line at bottom */}
        <div className="frame-line" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
      </section>
    </>
  );
}
