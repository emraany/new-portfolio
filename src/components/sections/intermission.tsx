'use client';

import { useEffect, useState } from 'react';

const TOTAL_SECONDS = 15;

export default function Intermission() {
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);

  /* Countdown — resets at 0 */
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) return TOTAL_SECONDS;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${String(minutes).padStart(1, '0')}:${String(secs).padStart(2, '0')}`;

  /* Proportion of time elapsed in the current cycle */
  const progress = ((TOTAL_SECONDS - seconds) / TOTAL_SECONDS) * 100;

  function handleSkip() {
    document.querySelector('#experience')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section
      id="intermission"
      aria-label="Intermission"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-accent-red)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-8)',
        padding: 'var(--space-16) var(--space-8)',
        position: 'relative',
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(3rem, 10vw, 72px)',
          color: 'var(--color-text-primary)',
          letterSpacing: 'var(--tracking-wide)',
          textTransform: 'uppercase',
          margin: 0,
          textAlign: 'center',
        }}
      >
        Intermission
      </h2>

      {/* Countdown */}
      <p
        aria-live="polite"
        aria-label={`Intermission countdown: ${display}`}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(2.5rem, 8vw, 48px)',
          color: 'var(--color-text-primary)',
          margin: 0,
          tabularNums: true,
          fontVariantNumeric: 'tabular-nums',
        } as React.CSSProperties}
      >
        {display}
      </p>

      {/* Countdown bar */}
      <div
        role="progressbar"
        aria-valuenow={TOTAL_SECONDS - seconds}
        aria-valuemin={0}
        aria-valuemax={TOTAL_SECONDS}
        aria-label="Intermission progress"
        style={{
          width: 'min(400px, 80vw)',
          height: '2px',
          backgroundColor: 'rgba(232, 228, 220, 0.2)',
          borderRadius: '1px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: 'var(--color-text-primary)',
            transition: 'width 1000ms linear',
            borderRadius: '1px',
          }}
        />
      </div>

      {/* Tagline */}
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'var(--text-xl)',
          color: 'var(--color-text-primary)',
          opacity: 0.85,
          margin: 0,
          textAlign: 'center',
        }}
      >
        We&rsquo;ll be right back.
      </p>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        aria-label="Skip intermission and continue to experience section"
        style={{
          marginTop: 'var(--space-4)',
          border: '1px solid var(--color-text-primary)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          letterSpacing: 'var(--tracking-wide)',
          padding: '10px 24px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          background: 'transparent',
          transition: 'background-color 200ms, color 200ms',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.backgroundColor = 'var(--color-text-primary)';
          el.style.color = 'var(--color-accent-red)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.backgroundColor = 'transparent';
          el.style.color = 'var(--color-text-primary)';
        }}
      >
        Skip Intermission
      </button>
    </section>
  );
}
