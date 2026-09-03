/* Ported from ../Website/src/components/portfolio/gridExpansionConfig.ts */

/** Scroll-to-collapse: how far the user must scroll (px) before the
 *  expanded tile auto-collapses. Higher = harder to trigger. */
export const SCROLL_COLLAPSE_THRESHOLD = 300;

/** Animation durations (seconds) */
export const EXPAND_DURATION = 0.4;
export const COLLAPSE_DURATION = 0.3;
export const CONTENT_FADE_DELAY = 0.15;

/** Easing curves (GSAP) */
export const EXPAND_EASE = 'power2.out';
export const COLLAPSE_EASE = 'power2.in';

/** Tile border radius (px) */
export const TILE_RADIUS = 12;

/**
 * Left-panel width ratios.
 *
 * His 3-column value is 2/5. Ours is 1/3 on both, because a grid column is
 * almost exactly a third of the grid: the card slides into the panel at
 * very nearly the width it already had, so its 16/10 visual barely
 * resizes and the live preview inside never reflows. At 2/5 the card grew
 * ~25% wider on open, which also made it taller than the row it came from.
 */
export const LEFT_PANEL_RATIO_2COL = 1 / 3;
export const LEFT_PANEL_RATIO_3COL = 1 / 3;

/**
 * Height of a card's visual area as a fraction of its width.
 *
 * Wesley's tiles use a fixed-height visual (`h-44 sm:h-52`), so a tile
 * flying into the wider left panel keeps its height and the overlay can
 * simply reuse the grid slot's height. Ours is 16/10 — the live previews
 * are authored against that box — so widening the tile also makes it
 * taller, and the overlay height has to account for the difference.
 */
export const VISUAL_ASPECT = 10 / 16;
