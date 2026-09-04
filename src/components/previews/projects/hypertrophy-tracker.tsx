'use client';

import { useEffect, useRef } from 'react';
import { PreviewSurface } from '../surface';
import { useScript } from '../use-loop';
import type { PreviewProps } from '../registry';

/* ── Design tokens — from the app's own source ────────────────────────── *
 * components/Navbar.tsx  → gray-800→gray-900 bar, blue-400 active link
 *                          with underline, red-400 logout
 * pages/SessionForm.tsx  → "Log Training Session" heading, white card,
 *                          gray-50 exercise block, Reps/Weight inputs,
 *                          "+ Add Set", blue-600 "Save Session"
 * pages/Progress.tsx     → Chart.js line, borderColor "rgb(59,130,246)",
 *                          backgroundColor "rgba(59,130,246,0.3)"        */
const c = {
  page: '#f8fafc',
  navFrom: '#1f2937',
  navTo: '#111827',
  white: '#ffffff',
  gray50: '#f9fafb',
  border: '#e5e7eb',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  blue400: '#60a5fa',
  blue600: '#2563eb',
  red400: '#f87171',
  green600: '#16a34a',
  line: 'rgb(59, 130, 246)',
  fill: 'rgba(59, 130, 246, 0.3)',
} as const;

const FONT = 'var(--font-inter), system-ui, sans-serif';
const NAV = ['Home', 'New Session', 'Session Log', 'Progress', 'Profile'] as const;

/* Real muscle groups — SessionForm.tsx */
const EXERCISE = { muscle: 'Chest', name: 'Incline dumbbell press' };

/* The sets logged during the form scene */
const SETS = [
  { reps: '10', weight: '65' },
  { reps: '9', weight: '70' },
  { reps: '8', weight: '75' },
] as const;

/* Progressive-overload curve, chart-space 0..1 */
const CURVE = [0.06, 0.10, 0.22, 0.36, 0.44, 0.55, 0.68, 0.78, 0.87, 0.96];

const BOX = { x: 28, y: 39, w: 46, h: 16 };

/* ── The loop ─────────────────────────────────────────────────────────── *
 *  0  New Session — the exercise is picked
 *  1  New Session — set 1 logged
 *  2  New Session — set 2 logged
 *  3  New Session — set 3 logged
 *  4  New Session — "Session saved" confirmation
 *  5  Progress    — tab switches, the volume curve draws itself
 *  6  Progress    — hold on the finished chart, then back to the form
 * ─────────────────────────────────────────────────────────────────────── */
const SCRIPT = [1200, 900, 900, 900, 1200, 2100, 1800] as const;
const CHART_STEP = 5;
const DRAW_MS = SCRIPT[CHART_STEP];

