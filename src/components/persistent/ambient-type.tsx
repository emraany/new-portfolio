'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useScrollProgress } from '@/hooks/useScrollProgress';

// ---------------------------------------------------------------------------
// Section → ambient word map
// ---------------------------------------------------------------------------

const SECTION_WORDS: Record<string, string> = {
  hero:             'EMRAAN',
  about:            'SYNOPSIS',
  filmography:      'FILMOGRAPHY',
  experience:       'CREDITS',
  skills:           'THE CREW',
  archive:          'OFF-SCREEN',
  'screening-room': 'CINEMA',
  credits:          'FIN',
  contact:          'FIN',
};

const DEFAULT_WORD = 'DIRECTOR';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AmbientType() {
  const { currentSection } = useScrollProgress();

  const word = SECTION_WORDS[currentSection] ?? DEFAULT_WORD;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 'var(--z-base)' as unknown as number,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        // Shift right of center for editorial feel
        justifyContent: 'flex-end',
        paddingRight: '5vw',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-huge)',
            color: 'var(--color-text-muted)',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            // Parallax: moves slightly slower than scroll (60% speed, upward)
            transform: 'translateY(calc(var(--scroll-y) * -0.05))',
            willChange: 'transform',
          }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
