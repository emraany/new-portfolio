'use client';

import { PreviewSurface } from '../surface';
import { useScript } from '../use-loop';
import type { PreviewProps } from '../registry';

/* ── Assets and mechanics — from the game's own source ────────────────── *
 * caketopia/assets/imgs/{cake,cake2,cake3}.png — the real sprites, copied
 *   into /public/previews/caketopia.
 * caketopia/Cake.java   → `speed = -8`; the active layer slides and
 *   reverses at the world edges until `stop()` is called.
 * caketopia/MyWorld.java → 700×1000 world; layers stack upward from the
 *   floor and each new layer is trimmed to its overlap with the one
 *   below (`trimToOverlap`), so the tower narrows as it climbs.
 * Sky colour sampled from assets/imgs/sky1.png → rgb(124,168,220).
 *
 * The bird is deliberately omitted: in the game it knocks layers off, and
 * a card-sized loop reads better as an uninterrupted build.             */
const SKY_TOP = '#9dc4e8';
const SKY_BOTTOM = '#7ca8dc';

const CAKES = [
  '/previews/caketopia/cake.png',
  '/previews/caketopia/cake2.png',
  '/previews/caketopia/cake3.png',
] as const;

/* Geometry in cqw (1cqw = 1% of card width), measured up from the floor */
const GROUND = 3;
const BASE_W = 46;
const LAYER_H = BASE_W / (395 / 24); // one sprite tall at base width
const TRIM = 1.9;                    // width lost per course
const MIN_W = 20;                    // MyWorld's MIN_WIDTH guard
const MAX_LAYERS = 7;
const SLIDE_Y = 47;                  // height the active layer slides at

/* Deterministic landing offsets — no Math.random at render, so the
   preview is hydration-safe. Alternating misses read as a real stack. */
const OFFSETS = [0, -2.4, 1.9, -1.4, 2.2, -1.9, 1.5];

const SWEEP_MS = 620;   // one leg of the crane's back-and-forth
const AIM_MS = 420;     // the crane settling over the drop point
const DROP_MS = 380;
const SETTLE_MS = 220;
const HOLD_MS = 1600;   // admire the finished tower
const CLEAR_MS = 900;   // the tower drops away before the next round

/** How far either side of centre the crane carries the cake, in cqw. */
const SWEEP = 13;

type Phase = 'sweepR' | 'sweepL' | 'aim' | 'drop' | 'settle' | 'hold' | 'clear';

const layerWidth = (i: number) => Math.max(MIN_W, BASE_W - i * TRIM);

/* ── The round, flattened into scenes ─────────────────────────────────── *
 * The slide used to be a CSS keyframe on `margin-left` that was removed
 * the instant the cake dropped — and removing a running animation snaps
 * its property back, so every drop teleported the cake to centre and it
 * landed nowhere near the layer under it.
 *
 * Now the crane's whole path is scenes: sweep right, sweep left, settle
 * over the landing spot, drop. Each leg is a plain `left` transition on
 * an element that stays mounted for the entire round, so there is no
 * keyframe to remove and the cake lands exactly where it was aimed. */
type Scene = { phase: Phase; layers: number };

const { SCENES, DURATIONS } = (() => {
  const SCENES: Scene[] = [];
  const DURATIONS: number[] = [];
  const push = (phase: Phase, layers: number, ms: number) => {
    SCENES.push({ phase, layers });
    DURATIONS.push(ms);
  };
  for (let i = 0; i < MAX_LAYERS; i++) {
    push('sweepR', i, SWEEP_MS);
    push('sweepL', i, SWEEP_MS);
    push('aim', i, AIM_MS);
    push('drop', i, DROP_MS);
    push('settle', i, SETTLE_MS);
  }
  push('hold', MAX_LAYERS, HOLD_MS);
  push('clear', MAX_LAYERS, CLEAR_MS);
  return { SCENES, DURATIONS };
})();

