'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IrisClose } from '../transitions/iris';
import { projects } from '@/data/projects';

/**
 * CreditsRoll
 *
 * Full-viewport end credits in pure black/white.
 * Auto-scrolls at ~60px/second. User can scroll manually (pauses 1.5s).
 * IrisClose triggers when FIN reaches viewport center.
 * After IrisClose + 3s black → [ ROLL CREDITS AGAIN ] button.
 *
 * No film grain in this section (isolated stacking context above grain layer).
 */

interface CreditsRollProps {
  isActive: boolean;
  onComplete?: () => void;
}

type CreditsStage = 'scrolling' | 'iris-close' | 'black' | 'ended';

interface CreditBlock {
  type: 'heading' | 'label' | 'name' | 'spacer' | 'divider' | 'fin';
  text?: string;
}

function buildCreditsContent(): CreditBlock[] {
  const projectNames = projects.map((p) => p.title.toUpperCase());

  return [
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'label', text: 'A EMRAAN YUSUF PRODUCTION' },
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'divider' },
    { type: 'spacer' },
    { type: 'label', text: 'Written and Directed by' },
    { type: 'spacer' },
    { type: 'heading', text: 'EMRAAN YUSUF' },
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'divider' },
    { type: 'spacer' },
    { type: 'label', text: 'Starring' },
    { type: 'spacer' },
    ...projectNames.map((title): CreditBlock => ({ type: 'name', text: title })),
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'divider' },
    { type: 'spacer' },
    { type: 'label', text: 'Technical Direction' },
    { type: 'spacer' },
    { type: 'name', text: 'TYPESCRIPT · PYTHON · REACT' },
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'divider' },
    { type: 'spacer' },
    { type: 'label', text: 'Special Thanks' },
    { type: 'spacer' },
    // TODO: Emraan — fill in names here
    { type: 'name', text: '— — —' },
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'divider' },
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'fin' },
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'spacer' },
  ];
}

const CREDITS_CONTENT: CreditBlock[] = buildCreditsContent();
const SCROLL_SPEED = 60; // px per second

