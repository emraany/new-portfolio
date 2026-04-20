'use client';

/**
 * FilmGrain
 *
 * Renders the #film-grain element targeted by grain.css.
 * The CSS ::after pseudo-element carries the animated SVG noise texture.
 * This component itself is static — all animation lives in grain.css.
 */

export default function FilmGrain() {
  return <div id="film-grain" aria-hidden="true" />;
}
