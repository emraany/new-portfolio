'use client';

import { PreviewSurface } from '../surface';
import { useScript } from '../use-loop';
import type { PreviewProps } from '../registry';

/* ── Design tokens — from the app's own source ────────────────────────── *
 * The simulator is a console-first Java app (cli/Main.java), so its
 * "UI" is terminal output. Colours match the VS Code integrated terminal
 * the project ships a launch config for; the text is the real thing.     */
const c = {
  bg: '#0b0b0b',
  chrome: '#1a1a1a',
  text: '#cccccc',
  dim: '#7a7a7a',
  green: '#4ec9b0',
  cyan: '#569cd6',
  yellow: '#dcdcaa',
  magenta: '#c586c0',
  prompt: '#6a9955',
} as const;

const FONT = 'var(--font-jetbrains), "JetBrains Mono", Menlo, monospace';

/* ── Real transitions — src/main/resources/catalog/moves.json ─────────── *
 * A legal walk through the catalog: every move exists, its family is the
 * catalog's, and each `to` is that move's real success outcome.          */
type Line =
  | { k: 'plain'; t: string }
  | { k: 'head'; t: string }
  | { k: 'opt'; n: number; name: string; family: string }
  | { k: 'input'; t: string }
  | { k: 'result'; move: string; to: string; ms: number; t: number }
  | { k: 'sub'; t: string };

const SCRIPT: Line[] = [
  { k: 'head', t: '=== BJJ Simulator ===' },
  { k: 'plain', t: 'Resistance: 60 | Fatigue: 20' },
  { k: 'plain', t: 'Starting position: STANDING' },
  { k: 'head', t: 'Eligible moves:' },
  { k: 'opt', n: 1, name: 'Double Leg', family: 'ENTRY' },
  { k: 'opt', n: 2, name: 'Pull to Closed Guard', family: 'ENTRY' },
  { k: 'input', t: '1' },
  { k: 'result', move: 'Double Leg', to: 'SIDE_CONTROL_TOP', ms: 5400, t: 5400 },
  { k: 'head', t: 'Eligible moves:' },
  { k: 'opt', n: 1, name: 'Gift Wrap Back Take', family: 'TRANSITION' },
  { k: 'opt', n: 2, name: "D'Arce Choke", family: 'SUBMISSION' },
  { k: 'input', t: '2' },
  { k: 'result', move: "D'Arce Choke", to: 'END', ms: 4300, t: 9700 },
  { k: 'sub', t: 'Submission. Opponent tapped. Session over.' },
  { k: 'plain', t: 'Total time elapsed: 9700 ms' },
];

/** Visible rows — the terminal scrolls once the log outgrows the box. */
const ROWS = 13;
/* Paced so each line is comfortably readable before the next lands.
   Menu options come faster than results, because a result line is the
   one the viewer actually needs to read. */
const LINE_MS = 1500;
const CHOICE_MS = 1250;
const RESULT_MS = 2600;
/* The tap-out holds on screen before the session restarts */
const RESTART_MS = 3000;

/** How long the line at index `i` stays on screen before the next prints. */
function delayFor(i: number) {
  if (i >= SCRIPT.length - 1) return RESTART_MS;
  const kind = SCRIPT[i].k;
  if (kind === 'opt' || kind === 'input') return CHOICE_MS;
  if (kind === 'result' || kind === 'sub') return RESULT_MS;
  return LINE_MS;
}

/* One scene per printed line, plus a blank opening beat — so `step` is
   exactly the number of lines on screen and the session restarts empty. */
const SCENES = [LINE_MS, ...SCRIPT.map((_, i) => delayFor(i))];

