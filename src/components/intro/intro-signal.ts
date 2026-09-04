'use client';

/**
 * The intro's "the house lights are up" signal.
 *
 * The capability probe has to wait for this. The intro is the single most
 * expensive stretch of the site's life — a 60-tick SVG redrawn every frame, a
 * full-viewport brightness flicker, a page-wide blur during spool-up — so a
 * probe that overlaps it measures the intro rather than the device, and would
 * demote hardware that is perfectly capable of running the previews the
 * demotion exists to protect.
 *
 * Kept in its own module rather than on the IntroSequence component so that
 * `waitForIntroReveal` can be awaited from anywhere without importing a React
 * tree, and so a page that never mounts the intro still resolves.
 */

const INTRO_DONE_EVENT = 'film:intro-done';

let done = false;

/** Called by IntroSequence when the spool-up finishes or the visitor skips. */
export function markIntroDone() {
  if (done) return;
  done = true;
  document.dispatchEvent(new CustomEvent(INTRO_DONE_EVENT));
}

/**
 * Resolves once the intro is over.
 *
 * Resolves immediately if it already finished, and always resolves eventually:
 * the fallback is a safety net, not a schedule, so a bug in the intro can
 * never leave a caller hanging forever.
 */
export function waitForIntroReveal(fallbackMs = 8000): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || done) {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      document.removeEventListener(INTRO_DONE_EVENT, finish);
      clearTimeout(timer);
      resolve();
    };

    const timer = setTimeout(finish, fallbackMs);
    document.addEventListener(INTRO_DONE_EVENT, finish, { once: true });
  });
}
