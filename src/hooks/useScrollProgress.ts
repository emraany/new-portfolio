'use client';

import { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScrollProgress {
  /** Raw window.scrollY value. */
  scrollY: number;
  /** 0–1, scrollY / (document height − viewport height). */
  scrollProgress: number;
  /** Absolute px/frame delta, smoothed with an exponential moving average. */
  scrollSpeed: number;
  /** id of the section element currently most visible in the viewport. */
  currentSection: string;
  isAtTop: boolean;
  isAtBottom: boolean;
}

// ---------------------------------------------------------------------------
// Section ids that IntersectionObserver watches
// ---------------------------------------------------------------------------

const SECTION_IDS = [
  'hero',
  'about',
  'filmography',
  'experience',
  'skills',
  'archive',
  'screening-room',
  'credits',
  'contact',
] as const;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useScrollProgress(): ScrollProgress {
  const [state, setState] = useState<ScrollProgress>({
    scrollY: 0,
    scrollProgress: 0,
    scrollSpeed: 0,
    currentSection: 'hero',
    isAtTop: true,
    isAtBottom: false,
  });

  // Mutable refs so the RAF loop can read/write without closure staleness.
  const rafRef = useRef<number | null>(null);
  const lastScrollYRef = useRef<number>(0);
  const smoothSpeedRef = useRef<number>(0);
  // Map from section id → current intersectionRatio (updated by observer).
  const ratioMapRef = useRef<Map<string, number>>(new Map());
  const currentSectionRef = useRef<string>('hero');

  // -------------------------------------------------------------------------
  // IntersectionObserver — tracks which section is most visible
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).id;
        ratioMapRef.current.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
      }

      // Pick the section with the highest ratio.
      let best = currentSectionRef.current;
      let bestRatio = 0;
      for (const [id, ratio] of ratioMapRef.current) {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = id;
        }
      }
      currentSectionRef.current = best;
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      rootMargin: '0px',
    });

    // Observe all section[id] elements we care about.
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // -------------------------------------------------------------------------
  // RAF loop — updates scroll metrics every frame
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tick = () => {
      const currentY = window.scrollY;
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);

      // Exponential moving average for speed.
      const delta = Math.abs(currentY - lastScrollYRef.current);
      smoothSpeedRef.current = 0.8 * smoothSpeedRef.current + 0.2 * delta;

      lastScrollYRef.current = currentY;

      const progress = currentY / maxScroll;

      setState({
        scrollY: currentY,
        scrollProgress: progress,
        scrollSpeed: smoothSpeedRef.current,
        currentSection: currentSectionRef.current,
        isAtTop: currentY < 50,
        isAtBottom: progress > 0.98,
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return state;
}
