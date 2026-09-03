'use client';

import { useEffect, useRef, useState } from 'react';
import { PreviewSurface } from '../surface';
import { useLoopClock } from '../use-loop';
import type { PreviewProps } from '../registry';

/* ── Design tokens — verbatim from the app's own design system ────────── *
 * conflict-coordinate/frontend/src/styles/tokens.ts                       */
const colors = {
  bg: '#2e3338',
  bgRaised: '#3a4048',
  bgSunken: '#252930',
  text: '#e8dcc4',
  textMuted: '#a8a294',
  textDim: '#7c7a6e',
  rule: '#525862',
  ruleStrong: '#6b727c',
  olive: '#6b7354',
  oliveLight: '#8a9070',
  active: '#a64a3a',
  frozen: '#a8a294',
} as const;

/* Severity ramp for globe markers — tokens.ts `dotRamp` */
const dotRamp = ['#f2d492', '#f5a742', '#ef7326', '#e8432a', '#ff1f1f'] as const;

const fonts = {
  mono: 'var(--font-plex-mono), "IBM Plex Mono", Menlo, monospace',
  stamp: 'var(--font-special-elite), var(--font-plex-mono), monospace',
} as const;

/* ── Real crises — backend/app/seed_data.json ─────────────────────────── *
 * Coordinates, statuses and conflict types are the fixture set the app
 * actually ingests, so the globe's markers sit where the real ones do.    */
const CRISES = [
  { country: 'Ukraine', region: 'Eastern Europe', type: 'interstate', status: 'active', lat: 48.38, lng: 37.79, sev: 4 },
  { country: 'Sudan', region: 'Africa — Sahel', type: 'civil_war', status: 'active', lat: 15.5, lng: 32.56, sev: 4 },
  { country: 'Myanmar', region: 'Southeast Asia', type: 'civil_war', status: 'active', lat: 19.75, lng: 96.1, sev: 3 },
  { country: 'Palestine', region: 'Middle East', type: 'asymmetric', status: 'active', lat: 31.5, lng: 34.47, sev: 4 },
  { country: 'Haiti', region: 'Caribbean', type: 'gang_violence', status: 'active', lat: 18.54, lng: -72.34, sev: 2 },
  { country: 'DR Congo', region: 'Central Africa', type: 'insurgency', status: 'active', lat: -1.68, lng: 29.22, sev: 3 },
  { country: 'Yemen', region: 'Middle East', type: 'civil_war', status: 'active', lat: 15.35, lng: 44.21, sev: 3 },
  { country: 'Syria', region: 'Middle East', type: 'civil_war', status: 'frozen', lat: 33.51, lng: 36.29, sev: 2 },
  { country: 'Somalia', region: 'Horn of Africa', type: 'insurgency', status: 'active', lat: 2.05, lng: 45.32, sev: 3 },
  { country: 'Ethiopia', region: 'Horn of Africa', type: 'insurgency', status: 'active', lat: 11.6, lng: 37.39, sev: 2 },
  { country: 'Mali', region: 'Sahel', type: 'insurgency', status: 'active', lat: 12.65, lng: -8.0, sev: 3 },
  { country: 'Nigeria', region: 'Lake Chad Basin', type: 'insurgency', status: 'active', lat: 11.85, lng: 13.16, sev: 3 },
  { country: 'Mozambique', region: 'Southern Africa', type: 'insurgency', status: 'active', lat: -12.97, lng: 40.51, sev: 2 },
  { country: 'Colombia', region: 'South America', type: 'insurgency', status: 'active', lat: 4.71, lng: -74.07, sev: 2 },
  { country: 'Mexico', region: 'North America', type: 'gang_violence', status: 'active', lat: 19.43, lng: -99.13, sev: 3 },
  { country: 'Azerbaijan', region: 'South Caucasus', type: 'interstate', status: 'frozen', lat: 39.82, lng: 46.77, sev: 1 },
] as const;

/* tokens.ts `statusColor` */
const statusColor = (s: string) => (s === 'active' ? colors.active : colors.frozen);

/* Globe geometry, in em (1em = 1% of card width — see PreviewSurface) */
const CX = 31;
const CY = 33;
const R = 21;
const DEG = Math.PI / 180;

/* ── Camera ───────────────────────────────────────────────────────────── *
 * The app's autoRotate spins the globe continuously. A constant spin is
 * wrong for a card: the fixture set spans longitudes −99°…+96°, so a full
 * revolution parks ~165° of empty Pacific in front of the viewer for
 * nearly half the loop, with every marker stranded on the limb.
 *
 * Instead the camera sweeps back and forth across the populated band on a
 * cosine, which is seamless (it returns to its own start), eases at the
 * turns, and always keeps live markers on the visible hemisphere.        */
const SWEEP_PERIOD = 34;   // seconds for one there-and-back sweep
const SWEEP_AMPLITUDE = 96; // degrees either side of the prime meridian
/** How long each crisis holds the dossier panel. */
const DOSSIER_MS = 3600;
/** Crises to avoid re-selecting, so the panel cycles rather than sticks. */
const RECENT_MEMORY = 6;

