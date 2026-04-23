'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * FocusPull
 *
 * Wraps children with a blur(4px) → blur(0) animation over 800ms ease-out.
 * Triggers on mount by default, or when the `trigger` prop becomes true.
 * Optional `delay` in milliseconds before the pull starts.
 */

interface FocusPullProps {
  children: React.ReactNode;
  trigger?: boolean;
  delay?: number;
}

export default function FocusPull({
  children,
  trigger = true,
  delay = 0,
}: FocusPullProps) {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    const timer = setTimeout(() => {
      setIsFocused(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [trigger, delay]);

  return (
    <motion.div
      animate={{
        filter: isFocused ? 'blur(0px)' : 'blur(4px)',
      }}
      initial={{
        filter: 'blur(4px)',
      }}
      transition={{
        duration: 0.8,
        ease: [0, 0, 0.2, 1], // ease-out curve
      }}
      style={{ display: 'contents' }}
    >
      {children}
    </motion.div>
  );
}
