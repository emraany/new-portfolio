'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

// ---------------------------------------------------------------------------
// Focus Reticle — inline SVG crosshair-in-circle at cursor center
// ---------------------------------------------------------------------------

function FocusReticle() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle
        cx="8"
        cy="8"
        r="6.5"
        stroke="var(--color-accent)"
        strokeWidth="0.75"
        opacity="0.9"
      />
      {/* Horizontal crosshair */}
      <line
        x1="1"
        y1="8"
        x2="15"
        y2="8"
        stroke="var(--color-accent)"
        strokeWidth="0.75"
        opacity="0.9"
      />
      {/* Vertical crosshair */}
      <line
        x1="8"
        y1="1"
        x2="8"
        y2="15"
        stroke="var(--color-accent)"
        strokeWidth="0.75"
        opacity="0.9"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ProjectorCursor
// ---------------------------------------------------------------------------

export default function ProjectorCursor() {
  // Detect touch/coarse pointer devices — disable on mobile.
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (!isCoarse) {
      setIsEnabled(true);
    }
  }, []);

  // Raw mouse position (updated on every mousemove).
  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);

  // Springy position — gives the ~50ms trailing lag feel.
  const springConfig = { stiffness: 150, damping: 20 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Track mouse position.
  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isEnabled, mouseX, mouseY]);

  // Hide / restore native cursor on body.
  const originalCursorRef = useRef<string>('');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!isEnabled) {
      // Restore cursor if we somehow flipped isEnabled to false.
      document.body.style.cursor = originalCursorRef.current;
      return;
    }

    originalCursorRef.current = document.body.style.cursor;
    document.body.style.cursor = 'none';

    return () => {
      document.body.style.cursor = originalCursorRef.current;
    };
  }, [isEnabled]);

  // Nothing to render on touch devices.
  if (!isEnabled) return null;

  return (
    /*
     * motion.div positioned at the spring-interpolated cursor coords.
     * translateX / translateY of -50% centers the 240×240 glow on the
     * exact cursor position.
     *
     * pointer-events: none — must never intercept clicks.
     * mix-blend-mode: screen — brightens content beneath.
     * z-index: var(--z-cursor) — sits above everything.
     */
    <motion.div
      aria-hidden="true"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '240px',
        height: '240px',
        pointerEvents: 'none',
        zIndex: 'var(--z-cursor)' as unknown as number,
        willChange: 'transform',
        mixBlendMode: 'screen',
        // Soft warm radial glow — amber at center fading to transparent.
        background:
          'radial-gradient(circle, rgba(200,169,110,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
      }}
    >
      {/* Focus reticle — centered inside the glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          // Snap mix-blend-mode back to normal so the reticle
          // renders at full opacity regardless of blend layer.
          mixBlendMode: 'normal',
        }}
      >
        <FocusReticle />
      </div>
    </motion.div>
  );
}
