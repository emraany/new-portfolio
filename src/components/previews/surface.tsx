'use client';

import type { CSSProperties, ReactNode } from 'react';

/**
 * PreviewSurface
 *
 * The shared canvas every project preview draws on.
 *
 * It establishes a size container and sets `font-size: 1cqw`, so inside a
 * preview **1em === 1% of the card's width**. The surface is therefore
 * always 100em wide and 62.5em tall (the card's 16/10 box), and a preview
 * written entirely in `em` scales proportionally from a 300px tablet card
 * to a full-width phone card with no media queries and no JS measurement.
 *
 * Sizes below are quoted in em on that scale — e.g. `2.6em` is a ~10px
 * label on a 380px-wide card.
 */
export function PreviewSurface({
  background,
  fontFamily,
  active = true,
  children,
  style,
}: {
  background: string;
  fontFamily?: string;
  /**
   * The preview's run/pause flag.
   *
   * Passing it here is what makes pausing mean anything. `active` only ever
   * stopped the JavaScript clock, so a preview scrolled to the edge of the
   * viewport went on running every CSS `@keyframes` it had declared —
   * blinking cursors, drifting clouds, entrance loops — for as long as the
   * card stayed mounted. The attribute below lets one rule in globals.css
   * pause the whole subtree.
   */
  active?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className="preview-surface"
      data-active={active ? 'true' : 'false'}
      style={{
        position: 'absolute',
        inset: 0,
        containerType: 'size',
        overflow: 'hidden',
        /* A preview's content grows and shrinks every scene; scroll
           anchoring treats that as a reason to nudge the page. */
        overflowAnchor: 'none',
        background,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          fontSize: '1cqw',
          fontFamily,
          lineHeight: 1.35,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}
