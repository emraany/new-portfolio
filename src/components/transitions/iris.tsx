'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Iris
 *
 * Camera aperture animation using a radial clip-path technique.
 * IrisOpen: reveals content from center outward (blades open).
 * IrisClose: covers content from outside inward (blades close).
 *
 * The "blade" effect is approximated with a polygon clip-path
 * that starts as a closed octagon and expands to fully cover
 * (or uncover) the viewport.
 *
 * Exports: IrisOpen (default), IrisClose (named)
 */

interface IrisProps {
  onComplete?: () => void;
  duration?: number;
}

// Generate an N-pointed star polygon approximating camera iris blades.
// radius 0 = fully closed, radius 1 = fully open (covers the viewport diagonal).
function getIrisPolygon(radius: number, blades: number = 7): string {
  const cx = 50; // percent
  const cy = 50;
  // The outer radius needs to cover the full viewport when open.
  // We use viewport-unit equivalent by working in % of the max dimension.
  // We'll apply the polygon to a 100vmax × 100vmax element.
  const points: string[] = [];
  for (let i = 0; i < blades * 2; i++) {
    const angle = ((i * Math.PI) / blades) - Math.PI / 2;
    // Alternate between outer (blade tip) and inner (blade notch) vertices.
    const r = i % 2 === 0 ? radius : radius * 0.72;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(', ')})`;
}

// Closed = tiny polygon at center; Open = polygon that covers the full area
const CLOSED = getIrisPolygon(0.5, 7);
const OPEN = getIrisPolygon(120, 7); // 120% ensures full coverage

/**
 * IrisOpen — blades start closed, animate outward to reveal content.
 */
export default function IrisOpen({ onComplete, duration = 800 }: IrisProps) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 'var(--z-intro)' as unknown as number,
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: duration / 1000, duration: 0.1 }}
      onAnimationComplete={() => onCompleteRef.current?.()}
    >
      {/* The iris mask overlay — starts covering everything, opens to nothing */}
      <motion.div
        style={{
          position: 'absolute',
          inset: '-50%',
          backgroundColor: '#000000',
          clipPath: CLOSED,
        }}
        initial={{ clipPath: OPEN }}
        animate={{ clipPath: CLOSED }}
        transition={{
          duration: duration / 1000,
          ease: [0.4, 0, 0.2, 1], // --ease-snap
        }}
      />
    </motion.div>
  );
}

/**
 * IrisClose — blades start open, animate inward to cover content.
 */
export function IrisClose({ onComplete, duration = 800 }: IrisProps) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 'var(--z-intro)' as unknown as number,
      }}
    >
      {/* Iris overlay — starts open (tiny), closes to cover everything */}
      <motion.div
        style={{
          position: 'absolute',
          inset: '-50%',
          backgroundColor: '#000000',
          clipPath: CLOSED,
        }}
        initial={{ clipPath: CLOSED }}
        animate={{ clipPath: OPEN }}
        transition={{
          duration: duration / 1000,
          ease: [0.4, 0, 0.2, 1],
        }}
        onAnimationComplete={() => onCompleteRef.current?.()}
      />
    </motion.div>
  );
}
