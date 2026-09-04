'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ProjectCard from '@/components/projects/project-card';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ExpandedProject from '@/components/projects/expanded-project';
import { useGridExpansion } from '@/components/projects/use-grid-expansion';
import { projects } from '@/data/projects';
import type { Project } from '@/data/projects';
import { ProjectDrawer } from '@/components/projects/project-sheet';
import SectionHeader from '@/components/ui/section-header';

/**
 * Filmography — the projects grid, ported from
 * ../Website/src/components/portfolio/sections/ProjectsSection.tsx
 *
 * Same anatomy as his: a "Highlighted" band of three, a "More Projects"
 * band for the rest, and a full-width expansion overlay that is always
 * mounted (mounting it on click costs a frame). On the 3-column desktop
 * grid a click runs his FLIP expansion; narrower layouts open his bottom
 * sheet.
 *
 * Below 640px it becomes his horizontal snap carousel with mouse
 * drag-to-scroll and velocity snapping — but carrying every project
 * rather than a preview of three behind a "View all" button, so the whole
 * filmography is one sideways slide. Tapping a card opens his sheet.
 *
 * That last part was the problem: a centred card leaves a ~26px sliver of
 * its neighbour, which reads as a margin rather than as six more projects,
 * so the strip looked like a single tile. It now carries a frame counter, a
 * position rail and a swipe hint that retires itself after the first swipe.
 */

const HIGHLIGHTED_COUNT = 3;

