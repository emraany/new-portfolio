'use client';

import { useState } from 'react';

// Pure black/white isolated scene — bg intentionally #000 (not --color-bg) for max contrast
const CT = (pct: number) => `color-mix(in srgb, var(--color-credits-text) ${pct}%, transparent)`;

export default function EndCredits() {
  const [emailHovered, setEmailHovered] = useState(false);
  return (
    <section
      id="credits"
      style={{
        backgroundColor: 'var(--color-credits-bg)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '14vh 5vw 10vh',
      }}
      aria-label="Credits"
    >
      <style>{`
        @media (max-width: 600px) {
          .credits-row {
            flex-direction: column;
            gap: 0.25rem !important;
            margin-bottom: 1.25rem !important;
          }
          .credits-row > a,
          .credits-row > span:last-child {
            text-align: left !important;
          }
        }
      `}</style>
      {/* ── FIN card ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '6vh',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.35em',
            color: CT(35),
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}
        >
          — THE END —
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(5rem, 14vw, 10rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: 'var(--color-credits-text)',
            margin: 0,
          }}
        >
          CREDITS
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            color: CT(30),
            marginTop: '1.25rem',
          }}
        >
          EMRAAN YUSUF · 2026
        </p>
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          height: '1px',
          backgroundColor: CT(10),
          marginBottom: '4vh',
        }}
      />

      {/* ── Credits table ── */}
      <div style={{ width: '100%', maxWidth: '640px' }}>
        {CREDITS.map((entry: CreditLine, i: number) => {
          if (entry.role === 'DIVIDER') {
            return (
              <div
                key={i}
                style={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: CT(8),
                  margin: '2rem 0',
                }}
              />
            );
          }
          const nameEl = entry.href ? (
            <a
              href={entry.href}
              target={entry.href.startsWith('mailto') ? undefined : '_blank'}
              rel={entry.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              className="cursor-target"
              style={{
                color: 'var(--color-credits-text)',
                textAlign: 'right',
                textDecoration: 'none',
                borderBottom: `1px solid ${CT(20)}`,
              }}
            >
              {entry.name}
            </a>
          ) : (
            <span style={{ color: entry.role === '' ? CT(70) : 'var(--color-credits-text)', textAlign: 'right' }}>
              {entry.name}
            </span>
          );

          return (
            <div
              key={i}
              className="credits-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '2rem',
                marginBottom: '1rem',
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(0.65rem, 1.2vw, 0.78rem)',
                letterSpacing: '0.08em',
              }}
            >
              <span
                className="credits-row__role"
                style={{
                  color: CT(38),
                  textTransform: 'uppercase',
                  flexShrink: 0,
                  minWidth: '38%',
                }}
              >
                {entry.role}
              </span>
              {nameEl}
            </div>
          );
        })}

      </div>

      {/* ── Get in touch ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          marginTop: '8vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: CT(8),
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            color: CT(45),
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.9,
          }}
        >
          Open to full-time roles, internships, and collaborations.<br />
          Want to contact me regarding working on a project or career inquiries?
        </p>
        <a
          href="mailto:emraany1220@gmail.com"
          className="cursor-target"
          onMouseEnter={() => setEmailHovered(true)}
          onMouseLeave={() => setEmailHovered(false)}
          style={{
            marginTop: '0.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            color: emailHovered ? 'var(--color-credits-bg)' : 'var(--color-credits-text)',
            backgroundColor: emailHovered ? 'var(--color-credits-text)' : 'transparent',
            textDecoration: 'none',
            border: `1px solid ${CT(35)}`,
            padding: '0.625rem 1.5rem',
            textTransform: 'uppercase',
            transition: 'background-color 200ms, color 200ms',
          }}
        >
          SEND AN EMAIL
        </a>
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: CT(8),
            marginTop: '3vh',
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            color: CT(20),
            textAlign: 'center',
          }}
        >
          © 2026 EMRAAN YUSUF · ALL RIGHTS RESERVED
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Credits data
// ---------------------------------------------------------------------------

interface CreditLine { role: string; name: string; href?: string }

const CREDITS: CreditLine[] = [
  { role: 'CONTACT ME',     name: 'emraany1220@gmail.com',           href: 'mailto:emraany1220@gmail.com' },
  { role: 'GITHUB',    name: 'github.com/emraany',              href: 'https://github.com/emraany' },
  { role: 'LINKEDIN',            name: 'linkedin.com/in/emraanyusuf',     href: 'https://linkedin.com/in/emraanyusuf' },
];