/** z of a crisis's unit vector at rotation `rot`: 1 is dead-centre, 0 the limb. */
function facingAt(i: number, rot: number) {
  const cr = CRISES[i];
  return Math.cos(cr.lat * DEG) * Math.cos((cr.lng + rot) * DEG);
}

/** Centre-most crisis at a given rotation, skipping `exclude`. */
function mostCentred(rot: number, exclude: readonly number[]) {
  let best = 0;
  let bestFacing = -Infinity;
  for (let i = 0; i < CRISES.length; i++) {
    if (exclude.includes(i)) continue;
    const f = facingAt(i, rot);
    if (f > bestFacing) {
      bestFacing = f;
      best = i;
    }
  }
  return { best, bestFacing };
}

/* The sweep starts at its extreme (cos 0 = 1), so the opening frame looks
   at the Americas — seed the dossier with whatever is centred there rather
   than defaulting to index 0, which sits on the far side at t=0 and would
   leave the ring dark for the first hold. */
const INITIAL_ROT = SWEEP_AMPLITUDE;
const INITIAL_SELECTED = mostCentred(INITIAL_ROT, []).best;

export default function ConflictCoordinatePreview({ active }: PreviewProps) {
  const [selected, setSelected] = useState(INITIAL_SELECTED);
  const selectedRef = useRef(INITIAL_SELECTED);
  const rotRef = useRef(INITIAL_ROT);
  const recentRef = useRef<number[]>([INITIAL_SELECTED]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const ringRef = useRef<SVGCircleElement>(null);

  /* Orthographic projection, driven straight to the DOM.
     16 markers per frame is far cheaper than a React render, so the
     rotation never touches the reconciler.

     The clock is the shared pause-aware one: its origin lives across
     `active` flipping, so scrolling the card away and back resumes the
     sweep where it left off instead of snapping the globe home. */
  useLoopClock(active, (elapsed) => {
    const t = (elapsed / 1000 / SWEEP_PERIOD) % 1;
    const rot = SWEEP_AMPLITUDE * Math.cos(t * 2 * Math.PI);
    rotRef.current = rot;

    let ringDrawn = false;

    for (let i = 0; i < CRISES.length; i++) {
      const el = dotRefs.current[i];
      if (!el) continue;
      const cr = CRISES[i];
      const lam = (cr.lng + rot) * DEG;
      const phi = cr.lat * DEG;
      const z = Math.cos(phi) * Math.cos(lam);
      if (z <= 0) {
        el.style.opacity = '0';
        continue;
      }
      const x = CX + R * Math.cos(phi) * Math.sin(lam);
      const y = CY - R * Math.sin(phi);
      el.setAttribute('cx', String(x));
      el.setAttribute('cy', String(y));
      /* Fade markers as they approach the limb, like the real globe */
      el.style.opacity = String(Math.min(1, z * 2.6));

      if (i === selectedRef.current && ringRef.current) {
        ringRef.current.setAttribute('cx', String(x));
        ringRef.current.setAttribute('cy', String(y));
        ringRef.current.style.opacity = String(Math.min(1, z * 2.6));
        ringDrawn = true;
      }
    }

    /* Never leave the ring stranded at a stale position */
    if (!ringDrawn && ringRef.current) ringRef.current.style.opacity = '0';
  });

  /* The dossier walks the fixture set, always selecting the crisis nearest
     the centre of the visible hemisphere among those it hasn't shown
     lately. Merely "front-facing" wasn't enough — a marker near the limb
     rotates off it partway through its hold and takes the pulsing ring
     with it. Centre-most selection keeps the ring clearly visible for the
     whole time its dossier is up. */
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      /* Chosen out here, never inside the setState updater: React runs
         updaters more than once, and a `recent.push` in there filled the
         memory list with duplicates until every crisis looked recently
         seen and the dossier stuck on one country. */
      const rot = rotRef.current;
      const recent = recentRef.current;
      const centred = mostCentred(rot, recent);
      /* Everything unseen is on the far side — reach back into the
         recent list rather than hold a hidden marker */
      const best =
        centred.bestFacing < 0.4 ? mostCentred(rot, []).best : centred.best;
      recent.push(best);
      if (recent.length > RECENT_MEMORY) recent.shift();
      setSelected(best);
    }, DOSSIER_MS);
    return () => clearInterval(id);
  }, [active]);

  /* Keep the rAF loop's view of the selection current without
     restarting it */
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const c = CRISES[selected];
  const sc = statusColor(c.status);

  return (
    <PreviewSurface background={colors.bg} fontFamily={fonts.mono}>
      {/* ── Header bar ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          insetInline: 0,
          top: 0,
          height: '6.4em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.6em',
          borderBottom: `0.26em solid ${colors.rule}`,
          background: colors.bgSunken,
        }}
      >
        <span
          style={{
            fontFamily: fonts.stamp,
            fontSize: '2.15em',
            letterSpacing: '0.12em',
            color: colors.text,
            whiteSpace: 'nowrap',
          }}
        >
          THE CONFLICT COORDINATE
        </span>
        <span
          style={{
            fontSize: '1.7em',
            letterSpacing: '0.08em',
            color: colors.textDim,
            whiteSpace: 'nowrap',
          }}
        >
          [01] GLOBE&nbsp;&nbsp;[02] INDEX&nbsp;&nbsp;[03] ACTIVITY
        </span>
      </div>

      {/* ── Globe ──────────────────────────────────────────────────── */}
      <svg
        viewBox="0 0 100 62.5"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <radialGradient id="cc-sphere" cx="38%" cy="32%">
            <stop offset="0%" stopColor="#4a5560" />
            <stop offset="65%" stopColor="#333c44" />
            <stop offset="100%" stopColor="#232a31" />
          </radialGradient>
          <radialGradient id="cc-atmo" cx="50%" cy="50%">
            <stop offset="78%" stopColor={colors.olive} stopOpacity="0" />
            <stop offset="100%" stopColor={colors.olive} stopOpacity="0.5" />
          </radialGradient>
        </defs>

        {/* Atmosphere — Globe.tsx `atmosphereColor={colors.olive}` */}
        <circle cx={CX} cy={CY} r={R * 1.14} fill="url(#cc-atmo)" />
        <circle cx={CX} cy={CY} r={R} fill="url(#cc-sphere)" />

        {/* Graticule */}
        <g stroke={colors.ruleStrong} strokeOpacity="0.28" strokeWidth="0.14" fill="none">
          <circle cx={CX} cy={CY} r={R} />
          {[-14, -7, 0, 7, 14].map((o) => (
            <line key={o} x1={CX - R} y1={CY + o} x2={CX + R} y2={CY + o} />
          ))}
          {[0.35, 0.7, 1].map((k) => (
            <ellipse key={k} cx={CX} cy={CY} rx={R * k} ry={R} />
          ))}
        </g>

        {/* Selection ring — the app's ringColor on the focused crisis */}
        <circle
          ref={ringRef}
          r="1.9"
          fill="none"
          stroke={dotRamp[c.sev]}
          strokeWidth="0.24"
          style={{ transition: 'stroke 400ms' }}
        >
          <animate
            attributeName="r"
            values="1.2;2.9;1.2"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Event markers, coloured by the app's severity ramp */}
        {CRISES.map((crisis, i) => (
          <circle
            key={crisis.country}
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            r={i === selected ? 0.72 : 0.52}
            fill={dotRamp[crisis.sev]}
            style={{ opacity: 0 }}
          />
        ))}
      </svg>

      {/* ── Dossier panel ──────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: '55.5cqw',
          top: '9.6cqw',
          width: '41em',
          padding: '2em 2.2em',
          background: colors.bgRaised,
          border: `0.22em solid ${colors.rule}`,
          boxShadow: '0 1.2em 3em rgba(0,0,0,0.55)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5em',
          }}
        >
          <span style={{ fontSize: '2.3em', color: colors.text, letterSpacing: '0.03em' }}>
            {c.country}
          </span>
          {/* StatusChip.tsx */}
          <span
            style={{
              fontFamily: fonts.stamp,
              fontSize: '1.75em',
              letterSpacing: '0.2em',
              color: sc,
              border: `0.08em solid ${sc}`,
              padding: '0.15em 0.55em',
              whiteSpace: 'nowrap',
            }}
          >
            [ {c.status.toUpperCase()} ]
          </span>
        </div>

        {(
          [
            ['REGION', c.region],
            ['TYPE', c.type],
            ['COORDINATES', `${c.lat.toFixed(2)}, ${c.lng.toFixed(2)}`],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            style={{
              display: 'flex',
              gap: '1em',
              fontSize: '1.85em',
              lineHeight: 1.75,
            }}
          >
            <span style={{ color: colors.textDim, width: '7.6em', flexShrink: 0 }}>
              {label}
            </span>
            <span style={{ color: colors.textMuted, whiteSpace: 'nowrap' }}>{value}</span>
          </div>
        ))}

        <div
          style={{
            marginTop: '1.5em',
            paddingTop: '1.2em',
            borderTop: `0.16em solid ${colors.rule}`,
            fontSize: '1.5em',
            color: colors.oliveLight,
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
          }}
        >
          SOURCED · ACLED / GDELT / UCDP
        </div>
      </div>

      {/* ── Footer status bar ──────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          insetInline: 0,
          bottom: 0,
          height: '4.4em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.6em',
          borderTop: `0.2em solid ${colors.rule}`,
          background: colors.bgSunken,
          fontSize: '1.6em',
          letterSpacing: '0.08em',
          color: colors.textDim,
          whiteSpace: 'nowrap',
        }}
      >
        <span>
          <span style={{ color: colors.active }}>●</span> {CRISES.length} TRACKED
        </span>
        <span>ALL CLAIMS ATTRIBUTED TO A CITED SOURCE</span>
      </div>
    </PreviewSurface>
  );
}
