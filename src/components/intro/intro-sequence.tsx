'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Countdown from './countdown';
import SpoolUp from './spool-up';
import IrisOpen from '../transitions/iris';

/**
 * IntroSequence
 *
 * Full-viewport overlay that plays once on first visit (or on every
 * fresh session if the user clears localStorage).
 *
 * First visit:  Countdown (5s) → white flash (80ms) → SpoolUp → lock-in
 * Return visit: 1-second IrisOpen → done
 * Always:       [ SKIP INTRO ] button in top-right corner
 *
 * localStorage key: 'portfolio_visited'
 */

interface IntroSequenceProps {
  children: React.ReactNode;
}

type Stage =
  | 'idle'          // detecting visit type
  | 'countdown'     // SMPTE leader
  | 'flash'         // 80ms white flash
  | 'spoolup'       // film threading
  | 'lockin'        // spring + flicker
  | 'iris-return'   // 1-second iris open for return visits
  | 'done';         // overlay removed

export default function IntroSequence({ children }: IntroSequenceProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [childBrightness, setChildBrightness] = useState(1);
  const [overlayVisible, setOverlayVisible] = useState(true);

  // Determine visit type on mount
  useEffect(() => {
    const visited = localStorage.getItem('portfolio_visited');
    if (!visited) {
      setIsFirstVisit(true);
      setStage('countdown');
    } else {
      setIsFirstVisit(false);
      setStage('iris-return');
    }
  }, []);

  // Lock-in brightness flicker (2-3 frames)
  const runLockInFlicker = useCallback(() => {
    const FLICKER_FRAMES = [0.6, 1, 0.7, 1, 0.85, 1];
    let i = 0;
    const interval = setInterval(() => {
      if (i < FLICKER_FRAMES.length) {
        setChildBrightness(FLICKER_FRAMES[i]);
        i++;
      } else {
        clearInterval(interval);
        setChildBrightness(1);
        // Mark as visited and remove overlay
        localStorage.setItem('portfolio_visited', '1');
        setTimeout(() => {
          setStage('done');
          setOverlayVisible(false);
        }, 100);
      }
    }, 48); // ~3 frames at 60fps
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setStage('flash');
    // White flash for 80ms
    setTimeout(() => {
      setStage('spoolup');
    }, 80);
  }, []);

  const handleSpoolUpComplete = useCallback(() => {
    setStage('lockin');
    runLockInFlicker();
  }, [runLockInFlicker]);

  const handleIrisReturnComplete = useCallback(() => {
    setStage('done');
    setOverlayVisible(false);
  }, []);

  const handleSkip = useCallback(() => {
    setChildBrightness(1);
    localStorage.setItem('portfolio_visited', '1');
    setStage('done');
    setOverlayVisible(false);
  }, []);

  // Children are always rendered; the overlay sits on top
  const childrenVisible = stage !== 'idle' && stage !== 'countdown' && stage !== 'flash';

  return (
    <>
      {/* Page content — always in DOM, revealed after intro */}
      <motion.div
        animate={{
          filter: `brightness(${childBrightness})`,
        }}
        transition={{ duration: 0 }}
        style={{ minHeight: '100%' }}
      >
        {children}
      </motion.div>

      {/* Intro overlay */}
      <AnimatePresence>
        {overlayVisible && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 'var(--z-intro)' as unknown as number,
              pointerEvents: stage === 'done' ? 'none' : 'auto',
            }}
          >
            {/* SKIP INTRO button — always visible during intro */}
            <button
              onClick={handleSkip}
              style={{
                position: 'fixed',
                top: '1.5rem',
                right: '1.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-accent)',
                background: 'transparent',
                border: '1px solid var(--color-accent)',
                padding: '0.375rem 0.75rem',
                cursor: 'pointer',
                letterSpacing: '0.1em',
                zIndex: 10,
              }}
              aria-label="Skip intro"
            >
              [ SKIP INTRO ]
            </button>

            {/* Countdown stage */}
            {stage === 'countdown' && (
              <Countdown onComplete={handleCountdownComplete} />
            )}

            {/* White flash stage */}
            {stage === 'flash' && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: '#ffffff',
                  zIndex: 1,
                }}
                aria-hidden="true"
              />
            )}

            {/* SpoolUp stage */}
            {(stage === 'spoolup' || stage === 'lockin') && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'var(--color-bg)',
                  overflow: 'hidden',
                  zIndex: 1,
                }}
              >
                <SpoolUp onComplete={handleSpoolUpComplete}>
                  {/* Show a blurred preview of the children during spool-up */}
                  <div style={{ pointerEvents: 'none' }}>
                    {children}
                  </div>
                </SpoolUp>
              </div>
            )}

            {/* Return visit: iris open */}
            {stage === 'iris-return' && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: '#000000',
                  zIndex: 1,
                }}
              >
                <IrisOpen
                  onComplete={handleIrisReturnComplete}
                  duration={1000}
                />
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Ensure content is fully visible once done */}
      {!overlayVisible && !childrenVisible && null}
    </>
  );
}
