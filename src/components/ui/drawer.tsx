'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

/**
 * Bottom-sheet drawer — ported from
 * ../Website/src/components/ui/drawer.tsx
 *
 * Same primitive (vaul) and the same hand-rolled grab-zone drag: the sheet
 * follows the finger down and dismisses past a threshold or a flick, else
 * springs back. The gesture engages only on a downward, vertical-dominant
 * pull, so a tap on a button or a horizontal swipe is never captured, and
 * a scrollable body keeps its native scroll.
 *
 * His iOS-26 "chrome zone" machinery is deliberately left behind — it
 * exists to hand Safari's system bars document pixels on his site and has
 * no counterpart here.
 */

const cx = (...v: Array<string | false | null | undefined>) => v.filter(Boolean).join(' ');

/** Lets DrawerContent close its own drawer without every call site
 *  threading an onDismiss prop — so every drawer is swipe-down-able. */
const DrawerCloseContext = React.createContext<(() => void) | null>(null);

const Drawer = ({
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => {
  const contextClose = React.useCallback(() => onOpenChange?.(false), [onOpenChange]);
  return (
    <DrawerCloseContext.Provider value={onOpenChange ? contextClose : null}>
      <DrawerPrimitive.Root onOpenChange={onOpenChange} {...props} />
    </DrawerCloseContext.Provider>
  );
};
Drawer.displayName = 'Drawer';

/** A nested sheet stacked over an open drawer. Supplies the same close
 *  context as `Drawer`, so it gets grab-zone drag-to-close for free. */
const NestedDrawer = ({
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.NestedRoot>) => {
  const contextClose = React.useCallback(() => onOpenChange?.(false), [onOpenChange]);
  return (
    <DrawerCloseContext.Provider value={onOpenChange ? contextClose : null}>
      <DrawerPrimitive.NestedRoot onOpenChange={onOpenChange} {...props} />
    </DrawerCloseContext.Provider>
  );
};
NestedDrawer.displayName = 'NestedDrawer';

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cx('drawer-overlay', className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const CLOSE_SPRING = 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)';

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
    /** Float the drag handle over the content, for full-bleed hero sheets,
     *  instead of reserving a strip above it. */
    overlayHandle?: boolean;
  }
>(({ className, children, overlayHandle = false, ...props }, ref) => {
  const dismiss = React.useContext(DrawerCloseContext) ?? undefined;

  const sheetRef = React.useRef<HTMLDivElement | null>(null);
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      sheetRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref]
  );

  const drag = React.useRef({
    phase: 'idle' as 'idle' | 'pending' | 'active' | 'canceled',
    startX: 0,
    startY: 0,
    dy: 0,
    t0: 0,
  });

  const settle = (shouldDismiss: boolean) => {
    const el = sheetRef.current;
    drag.current.phase = 'idle';
    if (!el) return;
    if (shouldDismiss && dismiss) {
      // Carry the motion the rest of the way out, then unmount via vaul.
      el.style.transition = CLOSE_SPRING;
      el.style.transform = 'translate3d(0, 100%, 0)';
      window.setTimeout(() => dismiss(), 240);
    } else {
      el.style.transition = CLOSE_SPRING;
      el.style.transform = 'translate3d(0, 0px, 0)';
      window.setTimeout(() => {
        if (el && drag.current.phase === 'idle') {
          el.style.transition = '';
          el.style.transform = '';
        }
      }, 340);
    }
  };

  const dragHandlers = dismiss
    ? {
        onPointerDown: (e: React.PointerEvent) => {
          if (e.button && e.button !== 0) return;
          drag.current = {
            phase: 'pending',
            startX: e.clientX,
            startY: e.clientY,
            dy: 0,
            t0: e.timeStamp,
          };
        },
        onPointerMove: (e: React.PointerEvent) => {
          const d = drag.current;
          if (d.phase === 'idle' || d.phase === 'canceled') return;
          const dx = e.clientX - d.startX;
          const dy = e.clientY - d.startY;
          if (d.phase === 'pending') {
            // Engage only on a clearly downward, vertical-dominant gesture;
            // hand horizontal off, ignore taps and upward drags.
            if (dy >= 8 && dy > Math.abs(dx) * 1.2) {
              d.phase = 'active';
              if (sheetRef.current) sheetRef.current.style.transition = 'none';
              (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            } else if (Math.abs(dx) >= 8 || dy <= -8) {
              d.phase = 'canceled';
            }
            return;
          }
          const y = Math.max(0, dy);
          d.dy = y;
          if (sheetRef.current) sheetRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
        },
        onPointerUp: (e: React.PointerEvent) => {
          if (drag.current.phase !== 'active') {
            drag.current.phase = 'idle';
            return;
          }
          const { dy, t0 } = drag.current;
          const dt = Math.max(1, e.timeStamp - t0);
          const velocity = dy / dt; // px per ms
          const h = sheetRef.current?.getBoundingClientRect().height ?? 600;
          // A modest pull (~20% of the sheet, capped) or a light flick.
          settle(dy > Math.min(110, h * 0.2) || (velocity > 0.4 && dy > 20));
        },
        onPointerCancel: () => {
          if (drag.current.phase === 'active') settle(false);
          else drag.current.phase = 'idle';
        },
      }
    : {};

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={setRefs}
        className={cx('drawer-sheet', className)}
        {...props}
      >
        {/* Grab zone. With `overlayHandle` the whole hero is the drag
            target — a photo-viewer-style pull-down — leaving the
            scrollable body below untouched. */}
        <div
          data-drawer-grab-zone
          {...dragHandlers}
          className={cx('drawer-grab', overlayHandle && 'drawer-grab-overlay')}
        >
          <div className={cx('drawer-handle', overlayHandle && 'drawer-handle-overlay')} />
        </div>
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cx('drawer-header', className)} {...props} />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerTitle = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title ref={ref} className={cx('drawer-title', className)} {...props} />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description ref={ref} className={cx(className)} {...props} />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  NestedDrawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
};
