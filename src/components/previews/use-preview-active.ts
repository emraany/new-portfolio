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
 * Seven live previews is a lot to ask of a device, so what it costs is decided
 * per device — but the decision is now binary, because the card *is* the
 * animation:
 *
 * - **high** and **medium** — previews mount on approach. The card has no
 *   still underneath it; the preview is the first and only thing it paints.
 * - **low**, and `prefers-reduced-motion` — the poster still, and only that.
 *   These are the devices that never get an animation, which is exactly what
 *   the poster is for.
 *
 * The middle tier used to rest as a poster and develop into the preview on
 * hover — a motion poster. Two things killed that. It could not work on touch
 * at all (a phone has no hover, and nearly every phone lands on `medium`,
 * since Safari withholds `deviceMemory` and no handset reports eight cores),
 * and the still-then-animation handoff was the visible snap it was meant to
 * smooth: the posters are frames of these previews, but a mounting preview
 * starts at scene zero, so the crossfade dissolved one image into a different
 * one. Deciding once, per device, whether a card is a still or an animation
 * removes both problems.
 *
 * `activate` survives for the one caller that still needs it: the detail
 * sheet, which forces its hero live rather than waiting to be scrolled to.
 *
 * Mounting **latches**. Once a card has gone live the near observer can never
 * put it back, and neither can a tier that arrives late — the probe finishing
 * while someone is watching a preview must not yank it away.
 */
export function usePreviewActive<T extends HTMLElement>(enabled = true) {
  const { tier } = useCapability();
  const ref = useRef<T>(null);
  const [reduced, setReduced] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [settled, setSettled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mql.matches);
    sync();
    setSettled(true);
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);

  /* `(hover: none)` rather than `(pointer: coarse)`: what decides this is
     whether the hover gesture the middle tier waits for can happen at all,
     not how precise the pointer is. A stylus is coarse and still hovers. */
  useEffect(() => {
    const mql = window.matchMedia('(hover: none)');
    const sync = () => setCoarse(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);

  /** This device is never getting an animation, so the still is what it gets. */
  const stillOnly = reduced || tier === 'low';

  /* Force a mount ahead of the observer. Only the detail sheet calls this —
     opening a project is already an explicit request for it, so its hero does
     not wait to be scrolled into view. `stillOnly` is a hard block: "posters
     only" has to mean it. */
  const activate = useCallback(() => {
    if (stillOnly || !enabled) return;
    if (mountedRef.current) return;
    mountedRef.current = true;
    setMounted(true);
  }, [stillOnly, enabled]);

  const autoMount = !stillOnly;

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
      /* A phone shows one card at a time and has a fraction of the frame
         budget, so the 400px lead-in — three cards of the carousel — is a
         desktop luxury. Off screen means paused there.

         The threshold goes with it: the mobile strip deliberately leaves a
         sliver of the next card showing, and a 26px sliver is not a card
         arriving. Without it a swipe would mount and run three previews at
         once. Safe against a tall element never reaching the fraction —
         what is observed is the 16/10 visual, not the whole card. */
      { rootMargin: coarse ? '0px' : '400px', threshold: coarse ? 0.4 : 0 }
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
  }, [reduced, autoMount, enabled, coarse]);

  return {
    ref,
    /** Mount the preview at all — latched, only released far offscreen. */
    mounted: mounted && !reduced,
    /** Run its animation. Pausing preserves the loop's clock. */
    active: visible && mounted && !reduced,
    /** Force a mount without waiting for the observer. Used by the sheet. */
    activate,
    /**
     * Render the still instead of the animation.
     *
     * Gated on `settled` rather than read straight off the tier: the server
     * has no `navigator`, so `computeTier` answers `medium` there while the
     * browser may answer `low` on its very first render. Deferring the
     * decision by one commit keeps the server and the hydrating client
     * rendering the same thing.
     */
    posterOnly: settled && stillOnly,
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
