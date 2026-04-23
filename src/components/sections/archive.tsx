'use client';

import { motion, type Variants } from 'framer-motion';

interface ArchiveEntry {
  title: string;
  year: string;
}

const ARCHIVE_ENTRIES: ArchiveEntry[] = [
  {
    title: 'Association for Computing Machinery (ACM) — President',
    year: '2024–Present',
  },
  {
    title: 'Machine Learning Club — Founding Member',
    year: '2023–Present',
  },
  {
    title: 'HackUTD — Organizer',
    year: '2023–2024',
  },
  {
    title: 'Google Developer Student Club — Technical Lead',
    year: '2023–2024',
  },
  {
    title: 'CS Peer Tutor',
    year: '2022–2024',
  },
  {
    title: 'Competitive Programming Team',
    year: '2022–Present',
  },
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
          marginBottom: 'var(--space-10)',
        }}
      >
        Campus Involvement
      </h2>

      {/* Dot-leader list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {ARCHIVE_ENTRIES.map((entry, index) => (
          <motion.div
            key={entry.title}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={rowVariants}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '4px',
            }}
          >
            {/* Title */}
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                flexShrink: 0,
                lineHeight: 'var(--leading-body)',
              }}
            >
              {entry.title}
            </span>

            {/* Dot leader */}
            <span
              style={{
                flex: 1,
                borderBottom: '2px dotted var(--color-border)',
                marginBottom: '4px',
                minWidth: 'var(--space-6)',
              }}
              aria-hidden="true"
            />

            {/* Year */}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                flexShrink: 0,
                lineHeight: 'var(--leading-body)',
                whiteSpace: 'nowrap',
              }}
            >
              {entry.year}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
