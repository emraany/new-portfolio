'use client';

import { PreviewSurface } from '../surface';
import { useScript } from '../use-loop';
import type { PreviewProps } from '../registry';

/* ── Design tokens — from the app's own source ────────────────────────── *
 * quran-app/src/app/globals.css → `--background: wheat`
 * quran-app/src/app/layout.tsx  → Marcellus (--font-brand),
 *                                 Scheherazade New (--font-arabic)
 * components/AyahCard.tsx       → white/60 card, gray-200 border,
 *                                 rounded-2xl, blue-50 flash
 * components/ThemeChip.tsx      → indigo-100 → purple-100 gradient pill
 * app/ayah/[ref]/page.tsx       → blue-600 active style button           */
const c = {
  bg: 'wheat',
  card: 'rgba(255,255,255,0.60)',
  cardFlash: '#eff6ff',
  border: '#e5e7eb',
  borderStrong: '#d1d5db',
  ink: '#171717',
  gray900: '#111827',
  gray700: '#374151',
  gray500: '#6b7280',
  blue600: '#2563eb',
  chipFrom: '#e0e7ff',
  chipTo: '#f3e8ff',
} as const;

const FONT_SANS = 'var(--font-inter), system-ui, sans-serif';
const FONT_BRAND = 'var(--font-marcellus), Georgia, serif';
const FONT_ARABIC = 'var(--font-arabic), "Scheherazade New", serif';

/* ── Real verse — raw/quran_en.json 2:2, themes from inverse_themes.json  */
const VERSE = {
  ref: '2:2',
  surah: 'Al-Baqarah (The Cow · Surah 2) — Ayah 2',
  arabic: 'ذَٰلِكَ ٱلۡكِتَٰبُ لَا رَيۡبَۛ فِيهِۛ هُدٗى لِّلۡمُتَّقِينَ',
  translation:
    'This is the Book about which there is no doubt, a guidance for those conscious of Allah',
  themes: ['Consciousness of God', 'Guidance'],
} as const;

/* ── Explain styles — app/ayah/[ref]/page.tsx ─────────────────────────── */
const STYLES = [
  'Balanced', 'TL;DR', 'Bullets', 'Study',
  'Youth', 'Reflection', 'Linguistic', 'Context',
] as const;

/* ── Cached answers ───────────────────────────────────────────────────── *
 * The real app streams these from the OpenAI API. Calling it from a
 * portfolio card would burn quota on every page view, so one short sample
 * answer per mode is cached here and replayed. Same verse, same modes,
 * same streaming behaviour — no network.                                  */
const ANSWERS: Record<string, string[]> = {
  Balanced: [
    'The verse presents the Qur’an as a book whose guidance is certain.',
    'Its benefit is conditional: it guides those already conscious of God.',
  ],
  'TL;DR': ['A book beyond doubt — guidance for the God-conscious.'],
  Bullets: [
    'Refers to the Qur’an as “the Book,” asserting its authority.',
    'States there is “no doubt” in it — clarity and truth.',
    'Describes it as “guidance,” offering direction for life.',
    'That guidance is for “those conscious of Allah” — the mindful.',
  ],
  Study: [
    'ذَٰلِكَ (dhālika) — a demonstrative for the distant, elevating the text.',
    'رَيۡب (rayb) — doubt paired with unease, not mere uncertainty.',
    'هُدٗى (hudan) — indefinite, so: guidance of an unqualified kind.',
  ],
  Youth: [
    'This is the book you can actually trust — no catch, no fine print.',
    'But it only clicks for people who are paying attention to God.',
  ],
  Reflection: [
    'What would it change to read this as addressed to you?',
    'Guidance is offered, not forced — taqwā is what opens the door.',
  ],
  Linguistic: [
    'لَا رَيۡبَ فِيهِ is an absolute negation — doubt is excluded entirely.',
    'The small pause marks (ۛ) allow two valid recitations of the phrase.',
  ],
  Context: [
    'Opens Al-Baqarah, the longest surah, revealed in Madinah.',
    'Follows Al-Fātiḥah’s plea for guidance — this verse answers it.',
  ],
};

/* Three of the eight modes are cycled — enough to show the selector
   moving and the answer changing shape without a long loop. */
const CYCLE = ['Balanced', 'Bullets', 'Reflection'] as const;
const LINE_MS = 950;
const HOLD_MS = 1400;

/* ── The loop, flattened into scenes ──────────────────────────────────── *
 * Each mode contributes: the card flash as the request goes out, one
 * scene per streamed line, then a hold on the finished answer. Laid out
 * as one flat list, the whole state of the preview is a lookup on a
 * single scene index — nothing to fall out of step with anything else. */
type Scene = { mode: number; shown: number; flash: boolean };

const { SCENES, DURATIONS } = (() => {
  const SCENES: Scene[] = [];
  const DURATIONS: number[] = [];
  for (const name of CYCLE) {
    const mode = STYLES.indexOf(name);
    const lines = ANSWERS[name];
    SCENES.push({ mode, shown: 0, flash: true });
    DURATIONS.push(420);
    for (let i = 0; i < lines.length; i++) {
      SCENES.push({ mode, shown: i + 1, flash: i === 0 });
      DURATIONS.push(LINE_MS);
    }
    SCENES.push({ mode, shown: lines.length, flash: false });
    DURATIONS.push(HOLD_MS);
  }
  return { SCENES, DURATIONS };
})();

