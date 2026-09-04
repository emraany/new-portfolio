'use client';

/**
 * CapabilityProvider — decides how much motion this device gets.
 *
 * Seeds a tier from `navigator` hints immediately, then measures the device
 * and demotes it if the measurement disagrees. Three guards keep the
 * measurement honest, and each one exists because the naive version is wrong
 * in a specific, reproducible way:
 *
 * 1. **The probe is anchored to the end of the intro, not to mount.** Our
 *    intro is ~4.8s of the most expensive work on the site: a 60-tick SVG
 *    redrawn every frame, a full-viewport brightness flicker, and a page-wide
 *    blur during spool-up. A probe that samples any of that is measuring the
 *    intro, not the hardware, and would happily demote a flagship.
 *
 * 2. **A bad result must be confirmed by a second probe.** One noisy window —
 *    garbage collection, a dragged window, a notification arriving — is not
 *    evidence. Hardware that genuinely cannot keep up fails twice; a blip
 *    fails once. Without this, a single unlucky second writes a verdict that
 *    later visits inherit.
 *
 * 3. **A demotion requires a real missed-paint spike.** iOS Low Power Mode and
 *    Chromium's battery saver cap rAF at a uniform 30fps on perfectly capable
 *    devices, which reads as "fps ≈ 30, nearly every interval long" — exactly
 *    like weak hardware, except a device that is truly struggling always has a
 *    long tail. Requiring one genuinely long frame separates a throttle from
 *    weakness, and a throttle is a transient power state that must never be
 *    written down.
 *
 * The verdict is persisted so the next visit starts light rather than
 * re-learning the same lesson mid-scroll, and it expires so a device is never
 * permanently condemned by one bad afternoon.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  computeTier,
  readHints,
  JANK_LOW_THRESHOLD,
  type CapabilityProfile,
} from './detect-capability';
import { probeFrames, type FrameProbe } from './fps-probe';
import { waitForIntroReveal } from '@/components/intro/intro-signal';

const STORAGE_KEY = 'film:low-power';
/** Verdicts older than this are re-measured rather than trusted. */
const VERDICT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Persist a low verdict below this mean FPS — deliberately above the live
 * demotion bar of 30. rAF keeps ticking near the refresh rate while paint is
 * the bottleneck, so by the time the *mean* sinks into the 30s the experience
 * has been bad for a while.
 */
const PERSIST_FPS_FLOOR = 40;

/**
 * A single frame at least this long is a genuine missed paint (two-plus
 * missed 60Hz deadlines). See guard 3 above — without this, an OS rAF
 * throttle is indistinguishable from weak hardware.
 */
const SPIKE_FRAME_MS = 60;

const defaultProfile: CapabilityProfile = {
  tier: 'high',
  deviceMemory: null,
  hardwareConcurrency: null,
  effectiveType: null,
  saveData: false,
  prefersReducedMotion: false,
  uaIsOldIos: false,
  fps: null,
  jankRatio: null,
  source: 'hints',
};

const CapabilityContext = createContext<CapabilityProfile>(defaultProfile);

export function useCapability(): CapabilityProfile {
  return useContext(CapabilityContext);
}

/* ----------------------------------------------------------------
   Persistence — every access guarded, storage can be unavailable
   ---------------------------------------------------------------- */

function readPersistedLowPower(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { at?: number };
    if (typeof parsed.at !== 'number') return false;
    return Date.now() - parsed.at < VERDICT_TTL_MS;
  } catch {
    /* Storage disabled, or a value we no longer understand. Either way the
       heavy path is the default and only a verdict we can read opts out. */
    return false;
  }
}

function writePersistedLowPower(low: boolean) {
  if (typeof window === 'undefined') return;
  try {
    if (low) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now() }));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* Storage disabled or over quota — degrade to per-load detection. */
  }
}

/* ----------------------------------------------------------------
   Provider
   ---------------------------------------------------------------- */

export function CapabilityProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CapabilityProfile>(defaultProfile);

  useEffect(() => {
    /* A stored verdict seeds the tier synchronously, so a device that was
       measured struggling last visit starts light this visit instead of
       learning it again halfway down the page. */
    const ranLight = readPersistedLowPower();
    const hints = readHints();

    setProfile({
      ...hints,
      tier: ranLight ? 'low' : computeTier(hints),
      source: ranLight ? 'persisted' : 'hints',
    });

    let cancelled = false;

    const showsRealJank = (p: FrameProbe) => p.worstFrameMs >= SPIKE_FRAME_MS;
    const suspicious = (p: FrameProbe) =>
      (p.fps < PERSIST_FPS_FLOOR || p.jankRatio >= JANK_LOW_THRESHOLD) && showsRealJank(p);

    waitForIntroReveal()
      .then(() => (cancelled ? null : probeFrames(1200, 1200)))
      .then((first) => {
        if (cancelled || !first) return null;
        /* Only a result that would demote is worth a second look. */
        return suspicious(first) ? probeFrames(1200, 800) : first;
      })
      .then((confirmed) => {
        if (cancelled || !confirmed) return;

        const { fps, jankRatio } = confirmed;
        const live = readHints();
        const measured = { ...live, fps, jankRatio };

        setProfile((prev) => {
          /* A page view that ran light proves nothing about the heavy path:
             its smooth frames are the verdict working, not evidence the seven
             live previews would have been fine. So it neither clears the
             verdict nor promotes itself mid-view. */
          if (ranLight) {
            return { ...measured, tier: 'low', source: 'persisted' };
          }

          writePersistedLowPower(suspicious(confirmed));

          /* A throttle-shaped window (bad numbers, no real spike) is
             inconclusive. Keep the raw measurements on the profile, but do
             not let them decide the tier. */
          const nextTier = computeTier(
            showsRealJank(confirmed) ? measured : { ...measured, fps: null, jankRatio: null }
          );

          return {
            ...measured,
            tier: nextTier,
            source: nextTier === 'low' && prev.tier !== 'low' ? 'probe-demoted' : 'hints',
          };
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CapabilityContext.Provider value={profile}>{children}</CapabilityContext.Provider>
  );
}
