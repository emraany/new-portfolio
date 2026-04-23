'use client';

import { motion } from 'framer-motion';

/**
 * DarkroomImage
 *
 * Wraps any image or poster with a darkroom-develop hover effect.
 * Default: slightly desaturated + dimmed (like an undeveloped photograph).
 * Hover: over 400ms ease-out, full saturation + brightness snap to 1.
 *
 * Also exports `darkroomImageClass` string for use in plain CSS.
 */

interface DarkroomImageProps {
  children: React.ReactNode;
  className?: string;
}

export const darkroomImageClass = 'darkroom-image';

export default function DarkroomImage({ children, className }: DarkroomImageProps) {
  return (
    <motion.div
      className={[darkroomImageClass, className].filter(Boolean).join(' ')}
      initial={{
        filter: 'saturate(0.7) brightness(0.85)',
      }}
      whileHover={{
        filter: 'saturate(1) brightness(1)',
        transition: {
          duration: 0.4,
          ease: [0.4, 0, 0.6, 1], // --ease-develop
        },
      }}
      style={{
        display: 'inline-block',
        position: 'relative',
      }}
    >
      {children}
    </motion.div>
  );
}
