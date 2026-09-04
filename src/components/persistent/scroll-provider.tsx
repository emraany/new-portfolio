'use client';

/**
 * ScrollEngine — the site's single scroll subscription.
 *
 * This replaces four permanent `requestAnimationFrame` loops: the one in
 * ScrollDriver, plus one per `useScrollProgress()` call site (FrameCounter,
 * AmbientType, TicketNav each instantiated their own). Every one of those
 * loops ran forever, on every device, whether or not the page was scrolling,
 * visible, or even in the foreground — and the hook's loop called `setState`
 * with a freshly allocated object on every frame, so TicketNav re-rendered
 * eight `motion.button`s sixty times a second to read a section name that
 * changes maybe nine times in a session.
 *
 * Two principles replace them:
 *
 * 1. **Nothing runs at rest.** There is no standing loop. A passive `scroll`
 *    listener schedules at most one rAF per frame, and that rAF does not
 *    reschedule itself — when scrolling stops, so does all work.
 * 2. **Publish only what changed.** Subscribers are notified per field, and
 *    the per-frame value is quantized at the source (see `frame` below), so a
 *    re-render means the number on screen genuinely differs.
 *
 * The perforation drift used to be the reason a loop had to run continuously:
 * it is a constant, scroll-independent forward crawl, so it kept the rAF alive
 * even on a motionless page, and each tick wrote a custom property on `:root`
 * — invalidating style for the entire document. It is now a CSS animation in
 * perforations.css, which is what a constant linear infinite motion always
 * wanted to be. Same drift, same speed, no JavaScript.
 */

import { useEffect, useSyncExternalStore } from 'react';

/* ----------------------------------------------------------------
   Section ids the observer watches, in document order.
   ---------------------------------------------------------------- */

const SECTION_IDS = [
  'hero',
  'about',
  'filmography',
  'experience',
  'skills',
  'archive',
  'screening-room',
  'credits',
] as const;

/* ----------------------------------------------------------------
   Store
   ---------------------------------------------------------------- */

/** Scroll distance, in px, that advances the HUD by one frame. */
const PX_PER_FRAME = 10;
/** Frame counter wraps here, matching a 4-digit display. */
const FRAME_WRAP = 9999;

let section = 'hero';
let frame = 0;

const sectionListeners = new Set<() => void>();
const frameListeners = new Set<() => void>();

function subscribeSection(listener: () => void) {
  sectionListeners.add(listener);
  return () => sectionListeners.delete(listener);
}

function subscribeFrame(listener: () => void) {
  frameListeners.add(listener);
  return () => frameListeners.delete(listener);
}

/**
 * The id of the section currently most visible.
 *
 * Changes a handful of times per session, so a subscriber re-renders a
 * handful of times per session.
 */
export function useCurrentSection(): string {
  return useSyncExternalStore(
    subscribeSection,
    () => section,
    () => 'hero'
  );
}

/**
 * The HUD frame count.
 *
 * Already quantized to `PX_PER_FRAME` — the value only changes once every
 * 10px of scroll, not once per animation frame, so subscribing to it costs a
 * render only when the displayed digits actually differ.
 */
export function useScrollFrame(): number {
  return useSyncExternalStore(
    subscribeFrame,
    () => frame,
    () => 0
  );
}

/* ----------------------------------------------------------------
   Engine
   ---------------------------------------------------------------- */

export default function ScrollEngine() {
  useEffect(() => {
    const root = document.documentElement;

    /* --scroll-y feeds AmbientType's parallax transform. Seed it once so the
       first paint is correct even if the visitor never scrolls (a refresh
       restoring a scroll offset, or a deep link). */
    root.style.setProperty('--scroll-y', `${window.scrollY}px`);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- Per-frame work, coalesced ---------------------------------- */

    let rafId: number | null = null;

    const flush = () => {
      rafId = null;
      const y = window.scrollY;

      if (!reduceMotion) {
        root.style.setProperty('--scroll-y', `${y}px`);
      }

      const nextFrame = Math.floor(y / PX_PER_FRAME) % FRAME_WRAP;
      if (nextFrame !== frame) {
        frame = nextFrame;
        frameListeners.forEach((l) => l());
      }
    };

    /* One rAF per frame at most, and it never reschedules itself — the next
       scroll event is what starts the next one. A motionless page does no
       work at all. */
    const onScroll = () => {
      if (rafId === null) rafId = requestAnimationFrame(flush);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---- Which section are we in ------------------------------------ */

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let best = section;
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }

        if (best !== section) {
          section = best;
          sectionListeners.forEach((l) => l());
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return null;
}