export default function BjjSimulatorPreview({ active }: PreviewProps) {
  const [n] = useScript(SCENES, active);

  const written = SCRIPT.slice(0, n);
  const visible = written.slice(Math.max(0, written.length - ROWS));

  return (
    <PreviewSurface background={c.bg} fontFamily={FONT} active={active}>
      {/* ── Terminal tab strip ─────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          insetInline: 0,
          top: 0,
          height: '4.4em',
          display: 'flex',
          alignItems: 'center',
          gap: '1.4em',
          padding: '0 2em',
          background: c.chrome,
          fontSize: '1.55em',
          color: c.dim,
        }}
      >
        <span style={{ color: c.text }}>TERMINAL</span>
        <span>PROBLEMS</span>
        <span>OUTPUT</span>
        <span style={{ marginLeft: 'auto' }}>java · Main</span>
      </div>

      {/* ── Log ────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          insetInline: 0,
          top: '4.4cqw',
          bottom: '3.6cqw',
          padding: '1em 2em',
          fontSize: '1.72em',
          lineHeight: 1.42,
          color: c.text,
          overflow: 'hidden',
          /* Output rises from the bottom, the way a real terminal fills */
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {visible.map((l, i) => (
          <div
            /* Keyed by absolute line number, not row position: as the log
               scrolls, every line keeps its element and only the newly
               printed one is a new key — so the entrance plays once, on
               the line that actually just arrived. */
            key={n - visible.length + i}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              /* Only the newest line animates in */
              animation:
                i === visible.length - 1
                  ? 'bjj-line-in 260ms ease-out both'
                  : undefined,
            }}
          >
            <LineText line={l} />
          </div>
        ))}

        {/* Prompt + block cursor */}
        <div style={{ whiteSpace: 'nowrap' }}>
          <span style={{ color: c.prompt }}>&gt; </span>
          <span
            style={{
              display: 'inline-block',
              width: '0.55em',
              height: '1.05em',
              background: c.text,
              verticalAlign: '-0.15em',
              animation: 'bjj-blink 1.06s steps(1) infinite',
            }}
          />
        </div>
      </div>

      {/* ── Status bar ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          insetInline: 0,
          bottom: 0,
          height: '3.6em',
          display: 'flex',
          alignItems: 'center',
          gap: '1.6em',
          padding: '0 2em',
          background: c.chrome,
          fontSize: '1.45em',
          color: c.dim,
        }}
      >
        <span>⚠ 0</span>
        <span>△ 1</span>
        <span style={{ marginLeft: 'auto', color: c.green }}>Java: Ready</span>
      </div>

      <style>{`
        @keyframes bjj-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
        @keyframes bjj-line-in {
          from { opacity: 0; transform: translateY(0.35em) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </PreviewSurface>
  );
}

/** Renders one console line in the format cli/Main.java prints it. */
function LineText({ line }: { line: Line }) {
  switch (line.k) {
    case 'head':
      return <span style={{ color: c.cyan }}>{line.t}</span>;
    case 'opt':
      return (
        <span>
          {line.n}){' '}
          <span style={{ color: c.yellow }}>{line.name}</span>{' '}
          <span style={{ color: c.dim }}>[{line.family}]</span>
        </span>
      );
    case 'input':
      return (
        <span>
          <span style={{ color: c.prompt }}>&gt; </span>
          {line.t}
        </span>
      );
    case 'result':
      /* Main.java:129 — "%s -> %s (%d ms) | pos: %s | t=%d" */
      return (
        <span>
          <span style={{ color: c.dim }}>-&gt; </span>
          <span style={{ color: c.yellow }}>{line.move}</span>
          <span style={{ color: c.dim }}> -&gt; </span>
          <span style={{ color: c.green }}>SUCCESS</span>
          <span style={{ color: c.dim }}> ({line.ms} ms) | pos: </span>
          <span style={{ color: c.magenta }}>{line.to}</span>
          <span style={{ color: c.dim }}> | t={line.t}</span>
        </span>
      );
    case 'sub':
      return <span style={{ color: c.green }}>{line.t}</span>;
    default:
      return <span>{line.t}</span>;
  }
}
