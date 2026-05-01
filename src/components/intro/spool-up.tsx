'use client';

import { useEffect, useRef } from 'react';
import { animate, type MotionValue } from 'framer-motion';

/**
 * SpoolUp
 *
 * Runs the film-threading effect as a pure transform animation on the
 * page content. The real window scroll is untouched — the parent holds
 * a MotionValue that drives translateY on the children wrapper, so the
 * effect plays "in a vacuum" and cannot be disturbed by the user's
 * real scroll position. Fixed UI (perforations, grain, cursor) stays
 * pinned like a film projector gate while the content reels past.
 */

interface SpoolUpProps {
  pageY: MotionValue<number>;
  blurY: MotionValue<number>;
  getTravel: () => number;
  onComplete: () => void;
  onSettleStart?: () => void;
  registerStop?: (stop: () => void) => void;
}

// Fast start, then each pass takes noticeably longer — reel losing momentum
const LOOP_DURATIONS = [0.15, 0.28, 0.5];
const SETTLE_DURATION = 0.7;

export default function SpoolUp({
  pageY,
  blurY,
  getTravel,
  onComplete,
  onSettleStart,
  registerStop,
}: SpoolUpProps) {
  const onCompleteRef = useRef(onComplete);
  const onSettleStartRef = useRef(onSettleStart);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onSettleStartRef.current = onSettleStart;
  }, [onComplete, onSettleStart]);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      pageY.set(0);
      blurY.set(0);
      onSettleStartRef.current?.();
      onCompleteRef.current();
      return;
    }

    const travel = getTravel();

    if (travel <= 0) {
      onCompleteRef.current();
      return;
    }

    let stopped = false;
    const stopFns: Array<() => void> = [];

    const totalLoopDuration = LOOP_DURATIONS.reduce((a, b) => a + b, 0);
    const totalDuration = totalLoopDuration + SETTLE_DURATION;
    const loopFraction = totalLoopDuration / totalDuration;

    // Motion blur held at full during loops, fades out over settle.
    const blurControls = animate(blurY, [3, 3, 0], {
      duration: totalDuration,
      times: [0, loopFraction, 1],
      ease: ['linear', 'easeOut'],
    });
    stopFns.push(() => blurControls.stop());

    // Run each loop pass sequentially, each one slower than the last.
    function runPass(index: number) {
      if (stopped) return;

      if (index >= LOOP_DURATIONS.length) {
        // All passes done — settle back to rest.
        onSettleStartRef.current?.();
        const settleControls = animate(pageY, 0, {
          duration: SETTLE_DURATION,
          ease: [0.16, 1, 0.3, 1],
          onComplete: () => {
            if (!stopped) {
              pageY.set(0);
              onCompleteRef.current();
            }
          },
        });
        stopFns.push(() => settleControls.stop());
        return;
      }

      pageY.set(0);
      const ctrl = animate(pageY, -travel, {
        duration: LOOP_DURATIONS[index],
        ease: 'linear',
        onComplete: () => runPass(index + 1),
      });
      stopFns.push(() => ctrl.stop());
    }

    runPass(0);

    if (registerStop) {
      registerStop(() => {
        stopped = true;
        stopFns.forEach(fn => fn());
        pageY.set(0);
        blurY.set(0);
      });
    }

    return () => {
      stopped = true;
      stopFns.forEach(fn => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
