'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FocusPull from '@/components/animations/focus-pull';
import SectionHeader from '@/components/ui/section-header';

interface TimelineEntry {
  id: string;
  role: string;
  company: string;
  dates: string;
  description: string[];
  defaultExpanded: boolean;
}

const TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    id: 'ml-lead',
    role: 'ML Research Lead',
    company: 'UTD Natural Language Processing Lab',
    dates: 'January 2026 – Present',
    description: [
      'Led a team of 12 researchers producing 200+ weekly annotations to build datasets for detecting logical fallacies in political memes',
      'Created comprehensive annotation guidelines to standardize how logical fallacies are identified across the team',
      'Used Python to analyze annotation results and compare them with model predictions',
      'Helped develop a structured fallacy dataset to be used by anyone conducting Natural Language Processing research once published',
      'Contributed to a research project being submitted to the Association for Computational Linguistics (ACL)',
    ],
    defaultExpanded: true,
  },
  {
    id: 'ml-researcher',
    role: 'ML Researcher',
    company: 'Spectra — ACM Research',
    dates: 'January 2026 – May 2026',
    description: [
      'Designed and evaluated visual prompt injection attacks on multimodal AI systems to study how hidden instructions in images affect model behavior',
      'Built a testing pipeline using Python, PyTorch, and NumPy to generate attacks, run experiments, and measure attack success rates across multiple models',
      'Worked with open-source multimodal models from Hugging Face to benchmark vulnerabilities in models such as Gemma, Llama, and Qwen',
      'Benchmarked attack success rates at 86-91%, then designed defense methods to reduce the attack success rate by 99%, effectively completely mitingating the problem in tests',
      'Maintained accuracies and inference times that remained close to the baseline after applying defenses',
    ],
    defaultExpanded: true,
  },
  {
    id: 'utd',
    role: 'B.S. Computer Science',
    company: 'University of Texas at Dallas',
    dates: 'Expected Graduation: May 2027',
    description: [
      'GPA: 3.6',
      'Relevant coursework: Artificial Intelligence, Machine Learning, Databases, Networks, Data Structures and Algorithms, Software Engineering',
    ],
    defaultExpanded: true,
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
      <div style={{ display: 'flex', gap: 'var(--space-6)', position: 'relative' }}>
        {/* Left column: reticle + connecting line */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '24px' }}>
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
        <div style={{ flex: 1, paddingBottom: isLast ? '0' : 'var(--space-10)' }}>
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
                  fontFamily: 'var(--font-mono)',
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
                }}
              >
                {entry.dates}
              </div>
            </div>

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
                <ul
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-body)',
                    marginTop: 'var(--space-4)',
                    paddingLeft: 'var(--space-5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                    listStyle: 'disc',
                  }}
                >
                  {entry.description.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
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
        padding: 'var(--section-pad-y) var(--section-pad-x)',
      }}
    >
      <SectionHeader label="PRODUCTION CREDITS" heading="[Experience]" />

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