export default function CaketopiaPreview({ active }: PreviewProps) {
  const [step] = useScript(DURATIONS, active);
  const { phase, layers } = SCENES[step];

  const clearing = phase === 'clear';
  const dropped = phase === 'drop' || phase === 'settle';
  const sweeping = phase === 'sweepR' || phase === 'sweepL';
  const activeWidth = layerWidth(layers);
  const activeBottom = dropped ? GROUND + LAYER_H * layers : SLIDE_Y;
  /* Where the crane is holding the cake this scene, as the element's
     `left` — the aim/drop scenes share the landing spot, so the drop is
     purely vertical. */
  const activeCentre =
    phase === 'sweepR'
      ? SWEEP
      : phase === 'sweepL'
        ? -SWEEP
        : OFFSETS[Math.min(layers, OFFSETS.length - 1)];
  /* No active layer once the tower is topped out or being cleared — it
     fades rather than unmounting, so the next round's sweep starts from
     a real position instead of popping into existence. */
  const showActive = !clearing && phase !== 'hold';

  return (
    <PreviewSurface
      background={`linear-gradient(${SKY_TOP}, ${SKY_BOTTOM})`}
      fontFamily="var(--font-inter), system-ui, sans-serif"
    >
      {/* ── Drifting clouds ────────────────────────────────────────── */}
      {[
        { top: 5, size: 26, dur: 52, delay: 0, o: 0.42 },
        { top: 20, size: 18, dur: 68, delay: -22, o: 0.34 },
        { top: 34, size: 32, dur: 86, delay: -47, o: 0.28 },
      ].map((cl, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${cl.top}cqw`,
            left: 0,
            width: `${cl.size}cqw`,
            height: `${cl.size * 0.42}cqw`,
            borderRadius: '999em',
            background: '#ffffff',
            filter: 'blur(0.7em)',
            opacity: cl.o,
            animation: `cake-cloud ${cl.dur}s linear ${cl.delay}s infinite`,
            animationPlayState: active ? 'running' : 'paused',
          }}
        />
      ))}

      {/* ── The tower ──────────────────────────────────────────────── */}
      {Array.from({ length: Math.min(layers, MAX_LAYERS) }, (_, i) => {
        const w = layerWidth(i);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: `${GROUND + LAYER_H * i}cqw`,
              left: `${50 + OFFSETS[i] - w / 2}cqw`,
              width: `${w}cqw`,
              height: `${LAYER_H}cqw`,
              opacity: clearing ? 0 : 1,
              transform: clearing ? 'translateY(6cqw)' : 'none',
              /* The whole tower drops away together, bottom-up */
              transition: clearing
                ? `opacity ${CLEAR_MS}ms ease ${(MAX_LAYERS - i) * 22}ms, ` +
                  `transform ${CLEAR_MS}ms ease-in ${(MAX_LAYERS - i) * 22}ms`
                : `opacity ${CLEAR_MS}ms ease, transform ${CLEAR_MS}ms ease-in`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CAKES[i % CAKES.length]}
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>
        );
      })}

      {/* ── Active layer — the crane sweeps, aims, then drops ──────── */}
      <div
        style={{
          position: 'absolute',
          bottom: `${activeBottom}cqw`,
          left: `${50 + activeCentre - activeWidth / 2}cqw`,
          width: `${activeWidth}cqw`,
          height: `${LAYER_H}cqw`,
          opacity: showActive ? 1 : 0,
          transition: [
            dropped
              ? `bottom ${DROP_MS}ms cubic-bezier(0.5, 0, 0.9, 0.4)`
              : `bottom ${SWEEP_MS}ms ease-out`,
            sweeping
              ? `left ${SWEEP_MS}ms ease-in-out`
              : phase === 'aim'
                ? `left ${AIM_MS}ms ease-out`
                : 'left 0ms',
            `opacity ${CLEAR_MS}ms ease`,
            `transform 140ms ease-out`,
          ].join(', '),
          /* Squash on impact, then recover */
          transform: phase === 'settle' ? 'scaleY(0.7)' : 'scaleY(1)',
          transformOrigin: 'bottom center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CAKES[layers % CAKES.length]}
          alt=""
          draggable={false}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {/* ── Height readout — MyWorld's Scoreboard ──────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: '4cqw',
          top: '4cqw',
          fontSize: '1.7em',
          fontWeight: 700,
          color: '#20456e',
          opacity: 0.75,
        }}
      >
        HEIGHT {String(Math.min(layers, MAX_LAYERS)).padStart(2, '0')}
      </div>

      {/* ── DROP button ────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          right: '4cqw',
          bottom: '3.4cqw',
          padding: '1.1em 2.6em',
          background: '#f2c230',
          border: '0.22em solid #b98f13',
          color: '#3a2c05',
          fontSize: '1.9em',
          fontWeight: 700,
          letterSpacing: '0.06em',
          /* Presses in on the beat the layer lands */
          transform: phase === 'drop' ? 'translateY(0.35em)' : 'translateY(0)',
          transition: 'transform 160ms ease',
        }}
      >
        DROP
      </div>

      <style>{`
        @keyframes cake-cloud {
          from { transform: translateX(-40cqw) }
          to   { transform: translateX(140cqw) }
        }
      `}</style>
    </PreviewSurface>
  );
}
