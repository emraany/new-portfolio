'use client';

import SectionHeader from '@/components/ui/section-header';

export default function About() {
  return (
    <>
      <style>{`
        .about-resume-btn {
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
          text-decoration: none;
        }
        .about-resume-btn:hover {
          background-color: var(--color-accent);
          color: var(--color-bg);
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
          padding: 'var(--section-pad-y) var(--section-pad-x)',
        }}
      >
        <SectionHeader label="SYNOPSIS" heading="[About]" />

        {/* Centered content wrapper */}
        <div
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-10)',
          }}
        >

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
              ML / FULL-STACK
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
              Studio
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
              UT DALLAS
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
              YEAR 3
            </span>
          </div>
        </div>

        {/* Bio paragraphs */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          {[
            "I'm Emraan, a Computer Science student at the University of Texas at Dallas with a focus on machine learning and research.",
            "I got into technology at an early age through a fascination with how the tools I use every day work, which led me to study Computer Science at the University of Texas at Dallas. During my time at UTD, I’ve developed a strong passion for Machine Learning, especially research. Today, I spend most of my time learning and building; working on machine learning research projects, keeping up with research developments, creating full-stack applications and attending hackathons.",
           "Outside of coding, I’m usually in the gym, at my mosque, or watching movies. Film is something I've always been passionate about, inspiring the film-themed design of this portfolio, from the reel countdown to the perforated borders and other cinematic elements throughout!",
          ].map((text, i) => (
            <p
              key={i}
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--leading-body)',
                margin: 0,
                textAlign: 'center',
              }}
            >
              {text}
            </p>
          ))}
        </div>

        {/* Resume download link */}
        <a
          href="/Resume.pdf"
          className="about-resume-btn cursor-target"
          download
          aria-label="Download resume PDF"
        >
          [ DOWNLOAD RESUME ]
        </a>
        </div>
      </section>
    </>
  );
}
