'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FocusPull from '@/components/animations/focus-pull';

interface TimelineEntry {
  id: string;
  role: string;
  company: string;
  dates: string;
  tags: string[];
  description: string;
  defaultExpanded: boolean;
}

const TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    id: 'ml-lead',
    role: 'ML Research Lead',
    company: '[Placeholder Company]',
    dates: 'Jun 2024 – Present',
    tags: ['Research', 'ML', 'Leadership'],
    description: 'Placeholder description — Emraan will fill this in with real details.',
    defaultExpanded: true,
  },
  {
    id: 'ml-researcher',
    role: 'ML Researcher',
    company: '[Placeholder Company]',
    dates: 'Jan 2024 – May 2024',
    tags: ['Research', 'NLP'],
    description: 'Placeholder description.',
    defaultExpanded: false,
  },
  {
    id: 'utd',
    role: 'B.S. Computer Science',
    company: 'University of Texas at Dallas',
    dates: '2022 – 2026',
    tags: ['Education', 'CS'],
    description: 'GPA: placeholder. Relevant coursework: placeholder.',
    defaultExpanded: false,
  },
];

function FocusReticle() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      style={{ color: 'var(--color-accent)', flexShrink: 0 }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" />
      <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="1" />
      <line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" strokeWidth="1" />
      <line x1="4" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="1" />
      <line x1="16" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

interface EntryProps {
  entry: TimelineEntry;
  isLast: boolean;
}

function TimelineEntryRow({ entry, isLast }: EntryProps) {
  const [expanded, setExpanded] = useState(entry.defaultExpanded);

  return (
    <FocusPull>
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-6)',
          position: 'relative',
        }}
      >
        {/* Left column: reticle + connecting line */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flexShrink: 0,
            width: '24px',
          }}
        >
          <div style={{ zIndex: 1 }}>
            <FocusReticle />
          </div>
          {!isLast && (
            <div
              style={{
                flex: 1,
                width: '1px',
                backgroundColor: 'var(--color-border)',
                marginTop: 'var(--space-2)',
                marginBottom: 'var(--space-2)',
                minHeight: 'var(--space-12)',
              }}
            />
          )}
        </div>

        {/* Right column: content */}
        <div
          style={{
            flex: 1,
            paddingBottom: isLast ? '0' : 'var(--space-10)',
          }}
        >
          {/* Header row — clickable */}
          <button
            onClick={() => setExpanded((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              width: '100%',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left',
              gap: 'var(--space-4)',
            }}
            aria-expanded={expanded}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-tight)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                {entry.role}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-accent)',
                  letterSpacing: 'var(--tracking-wide)',
                  textTransform: 'uppercase',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {entry.company}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                {entry.dates}
              </div>
              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-accent)',
                      border: '1px solid var(--color-accent)',
                      borderRadius: '2px',
                      padding: '1px var(--space-2)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Expand indicator */}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                flexShrink: 0,
                marginTop: 'var(--space-1)',
                lineHeight: 1,
                userSelect: 'none',
              }}
              aria-hidden="true"
            >
              ▾
            </motion.span>
          </button>

          {/* Expandable description */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="description"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-body)',
                    marginTop: 'var(--space-4)',
                    paddingLeft: 'var(--space-1)',
                    borderLeft: '2px solid var(--color-border)',
                  }}
                >
                  {entry.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FocusPull>
  );
}

export default function Experience() {
  return (
    <section
      id="experience"
      style={{
        padding: 'var(--space-20) var(--space-8)',
        maxWidth: '860px',
        margin: '0 auto',
      }}
    >
      {/* Frame line */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          marginBottom: 'var(--space-10)',
        }}
      />

      {/* Section heading */}
      <h2
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-accent)',
          letterSpacing: 'var(--tracking-wide)',
          textTransform: 'uppercase',
          fontVariant: 'small-caps',
          marginBottom: 'var(--space-12)',
        }}
      >
        Production History
      </h2>

      {/* Timeline */}
      <div>
        {TIMELINE_ENTRIES.map((entry, index) => (
          <TimelineEntryRow
            key={entry.id}
            entry={entry}
            isLast={index === TIMELINE_ENTRIES.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
