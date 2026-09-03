'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  SCROLL_COLLAPSE_THRESHOLD,
  EXPAND_DURATION,
  COLLAPSE_DURATION,
  CONTENT_FADE_DELAY,
  EXPAND_EASE,
  COLLAPSE_EASE,
  TILE_RADIUS,
  LEFT_PANEL_RATIO_2COL,
  LEFT_PANEL_RATIO_3COL,
  VISUAL_ASPECT,
} from './grid-expansion-config';

/**
 * Grid expansion — ported from
 * ../Website/src/components/portfolio/hooks/useGridExpansion.ts
 *
 * Clicking a card doesn't open a modal. The card itself is lifted out of
 * grid flow into `position: absolute` and GSAP-flown into the left panel
 * of a full-width overlay that clips open from exactly the card's own
 * column bounds — so the card never leaves the page, it just widens into
 * its own detail view. Closing reverses the same two tweens.
 *
 * Deviation from the original: his tiles have a fixed-height visual, so
 * his overlay height is just the grid slot's height. Our visual is 16/10,
 * so a card flying into the wider panel also grows taller — see
 * `VISUAL_ASPECT` and `expandedHeight` below.
 */

interface UseGridExpansionOptions {
  gridRef: React.RefObject<HTMLDivElement | null>;
}

interface OverlayPosition {
  top: number;
  left: number;
  right: number;
  height: number; // expanded overlay height
  slotHeight: number; // original tile height — used for grid slot minHeight only
}

