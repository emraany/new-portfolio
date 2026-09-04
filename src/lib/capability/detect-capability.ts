/**
 * Device capability detection.
 *
 * Combines what the browser will tell us about a device with what we can
 * measure about it, into one tier the Filmography grid uses to decide how many
 * of its seven live previews to run.
 *
 * No single hint works everywhere:
 *
 *   deviceMemory         Chromium only, rounded to {0.25, 0.5, 1, 2, 4, 8} GB
 *   hardwareConcurrency  Universal, but a weak machine can still report 8
 *   connection.*         Chromium only (effectiveType + saveData)
 *   prefers-reduced-motion  Universal — a preference, not a capability, but
 *                        always honored
 *
 * On static hints alone a laptop is close to unclassifiable: Safari reports
 * neither `deviceMemory` nor `connection`, and an underpowered MacBook Air
 * still reports 8 cores — so every signal that could demote it is simply
 * absent and it lands in `high` by default. `jankRatio` is what closes that
 * hole, because it is a measurement of the device actually missing frame
 * deadlines, which is the one thing no laptop can misreport.
 */

export type Tier = 'low' | 'medium' | 'high';

/** Where the current tier came from. Useful when reasoning about a session. */
export type CapabilitySource = 'hints' | 'probe-demoted' | 'persisted';

export interface CapabilityProfile {
  tier: Tier;
  deviceMemory: number | null;
  hardwareConcurrency: number | null;
  effectiveType: string | null;
  saveData: boolean;
  prefersReducedMotion: boolean;
  uaIsOldIos: boolean;
  fps: number | null;
  jankRatio: number | null;
  source: CapabilitySource;
}

export type Hints = Omit<CapabilityProfile, 'tier' | 'source'>;

/**
 * Share of long frames that means "this device is genuinely struggling".
 * A third of steady-state frames missing 30fps is already a visibly bad
 * experience; a capable machine that hit one busy moment still lands far
 * below this.
 */
export const JANK_LOW_THRESHOLD = 0.35;

/** Above this share of long frames, a device has not earned the top tier. */
const JANK_HIGH_CEILING = 0.15;

interface NetworkInformationLike {
  effectiveType?: string;
  saveData?: boolean;
}

interface NavigatorLike {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connection?: NetworkInformationLike;
  userAgent?: string;
}

/**
 * iOS generation heuristic, used only because Safari withholds `deviceMemory`.
 * iPhone 6/7/8-era hardware biases toward `low`; anything newer defaults to
 * `medium` and lets the probe decide.
 */
function isOldIos(ua: string): boolean {
  if (!/iPhone|iPad|iPod/.test(ua)) return false;
  const m = ua.match(/OS (\d+)_/);
  if (!m) return false;
  const major = parseInt(m[1], 10);
  return major > 0 && major < 13;
}

/** Read raw hints from `navigator`, with no interpretation. */
export function readHints(): Hints {
  if (typeof window === 'undefined') {
    return {
      deviceMemory: null,
      hardwareConcurrency: null,
      effectiveType: null,
      saveData: false,
      prefersReducedMotion: false,
      uaIsOldIos: false,
      fps: null,
      jankRatio: null,
    };
  }

  const nav = navigator as NavigatorLike;
  const conn = nav.connection;
  const ua = nav.userAgent ?? '';

  return {
    deviceMemory: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
    hardwareConcurrency:
      typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : null,
    effectiveType: conn?.effectiveType ?? null,
    saveData: conn?.saveData === true,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    uaIsOldIos: isOldIos(ua),
    fps: null,
    jankRatio: null,
  };
}

/**
 * Compute a tier from hints (plus probe results, once there are any).
 *
 *   low     any of: Save-Data, reduced motion, old iOS, memory ≤ 2GB,
 *           cores ≤ 2, 2g-class connection, measured fps < 30, or a
 *           measured jankRatio at or above the low threshold
 *   high    all of: memory ≥ 8GB or unknown, cores ≥ 8, 4g or unknown
 *           connection, fps > 55 or unmeasured, and a jank ratio below the
 *           high ceiling
 *   medium  everything else
 */
export function computeTier(hints: Hints): Tier {
  const {
    deviceMemory,
    hardwareConcurrency,
    effectiveType,
    saveData,
    prefersReducedMotion,
    uaIsOldIos,
    fps,
    jankRatio,
  } = hints;

  if (saveData) return 'low';
  if (prefersReducedMotion) return 'low';
  if (uaIsOldIos) return 'low';
  if (deviceMemory !== null && deviceMemory <= 2) return 'low';
  if (hardwareConcurrency !== null && hardwareConcurrency <= 2) return 'low';
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'low';
  if (fps !== null && fps < 30) return 'low';
  if (jankRatio !== null && jankRatio >= JANK_LOW_THRESHOLD) return 'low';

  const memoryHigh = deviceMemory === null || deviceMemory >= 8;
  const coresHigh = hardwareConcurrency !== null && hardwareConcurrency >= 8;
  const netHigh = effectiveType === null || effectiveType === '4g';
  const fpsHigh = fps === null || fps > 55;
  const smoothEnough = jankRatio === null || jankRatio < JANK_HIGH_CEILING;

  if (memoryHigh && coresHigh && netHigh && fpsHigh && smoothEnough) return 'high';

  return 'medium';
}
