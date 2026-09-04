'use client';

import { useEffect, useState } from 'react';

/**
 * Subscribes to a media query.
 *
 * Returns `null` until the component has mounted, then the live match.
 * The three-state return is deliberate: the server has no viewport, so any
 * boolean guessed during SSR is a coin flip that hydration would have to
 * correct — visibly, if the value gates what renders. `null` means "not known
 * yet", and callers decide what that should look like.
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, [query]);

  return matches;
}