export default function Filmography() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const openSheet = useCallback((project: Project) => {
    setSelectedProject(project);
    setSheetOpen(true);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    dragged: false,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });

  /* Which card the strip is showing, for the counter and the rail. One rAF
     per frame at most, and the setState bails when the index is unchanged —
     so a swipe across the whole filmography costs seven re-renders, not one
     per scroll event. */
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasSwiped, setHasSwiped] = useState(false);
  const scrollRaf = useRef(0);

  const readCarouselIndex = useCallback(() => {
    scrollRaf.current = 0;
    const el = scrollRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    if (cards.length === 0) return;

    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });

    setActiveIndex(best);
    if (el.scrollLeft > 8) setHasSwiped(true);
  }, []);

  const onCarouselScroll = useCallback(() => {
    if (scrollRaf.current) return;
    scrollRaf.current = requestAnimationFrame(readCarouselIndex);
  }, [readCarouselIndex]);

  useEffect(
    () => () => {
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
    },
    []
  );

  const {
    expandedIndex,
    fadingOutIndex,
    fadingOutHeight,
    overlayPosition,
    initialClip,
    isDesktopGrid,
    expandedTileRef,
    expand,
    collapse,
  } = useGridExpansion({ gridRef });

  const handleTileClick = useCallback(
    (e: React.MouseEvent, project: Project, index: number) => {
      if (dragState.current.dragged) return;
      if ((e.target as HTMLElement).closest('a')) return;
      if (!isDesktopGrid) {
        openSheet(project);
        return;
      }
      /* Clicking the card again — including after it has flown into the
         expanded view's left panel — closes it and hands the row back to
         the other projects. */
      if (expandedIndex === index) collapse();
      else expand(index);
    },
    [isDesktopGrid, expand, collapse, expandedIndex, openSheet]
  );

  const handleTileKeyDown = useCallback(
    (e: React.KeyboardEvent, project: Project, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isDesktopGrid) {
          openSheet(project);
          return;
        }
        if (expandedIndex === index) collapse();
        else expand(index);
      }
    },
    [isDesktopGrid, expand, collapse, expandedIndex, openSheet]
  );

  /* ── Mouse drag-to-scroll for the mobile carousel ─────────────────── */

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      dragged: false,
      lastX: e.clientX,
      lastTime: Date.now(),
      velocity: 0,
    };
    el.setPointerCapture(e.pointerId);
    el.style.cursor = 'grabbing';
    el.style.scrollSnapType = 'none';
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds.active) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - ds.startX;
    if (Math.abs(dx) > 5) ds.dragged = true;
    const now = Date.now();
    const dt = now - ds.lastTime;
    if (dt > 0) {
      ds.velocity = (e.clientX - ds.lastX) / dt; // px/ms, positive = dragged right
      ds.lastX = e.clientX;
      ds.lastTime = now;
    }
    el.scrollLeft = ds.scrollLeft - dx;
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds.active) return;
    ds.active = false;
    const el = scrollRef.current;
    if (!el) return;
    el.releasePointerCapture(e.pointerId);
    el.style.cursor = '';

    const cards = Array.from(el.children) as HTMLElement[];
    if (cards.length === 0) {
      el.style.scrollSnapType = '';
      return;
    }

    const containerRect = el.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    const VELOCITY_THRESHOLD = 0.3; // px/ms
    let bestIdx = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const dist = Math.abs(rect.left + rect.width / 2 - containerCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });

    // Velocity bias: a flick goes to the next/prev card even if not closest
    if (ds.velocity > VELOCITY_THRESHOLD && bestIdx > 0) bestIdx--;
    else if (ds.velocity < -VELOCITY_THRESHOLD && bestIdx < cards.length - 1) bestIdx++;

    const target = cards[bestIdx];
    el.scrollTo({
      left: target.offsetLeft - (el.offsetWidth - target.offsetWidth) / 2,
      behavior: 'smooth',
    });

    const onScrollEnd = () => {
      el.style.scrollSnapType = '';
    };
    if ('onscrollend' in el) el.addEventListener('scrollend', onScrollEnd, { once: true });
    else setTimeout(onScrollEnd, 350);
  }, []);

  /* Both card trees are always in the document and the breakpoint picks
     one with CSS, so every project has two cards at all times. The hidden
     half never animated — a display:none element reports no intersection —
     but each of its cards still built two IntersectionObservers, fourteen
     cards' worth of them. Only the tree that is actually on screen gets a
     live preview gate now. Null until mounted, so the server and the first
     client render agree. */
  const isWide = useMediaQuery('(min-width: 640px)');

  const renderCard = (project: Project, index: number, inGrid: boolean) => (
    <ProjectCard
      project={project}
      index={index}
      previewEnabled={isWide !== null && isWide === inGrid}
      onClick={(e) => handleTileClick(e, project, index)}
      onKeyDown={(e) => handleTileKeyDown(e, project, index)}
    />
  );

  const slotStyle = (index: number): React.CSSProperties | undefined => {
    if (expandedIndex === index) {
      /* The overlay is the taller of the two (our visual grows a little
         with width), so the slot reserves the overlay's height — otherwise
         the overlay spills over the divider in the row below. */
      return { visibility: 'hidden', minHeight: overlayPosition?.height };
    }
    if (fadingOutIndex === index) {
      return { visibility: 'hidden', minHeight: fadingOutHeight ?? undefined };
    }
    return undefined;
  };


  return (
    <>
      <style>{PROJECTS_CSS}</style>

      <section
        id="filmography"
        aria-label="Filmography — project grid"
        style={{
          paddingTop: 'var(--space-16)',
          paddingBottom: 'var(--space-16)',
          paddingLeft: 'var(--section-pad-x)',
          paddingRight: 'var(--section-pad-x)',
        }}
      >
        <SectionHeader label="FILMOGRAPHY" heading="[Projects]" />

        {/* ── Mobile: horizontal snap carousel + view all ─────────────── */}
        <div className="pj-mobile">
          <div
            ref={scrollRef}
            className="pj-carousel"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onScroll={onCarouselScroll}
          >
            {projects.map((project, i) => (
              <div className="pj-carousel-item" key={project.slug}>
                {renderCard(project, i, false)}
              </div>
            ))}
          </div>

          {/* Says there is more to the right, and where you are in it.
              aria-hidden because every card is already a focusable button in
              document order — this is the sighted-swipe equivalent of that,
              not a second set of facts. */}
          <div className="pj-swipe" aria-hidden="true">
            <span className="pj-swipe-count">
              {String(activeIndex + 1).padStart(2, '0')}
              <span className="pj-swipe-of">
                {' / '}
                {String(projects.length).padStart(2, '0')}
              </span>
            </span>

            <span className="pj-swipe-rail">
              <span
                className="pj-swipe-fill"
                style={{
                  width: `${100 / projects.length}%`,
                  transform: `translateX(${activeIndex * 100}%)`,
                }}
              />
            </span>

            <span className="pj-swipe-hint" data-done={hasSwiped ? '' : undefined}>
              Swipe
              <svg
                className="pj-swipe-arrow"
                width="16"
                height="8"
                viewBox="0 0 16 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M0 4h13.5M10.5 1 14 4l-3.5 3" />
              </svg>
            </span>
          </div>
        </div>

        {/* ── Tablet + desktop: the grid ──────────────────────────────── */}
        <div ref={gridRef} className="pj-grid">
          <div className="pj-divider">
            <span>Highlighted</span>
            <div className="pj-rule" />
          </div>

          {projects.slice(0, HIGHLIGHTED_COUNT).map((project, i) => (
            <div data-grid-slot key={project.slug} style={slotStyle(i)}>
              {renderCard(project, i, true)}
            </div>
          ))}

          <div className="pj-divider">
            <span>More Projects</span>
            <div className="pj-rule" />
          </div>

          {projects.slice(HIGHLIGHTED_COUNT).map((project, i) => {
            const idx = i + HIGHLIGHTED_COUNT;
            return (
              <div data-grid-slot key={project.slug} style={slotStyle(idx)}>
                {renderCard(project, idx, true)}
              </div>
            );
          })}

          {/* Expansion overlay — always mounted, hidden when idle */}
          <div
            ref={expandedTileRef}
            className="pj-overlay"
            style={{
              top: overlayPosition?.top ?? 0,
              left: overlayPosition?.left ?? 0,
              right: overlayPosition?.right ?? 0,
              height: overlayPosition?.height ?? 0,
              ...(initialClip ? { clipPath: initialClip } : {}),
              ...(expandedIndex === null
                ? { visibility: 'hidden' as const, pointerEvents: 'none' as const }
                : {}),
            }}
          >
            <ExpandedProject
              project={expandedIndex !== null ? projects[expandedIndex] : projects[0]}
              onClose={collapse}
            />
          </div>
        </div>
      </section>

      <ProjectDrawer project={selectedProject} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

const PROJECTS_CSS = `
/* ── Grid ──────────────────────────────────────────────────────────── */
/* p-4px / -m-4px so the 3px hover raise isn't clipped; the hook reads
   this padding as the overlay's left/right inset (his -m-1 p-1). */
.pj-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
  padding: 4px;
  margin: -4px;
}
.pj-mobile { display: none; }

@media (max-width: 1023px) {
  .pj-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 639px) {
  .pj-grid { display: none; }
  .pj-mobile { display: block; }
}

.pj-divider {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding-bottom: 4px;
}
.pj-divider + .pj-divider,
.pj-divider:not(:first-child) { padding-top: var(--space-2); }
.pj-divider span {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.pj-rule { height: 1px; flex: 1; background: var(--color-border); }

/* ── Card ──────────────────────────────────────────────────────────── */
/* No hover raise: the card sits still and the visual does the reacting —
   the border lifts, the print develops, the play button comes up. The
   raise also fought the FLIP, which had to cancel it before measuring. */
.pj-card {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  user-select: none;
  cursor: pointer;
  transition: border-color 220ms ease, background-color 220ms ease;
}
/* Every :hover below is behind a (hover: hover) query. On iOS an element whose
   hover styles change how it paints eats the first tap applying that state,
   so a card needed two taps to open its sheet — and the hover state then
   stuck on the card you left behind. */
@media (hover: hover) and (pointer: fine) {
  .pj-card:hover {
    border-color: rgba(216, 213, 204, 0.24);
    background: rgba(216, 213, 204, 0.02);
  }
}
.pj-card:focus-visible {
  outline: 1px solid var(--color-text-secondary);
  outline-offset: 2px;
}
.pj-card[data-expanded] { transition: none !important; }

.pj-visual {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--color-bg);
  flex-shrink: 0;
}

/* Darkroom develop — undeveloped at rest, full print on hover. A device
   that cannot hover has no way to finish the develop, so there it is simply
   printed: an image left permanently half-developed is not the effect. */
.pj-develop {
  filter: saturate(0.7) brightness(0.85);
  transition: filter 400ms cubic-bezier(0.4, 0, 0.6, 1);
}
@media (hover: hover) and (pointer: fine) {
  .pj-card:hover .pj-develop { filter: saturate(1) brightness(1); }
}
@media (hover: none) {
  .pj-develop { filter: none; }
}

.pj-slate {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  z-index: 3;
  font-family: var(--font-mono);
  font-size: 9px;
  line-height: 1;
  color: var(--color-text-muted);
  opacity: 0.6;
  pointer-events: none;
}

.pj-play-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(0, 0, 0, 0.62) 0%,
    rgba(0, 0, 0, 0.42) 60%,
    rgba(0, 0, 0, 0.34) 100%
  );
  opacity: 0;
  transition: opacity 250ms ease;
  pointer-events: none;
}
@media (hover: hover) and (pointer: fine) {
  .pj-card:hover .pj-play-layer { opacity: 1; }
}
.pj-card[data-expanded] .pj-play-layer { opacity: 0; }

.pj-play {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-text-primary);
  font-size: 26px;
  line-height: 1;
  padding-left: 4px;
  box-shadow: 0 0 0 6px rgba(56, 77, 69, 0.25);
  transform: scale(0.8);
  transition: transform 250ms ease 50ms;
}
@media (hover: hover) and (pointer: fine) {
  .pj-card:hover .pj-play { transform: scale(1); }
}

.pj-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: var(--space-5);
}

.pj-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  padding: 8px 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 200ms;
}
@media (hover: hover) and (pointer: fine) {
  .pj-link:hover { color: var(--color-text-primary); }
}

/* ── Expansion overlay ─────────────────────────────────────────────── */
.pj-overlay {
  position: absolute;
  z-index: 55;
  isolation: isolate;
  overflow: hidden;
  border-radius: 12px;
  will-change: clip-path, transform, opacity;
}

.pj-expanded {
  position: relative;
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}
/* Matches LEFT_PANEL_RATIO_* — the flying card lands exactly here */
.pj-expanded-panel {
  width: 33.3333%;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  overflow: hidden;
}

.pj-expanded-content {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  background: var(--color-surface);
  padding: var(--space-6);
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}

.pj-close {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 10;
  display: flex;
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(19, 24, 21, 0.8);
  backdrop-filter: blur(6px);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color 200ms, color 200ms;
}
@media (hover: hover) and (pointer: fine) {
  .pj-close:hover { background: var(--color-surface); color: var(--color-text-primary); }
}

.pj-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  padding: 10px 20px;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 200ms, background-color 200ms;
}
.pj-btn-primary {
  background: var(--color-text-primary);
  color: var(--color-bg);
}
@media (hover: hover) and (pointer: fine) {
  .pj-btn-primary:hover { opacity: 0.9; }
}
.pj-btn-secondary {
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-primary);
}
@media (hover: hover) and (pointer: fine) {
  .pj-btn-secondary:hover { background: rgba(216,213,204,0.05); }
}

/* ── Mobile carousel ───────────────────────────────────────────────── */
.pj-carousel {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: var(--space-4);
  margin: 0 calc(-1 * var(--section-pad-x));
  padding-inline: var(--section-pad-x);
  cursor: grab;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.pj-carousel::-webkit-scrollbar { display: none; }
.pj-carousel-item {
  flex-shrink: 0;
  scroll-snap-align: center;
  /* 74 rather than 78: four more viewport-percent of the neighbouring cards
     showing on each side is the difference between a margin and a strip. */
  width: 74vw;
}

/* ── Swipe affordance ──────────────────────────────────────────────── */
.pj-swipe {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-2);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.pj-swipe-count {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.pj-swipe-of { color: var(--color-text-muted); }

.pj-swipe-rail {
  position: relative;
  flex: 1;
  height: 1px;
  background: var(--color-border);
}
.pj-swipe-fill {
  position: absolute;
  top: -1px;
  left: 0;
  height: 3px;
  background: var(--color-accent);
  transition: transform 260ms cubic-bezier(0.4, 0, 0.2, 1);
}

.pj-swipe-hint {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
  transition: opacity 400ms ease;
}
/* Fades rather than unmounts: the rail keeps its width, so retiring the
   hint does not shuffle the row it sits in. */
.pj-swipe-hint[data-done] { opacity: 0; }
.pj-swipe-hint[data-done] .pj-swipe-arrow { animation: none; }

.pj-swipe-arrow { animation: pj-nudge 1.9s ease-in-out infinite; }
@keyframes pj-nudge {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4px); }
}
@media (prefers-reduced-motion: reduce) {
  .pj-swipe-arrow { animation: none; }
  .pj-swipe-fill { transition: none; }
}

`;
