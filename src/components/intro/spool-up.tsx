'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * SpoolUp
 *
 * Film-threading effect played after the countdown white flash.
 * Phase 1 (800ms): rapid scroll from below with motion blur.
 * Phase 2 (500ms): deceleration — blur clears, opacity rises.
 * Phase 3 (300ms): spring lock-in with a mechanical bounce.
 *
 * 5-8 subliminal white flash frames fire during Phase 1.
 */

interface SpoolUpProps {
  children: React.ReactNode;
  onComplete: () => void;
}

type SpoolPhase = 'phase1' | 'phase2' | 'phase3' | 'done';

export default function SpoolUp({ children, onComplete }: SpoolUpProps) {
  const [phase, setPhase] = useState<SpoolPhase>('phase1');
  const [flashVisible, setFlashVisible] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Schedule subliminal flash frames during phase 1 (0–800ms)
  useEffect(() => {
    const FLASH_COUNT = 6;
    const PHASE1_DURATION = 800;
    const flashTimers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < FLASH_COUNT; i++) {
      const flashTime = 50 + Math.random() * (PHASE1_DURATION - 150);
      const timer = setTimeout(() => {
        setFlashVisible(true);
        setTimeout(() => setFlashVisible(false), 120);
      }, flashTime);
      flashTimers.push(timer);
    }

    const p1Timer = setTimeout(() => setPhase('phase2'), 800);
    const p2Timer = setTimeout(() => setPhase('phase3'), 1300);
    const p3Timer = setTimeout(() => {
      setPhase('done');
      onCompleteRef.current();
    }, 1600);

    return () => {
      flashTimers.forEach(clearTimeout);
      clearTimeout(p1Timer);
      clearTimeout(p2Timer);
      clearTimeout(p3Timer);
    };
  }, []);

  // Derive animation props from phase
  const getAnimateTarget = () => {
    switch (phase) {
      case 'phase1':
        return { y: 0, filter: 'blur(8px)', opacity: 0.6, scaleY: 1.02 };
      case 'phase2':
        return { y: 0, filter: 'blur(0px)', opacity: 1, scaleY: 1 };
      case 'phase3':
      case 'done':
        return { y: 0, filter: 'blur(0px)', opacity: 1, scaleY: 1 };
    }
  };

  const getTransition = () => {
    switch (phase) {
      case 'phase1':
        return { duration: 0.8, ease: 'easeIn' as const };
      case 'phase2':
        return {
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
        };
      case 'phase3':
        return { type: 'spring' as const, stiffness: 300, damping: 20 };
      case 'done':
        return { duration: 0 };
    }
  };

  return (
    <>
      {/* Content container with spool-up animation */}
      <motion.div
        initial={{
          y: '100vh',
          filter: 'blur(8px)',
          opacity: 0.6,
          scaleY: 1,
        }}
        animate={getAnimateTarget()}
        transition={getTransition()}
        style={{
          width: '100%',
          transformOrigin: 'center bottom',
        }}
      >
        {children}
      </motion.div>

      {/* Subliminal white flash overlay */}
      {flashVisible && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#ffffff',
            zIndex: 'var(--z-intro)' as unknown as number,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
