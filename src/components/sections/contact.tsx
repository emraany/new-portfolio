'use client';

import { useState } from 'react';
import CreditsRoll from '@/components/credits-roll/credits-roll';

/**
 * Contact section — id="contact"
 *
 * "That's a Wrap" sign-off with contact links and a ROLL CREDITS button
 * that mounts the CreditsRoll component in full-viewport overlay mode.
 */
export default function Contact() {
  const [creditsActive, setCreditsActive] = useState(false);

  return (
    <>
      <section
        id="contact"
        style={{
          padding: 'var(--space-24) var(--space-8)',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {/* Top frame line */}
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: 'var(--color-border)',
            marginBottom: 'var(--space-16)',
          }}
        />

        {/* Headline */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '4rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: 'var(--tracking-tight)',
            lineHeight: 1.1,
            margin: '0 0 var(--space-4) 0',
          }}
        >
          THAT&apos;S A WRAP
        </h2>

        {/* Tagline */}
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '1.25rem',
            color: 'var(--color-text-secondary)',
            margin: '0 0 var(--space-12) 0',
          }}
        >
          &ldquo;Let&apos;s make something.&rdquo;
        </p>

        {/* Contact links */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-12)',
          }}
        >
          <a
            href="mailto:emraany1220@gmail.com"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            emraany1220@gmail.com
          </a>

          <a
            href="https://github.com/placeholder"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            github.com/placeholder
          </a>

          <a
            href="https://linkedin.com/in/placeholder"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            linkedin.com/in/placeholder
          </a>
        </div>

        {/* ROLL CREDITS button */}
        <RollCreditsButton onClick={() => setCreditsActive(true)} />
      </section>

      {/* CreditsRoll — mounts as full-viewport overlay when active */}
      <CreditsRoll
        isActive={creditsActive}
        onComplete={() => {
          // onComplete fires after the 3s black screen; credits overlay persists
          // until user clicks Roll Again or navigates away
        }}
      />
    </>
  );
}

// ------------------------------------------------------------------
// RollCreditsButton — ticket-style amber bordered button
// ------------------------------------------------------------------

interface RollCreditsButtonProps {
  onClick: () => void;
}

function RollCreditsButton({ onClick }: RollCreditsButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-sm)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-wide)',
        padding: '10px 24px',
        border: '1px solid var(--color-accent)',
        color: hovered ? 'var(--color-bg)' : 'var(--color-accent)',
        backgroundColor: hovered ? 'var(--color-accent)' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 200ms, color 200ms',
      }}
      aria-label="Roll credits"
    >
      [ ROLL CREDITS ]
    </button>
  );
}
