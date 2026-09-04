'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCapability } from '@/lib/capability/capability-context';

/**
 * Drives a preview's mount/pause state.
 *
 * ## The two-observer gate
 *
 * A single observer doing both jobs is what made these cards flicker: at the
 * boundary the flag chatters, and every chatter tore the preview down and
 * restarted its loop from scene zero.
 *
 * - **near** (400px lead-in) drives `active`, the *pause* flag. A preview
 *   keeps its clock across a pause, so it resumes mid-scene.
 * - **far** (1500px) is the only thing that unmounts a preview, and by then
 *   the card is nowhere near the viewport.
 *
 * ## The capability tier
 *
 * Seven live previews is a lot to ask of a device, and until now every device
 * was asked for all seven. What it costs is decided per device now:
 *
 * - **high** — previews mount on approach. Unchanged; this is what a healthy
 *   machine has always seen and should keep seeing.
 * - **medium** — the card rests as its poster and develops into the live
 *   preview on hover or keyboard focus. A motion poster: the motion is still
 *   there, it just waits to be asked for.
 * - **low** — poster only.
 *
 * Mounting **latches**. Once a card has gone live the near observer can never
 * put it back to the poster, and neither can a tier that arrives late — the
 * probe finishing while someone is watching a preview must not yank it away.
 * `prefers-reduced-motion` is an absolute block on all of it.
 */
export function usePreviewActive<T extends HTMLElement>(enabled = true) {
  const { tier } = useCapability();
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

  /* Hover/focus opt-in for the middle tier. A low tier is a hard block here
     too: "posters only" has to mean it, or sweeping a cursor across the grid
     on a weak laptop mounts the whole row the classification exists to
     avoid. */
  const activate = useCallback(() => {
    if (reduced || !enabled || tier === 'low') return;
    if (mountedRef.current) return;
    mountedRef.current = true;
    setMounted(true);
  }, [reduced, enabled, tier]);

  const autoMount = tier === 'high';

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !enabled) return;

    const nearIO = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting && autoMount && !mountedRef.current) {
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
    /* Re-created when autoMount flips, because an observer fires immediately
       on (re)observe with the current intersection — so a card already in
       view goes live the moment the probe classifies the device, with no
       scroll needed. */
  }, [reduced, autoMount, enabled]);

  return {
    ref,
    /** Mount the preview at all — latched, only released far offscreen. */
    mounted: mounted && !reduced,
    /** Run its animation. Pausing preserves the loop's clock. */
    active: visible && mounted && !reduced,
    /** Call on hover/focus. No-op except on the middle tier. */
    activate,
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
