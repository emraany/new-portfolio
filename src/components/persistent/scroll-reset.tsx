'use client';

import { useLayoutEffect } from 'react';

/**
 * ScrollReset
 *
 * Disables the browser's automatic scroll restoration and forces the page
 * to start at (0, 0) on every mount. After the first run, the history
 * entry's scrollRestoration is "manual", so subsequent reloads no longer
 * trigger the browser's restore behavior.
 *
 * Replaces a previous beforeInteractive <Script> tag, which rendered a
 * `<script>` element inside <body> and triggered a React 19 warning
 * about scripts inside React components.
 */
export default function ScrollReset() {
  useLayoutEffect(() => {
    try {
      history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    } catch {}
  }, []);
  return null;
}
