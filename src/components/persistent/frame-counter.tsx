'use client';

/**
 * FrameCounter
 *
 * Fixed top-right HUD element that displays the current reel number
 * and a frame count derived from scroll position.
 *
 * Format: REEL 01 | 0042
 * - Reel: maps currentSection → 01–10
 * - Frame: Math.floor(scrollY / 10) % 9999, zero-padded to 4 digits
 * - Separator | blinks on a 1.5s CSS animation
 *
 * Hidden entirely on screens narrower than 768px.
 */

import { useCurrentSection, useScrollFrame } from '@/components/persistent/scroll-provider';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/* ----------------------------------------------------------------
   Section → reel number mapping
   ---------------------------------------------------------------- */

const SECTION_REEL_MAP: Record<string, string> = {
  'hero':           '01',
  'about':          '02',
  'filmography':    '03',
  'experience':     '04',
  'skills':         '05',
  'archive':        '06',
  'screening-room': '07',
  'credits':        '08',
};

function padFrame(n: number): string {
  return String(n).padStart(4, '0');
}

/* ----------------------------------------------------------------
   Component
   ---------------------------------------------------------------- */

export default function FrameCounter() {
  const currentSection = useCurrentSection();
  const frameCount = useScrollFrame();

  /* The CSS below hides this on phones, which is enough to make it
     invisible but not enough to make it free — it still mounted and still
     held a live scroll subscription on every phone. The media query stays
     (it is what keeps the first paint identical), and this unmounts the
     component once we actually know the viewport. */
  const isDesktop = useMediaQuery('(min-width: 768px)');
  if (isDesktop === false) return null;

  const reel = SECTION_REEL_MAP[currentSection] ?? '01';
  const frame = padFrame(frameCount);

  return (
    <>
      <style>{`
        @keyframes frame-counter-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        .frame-counter-separator {
          animation: frame-counter-blink 1.5s step-end infinite;
        }

        @media (max-width: 767px) {
          .frame-counter-root {
            display: none;
          }
        }
      `}</style>

      <div
        className="frame-counter-root"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '16px',
          right: '56px',
          zIndex: 'var(--z-frame-counter)' as unknown as number,
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-accent)',
          letterSpacing: '0.1em',
          background: 'rgba(10, 10, 10, 0.7)',
          padding: '4px 10px',
          borderRadius: '2px',
          border: '1px solid var(--color-border)',
          userSelect: 'none',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}
      >
        REEL {reel}
        <span className="frame-counter-separator" style={{ margin: '0 6px' }}>|</span>
        {frame}
      </div>
    </>
  );
}
