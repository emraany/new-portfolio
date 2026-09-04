'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The clock every preview runs on.
 *
 * Ported from ../Website's NowPlayingTile: one `performance.now()` origin
 * per mount, every visual derived from `elapsed` on each frame. Nothing is
 * ever "advanced" by a timer, so a preview cannot drift, cannot double up
 * its own schedule, and always agrees with itself no matter how many
 * frames were dropped.
 *
 * Two details carry the whole thing:
 *
 * 1. **Pause-aware timing.** rAF (and the throttle's setTimeout) freeze
 *    while the tab is backgrounded or the card is scrolled away, so `now`
 *    can leap forward by seconds on resume. Left alone, `elapsed` snaps
 *    ahead and the loop jumps several scenes in one frame. A gap over
 *    500ms slides the origin forward instead, so the loop resumes exactly
 *    where it paused.
 * 2. **The origin lives in a ref**, so pausing and resuming (`active`
 *    flipping) never restarts the animation — it picks up mid-scene.
 *
 * `onFrame` is read from a ref, so passing a fresh closure every render
 * never tears down and rebuilds the loop.
 */
export function useLoopClock(
  active: boolean,
  onFrame: (elapsed: number) => void,
  fps = 60
) {
  const frameRef = useRef(onFrame);
  frameRef.current = onFrame;

  const startRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    if (startRef.current === null) startRef.current = performance.now();

    let rafId = 0;
    let throttle = 0;
    const interval = 1000 / fps;

    const tick = (now: number) => {
      if (lastRef.current !== null && startRef.current !== null) {
        const gap = now - lastRef.current;
        if (gap > 500) startRef.current += gap;
      }
      lastRef.current = now;

      /* Never hand out a negative elapsed. The timestamp rAF passes is the
         frame's own start time, so the first callback after the origin is
         captured can legitimately predate it, and any clock adjustment can
         do the same. One negative frame is enough to wreck a derived loop:
         `Math.floor(-1 / total)` is -1, which lands the scene lookup on the
         very last scene and holds it there until the next good frame. */
      frameRef.current(Math.max(0, now - (startRef.current ?? now)));

      throttle = window.setTimeout(() => {
        rafId = requestAnimationFrame(tick);
      }, interval);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(throttle);
    };
  }, [active, fps]);
}

/**
 * Drives a preview through a looping script of scenes.
 *
 * Each preview declares its scenes as a list of durations in ms; this
 * returns `[step, loop]` — the index of the scene playing now, and how
 * many complete passes have finished (for re-keying elements that must
 * replay an entrance every round).
 *
 * Both are *derived* from the clock rather than advanced by a timer
 * chain, which is the difference between a loop that survives a tab
 * switch and one that unravels: a chain that misses its window keeps
 * missing, while a derivation just reads the right scene on the next
 * frame. React state is only touched when the scene actually changes.
 */
export function useScript(
  durations: readonly number[],
  active: boolean,
  options?: {
    /**
     * Override the scene clock's rate. Only worth raising for a preview
     * that also drives per-frame work through `onFrame` — see below.
     */
    fps?: number;
    /**
     * Per-frame hook, called with the same elapsed the scene index is
     * derived from.
     *
     * This exists so a preview that needs both a scene script and smooth
     * per-frame work runs on ONE clock. Two `useLoopClock` calls in one
     * component are two independent rAF chains for a single card, and
     * they can disagree about what time it is — which is how a count-up
     * ends up animating for a scene that is no longer on screen.
     */
    onFrame?: (elapsed: number) => void;
  }
): [step: number, loop: number] {
  const total = durations.reduce((a, b) => a + b, 0);

  const [state, setState] = useState<[number, number]>([0, 0]);
  const stateRef = useRef(state);

  const onFrameRef = useRef(options?.onFrame);
  onFrameRef.current = options?.onFrame;

  useLoopClock(
    active,
    (rawElapsed) => {
      /* Belt and braces alongside the clock's own clamp: a scene lookup
         must never be able to fall through its loop, because the fallback
         is "hold the last scene forever" — the exact way a preview jams. */
      const elapsed = rawElapsed > 0 ? rawElapsed : 0;
      const loop = total > 0 ? Math.floor(elapsed / total) : 0;
      const t = elapsed - loop * total;

      let acc = 0;
      let step = 0;
      for (let i = 0; i < durations.length; i++) {
        acc += durations[i];
        if (t < acc) {
          step = i;
          break;
        }
      }

      const [prevStep, prevLoop] = stateRef.current;
      if (step !== prevStep || loop !== prevLoop) {
        stateRef.current = [step, loop];
        setState([step, loop]);
      }

      onFrameRef.current?.(elapsed);
    },
    // Scene changes are ms-scale; 20fps is more than enough to catch them
    // and keeps a grid of cards off the main thread.
    options?.fps ?? 20
  );

  return state;
}