function pathFor(vals: number[]) {
  return vals
    .map((v, i) => {
      const x = BOX.x + (i / (vals.length - 1)) * BOX.w;
      const y = BOX.y + BOX.h - v * BOX.h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

export default function HypertrophyTrackerPreview({ active }: PreviewProps) {
  /* `loop` counts completed passes — it re-keys the SVG so the chart's
     draw-on animation replays every round. */
  const [step, loop] = useScript(SCRIPT, active);

  const onProgress = step >= CHART_STEP;
  const setsLogged = Math.min(Math.max(step, 0), SETS.length);
  const saved = step === 4;

  /* The chart draws itself with SMIL (<animate> on stroke-dashoffset, plus
     an <animateMotion> tracker). SMIL is not CSS, so the pause rule on the
     surface cannot touch it — it has its own clock and its own controls,
     and without this the chart kept drawing while the card was parked
     offscreen and had finished by the time anyone looked at it. */
  const chartRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = chartRef.current;
    if (!svg) return;
    if (active) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [active, onProgress]);

  const d = pathFor(CURVE);
  const area = `${d} L${BOX.x + BOX.w},${BOX.y + BOX.h} L${BOX.x},${BOX.y + BOX.h} Z`;

  return (
    <PreviewSurface background={c.page} fontFamily={FONT} active={active}>
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          insetInline: 0,
          top: 0,
          height: '5.6cqw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.6cqw',
          background: `linear-gradient(to right, ${c.navFrom}, ${c.navTo})`,
        }}
      >
        <span style={{ fontSize: '2em', fontWeight: 800, color: c.white }}>
          Hypertrophy Tracker
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '1.5em' }}>
          {NAV.map((n) => {
            const on = onProgress ? n === 'Progress' : n === 'New Session';
            return (
              <span
                key={n}
                style={{
                  fontSize: '1.45em',
                  fontWeight: 500,
                  color: on ? c.blue400 : c.gray300,
                  borderBottom: on ? `0.14em solid ${c.blue400}` : 'none',
                  paddingBottom: '0.1em',
                  whiteSpace: 'nowrap',
                  transition: 'color 350ms ease',
                }}
              >
                {n}
              </span>
            );
          })}
          <span style={{ fontSize: '1.45em', fontWeight: 600, color: c.red400 }}>
            Logout
          </span>
        </span>
      </div>

      {/* ── Scene A — Log Training Session ─────────────────────────── */}
      {!onProgress && (
        <div
          key={`form-${loop}`}
          style={{
            position: 'absolute',
            left: '12cqw',
            right: '12cqw',
            top: '8.5cqw',
            bottom: '3cqw',
            background: c.white,
            borderRadius: '0.5em',
            border: `0.12em solid ${c.border}`,
            padding: '1.6cqw 2.2cqw',
            animation: 'ht-in 420ms ease-out both',
          }}
        >
          <div
            style={{
              fontSize: '2.3em',
              fontWeight: 700,
              color: c.gray800,
              textAlign: 'center',
            }}
          >
            Log Training Session
          </div>

          {/* Exercise block */}
          <div
            style={{
              marginTop: '1.4cqw',
              border: `0.12em solid ${c.border}`,
              borderRadius: '0.5em',
              background: c.gray50,
              padding: '1.2cqw 1.4cqw',
            }}
          >
            <div style={{ display: 'flex', gap: '1.2cqw' }}>
              <Field label="Muscle Group" value={EXERCISE.muscle} grow={0.8} />
              <Field label="Exercise" value={EXERCISE.name} grow={1.6} />
            </div>

            {/* Sets — each row lands one script step apart */}
            <div style={{ marginTop: '1cqw' }}>
              <div
                style={{
                  fontSize: '1.35em',
                  fontWeight: 500,
                  color: c.gray700,
                  marginBottom: '0.4cqw',
                }}
              >
                Sets
              </div>
              {SETS.map((set, i) => {
                const on = i < setsLogged;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '0.8cqw',
                      marginBottom: '0.55cqw',
                      opacity: on ? 1 : 0,
                      transform: on ? 'translateY(0)' : 'translateY(0.7cqw)',
                      transition: 'opacity 320ms ease, transform 320ms ease',
                    }}
                  >
                    <Input value={on ? set.reps : ''} placeholder="Reps" />
                    <Input value={on ? set.weight : ''} placeholder="Weight" />
                    <span
                      style={{
                        fontSize: '1.3em',
                        color: c.gray500,
                        alignSelf: 'center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      lb
                    </span>
                  </div>
                );
              })}
              <div style={{ fontSize: '1.35em', color: c.blue600, fontWeight: 500 }}>
                + Add Set
              </div>
            </div>
          </div>

          {/* Save */}
          <div
            style={{
              marginTop: '1.2cqw',
              borderRadius: '0.35em',
              background: saved ? c.green600 : c.blue600,
              color: c.white,
              textAlign: 'center',
              padding: '0.55cqw',
              fontSize: '1.5em',
              fontWeight: 500,
              transition: 'background-color 300ms ease',
            }}
          >
            {saved ? '✓ Session saved' : 'Save Session'}
          </div>
        </div>
      )}

      {/* ── Scene B — Progress chart ───────────────────────────────── */}
      {onProgress && (
        <div
          key={`chart-${loop}`}
          style={{
            position: 'absolute',
            inset: 0,
            animation: 'ht-in 420ms ease-out both',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '8cqw',
              insetInline: 0,
              textAlign: 'center',
              fontSize: '2.8em',
              fontWeight: 700,
              color: c.gray900,
            }}
          >
            Progress
          </div>

          <div
            style={{
              position: 'absolute',
              top: '15cqw',
              insetInline: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: '0.6em',
            }}
          >
            {['By Exercise', 'By Muscle Group'].map((t, i) => (
              <span
                key={t}
                style={{
                  fontSize: '1.45em',
                  padding: '0.3em 0.9em',
                  borderRadius: '0.4em',
                  background: i === 0 ? c.blue600 : c.white,
                  color: i === 0 ? c.white : c.gray700,
                  border: `0.1em solid ${i === 0 ? c.blue600 : c.gray300}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <div
            style={{
              position: 'absolute',
              top: '21cqw',
              insetInline: 0,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Select label={EXERCISE.name} width="30cqw" />
          </div>

          {/* Chart card */}
          <div
            style={{
              position: 'absolute',
              left: '24cqw',
              right: '24cqw',
              top: '27cqw',
              bottom: '4cqw',
              borderRadius: '0.4em',
              border: `0.12em solid ${c.border}`,
              background: c.white,
            }}
          />

          <svg
            ref={chartRef}
            viewBox="0 0 100 62.5"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            <rect x={BOX.x + 7} y="30.6" width="1.6" height="1.6" fill={c.line} />
            <text x={BOX.x + 9.4} y="31.9" fontSize="1.45" fill={c.gray700} fontFamily={FONT}>
              {EXERCISE.name} Total Volume
            </text>

            <g stroke={c.border} strokeWidth="0.1">
              {[0, 0.25, 0.5, 0.75, 1].map((k) => (
                <line
                  key={k}
                  x1={BOX.x}
                  y1={BOX.y + BOX.h * k}
                  x2={BOX.x + BOX.w}
                  y2={BOX.y + BOX.h * k}
                />
              ))}
            </g>
            <g stroke={c.gray300} strokeWidth="0.12">
              <line x1={BOX.x} y1={BOX.y} x2={BOX.x} y2={BOX.y + BOX.h} />
              <line x1={BOX.x} y1={BOX.y + BOX.h} x2={BOX.x + BOX.w} y2={BOX.y + BOX.h} />
            </g>

            <path d={area} fill={c.fill} opacity="0">
              <animate
                attributeName="opacity"
                from="0"
                to="1"
                dur="600ms"
                begin={`${DRAW_MS - 500}ms`}
                fill="freeze"
              />
            </path>
            <path
              d={d}
              fill="none"
              stroke={c.line}
              strokeWidth="0.42"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset="1"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="1"
                to="0"
                dur={`${DRAW_MS}ms`}
                fill="freeze"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
                keyTimes="0;1"
              />
            </path>
            <circle r="0.55" fill={c.line} opacity="0">
              <animate
                attributeName="opacity"
                from="0"
                to="1"
                dur="250ms"
                begin={`${DRAW_MS - 250}ms`}
                fill="freeze"
              />
              <animateMotion dur={`${DRAW_MS}ms`} fill="freeze" path={d} />
            </circle>
          </svg>
        </div>
      )}

      <style>{`
        @keyframes ht-in {
          from { opacity: 0; transform: translateY(1cqw) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </PreviewSurface>
  );
}

function Field({ label, value, grow }: { label: string; value: string; grow: number }) {
  return (
    <span style={{ flex: grow, minWidth: 0 }}>
      <span
        style={{
          display: 'block',
          fontSize: '1.25em',
          fontWeight: 500,
          color: c.gray700,
          marginBottom: '0.25cqw',
        }}
      >
        {label}
      </span>
      <Select label={value} width="100%" />
    </span>
  );
}

function Input({ value, placeholder }: { value: string; placeholder: string }) {
  return (
    <span
      style={{
        flex: 1,
        fontSize: '1.35em',
        padding: '0.25em 0.6em',
        borderRadius: '0.35em',
        border: `0.1em solid ${c.gray300}`,
        background: c.white,
        color: value ? c.gray900 : c.gray500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {value || placeholder}
    </span>
  );
}

function Select({ label, width }: { label: string; width: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width,
        fontSize: '1.35em',
        padding: '0.28em 0.6em',
        borderRadius: '0.35em',
        border: `0.1em solid ${c.gray300}`,
        background: c.white,
        color: c.gray700,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      <span style={{ color: c.gray500, flexShrink: 0, marginLeft: '0.4em' }}>▾</span>
    </span>
  );
}
