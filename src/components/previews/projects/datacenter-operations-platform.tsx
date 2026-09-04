'use client';

import { useRef } from 'react';
import { PreviewSurface } from '../surface';
import { useScript } from '../use-loop';
import type { PreviewProps } from '../registry';

/* ── Design tokens — from the app's own source ────────────────────────── *
 * hackutd2025/app/globals.css → body background #01040b
 * components/dashboard/*.tsx  → white/10 hairlines, cyan-300 eyebrows,
 *                               rounded-3xl cards, radial blue wash
 * components/dashboard/ticket-board.tsx → severity chip colours
 * components/layout/floating-island-nav.tsx → the pill nav              */
const c = {
  bg: '#01040b',
  panel: 'rgba(255,255,255,0.05)',
  panelTop: 'rgba(255,255,255,0.10)',
  hairline: 'rgba(255,255,255,0.10)',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.60)',
  faint: 'rgba(255,255,255,0.42)',
  cyan: '#67e8f9',
  sky: '#38bdf8',
  emerald: '#6ee7b7',
} as const;

const SEVERITY = {
  critical: { fg: '#fecdd3', bg: 'rgba(244,63,94,0.12)', br: 'rgba(244,63,94,0.35)' },
  high: { fg: '#fde68a', bg: 'rgba(245,158,11,0.12)', br: 'rgba(245,158,11,0.35)' },
  medium: { fg: '#a7f3d0', bg: 'rgba(16,185,129,0.12)', br: 'rgba(16,185,129,0.35)' },
  standard: { fg: '#a7f3d0', bg: 'rgba(16,185,129,0.12)', br: 'rgba(16,185,129,0.35)' },
} as const;

const NAV = ['Overview', 'Tickets'] as const;

/* ── Real metrics — app/page.tsx `metrics` ────────────────────────────── */
const METRICS: { label: string; to: number; suffix: string; trend: string; decimals?: number }[] = [
  { label: 'CLUSTER UTIL', to: 82, suffix: '%', trend: '+6%' },
  { label: 'WORK ORDERS', to: 27, suffix: '', trend: '−3 open' },
  { label: 'POWER', to: 9.8, suffix: 'MW', trend: 'safe', decimals: 1 },
  { label: 'QUEUE DEPTH', to: 412, suffix: '', trend: 'syncing' },
];

/* ── Real work orders — lib/tickets/tickets.json ──────────────────────── */
const TICKETS = [
  { id: 'WO-9823', title: 'Replace PSU on rack P44', severity: 'critical', status: 'Crew en route' },
  { id: 'WO-9830', title: 'Swap QSFP on spine 6', severity: 'critical', status: 'On floor' },
  { id: 'WO-9824', title: 'Provision 10-node pod for SentiAI', severity: 'high', status: 'Queued' },
  { id: 'SIG-442', title: 'Node pool 7 intermittent resets', severity: 'high', status: 'Signal analysing' },
  { id: 'WO-9831', title: 'Verify cabling bundle 44B', severity: 'medium', status: 'Waiting clearance' },
] as const;

/* ── The loop (~8s) ───────────────────────────────────────────────────── *
 *  0  Overview  — the four KPI tiles count up from zero
 *  1  Overview  — hold, fully counted
 *  2  Tickets   — work orders stream into the table one row at a time
 *  3  Tickets   — the AI triage bundles two rows, then back to Overview
 * ─────────────────────────────────────────────────────────────────────── */
const SCRIPT = [1900, 1500, 2500, 2200] as const;
const PAGE_OF_STEP = [0, 0, 1, 1] as const;

/* Where each scene begins inside one pass of the loop. */
const CYCLE_MS = SCRIPT.reduce((a, b) => a + b, 0);

