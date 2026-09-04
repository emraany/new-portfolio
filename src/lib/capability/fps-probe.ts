/**
 * Frame probe.
 *
 * Samples `requestAnimationFrame` timestamps for a window and reports three
 * numbers. The one that matters is `jankRatio`, not mean FPS.
 *
 * Mean FPS cannot see a struggling device. rAF keeps being *called* at the
 * display's cadence even when the device is missing its paint deadlines, so a
 * machine that visibly stutters still averages a healthy-looking number — the
 * documented case being a page whose 95th-percentile frame took 367ms while
 * the mean still read 49.6fps. What separates a struggling device from a
 * healthy one is the long tail: it drops frames in clusters, and no average
 * survives that. So we count them.
 */

export interface FrameProbe {
  /** Mean frames per second across the measured window. */
  fps: number;
  /** Fraction (0-1) of frame intervals longer than ~33ms. */
  jankRatio: number;
  /** Longest single frame interval observed, in ms. */
  worstFrameMs: number;
}

/** A frame interval at least this long counts as dropped (under 30fps). */
const LONG_FRAME_MS = 33;

/**
 * Measure frame pacing for `durationMs`, starting `settleMs` from now.
 *
 * The settle is not optional politeness — every device drops frames during
 * hydration, a flagship included, so a window that overlaps startup measures
 * the page's cost rather than the hardware's capability.
 */
export function probeFrames(durationMs = 1200, settleMs = 0): Promise<FrameProbe> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
      resolve({ fps: 60, jankRatio: 0, worstFrameMs: 0 });
      return;
    }

    const start = performance.now();
    let counting = settleMs <= 0;
    let countFrom = start;
    let frames = 0;
    let intervals = 0;
    let longFrames = 0;
    let worst = 0;
    let prev = 0;

    const tick = (now: number) => {
      if (!counting && now - start >= settleMs) {
        /* Open the measured window here. Without resetting `prev`, the whole
           settle gap would register as one enormous interval and every probe
           would report a spike it never saw. */
        counting = true;
        countFrom = now;
        prev = now;
        requestAnimationFrame(tick);
        return;
      }

      if (counting) {
        frames++;
        if (prev) {
          const delta = now - prev;
          intervals++;
          if (delta > LONG_FRAME_MS) longFrames++;
          if (delta > worst) worst = delta;
        }
        prev = now;

        if (now - countFrom >= durationMs) {
          const elapsed = now - countFrom;
          resolve({
            fps: elapsed > 0 ? (frames * 1000) / elapsed : 0,
            jankRatio: intervals > 0 ? longFrames / intervals : 0,
            worstFrameMs: worst,
          });
          return;
        }
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}