export default function CreditsRoll({ isActive, onComplete }: CreditsRollProps) {
  const [stage, setStage] = useState<CreditsStage>('scrolling');
  const [showRollAgain, setShowRollAgain] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const isAutoScrollingRef = useRef(true);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef = useRef<CreditsStage>('scrolling');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { stageRef.current = stage; }, [stage]);

  // Reset on re-activation
  useEffect(() => {
    if (!isActive) return;
    setStage('scrolling');
    setShowRollAgain(false);
    scrollPosRef.current = 0;
    isAutoScrollingRef.current = true;
    lastTimeRef.current = 0;
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [isActive]);

  // Auto-scroll animation loop
  useEffect(() => {
    if (!isActive) return;

    const animate = (timestamp: number) => {
      if (!containerRef.current || stageRef.current !== 'scrolling') return;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const delta = (timestamp - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = timestamp;

      if (isAutoScrollingRef.current) {
        scrollPosRef.current += SCROLL_SPEED * delta;
        containerRef.current.scrollTop = scrollPosRef.current;
      } else {
        // User is manually scrolling — sync our tracked position
        scrollPosRef.current = containerRef.current.scrollTop;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [isActive]);

  // Handle manual scroll — pause auto-scroll for 1.5s, then resume
  const handleScroll = useCallback(() => {
    if (stageRef.current !== 'scrolling') return;

    // Pause auto-scroll
    isAutoScrollingRef.current = false;

    // Clear any pending resume timer
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    // Resume auto-scroll after 1.5s of no manual scroll input
    pauseTimerRef.current = setTimeout(() => {
      isAutoScrollingRef.current = true;
      if (containerRef.current) {
        scrollPosRef.current = containerRef.current.scrollTop;
      }
      pauseTimerRef.current = null;
    }, 1500);
  }, []);

  // IntersectionObserver on FIN element to trigger iris close when FIN hits center
  useEffect(() => {
    if (!isActive || !finRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && stageRef.current === 'scrolling') {
            isAutoScrollingRef.current = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            setStage('iris-close');
          }
        });
      },
      {
        // Center 20% of viewport — fires when FIN enters the middle band
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0.1,
      }
    );

    observer.observe(finRef.current);
    return () => observer.disconnect();
  }, [isActive]);

  const handleIrisCloseComplete = useCallback(() => {
    setStage('black');
    setTimeout(() => {
      setShowRollAgain(true);
      setStage('ended');
      onCompleteRef.current?.();
    }, 3000);
  }, []);

  const handleSkipToEnd = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;
    // Scroll to the bottom of the content
    const maxScroll =
      contentRef.current.scrollHeight ?? contentRef.current.offsetHeight;
    containerRef.current.scrollTop = maxScroll;
    scrollPosRef.current = maxScroll;
    isAutoScrollingRef.current = false;
  }, []);

  const handleRollAgain = useCallback(() => {
    setStage('scrolling');
    setShowRollAgain(false);
    scrollPosRef.current = 0;
    isAutoScrollingRef.current = true;
    lastTimeRef.current = 0;
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--color-credits-bg)',
        // Cast needed: CSS custom property string is valid for zIndex at runtime
        zIndex: 'var(--z-intro)' as unknown as number,
        // Isolated stacking context — above grain layer, no grain rendered here
        isolation: 'isolate',
      }}
    >
      {/* Scrolling credits content */}
      {(stage === 'scrolling' || stage === 'iris-close') && (
        <>
          <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{
              position: 'absolute',
              inset: 0,
              overflowY: 'scroll',
              overflowX: 'hidden',
              scrollbarWidth: 'none',
            }}
          >
            <div
              ref={contentRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0 2rem',
                paddingTop: '100vh', // start content below viewport
              }}
            >
              {CREDITS_CONTENT.map((block, i) => (
                <CreditLine
                  key={i}
                  block={block}
                  finRef={block.type === 'fin' ? finRef : undefined}
                />
              ))}
              {/* Extra bottom padding so FIN can reach center */}
              <div style={{ height: '60vh' }} />
            </div>
          </div>

          {/* SKIP TO END button */}
          <button
            onClick={handleSkipToEnd}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--color-credits-text)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.375rem 0.75rem',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              opacity: 0.6,
              zIndex: 2,
            }}
            aria-label="Skip to end of credits"
          >
            [ SKIP TO END ]
          </button>

          {/* IrisClose fires when FIN hits viewport center */}
          {stage === 'iris-close' && (
            <IrisClose onComplete={handleIrisCloseComplete} duration={800} />
          )}
        </>
      )}

      {/* Post-credits: total black, then Roll Again button */}
      {(stage === 'black' || stage === 'ended') && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AnimatePresence>
            {showRollAgain && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                onClick={handleRollAgain}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  color: 'var(--color-credits-text)',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.4)',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  letterSpacing: '0.15em',
                }}
                aria-label="Roll credits again"
              >
                [ ROLL CREDITS AGAIN ]
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// CreditLine — renders a single credit block
// ------------------------------------------------------------------

interface CreditLineProps {
  block: CreditBlock;
  finRef?: React.RefObject<HTMLDivElement | null>;
}

function CreditLine({ block, finRef }: CreditLineProps) {
  const baseStyle: React.CSSProperties = {
    textAlign: 'center',
    width: '100%',
    maxWidth: '600px',
    margin: 0,
  };

  if (block.type === 'spacer') {
    return <div style={{ height: '1.5rem' }} />;
  }

  if (block.type === 'divider') {
    return (
      <div
        style={{
          ...baseStyle,
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          margin: '0.5rem 0',
        }}
      />
    );
  }

  if (block.type === 'fin') {
    return (
      <div
        ref={finRef as React.RefObject<HTMLDivElement>}
        style={{
          ...baseStyle,
          fontFamily: 'var(--font-display)',
          fontSize: '5rem',
          fontWeight: 900,
          color: 'var(--color-credits-text)',
          letterSpacing: '0.3em',
          lineHeight: 1,
          padding: '2rem 0',
        }}
      >
        FIN
      </div>
    );
  }

  if (block.type === 'heading') {
    return (
      <p
        style={{
          ...baseStyle,
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--color-credits-text)',
          letterSpacing: '0.05em',
          lineHeight: 1.3,
        }}
      >
        {block.text}
      </p>
    );
  }

  if (block.type === 'label') {
    return (
      <p
        style={{
          ...baseStyle,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          lineHeight: 1.6,
        }}
      >
        {block.text}
      </p>
    );
  }

  if (block.type === 'name') {
    return (
      <p
        style={{
          ...baseStyle,
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--color-credits-text)',
          letterSpacing: '0.08em',
          lineHeight: 1.8,
        }}
      >
        {block.text}
      </p>
    );
  }

  return null;
}
