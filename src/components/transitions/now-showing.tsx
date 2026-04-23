'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * NowShowing
 *
 * Reusable interstitial overlay. 600ms total.
 * Three variants:
 *   hardCut     — instant white flash frame, then fade in/out
 *   slowDissolve — standard cross-fade (default)
 *   fadeToBlack  — fade in through black, hold, fade out through black
 */

interface NowShowingProps {
  sectionName: string;
  variant?: 'hardCut' | 'slowDissolve' | 'fadeToBlack';
  isVisible: boolean;
  onComplete?: () => void;
}

const FADE_IN_MS = 200;
const HOLD_MS = 200;
const FADE_OUT_MS = 200;
const TOTAL_MS = FADE_IN_MS + HOLD_MS + FADE_OUT_MS;

export default function NowShowing({
  sectionName,
  variant = 'slowDissolve',
  isVisible,
  onComplete,
}: NowShowingProps) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Fire onComplete after full animation duration
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onCompleteRef.current?.();
    }, TOTAL_MS);
    return () => clearTimeout(timer);
  }, [isVisible]);

  // Variant-specific animation config
  const getOverlayVariants = () => {
    if (variant === 'hardCut') {
      return {
        initial: { opacity: 1, backgroundColor: '#ffffff' as string },
        animate: { opacity: 1, backgroundColor: 'rgba(0,0,0,0.95)' as string },
        exit: { opacity: 0 },
        transition: {
          backgroundColor: { duration: 0.05, delay: 0 },
          opacity: { duration: FADE_OUT_MS / 1000, delay: (FADE_IN_MS + HOLD_MS) / 1000 },
        },
      };
    }
    if (variant === 'fadeToBlack') {
      return {
        initial: { opacity: 0, backgroundColor: '#000000' as string },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: {
          opacity: {
            duration: FADE_IN_MS / 1000,
          },
        },
      };
    }
    // slowDissolve (default)
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: {
        opacity: { duration: FADE_IN_MS / 1000 },
      },
    };
  };

  const overlayVariants = getOverlayVariants();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="now-showing-overlay"
          initial={overlayVariants.initial}
          animate={overlayVariants.animate}
          exit={overlayVariants.exit}
          transition={overlayVariants.transition}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: variant === 'fadeToBlack' ? '#000000' : 'rgba(10, 10, 10, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            zIndex: 'var(--z-modal)' as unknown as number,
          }}
          aria-live="polite"
          role="status"
        >
          {/* "NOW SHOWING" label */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: FADE_IN_MS / 1000, duration: 0.15 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-accent)',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              fontVariant: 'small-caps',
            }}
          >
            NOW SHOWING
          </motion.p>

          {/* Section name */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: FADE_IN_MS / 1000 + 0.05, duration: 0.2 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            {sectionName}
          </motion.h2>

          {/* Decorative amber line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: FADE_IN_MS / 1000 + 0.1, duration: 0.2 }}
            style={{
              width: '3rem',
              height: '1px',
              backgroundColor: 'var(--color-accent)',
              transformOrigin: 'center',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
