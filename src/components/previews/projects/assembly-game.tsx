'use client';

import { PreviewSurface } from '../surface';
import { useScript } from '../use-loop';
import type { PreviewProps } from '../registry';

/* ── Everything below is lifted from the .asm source ──────────────────── *
 * Main.asm      → `combinedArray` str1–str16 (the card faces) and
 *                 `ArrayPairs` (1,2,…,8,1,2,…,8 — links expression to
 *                 result, so card i pairs with card i+8).
 * Display.asm   → top_border / mid_border / hidden_space literals.
 * GameLogic.asm → the prompts, "Match found!", and the title.
 * Chrome colours are MARS 4.5's Swing look, the IDE it runs in.          */
const FACES = [
  '3 × 4', '5 × 5', '2 × 7', '3 × 2', '6 × 3', '4 × 6', '2 × 5', '3 × 3',
  ' 12  ', ' 25  ', ' 14  ', '  6  ', ' 18  ', ' 24  ', ' 10  ', '  9  ',
] as const;

const HIDDEN = '  ?  ';
const TOP_BORDER = '+-----+-----+-----+-----+';
const MID_BORDER = '|-----+-----+-----+-----|';

/* A dealt board: position → card index. Fixed, so the preview is
   hydration-safe (shuffle.asm randomises this at runtime). */
const BOARD = [5, 12, 0, 9, 14, 3, 8, 6, 1, 11, 15, 4, 10, 7, 2, 13] as const;

/* Pairs solved in order, as board positions. `ArrayPairs` makes card i
   and card i+8 a pair; these are the positions those cards were dealt to. */
const SOLVE: [number, number][] = [
  [2, 6],  // "3 × 4" ↔ " 12  "
  [0, 15], // "4 × 6" ↔ " 24  "
];

const c = {
  chrome: '#d6d2c8',
  chromeLine: '#a9a496',
  console: '#ffffff',
  text: '#1a1a1a',
  dim: '#6d6d6d',
  reveal: '#0b57d0',
  match: '#137333',
  miss: '#b3261e',
} as const;

const FONT = 'var(--font-jetbrains), "JetBrains Mono", Menlo, monospace';

/* Paced so each entered index and each flipped card is readable */
const STEP_MS = 2000;
const MATCH_MS = 2200;
/* The win message holds, then the board is dealt again ("play again") */
const RESET_MS = 3200;

/* Scenes, in order: for each pair — reveal A, reveal B, matched — then a
   final scene holding the win message before the board is dealt again. */
const TOTAL = SOLVE.length * 3;
const SCENES = [
  ...Array.from({ length: TOTAL }, (_, s) =>
    s % 3 === 2 ? MATCH_MS : STEP_MS
  ),
  RESET_MS,
];

