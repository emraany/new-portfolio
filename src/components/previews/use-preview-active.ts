'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Drives a preview's mount/pause state.
 *
 * A direct port of the two-observer gate in ../Website's StaticTileGate,
 * because a single observer doing both jobs is what made these cards
 * flicker: at the boundary the flag chatters, and every chatter tore the
 * preview down and restarted its loop from scene zero.
 *
 * - **near** (400px lead-in) drives `visible`, the *pause* flag. A preview
 *   keeps its clock across a pause, so it resumes mid-scene.
 * - **far** (1500px) is the only thing that unmounts a preview, and by
 *   then the card is nowhere near the viewport.
 *
 * Mounting **latches**: once a card has gone live the near observer can
 * never put it back to the poster, so scrolling past the 400px line does
 * not restart anything. `prefers-reduced-motion` is an absolute block.
 */
export function usePreviewActive<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [reduced, setReduced] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const nearIO = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting && !mountedRef.current) {
          mountedRef.current = true;
          setMounted(true);
        }
      },
      { rootMargin: '400px' }
    );
    nearIO.observe(el);

    const farIO = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          mountedRef.current = false;
          setMounted(false);
          setVisible(true);
        }
      },
      { rootMargin: '1500px' }
    );
    farIO.observe(el);

    return () => {
      nearIO.disconnect();
      farIO.disconnect();
    };
  }, [reduced]);

  return {
    ref,
    /** Mount the preview at all — latched, only released far offscreen. */
    mounted: mounted && !reduced,
    /** Run its animation. Pausing preserves the loop's clock. */
    active: visible && !reduced,
  } as const;
}

/** Standalone reduced-motion check, for components outside the gate. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);
  return reduced;
}