interface SourceRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function useGridExpansion({ gridRef }: UseGridExpansionOptions) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [overlayPosition, setOverlayPosition] = useState<OverlayPosition | null>(null);
  const [initialClip, setInitialClip] = useState<string | null>(null);
  const [isDesktopGrid, setIsDesktopGrid] = useState(false);
  const [pendingExpand, setPendingExpand] = useState<number | null>(null);
  const [fadingOutIndex, setFadingOutIndex] = useState<number | null>(null);
  const [fadingOutHeight, setFadingOutHeight] = useState<number | null>(null);
  const isAnimating = useRef(false);
  const expandedTileRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const sourceClipRef = useRef<{ left: number; right: number } | null>(null);

  // Track the source tile element being animated
  const sourceTileElRef = useRef<HTMLElement | null>(null);
  const sourceRectRef = useRef<SourceRect | null>(null);
  // Precomputed target rect for the tile's final position (left panel of overlay)
  const targetRectRef = useRef<SourceRect | null>(null);
  const rafRef = useRef<number>(0);
  // Signals the expansion effect to use opacity crossfade instead of clipPath fromTo
  const touchSwapRef = useRef(false);

  /**
   * Immediately restore the source tile to normal grid flow (no animation).
   * @param unhideSlot — When true, also clear the grid slot's visibility:hidden
   *   so the tile is visible in its grid position. Used by scroll-collapse where
   *   React state hasn't cleared expandedIndex yet (overlay animation still playing).
   */
  const restoreTile = useCallback((unhideSlot = false) => {
    const tile = sourceTileElRef.current;
    if (tile) {
      gsap.killTweensOf(tile);

      // Unhide the grid slot BEFORE removing the tile's visibility override.
      // Otherwise the tile briefly inherits visibility:hidden from the slot.
      if (unhideSlot) {
        const gridSlot = tile.closest('[data-grid-slot]') as HTMLElement | null;
        if (gridSlot) {
          gridSlot.style.minHeight = '';
          gridSlot.style.visibility = '';
        }
      }

      // Kill CSS transition before clearing props so the tile doesn't
      // animate its `top` property back (the hover raise).
      tile.style.transition = 'none';
      gsap.set(tile, { clearProps: 'position,left,top,width,height,zIndex,borderRadius' });
      tile.style.removeProperty('visibility');
      delete tile.dataset.expanded;
      requestAnimationFrame(() => {
        tile.style.transition = '';
      });
    }
    sourceTileElRef.current = null;
    sourceRectRef.current = null;
    sourceClipRef.current = null;
    targetRectRef.current = null;
  }, []);

  /** Lock the grid's current height to prevent reflow during animations. */
  const lockGrid = useCallback(() => {
    const grid = gridRef.current;
    if (grid) grid.style.height = `${grid.offsetHeight}px`;
  }, [gridRef]);

  /** Release the grid height lock. */
  const unlockGrid = useCallback(() => {
    const grid = gridRef.current;
    if (grid) grid.style.height = '';
  }, [gridRef]);

  const getColumnCount = useCallback((): number => {
    const el = gridRef.current;
    if (!el) return 1;
    return getComputedStyle(el).gridTemplateColumns.split(' ').length;
  }, [gridRef]);

  // Expansion overlay is only used on the 3-column desktop grid. Narrower
  // layouts open the screening panel instead.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    setIsDesktopGrid(mql.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsDesktopGrid(e.matches);
      if (!e.matches) {
        restoreTile();
        unlockGrid();
        setExpandedIndex(null);
        setOverlayPosition(null);
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [restoreTile, unlockGrid]);

  // Collapse on window resize (column count may change)
  useEffect(() => {
    if (expandedIndex === null) return;
    const handleResize = () => {
      restoreTile();
      unlockGrid();
      setExpandedIndex(null);
      setOverlayPosition(null);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [expandedIndex, restoreTile, unlockGrid]);

  const collapse = useCallback(() => {
    if (isAnimating.current) return;
    if (expandedIndex === null) return;

    const overlayEl = expandedTileRef.current;
    const tileEl = sourceTileElRef.current;
    const sourceRect = sourceRectRef.current;

    if (!overlayEl) {
      restoreTile();
      setExpandedIndex(null);
      setOverlayPosition(null);
      return;
    }

    isAnimating.current = true;
    const clip = sourceClipRef.current;

    // One timeline so both tweens stay in sync and cleanup runs once,
    // after BOTH finish.
    const tl = gsap.timeline({
      onComplete: () => {
        // Hide overlay before clearing props to prevent a one-frame flash
        gsap.set(overlayEl, { visibility: 'hidden' });
        gsap.set(overlayEl, { clearProps: 'clipPath' });
        isAnimating.current = false;

        if (tileEl) {
          const gridSlot = tileEl.closest('[data-grid-slot]') as HTMLElement | null;
          if (gridSlot) {
            // Clear minHeight BEFORE making the slot visible, or the slot
            // paints one frame at its stale expanded height.
            gridSlot.style.minHeight = '';
            gridSlot.style.visibility = '';
          }
          tileEl.style.transition = 'none';
          gsap.set(tileEl, { clearProps: 'position,left,top,width,height,zIndex,borderRadius' });
          tileEl.style.removeProperty('visibility');
          delete tileEl.dataset.expanded;
          requestAnimationFrame(() => {
            tileEl.style.transition = '';
          });
        }
        sourceTileElRef.current = null;
        sourceRectRef.current = null;
        sourceClipRef.current = null;
        targetRectRef.current = null;

        unlockGrid();
        setExpandedIndex(null);
        setOverlayPosition(null);
        setInitialClip(null);
        previousFocusRef.current?.focus({ preventScroll: true });
        previousFocusRef.current = null;
      },
    });

    // Clip the overlay inward, back toward the source column
    tl.to(
      overlayEl,
      {
        clipPath: clip
          ? `inset(0px ${clip.right}px 0px ${clip.left}px round ${TILE_RADIUS}px)`
          : `inset(0px 30% 0px 30% round ${TILE_RADIUS}px)`,
        duration: COLLAPSE_DURATION,
        ease: COLLAPSE_EASE,
      },
      0
    );

    // Fly the tile back to its grid position, in sync
    if (tileEl && sourceRect) {
      tl.to(
        tileEl,
        {
          left: sourceRect.left,
          top: sourceRect.top,
          width: sourceRect.width,
          height: sourceRect.height,
          borderRadius: TILE_RADIUS,
          duration: COLLAPSE_DURATION,
          ease: COLLAPSE_EASE,
        },
        0
      );
    }
  }, [expandedIndex, restoreTile, unlockGrid]);

  const expand = useCallback(
    (index: number) => {
      if (isAnimating.current) return;
      if (expandedIndex === index) return;

      lockGrid();

      // Another tile already open — swap.
      // Touch: collapse and expand play together. Pointer: collapse first,
      // then expand from the queue.
      if (expandedIndex !== null) {
        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        if (isTouch) {
          cancelAnimationFrame(rafRef.current);
          const overlayEl = expandedTileRef.current;
          if (overlayEl) gsap.killTweensOf(overlayEl);

          const oldTileEl = sourceTileElRef.current;
          if (oldTileEl) gsap.killTweensOf(oldTileEl);
          const oldSourceRect = sourceRectRef.current;

          setFadingOutIndex(expandedIndex);
          setFadingOutHeight(overlayPosition?.slotHeight ?? null);

          if (oldTileEl) {
            const oldSlot = oldTileEl.closest('[data-grid-slot]') as HTMLElement | null;
            const finish = () => {
              gsap.set(oldTileEl, {
                clearProps: 'position,left,top,width,height,zIndex,borderRadius,opacity',
              });
              oldTileEl.style.removeProperty('visibility');
              delete oldTileEl.dataset.expanded;
              if (oldSlot) {
                oldSlot.style.minHeight = '';
                oldSlot.style.visibility = '';
              }
              setFadingOutIndex(null);
              setFadingOutHeight(null);
            };
            if (oldSourceRect) {
              gsap.to(oldTileEl, {
                left: oldSourceRect.left,
                top: oldSourceRect.top,
                width: oldSourceRect.width,
                height: oldSourceRect.height,
                borderRadius: TILE_RADIUS,
                duration: COLLAPSE_DURATION,
                ease: COLLAPSE_EASE,
                onComplete: finish,
              });
            } else {
              gsap.to(oldTileEl, {
                opacity: 0,
                duration: COLLAPSE_DURATION * 0.5,
                ease: COLLAPSE_EASE,
                onComplete: finish,
              });
            }
          } else {
            setFadingOutIndex(null);
            setFadingOutHeight(null);
          }

          // Briefly fade the overlay so the content switch isn't jarring —
          // the expansion effect fades it back in with the new project.
          if (overlayEl) {
            gsap.to(overlayEl, {
              opacity: 0,
              duration: COLLAPSE_DURATION * 0.25,
              ease: COLLAPSE_EASE,
            });
          }

          touchSwapRef.current = true;

          sourceTileElRef.current = null;
          sourceRectRef.current = null;
          sourceClipRef.current = null;
          targetRectRef.current = null;
          isAnimating.current = false;
          // Fall through — both animations play at once.
        } else {
          setPendingExpand(index);
          collapse();
          return;
        }
      }

      previousFocusRef.current = document.activeElement as HTMLElement;

      const grid = gridRef.current;
      if (!grid) return;

      const slots = Array.from(
        grid.querySelectorAll<HTMLElement>(':scope > [data-grid-slot]')
      );
      const gridSlot = slots[index];
      if (!gridSlot) return;

      const tileEl = gridSlot.querySelector<HTMLElement>('[data-tile-root]') ?? gridSlot;

      // ── Drop the hover raise instantly, before measuring ──
      tileEl.dataset.expanded = '';
      tileEl.style.transition = 'none';
      void tileEl.offsetHeight; // force style recalc

      // ── Batch all layout reads (tile now sits un-raised) ──
      const firstRect = tileEl.getBoundingClientRect();
      const gridRect = grid.getBoundingClientRect();
      const slotOffsetLeft = gridSlot.offsetLeft;
      const slotHeight = gridSlot.offsetHeight;
      const slotWidth = gridSlot.offsetWidth;
      const gridWidth = grid.offsetWidth;

      // ── Correct for inflated offsetTop during a touch swap ──
      // The previously expanded slot still carries minHeight: overlayHeight,
      // which pushes down everything below it. Subtract the excess so the
      // new overlay lands where it belongs.
      let rawSlotOffsetTop = gridSlot.offsetTop;
      let rawTileGridTop = firstRect.top - gridRect.top;
      if (touchSwapRef.current && expandedIndex !== null && overlayPosition) {
        const oldSlot = slots[expandedIndex];
        if (oldSlot && oldSlot.offsetTop < rawSlotOffsetTop) {
          const excess = overlayPosition.height - overlayPosition.slotHeight;
          rawSlotOffsetTop -= excess;
          rawTileGridTop -= excess;
        }
      }
      const slotOffsetTop = rawSlotOffsetTop;

      // ── Derived values ──
      const gridPadding = parseFloat(getComputedStyle(grid).paddingLeft) || 0;
      const overlayWidth = gridWidth - 2 * gridPadding;
      const clip = {
        left: slotOffsetLeft - gridPadding,
        right: gridWidth - gridPadding - slotOffsetLeft - slotWidth,
      };

      const cols = getColumnCount();
      const panelRatio = cols >= 3 ? LEFT_PANEL_RATIO_3COL : LEFT_PANEL_RATIO_2COL;
      const panelWidth = overlayWidth * panelRatio;

      // Our 16/10 visual grows with the tile, so the overlay must be tall
      // enough for the widened card (his fixed-height visual needed no
      // correction here).
      const expandedHeight = slotHeight + Math.max(0, panelWidth - slotWidth) * VISUAL_ASPECT;

      const overlayPos = {
        top: slotOffsetTop,
        left: gridPadding,
        right: gridPadding,
        height: expandedHeight,
        slotHeight,
      };

      targetRectRef.current = {
        left: gridPadding,
        top: slotOffsetTop,
        width: panelWidth,
        height: expandedHeight,
      };

      // ── Store refs (grid-relative coordinates) ──
      sourceRectRef.current = {
        left: firstRect.left - gridRect.left,
        top: rawTileGridTop,
        width: firstRect.width,
        height: firstRect.height,
      };
      sourceTileElRef.current = tileEl;
      sourceClipRef.current = clip;

      // ── Lift the tile out of flow (write phase) ──
      // Absolute, not fixed, so it scrolls with the page.
      tileEl.style.transition = '';
      gsap.set(tileEl, {
        position: 'absolute',
        left: sourceRectRef.current.left,
        top: sourceRectRef.current.top,
        width: firstRect.width,
        height: firstRect.height,
        zIndex: 56,
        visibility: 'visible',
      });

      // ── React state (batched) ──
      setOverlayPosition(overlayPos);
      if (!touchSwapRef.current) {
        setInitialClip(`inset(0px ${clip.right}px 0px ${clip.left}px round ${TILE_RADIUS}px)`);
      }
      setExpandedIndex(index);
    },
    [expandedIndex, overlayPosition, gridRef, collapse, lockGrid, getColumnCount]
  );

  // Stable ref so the pending-expand effect always calls the latest expand
  const expandRef = useRef(expand);
  expandRef.current = expand;

  // After a collapse finishes, trigger any queued expansion
  useEffect(() => {
    if (pendingExpand !== null && expandedIndex === null && !isAnimating.current) {
      const index = pendingExpand;
      setPendingExpand(null);
      expandRef.current(index);
    }
  }, [pendingExpand, expandedIndex]);

  // FLIP expand — deferred to rAF so tweens start after paint
  useEffect(() => {
    if (expandedIndex === null) return;
    const overlayEl = expandedTileRef.current;
    const tileEl = sourceTileElRef.current;
    if (!overlayEl) return;

    const clip = sourceClipRef.current;
    const target = targetRectRef.current;
    const isTouchSwap = touchSwapRef.current;
    touchSwapRef.current = false;

    isAnimating.current = true;

    rafRef.current = requestAnimationFrame(() => {
      gsap.set(overlayEl, { visibility: 'visible', pointerEvents: 'auto' });
      // Kill the brief fade-out started during a touch swap
      gsap.killTweensOf(overlayEl);

      const content = overlayEl.querySelector<HTMLElement>('[data-expand-content]');
      const done = () => {
        isAnimating.current = false;
        overlayEl
          .querySelector<HTMLButtonElement>('[data-expand-close]')
          ?.focus({ preventScroll: true });
      };

      if (isTouchSwap) {
        // The old tile is already flying back — crossfade the overlay.
        gsap.fromTo(
          overlayEl,
          { opacity: 0 },
          { opacity: 1, duration: EXPAND_DURATION, ease: EXPAND_EASE, onComplete: done }
        );
      } else if (clip) {
        setInitialClip(null);

        gsap.fromTo(
          overlayEl,
          { clipPath: `inset(0px ${clip.right}px 0px ${clip.left}px round ${TILE_RADIUS}px)` },
          {
            clipPath: `inset(0px 0px 0px 0px round ${TILE_RADIUS}px)`,
            duration: EXPAND_DURATION,
            ease: EXPAND_EASE,
            onComplete: () => {
              gsap.set(overlayEl, { clearProps: 'clipPath' });
              done();
            },
          }
        );

        if (content) {
          gsap.fromTo(
            content,
            { opacity: 0 },
            {
              opacity: 1,
              duration: COLLAPSE_DURATION,
              delay: CONTENT_FADE_DELAY,
              ease: EXPAND_EASE,
            }
          );
        }
      } else {
        gsap.fromTo(
          overlayEl,
          { opacity: 0 },
          { opacity: 1, duration: EXPAND_DURATION, ease: EXPAND_EASE, onComplete: done }
        );
      }

      // Fly the tile from its grid position into the left panel
      if (tileEl && target) {
        gsap.to(tileEl, {
          left: target.left,
          top: target.top,
          width: target.width,
          height: target.height,
          borderRadius: `${TILE_RADIUS}px 0 0 ${TILE_RADIUS}px`,
          duration: EXPAND_DURATION,
          ease: EXPAND_EASE,
        });
      }
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [expandedIndex]);

  // Animated collapse on scroll — only past a meaningful distance, so small
  // adjustments don't dismiss the tile.
  useEffect(() => {
    if (expandedIndex === null) return;
    const scrollStart = window.scrollY;
    let dismissed = false;

    const handleScroll = () => {
      if (dismissed) return;
      if (Math.abs(window.scrollY - scrollStart) < SCROLL_COLLAPSE_THRESHOLD) return;
      dismissed = true;

      const overlayEl = expandedTileRef.current;
      const tileEl = sourceTileElRef.current;
      const clip = sourceClipRef.current;
      const sourceRect = sourceRectRef.current;

      cancelAnimationFrame(rafRef.current);
      if (overlayEl) gsap.killTweensOf(overlayEl);
      if (tileEl) gsap.killTweensOf(tileEl);

      if (!overlayEl) {
        restoreTile(true);
        unlockGrid();
        setExpandedIndex(null);
        setOverlayPosition(null);
        setInitialClip(null);
        previousFocusRef.current = null;
        return;
      }

      isAnimating.current = true;

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlayEl, { visibility: 'hidden' });
          gsap.set(overlayEl, { clearProps: 'clipPath' });
          isAnimating.current = false;

          if (tileEl) {
            const gridSlot = tileEl.closest('[data-grid-slot]') as HTMLElement | null;
            if (gridSlot) {
              gridSlot.style.minHeight = '';
              gridSlot.style.visibility = '';
            }
            tileEl.style.transition = 'none';
            gsap.set(tileEl, {
              clearProps: 'position,left,top,width,height,zIndex,borderRadius',
            });
            tileEl.style.removeProperty('visibility');
            delete tileEl.dataset.expanded;
            requestAnimationFrame(() => {
              tileEl.style.transition = '';
            });
          }
          sourceTileElRef.current = null;
          sourceRectRef.current = null;
          sourceClipRef.current = null;
          targetRectRef.current = null;

          unlockGrid();
          setExpandedIndex(null);
          setOverlayPosition(null);
          setInitialClip(null);
          // Don't refocus or run a queued expand — the user scrolled away
          previousFocusRef.current = null;
          setPendingExpand(null);
        },
      });

      tl.to(
        overlayEl,
        {
          clipPath: clip
            ? `inset(0px ${clip.right}px 0px ${clip.left}px round ${TILE_RADIUS}px)`
            : `inset(0px 30% 0px 30% round ${TILE_RADIUS}px)`,
          duration: COLLAPSE_DURATION,
          ease: COLLAPSE_EASE,
        },
        0
      );

      if (tileEl && sourceRect) {
        tl.to(
          tileEl,
          {
            left: sourceRect.left,
            top: sourceRect.top,
            width: sourceRect.width,
            height: sourceRect.height,
            borderRadius: TILE_RADIUS,
            duration: COLLAPSE_DURATION,
            ease: COLLAPSE_EASE,
          },
          0
        );
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [expandedIndex, restoreTile, unlockGrid]);

  // Click outside to close — but let expand() handle a click on another tile
  useEffect(() => {
    if (expandedIndex === null) return;
    const handleMouseDown = (e: MouseEvent) => {
      const overlayEl = expandedTileRef.current;
      const tileEl = sourceTileElRef.current;
      const grid = gridRef.current;
      if (!overlayEl) return;
      const target = e.target as Node;
      if (overlayEl.contains(target)) return;
      if (tileEl?.contains(target)) return;
      if (
        grid &&
        target instanceof Element &&
        target.closest('[data-grid-slot]') &&
        grid.contains(target)
      ) {
        return;
      }
      collapse();
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [expandedIndex, collapse, gridRef]);

  // Escape to close
  useEffect(() => {
    if (expandedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') collapse();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expandedIndex, collapse]);

  // Scrolled fully out of view — close
  useEffect(() => {
    if (expandedIndex === null) return;
    const el = expandedTileRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) collapse();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [expandedIndex, collapse]);

  return {
    expandedIndex,
    fadingOutIndex,
    fadingOutHeight,
    overlayPosition,
    initialClip,
    isDesktopGrid,
    expandedTileRef,
    expand,
    collapse,
  };
}
