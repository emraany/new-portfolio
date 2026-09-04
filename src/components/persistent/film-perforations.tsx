'use client';

/**
 * FilmPerforations
 *
 * Renders the left and right perforation strips targeted by
 * perforations.css. The constant forward drift is a CSS keyframe
 * animation (`perf-drift`) defined there.
 *
 * No JavaScript runs here at all — not on mount, not per frame.
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