export default function AssemblyGamePreview({ active }: PreviewProps) {
  /* step counts through: reveal A, reveal B, matched → next pair */
  const [step] = useScript(SCENES, active);

  const pairIndex = Math.floor(step / 3);
  const withinPair = step % 3;

  /* Positions already matched in earlier rounds stay face-up */
  const matched = new Set<number>();
  for (let p = 0; p < pairIndex; p++) {
    matched.add(SOLVE[p][0]);
    matched.add(SOLVE[p][1]);
  }

  /* Positions flipped during the current round */
  const flipped = new Set<number>();
  if (pairIndex < SOLVE.length) {
    if (withinPair >= 1) flipped.add(SOLVE[pairIndex][0]);
    if (withinPair >= 2) flipped.add(SOLVE[pairIndex][1]);
  }

  const justMatched = withinPair === 0 && pairIndex > 0;

  const rows = [0, 1, 2, 3];

  return (
    <PreviewSurface background={c.chrome} fontFamily={FONT} active={active}>
      {/* ── MARS window chrome ─────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          insetInline: 0,
          top: 0,
          height: '4em',
          display: 'flex',
          alignItems: 'center',
          gap: '1.6em',
          padding: '0 1.6em',
          borderBottom: `0.14em solid ${c.chromeLine}`,
          fontSize: '1.5em',
          color: c.text,
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
        }}
      >
        <span>File</span>
        <span>Edit</span>
        <span>Run</span>
        <span>Settings</span>
        <span>Tools</span>
        <span>Help</span>
        <span style={{ marginLeft: 'auto', color: c.dim }}>Main.asm — MARS 4.5</span>
      </div>

      {/* ── Source tabs ────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          insetInline: 0,
          top: '4cqw',
          height: '3.4em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4em',
          padding: '0 1.6em',
          fontSize: '1.35em',
          color: c.dim,
          borderBottom: `0.14em solid ${c.chromeLine}`,
        }}
      >
        {['Main.asm', 'GameLogic.asm', 'Display.asm', 'Check.asm', 'shuffle.asm'].map(
          (t, i) => (
            <span
              key={t}
              style={{
                padding: '0.2em 0.6em',
                background: i === 0 ? c.console : 'transparent',
                border: `0.1em solid ${i === 0 ? c.chromeLine : 'transparent'}`,
                borderBottom: 'none',
                color: i === 0 ? c.text : c.dim,
                whiteSpace: 'nowrap',
              }}
            >
              {t}
            </span>
          )
        )}
      </div>

      {/* ── Run I/O console ────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: '1.6cqw',
          right: '1.6cqw',
          top: '8.6cqw',
          bottom: '2cqw',
          background: c.console,
          border: `0.14em solid ${c.chromeLine}`,
          display: 'flex',
          alignItems: 'center',
          gap: '2em',
          padding: '1.4em 1.8em',
          overflow: 'hidden',
        }}
      >
        {/* The board, drawn with Display.asm's own border strings */}
        <div style={{ fontSize: '1.85em', lineHeight: 1.32, color: c.text }}>
          <div style={{ color: c.dim, marginBottom: '0.3em' }}>
            Welcome to Math-Match!
          </div>
          <div>{TOP_BORDER}</div>
          {rows.map((r) => (
            <div key={r}>
              <div style={{ whiteSpace: 'pre' }}>
                |
                {[0, 1, 2, 3].map((col) => {
                  const pos = r * 4 + col;
                  const isMatched = matched.has(pos);
                  const isFlipped = flipped.has(pos);
                  const face = isMatched || isFlipped ? FACES[BOARD[pos]] : HIDDEN;
                  const color = isMatched
                    ? c.match
                    : isFlipped
                      ? c.reveal
                      : c.dim;
                  return (
                    <span key={col}>
                      <span
                        style={{
                          color,
                          fontWeight: isMatched || isFlipped ? 600 : 400,
                          transition: 'color 220ms',
                        }}
                      >
                        {face}
                      </span>
                      |
                    </span>
                  );
                })}
              </div>
              {r < 3 && <div>{MID_BORDER}</div>}
            </div>
          ))}
          <div>{TOP_BORDER}</div>
        </div>

        {/* The prompts, verbatim from GameLogic.asm */}
        <div
          style={{
            fontSize: '1.7em',
            lineHeight: 1.6,
            color: c.text,
            flex: 1,
            minWidth: 0,
          }}
        >
          {pairIndex < SOLVE.length && (
            <>
              <div style={{ color: c.dim }}>
                Please input your FIRST number (0-15):{' '}
                <span style={{ color: c.reveal, fontWeight: 600 }}>
                  {withinPair >= 1 ? SOLVE[pairIndex][0] : ''}
                </span>
                {withinPair === 0 && <Cursor />}
              </div>
              {withinPair >= 1 && (
                <div style={{ color: c.dim }}>
                  Please input your SECOND number (0-15):{' '}
                  <span style={{ color: c.reveal, fontWeight: 600 }}>
                    {withinPair >= 2 ? SOLVE[pairIndex][1] : ''}
                  </span>
                  {withinPair === 1 && <Cursor />}
                </div>
              )}
            </>
          )}

          {withinPair === 2 && (
            <div
              style={{
                color: c.match,
                fontWeight: 600,
                animation: 'asm-in 260ms ease-out both',
              }}
            >
              Match found!
            </div>
          )}

          {justMatched && (
            <div style={{ color: c.match, fontWeight: 600 }}>Match found!</div>
          )}

          {pairIndex >= SOLVE.length && (
            <div
              style={{
                color: c.match,
                fontWeight: 700,
                animation: 'asm-in 300ms ease-out both',
              }}
            >
              YOU WON! Do you want to play again? (Enter &apos;0&apos; to quit or
              &apos;1&apos; to play)
            </div>
          )}

          <div style={{ marginTop: '0.8em', color: c.dim }}>
            {matched.size / 2} of {SOLVE.length} pairs matched
          </div>
        </div>
      </div>

      <style>{`
        @keyframes asm-in {
          from { opacity: 0; transform: translateY(0.35em) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes asm-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
      `}</style>
    </PreviewSurface>
  );
}

function Cursor() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '0.5em',
        height: '1em',
        background: c.text,
        verticalAlign: '-0.12em',
        animation: 'asm-blink 1.06s steps(1) infinite',
      }}
    />
  );
}