export default function DatacenterOpsPreview({ active }: PreviewProps) {
  const countRefs = useRef<(HTMLSpanElement | null)[]>([]);

  /* One clock for both the scene script and the KPI count-up.
     This preview used to run two — a 20fps scene clock and a separate
     60fps counter loop — which is two independent rAF chains for a single
     card, and two clocks that can disagree about what time it is. The
     shared clock runs at the counter's rate, since scene changes are
     ms-scale and cost nothing to notice early.

     The digits are written straight to their DOM nodes, never through
     React state: a setState per frame re-rendered this whole card sixty
     times a second while the numbers climbed, which is what made the
     count-up stutter next to the CSS transitions around it. One clock in,
     styles out, reconciler untouched. */
  const [step] = useScript(SCRIPT, active, {
    fps: 60,
    onFrame: (elapsed) => {
      const t = Math.min(1, (elapsed % CYCLE_MS) / SCRIPT[0]);
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic — settles, never snaps
      for (let i = 0; i < METRICS.length; i++) {
        const el = countRefs.current[i];
        if (!el) continue;
        const m = METRICS[i];
        el.textContent = (m.to * e).toFixed(m.decimals ?? 0) + m.suffix;
      }
    },
  });
  const page = PAGE_OF_STEP[step];

  /* Rows revealed on the Tickets page: streaming in, then all present */
  const rowsShown = step === 2 ? 3 : step >= 3 ? TICKETS.length : 0;
  const bundled = step === 3;
  return (
    <PreviewSurface
      background={c.bg}
      fontFamily="var(--font-inter), system-ui, sans-serif"
      active={active}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% -10%, rgba(59,130,246,0.30), rgba(15,23,42,0) 62%)',
        }}
      />

      {/* ── Floating island nav — the active pill slides between pages ── */}
      <div
        style={{
          position: 'absolute',
          top: '3.4cqw',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.35em',
          padding: '0.5em',
          borderRadius: '999em',
          border: `0.16em solid ${c.hairline}`,
          background: 'rgba(255,255,255,0.06)',
          fontSize: '1.9em',
        }}
      >
        {NAV.map((t, i) => (
          <span
            key={t}
            style={{
              padding: '0.3em 1em',
              borderRadius: '999em',
              background: i === page ? c.sky : 'transparent',
              color: i === page ? '#01040b' : c.faint,
              fontWeight: i === page ? 600 : 400,
              whiteSpace: 'nowrap',
              transition: 'background-color 380ms ease, color 380ms ease',
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* ── Page title ─────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: '11.5cqw', left: '5cqw' }}>
        <div
          style={{
            fontSize: '1.35em',
            letterSpacing: '0.25em',
            color: c.cyan,
            opacity: 0.85,
            fontWeight: 600,
          }}
        >
          HYPERION COMPUTE
        </div>
        <div
          key={page}
          style={{
            fontSize: '3em',
            fontWeight: 600,
            color: c.text,
            marginTop: '0.1em',
            animation: 'dcd-title 420ms ease-out both',
          }}
        >
          {page === 0 ? 'Work Orders · HPC Platform Ops' : 'Work order intelligence'}
        </div>
      </div>

      {/* ── Page body ──────────────────────────────────────────────── */}
      <div
        key={`page-${page}`}
        style={{
          position: 'absolute',
          left: '5cqw',
          right: '5cqw',
          top: '21cqw',
          bottom: '3cqw',
          animation: 'dcd-page 460ms ease-out both',
        }}
      >
        {/* ── Overview: the KPI grid ─────────────────────────────── */}
        {page === 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: '1.8cqw',
              height: '100%',
            }}
          >
            {METRICS.map((m, i) => (
              <div
                key={m.label}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '1.6em',
                  border: `0.16em solid ${c.hairline}`,
                  background: `linear-gradient(to bottom, ${c.panelTop}, ${c.panel})`,
                  padding: '1.4em 1.5em',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'radial-gradient(circle at top, rgba(59,130,246,0.35), rgba(15,23,42,0))',
                  }}
                />
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      fontSize: '1.3em',
                      letterSpacing: '0.22em',
                      color: 'rgba(255,255,255,0.5)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.5em',
                      marginTop: '0.2em',
                    }}
                  >
                    <span
                      ref={(el) => {
                        countRefs.current[i] = el;
                      }}
                      style={{
                        fontSize: '3.6em',
                        fontWeight: 600,
                        color: c.text,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {`${(0).toFixed(m.decimals ?? 0)}${m.suffix}`}
                    </span>
                    <span
                      style={{
                        fontSize: '1.3em',
                        color: c.emerald,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {m.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tickets: rows stream in, then two bundle together ──── */}
        {page === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9cqw' }}>
            {TICKETS.map((t, i) => {
              const s = SEVERITY[t.severity as keyof typeof SEVERITY];
              const shown = i < rowsShown;
              /* The two SentiAI/node-pool rows are the pair the app's
                 cosine-similarity bundler groups */
              const inBundle = bundled && (i === 2 || i === 3);
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.9em',
                    borderRadius: '0.9em',
                    border: `0.14em solid ${inBundle ? 'rgba(103,232,249,0.55)' : c.hairline}`,
                    background: inBundle
                      ? 'rgba(103,232,249,0.08)'
                      : 'rgba(255,255,255,0.04)',
                    padding: '0.75em 1em',
                    opacity: shown ? 1 : 0,
                    transform: shown ? 'translateY(0)' : 'translateY(1.6em)',
                    transition:
                      'opacity 420ms ease, transform 420ms cubic-bezier(0.22,1,0.36,1), ' +
                      'border-color 400ms ease, background-color 400ms ease',
                    transitionDelay: shown ? `${i * 110}ms` : '0ms',
                  }}
                >
                  <span style={{ fontSize: '1.35em', color: c.faint, flexShrink: 0 }}>
                    {t.id}
                  </span>
                  <span
                    style={{
                      fontSize: '1.65em',
                      color: c.text,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {t.title}
                  </span>
                  <span
                    style={{
                      fontSize: '1.2em',
                      letterSpacing: '0.12em',
                      padding: '0.15em 0.6em',
                      borderRadius: '0.5em',
                      color: s.fg,
                      background: s.bg,
                      border: `0.1em solid ${s.br}`,
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                  >
                    {inBundle ? 'bundled' : t.severity}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <style>{`
        @keyframes dcd-page {
          from { opacity: 0; transform: translateY(1.4cqw) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes dcd-title {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
      `}</style>
    </PreviewSurface>
  );
}