export default function QuranScopePreview({ active }: PreviewProps) {
  /* Which explain mode is selected, and how many of its lines have
     streamed in. Each pass streams one mode's answer, holds, then steps
     the selection one pill to the right and generates again — so the
     loop walks the whole row of modes and wraps. */
  const [step] = useScript(DURATIONS, active);
  const { mode, shown, flash } = SCENES[step];

  const answer = ANSWERS[STYLES[mode]];

  return (
    <PreviewSurface background={c.bg} fontFamily={FONT_SANS}>
      {/* ── Brand ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '2.6cqw',
          insetInline: 0,
          textAlign: 'center',
          fontFamily: FONT_BRAND,
          fontSize: '4em',
          color: c.ink,
          lineHeight: 1,
        }}
      >
        QuranScope
      </div>

      <div
        style={{
          position: 'absolute',
          top: '9.4cqw',
          left: '7cqw',
          fontSize: '1.75em',
          color: c.gray700,
          border: `0.09em solid ${c.borderStrong}`,
          borderRadius: '0.45em',
          background: '#fff',
          padding: '0.2em 0.7em',
        }}
      >
        ‹ Back
      </div>

      <div
        style={{
          position: 'absolute',
          top: '13.6cqw',
          left: '7cqw',
          right: '7cqw',
          fontSize: '2.15em',
          fontWeight: 600,
          color: c.gray900,
        }}
      >
        {VERSE.surah}
      </div>

      {/* ── AyahCard ───────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '18cqw',
          left: '7cqw',
          right: '7cqw',
          borderRadius: '1.5em',
          border: `0.14em solid ${c.border}`,
          background: flash ? c.cardFlash : c.card,
          padding: '1.3em 1.5em',
          boxShadow: '0 0.2em 0.6em rgba(0,0,0,0.05)',
          transition: 'background-color 300ms',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7em' }}>
          <span style={{ fontSize: '1.6em', fontWeight: 600, color: c.gray900 }}>
            {VERSE.ref}
          </span>
          {VERSE.themes.map((t) => (
            <span
              key={t}
              style={{
                fontSize: '1.35em',
                borderRadius: '999em',
                background: `linear-gradient(to right, ${c.chipFrom}, ${c.chipTo})`,
                color: c.gray700,
                padding: '0.15em 0.75em',
                whiteSpace: 'nowrap',
              }}
            >
              {t}
            </span>
          ))}
        </div>

        <div
          dir="rtl"
          style={{
            fontFamily: FONT_ARABIC,
            fontSize: '3.1em',
            color: c.gray900,
            textAlign: 'right',
            marginTop: '0.35em',
            lineHeight: 1.7,
          }}
        >
          {VERSE.arabic}
        </div>

        <div
          style={{
            fontSize: '1.55em',
            color: c.gray700,
            marginTop: '0.3em',
            lineHeight: 1.45,
          }}
        >
          {VERSE.translation}
        </div>
      </div>

      {/* ── Explain style buttons ──────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '38.4cqw',
          left: '7cqw',
          right: '7cqw',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.55em',
        }}
      >
        {STYLES.map((s, i) => {
          const on = i === mode;
          return (
            <span
              key={s}
              style={{
                fontSize: '1.4em',
                padding: '0.25em 0.7em',
                borderRadius: '0.45em',
                border: `0.09em solid ${on ? c.blue600 : c.borderStrong}`,
                background: on ? c.blue600 : '#fff',
                color: on ? '#fff' : c.gray700,
                whiteSpace: 'nowrap',
              }}
            >
              {s}
            </span>
          );
        })}
      </div>

      {/* ── Streamed explanation ───────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '44.6cqw',
          left: '7cqw',
          right: '7cqw',
          bottom: '3cqw',
          borderRadius: '1.1em',
          background: '#dbeafe',
          border: `0.12em solid #bfdbfe`,
          padding: '0.9em 1.2em',
          overflow: 'hidden',
        }}
      >
        {answer.map((b, i) => (
          <div
            key={`${mode}-${i}`}
            style={{
              display: 'flex',
              gap: '0.5em',
              fontSize: '1.4em',
              color: '#1e3a8a',
              lineHeight: 1.5,
              marginBottom: '0.25em',
              opacity: i < shown ? 1 : 0,
              transform: i < shown ? 'translateY(0)' : 'translateY(0.5em)',
              transition: 'opacity 420ms ease, transform 420ms ease',
            }}
          >
            {/* Only the list-shaped modes render a bullet marker */}
            {(STYLES[mode] === 'Bullets' || STYLES[mode] === 'Study') && (
              <span style={{ flexShrink: 0 }}>-</span>
            )}
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {b}
            </span>
          </div>
        ))}
      </div>
    </PreviewSurface>
  );
}
