'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Countdown
 *
 * SMPTE-style 5-count leader. Each count lasts exactly 1 second.
 * - Outer circle ring with 60 tick marks
 * - Rotating sweep hand (360° per count)
 * - Large count number in Playfair Display
 * - Focus reticle crosshair overlay
 * - 4 corner bracket marks
 * - Subtle frame-rate brightness flicker
 */

interface CountdownProps {
  onComplete: () => void;
}

const TOTAL_COUNTS = 3;
const TICK_COUNT = 60;

export default function Countdown({ onComplete }: CountdownProps) {
  const [currentCount, setCurrentCount] = useState(TOTAL_COUNTS);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [brightness, setBrightness] = useState(1);

  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const flickerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Subtle frame-rate flicker effect (dim-only; never brighter than 1)
  useEffect(() => {
    flickerIntervalRef.current = setInterval(() => {
      const flickerValue = 0.92 + Math.random() * 0.08;
      setBrightness(flickerValue);
      setTimeout(() => setBrightness(1), 16 + Math.random() * 16);
    }, 180 + Math.random() * 180);

    return () => {
      if (flickerIntervalRef.current) clearInterval(flickerIntervalRef.current);
    };
  }, []);

  // Main countdown animation loop
  useEffect(() => {
    const DURATION_PER_COUNT = 1000; // ms
    const TOTAL_DURATION = TOTAL_COUNTS * DURATION_PER_COUNT;

    startTimeRef.current = performance.now();

    let lastCount = TOTAL_COUNTS;

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const totalProgress = Math.min(elapsed / TOTAL_DURATION, 1);

      // Which count we're on (5, 4, 3, 2, 1)
      const countIndex = Math.floor(totalProgress * TOTAL_COUNTS);
      const safeIndex = Math.min(countIndex, TOTAL_COUNTS - 1);
      const count = TOTAL_COUNTS - safeIndex;

      // Sweep progress within current count (0 → 1)
      const countProgress = (totalProgress * TOTAL_COUNTS) - safeIndex;
      setSweepAngle(countProgress * 360);

      if (count !== lastCount) {
        setCurrentCount(count);
        lastCount = count;
      }

      if (totalProgress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        onCompleteRef.current();
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick marks on the outer ring
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const angle = (i / TICK_COUNT) * 360;
    const isMajor = i % 5 === 0;
    const rad = (angle - 90) * (Math.PI / 180);
    const outerR = 145;
    const innerR = isMajor ? 130 : 136;
    return {
      x1: 160 + Math.cos(rad) * innerR,
      y1: 160 + Math.sin(rad) * innerR,
      x2: 160 + Math.cos(rad) * outerR,
      y2: 160 + Math.sin(rad) * outerR,
    };
  });

  // Sweep hand path (SVG arc from 12 o'clock to current angle)
  const getSweepPath = (angleDeg: number) => {
    if (angleDeg <= 0) return '';
    const clampedAngle = Math.min(angleDeg, 359.99);
    const rad = (clampedAngle - 90) * (Math.PI / 180);
    const cx = 160, cy = 160, r = 110;
    const startX = cx;
    const startY = cy - r;
    const endX = cx + Math.cos(rad) * r;
    const endY = cy + Math.sin(rad) * r;
    const largeArc = clampedAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY} Z`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-intro)' as unknown as number,
        filter: `brightness(${brightness})`,
      }}
    >
      {/* Main SMPTE leader SVG */}
      <svg
        viewBox="0 0 320 320"
        width="min(80vmin, 480px)"
        height="min(80vmin, 480px)"
        aria-hidden="true"
        style={{ overflow: 'visible' }}
      >
        {/* Outer ring */}
        <circle
          cx="160"
          cy="160"
          r="148"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          opacity="0.6"
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="var(--color-accent)"
            strokeWidth={i % 5 === 0 ? 2 : 1}
            opacity={i % 5 === 0 ? 0.9 : 0.4}
          />
        ))}

        {/* Inner circle */}
        <circle
          cx="160"
          cy="160"
          r="120"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Sweep hand (filled arc, semi-transparent) */}
        <path
          d={getSweepPath(sweepAngle)}
          fill="var(--color-accent)"
          opacity="0.25"
        />

        {/* Sweep hand line */}
        {sweepAngle > 0 && (
          <line
            x1="160"
            y1="160"
            x2={160 + Math.cos(((sweepAngle - 90) * Math.PI) / 180) * 110}
            y2={160 + Math.sin(((sweepAngle - 90) * Math.PI) / 180) * 110}
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}

        {/* Center circle */}
        <circle cx="160" cy="160" r="6" fill="var(--color-accent)" opacity="0.8" />
        <circle cx="160" cy="160" r="3" fill="var(--color-accent)" />

        {/* Focus reticle crosshair — extends to edges */}
        <line x1="160" y1="0" x2="160" y2="60" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" />
        <line x1="160" y1="260" x2="160" y2="320" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" />
        <line x1="0" y1="160" x2="60" y2="160" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" />
        <line x1="260" y1="160" x2="320" y2="160" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" />

        {/* Inner reticle marks */}
        <line x1="160" y1="60" x2="160" y2="80" stroke="var(--color-accent)" strokeWidth="1" opacity="0.3" />
        <line x1="160" y1="240" x2="160" y2="260" stroke="var(--color-accent)" strokeWidth="1" opacity="0.3" />
        <line x1="60" y1="160" x2="80" y2="160" stroke="var(--color-accent)" strokeWidth="1" opacity="0.3" />
        <line x1="240" y1="160" x2="260" y2="160" stroke="var(--color-accent)" strokeWidth="1" opacity="0.3" />

        {/* 4 corner bracket marks (SMPTE corner markers) */}
        {/* Top-left */}
        <polyline points="10,30 10,10 30,10" fill="none" stroke="var(--color-accent)" strokeWidth="2" opacity="0.7" />
        {/* Top-right */}
        <polyline points="290,10 310,10 310,30" fill="none" stroke="var(--color-accent)" strokeWidth="2" opacity="0.7" />
        {/* Bottom-left */}
        <polyline points="10,290 10,310 30,310" fill="none" stroke="var(--color-accent)" strokeWidth="2" opacity="0.7" />
        {/* Bottom-right */}
        <polyline points="290,310 310,310 310,290" fill="none" stroke="var(--color-accent)" strokeWidth="2" opacity="0.7" />

        {/* Count number */}
        <AnimatePresence mode="wait">
          <motion.text
            key={currentCount}
            x="160"
            y="160"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-display)"
            fontSize="120"
            fontWeight="700"
            fill="var(--color-text-primary)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.15 }}
            style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
          >
            {currentCount}
          </motion.text>
        </AnimatePresence>
      </svg>
    </div>
  );
}
