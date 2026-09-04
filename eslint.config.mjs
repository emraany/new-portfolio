import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,

  {
    rules: {
      /**
       * These two are React Compiler's strict rules, and this codebase
       * deliberately does both things they forbid.
       *
       * `refs` fires on the write-a-fresh-callback-into-a-ref-during-render
       * pattern (use-loop.ts, use-grid-expansion.ts). That pattern is the
       * reason a preview's animation loop survives a re-render instead of
       * being torn down and restarted from scene zero every time its parent
       * renders — the ref is what lets the loop read the latest closure
       * without listing it as a dependency.
       *
       * `set-state-in-effect` fires where mount-time browser measurement
       * decides what to render — the intro advancing past its idle stage, and
       * the projector cursor deciding it is not on a touch device. Neither
       * value exists on the server, so neither can move into an initializer
       * without changing what is rendered before hydration.
       *
       * Warnings rather than off: they are worth seeing on new code. Both are
       * fixable, but each fix re-times an animation, which is out of scope for
       * a pass whose whole premise is that nothing changes visually.
       */
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Standalone HTML, rendered in a browser rather than built.
    'scripts/og/**',
  ]),
]);
