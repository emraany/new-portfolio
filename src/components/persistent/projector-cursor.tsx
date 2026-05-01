'use client';

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { gsap } from 'gsap';

export default function ProjectorCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<NodeListOf<HTMLDivElement> | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const isActiveRef = useRef(false);
  const targetCornerPositionsRef = useRef<{ x: number; y: number }[] | null>(null);
  const tickerFnRef = useRef<(() => void) | null>(null);
  const activeStrengthRef = useRef({ current: 0 });

  // Default to `false` so SSR and the first client render match. The real
  // value is computed in useEffect after mount; on touch devices we then
  // re-render to null. Hydrating with the same shape avoids the position
  // shift that previously misaligned AmbientType with the cursor div.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera: string }).opera;
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase());
    if ((hasTouchScreen && isSmallScreen) || isMobileUA) setIsMobile(true);
  }, []);

  const constants = useMemo(() => ({ borderWidth: 3, cornerSize: 12 }), []);

  const moveCursor = useCallback((x: number, y: number) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, { x, y, duration: 0.1, ease: 'power3.out' });
  }, []);

  useEffect(() => {
    if (isMobile || !cursorRef.current) return;

    const styleEl = document.createElement('style');
    styleEl.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(styleEl);

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll<HTMLDivElement>('.target-cursor-corner');

    let activeTarget: Element | null = null;
    let currentLeaveHandler: (() => void) | null = null;

    const cleanupTarget = (target: Element) => {
      if (currentLeaveHandler) {
        target.removeEventListener('mouseleave', currentLeaveHandler);
      }
      currentLeaveHandler = null;
    };

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });


    const tickerFn = () => {
      if (!targetCornerPositionsRef.current || !cursorRef.current || !cornersRef.current) return;
      const strength = activeStrengthRef.current.current;
      if (strength === 0) return;
      const cursorX = gsap.getProperty(cursorRef.current, 'x') as number;
      const cursorY = gsap.getProperty(cursorRef.current, 'y') as number;
      Array.from(cornersRef.current).forEach((corner, i) => {
        const currentX = gsap.getProperty(corner, 'x') as number;
        const currentY = gsap.getProperty(corner, 'y') as number;
        const targetX = targetCornerPositionsRef.current![i].x - cursorX;
        const targetY = targetCornerPositionsRef.current![i].y - cursorY;
        const finalX = currentX + (targetX - currentX) * strength;
        const finalY = currentY + (targetY - currentY) * strength;
        const duration = strength >= 0.99 ? 0.2 : 0.05;
        gsap.to(corner, { x: finalX, y: finalY, duration, ease: 'power1.out', overwrite: 'auto' });
      });
    };
    tickerFnRef.current = tickerFn;

    const moveHandler = (e: MouseEvent) => moveCursor(e.clientX, e.clientY);
    window.addEventListener('mousemove', moveHandler, { passive: true });

    const scrollHandler = () => {
      if (!activeTarget || !cursorRef.current) return;
      const mx = gsap.getProperty(cursorRef.current, 'x') as number;
      const my = gsap.getProperty(cursorRef.current, 'y') as number;
      const el = document.elementFromPoint(mx, my);
      if (!el || (el !== activeTarget && el.closest('.cursor-target') !== activeTarget)) {
        currentLeaveHandler?.();
        return;
      }
      // Recalculate corner positions with updated viewport rect after scroll
      const rect = activeTarget.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      targetCornerPositionsRef.current = [
        { x: rect.left  - borderWidth,             y: rect.top    - borderWidth              },
        { x: rect.right + borderWidth - cornerSize, y: rect.top    - borderWidth              },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left  - borderWidth,             y: rect.bottom + borderWidth - cornerSize },
      ];
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });

    const mouseDownHandler = () => {
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.3 });
      gsap.to(cursor, { scale: 0.9, duration: 0.2 });
    };
    const mouseUpHandler = () => {
      gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
      gsap.to(cursor, { scale: 1, duration: 0.2 });
    };
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    const enterHandler = (e: MouseEvent) => {
      let current: Element | null = e.target as Element;
      let target: Element | null = null;
      while (current && current !== document.body) {
        if (current.matches('.cursor-target')) { target = current; break; }
        current = current.parentElement;
      }
      if (!target || !cursorRef.current || !cornersRef.current) return;
      if (activeTarget === target) return;
      if (activeTarget) cleanupTarget(activeTarget);

      activeTarget = target;
      const corners = Array.from(cornersRef.current);
      corners.forEach(c => gsap.killTweensOf(c));

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const cursorX = gsap.getProperty(cursor, 'x') as number;
      const cursorY = gsap.getProperty(cursor, 'y') as number;

      targetCornerPositionsRef.current = [
        { x: rect.left  - borderWidth,              y: rect.top    - borderWidth              },
        { x: rect.right + borderWidth - cornerSize,  y: rect.top    - borderWidth              },
        { x: rect.right + borderWidth - cornerSize,  y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left  - borderWidth,              y: rect.bottom + borderWidth - cornerSize },
      ];

      isActiveRef.current = true;
      gsap.ticker.add(tickerFnRef.current!);
      gsap.to(activeStrengthRef.current, { current: 1, duration: 0.2, ease: 'power2.out' });

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCornerPositionsRef.current![i].x - cursorX,
          y: targetCornerPositionsRef.current![i].y - cursorY,
          duration: 0.2,
          ease: 'power2.out',
        });
      });

      const leaveHandler = () => {
        gsap.ticker.remove(tickerFnRef.current!);
        isActiveRef.current = false;
        targetCornerPositionsRef.current = null;
        gsap.set(activeStrengthRef.current, { current: 0, overwrite: true });
        activeTarget = null;

        if (cornersRef.current) {
          const { cornerSize } = constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x:  cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x:  cornerSize * 0.5, y:  cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y:  cornerSize * 0.5 },
          ];
          const tl = gsap.timeline();
          Array.from(cornersRef.current).forEach((c, i) => {
            tl.to(c, { x: positions[i].x, y: positions[i].y, duration: 0.3, ease: 'power3.out' }, 0);
          });
        }


        cleanupTarget(target);
      };

      currentLeaveHandler = leaveHandler;
      target.addEventListener('mouseleave', leaveHandler);
    };

    window.addEventListener('mouseover', enterHandler as EventListener);

    return () => {
      if (tickerFnRef.current) gsap.ticker.remove(tickerFnRef.current);
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', enterHandler as EventListener);
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      if (activeTarget) cleanupTarget(activeTarget);
      styleEl.remove();
      isActiveRef.current = false;
      targetCornerPositionsRef.current = null;
      activeStrengthRef.current.current = 0;
    };
  }, [isMobile, moveCursor, constants]);

  if (isMobile) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: 'var(--z-cursor)' as unknown as number,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Center dot */}
      <div
        ref={dotRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '4px',
          height: '4px',
          background: 'var(--color-text-primary)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          willChange: 'transform',
          opacity: 0.7,
        }}
      />
      {/* Corner brackets — TL, TR, BR, BL */}
      {[
        { transform: 'translate(-150%, -150%)', borderRight: 'none', borderBottom: 'none' },
        { transform: 'translate(50%, -150%)',   borderLeft:  'none', borderBottom: 'none' },
        { transform: 'translate(50%, 50%)',     borderLeft:  'none', borderTop:    'none' },
        { transform: 'translate(-150%, 50%)',   borderRight: 'none', borderTop:    'none' },
      ].map((style, i) => (
        <div
          key={i}
          className="target-cursor-corner"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '12px',
            height: '12px',
            border: '2px solid var(--color-text-primary)',
            opacity: 0.75,
            willChange: 'transform',
            ...style,
          }}
        />
      ))}
    </div>
  );
}
