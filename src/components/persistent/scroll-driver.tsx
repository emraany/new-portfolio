'use client';

/**
 * ScrollDriver
 *
 * A zero-render component that runs two scroll-related side effects:
 *
 * 1. Updates the --scroll-y CSS custom property on :root every
 *    animation frame for parallax consumers (e.g. ambient-type).
 *
 * 2. Drives --perf-position, the value perforations.css plugs into
 *    background-position-y. The strip drifts forward at a constant
 *    idle baseline regardless of scroll, so the perforations always
 *    move at the same steady speed.
 */

import { useEffect } from 'react';

const PERF_IDLE_SPEED = 2.4; // px/frame forward drift

export default function ScrollDriver() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let perfPosition = 0;
    let rafId: number;

    if (reduceMotion) {
      document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
      document.documentElement.style.setProperty('--perf-position', '0px');
      return;
    }

    function tick() {
      document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);

      perfPosition -= PERF_IDLE_SPEED;
      document.documentElement.style.setProperty('--perf-position', `${perfPosition}px`);

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
