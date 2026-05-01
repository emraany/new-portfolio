'use client';

import { motion, type Variants } from 'framer-motion';
import SectionHeader from '@/components/ui/section-header';

interface ArchiveEntry {
  title: string;
  year: string;
}

const ARCHIVE_ENTRIES: ArchiveEntry[] = [
  { title: 'ACM UTD — Researcher', year: 'August 2023 – Present' },
  { title: 'HackUTD — 3rd Place Winner',                             year: 'November 2025' },
  { title: 'ColorStack - Member',                                              year: 'January 2025 – Present' },
  { title: 'Artificial Intelligence Society — Member',               year: 'January 2024 – Present' },
  { title: 'National Society of Black Engineers - Member',                     year: 'January 2024 – Present' },
];

const rowVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.04,
      duration: 0.35,
      ease: [0, 0, 0.2, 1] as [number, number, number, number],
    },
  }),
};

export default function Archive() {
  return (
    <section
      id="archive"
      style={{
        padding: 'var(--section-pad-y) var(--section-pad-x)',
      }}
    >
      <style>{`
        .archive-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .archive-row__title,
        .archive-row__year {
          font-family: var(--font-mono);
          font-size: var(--text-base);
          color: var(--color-text-secondary);
          flex-shrink: 0;
          line-height: var(--leading-body);
        }
        .archive-row__year {
          white-space: nowrap;
        }
        .archive-row__leader {
          flex: 1;
          border-bottom: 2px dotted var(--color-border);
          margin-bottom: 4px;
          min-width: var(--space-6);
        }
        @media (max-width: 600px) {
          .archive-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }
          .archive-row__leader {
            display: none;
          }
          .archive-row__year {
            font-size: var(--text-sm);
            color: var(--color-text-muted);
          }
        }
      `}</style>

      <SectionHeader label="OFF-SCREEN WORK" heading="[Campus Involvement]" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {ARCHIVE_ENTRIES.map((entry, index) => (
          <motion.div
            key={entry.title}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={rowVariants}
            className="archive-row"
          >
            <span className="archive-row__title">{entry.title}</span>
            <span className="archive-row__leader" aria-hidden="true" />
            <span className="archive-row__year">{entry.year}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
