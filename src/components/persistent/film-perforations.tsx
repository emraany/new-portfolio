'use client';

/**
 * FilmPerforations
 *
 * Renders the left and right perforation strips targeted by
 * perforations.css. The scroll animation is driven by the
 * --scroll-y CSS custom property set by ScrollDriver, which
 * perforations.css reads via background-position-y.
 *
 * No JavaScript animation runs here — it is all CSS.
 */

const EDGE_CODE = 'EMRAAN-Y · 2026 · 24fps · REEL 01';

export default function FilmPerforations() {
  return (
    <>
      <div
        className="film-strip film-strip--left"
        aria-hidden="true"
        role="presentation"
      >
        <span className="perf-edge-code">{EDGE_CODE}</span>
      </div>
      <div
        className="film-strip film-strip--right"
        aria-hidden="true"
        role="presentation"
      >
        <span className="perf-edge-code">{EDGE_CODE}</span>
      </div>
    </>
  );
}
