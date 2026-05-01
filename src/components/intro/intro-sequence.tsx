'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionTemplate,
} from 'framer-motion';
import Countdown from './countdown';
import SpoolUp from './spool-up';

/**
 * IntroSequence
 *
 * Countdown (SMPTE leader) → brief reveal fade → SpoolUp (content reels
 * past a fixed projector gate via transform) → done.
 *
 * The black curtain fully fades out BEFORE the spool animation begins,
 * so the first rapid pass is visible. The translating wrapper gets a
 * motion-blur filter during the fast passes, and body.is-fast-scroll
 * is toggled so the perforations also blur.
 */

interface IntroSequenceProps {
  children: React.ReactNode;
}

type Stage = 'idle' | 'countdown' | 'reveal' | 'spoolup' | 'done';

const REVEAL_MS = 140;

export default function IntroSequence({ children }: IntroSequenceProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [overlayVisible, setOverlayVisible] = useState(true);
  const stopSpoolRef = useRef<(() => void) | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const pageY = useMotionValue(0);
  const blurY = useMotionValue(0);
  const filter = useMotionTemplate`blur(${blurY}px)`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.history.scrollRestoration = 'manual';
    } catch {
      /* older browsers — no-op */
    }
    window.scrollTo(0, 0);
    setStage('countdown');
  }, []);

  const getTravel = useCallback(() => {
    const el = contentRef.current;
    if (!el) return 0;
    return Math.max(el.scrollHeight - window.innerHeight, 0);
  }, []);

  const lockScroll = useCallback(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }, []);

  const unlockScroll = useCallback(() => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.classList.remove('is-fast-scroll');
    window.scrollTo(0, 0);
  }, []);

  const handleCountdownComplete = useCallback(() => {
    lockScroll();
    setStage('reveal');
    // Let the curtain fully fade before any content motion begins.
    window.setTimeout(() => {
      document.body.classList.add('is-fast-scroll');
      setStage('spoolup');
    }, REVEAL_MS);
  }, [lockScroll]);

  const handleSettleStart = useCallback(() => {
    // Drop the perforation blur in sync with the content blur as the
    // final decelerating pass begins.
    document.body.classList.remove('is-fast-scroll');
  }, []);

  const handleSpoolUpComplete = useCallback(() => {
    unlockScroll();
    setStage('done');
    setOverlayVisible(false);
  }, [unlockScroll]);

  const handleSkip = useCallback(() => {
    stopSpoolRef.current?.();
    pageY.set(0);
    blurY.set(0);
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.classList.remove('is-fast-scroll');
    setStage('done');
    setOverlayVisible(false);
    // Force scroll to top after paint so the transform reset is applied first.
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, [pageY, blurY]);

  useEffect(() => {
    if (stage === 'done' || stage === 'idle') return;
    const onKey = () => handleSkip();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, handleSkip]);

  return (
    <>
      <motion.div
        ref={contentRef}
        style={{
          y: pageY,
          filter,
          minHeight: '100%',
          willChange: 'transform, filter',
        }}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {overlayVisible && (
          <motion.div
            key="intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={handleSkip}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 'var(--z-intro)' as unknown as number,
              pointerEvents: stage === 'done' ? 'none' : 'auto',
              cursor: 'pointer',
            }}
          >
            {/* Black curtain — opaque during countdown, fades to
                transparent during reveal, fully gone by spoolup. */}
            <motion.div
              initial={false}
              animate={{
                opacity: stage === 'countdown' || stage === 'idle' ? 1 : 0,
              }}
              transition={{ duration: REVEAL_MS / 1000, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'var(--color-bg)',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            />

            {stage === 'countdown' && (
              <Countdown onComplete={handleCountdownComplete} />
            )}

            {stage === 'spoolup' && (
              <SpoolUp
                pageY={pageY}
                blurY={blurY}
                getTravel={getTravel}
                onComplete={handleSpoolUpComplete}
                onSettleStart={handleSettleStart}
                registerStop={(stop) => {
                  stopSpoolRef.current = stop;
                }}
              />
            )}

            {/* Press anything to skip — rendered last so it layers above countdown */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: stage === 'countdown' || stage === 'spoolup' ? 0.75 : 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              style={{
                position: 'fixed',
                bottom: '33.33vh',
                left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.18em',
                color: 'var(--color-text-primary)',
                pointerEvents: 'none',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                zIndex: 200,
              }}
              aria-hidden="true"
            >
              PRESS ANYTHING TO SKIP
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
