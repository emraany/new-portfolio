'use client';

/**
 * ScrollDriver
 *
 * A zero-render component that runs two scroll-related side effects:
 *
 * 1. Updates the --scroll-y CSS custom property on :root every
 *    animation frame so perforations.css can tie background-position-y
 *    to the scroll offset, making the strips appear to travel upward
 *    at the same rate the user scrolls downward.
 *
 * 2. Detects fast scrolling (velocity > 20px per frame) and toggles
 *    .is-fast-scroll on <body> so perforations.css can apply a
 *    1–2px motion blur exclusively to the strip elements.
 *
 * This file is owned by the design-system agent because the scroll
 * behaviour is part of the perforation spec defined in variables.css
 * and perforations.css.
 */

import { useEffect } from 'react';

const FAST_SCROLL_THRESHOLD = 20; // px per RAF
const FAST_SCROLL_DEBOUNCE  = 150; // ms before removing the class

export default function ScrollDriver() {
  useEffect(() => {
    let lastScrollY   = window.scrollY;
    let rafId: number;
    let debounceTimer: ReturnType<typeof setTimeout>;
    let isFast        = false;

    function tick() {
      const currentY  = window.scrollY;
      const delta     = Math.abs(currentY - lastScrollY);

      // Update the CSS custom property every frame
      document.documentElement.style.setProperty('--scroll-y', `${currentY}px`);

      // Fast-scroll detection
      if (delta > FAST_SCROLL_THRESHOLD) {
        if (!isFast) {
          document.body.classList.add('is-fast-scroll');
          isFast = true;
        }
        // Reset the debounce timer on each fast frame
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          document.body.classList.remove('is-fast-scroll');
          isFast = false;
        }, FAST_SCROLL_DEBOUNCE);
      }

      lastScrollY = currentY;
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(debounceTimer);
      document.body.classList.remove('is-fast-scroll');
    };
  }, []);

  // Renders nothing — pure side-effect component
  return null;
}
