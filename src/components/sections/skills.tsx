'use client';

import { motion, type Variants, type Easing } from 'framer-motion';

interface SkillCategory {
  heading: string;
  members: string;
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    heading: 'Directed By',
    members: 'TypeScript, Python, SQL, Bash, Java',
  },
  {
    heading: 'Produced By',
    members: 'React, Next.js, FastAPI, PyTorch, scikit-learn, Framer Motion, Tailwind CSS',
  },
  {
    heading: 'Director of Photography',
    members: 'NLP, Computer Vision, Graph Neural Networks, Transformers, LLMs',
  },
  {
    heading: 'Production Design',
    members: 'PostgreSQL, Supabase, Redis, Docker, AWS',
  },
  {
    heading: 'Special Effects',
    members: 'Git, Figma, Linear, Vercel, Jupyter',
  },
];

const EASE_OUT: Easing = 'easeOut';

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: EASE_OUT,
    },
  }),
};

export default function Skills() {
  return (
    <section
      id="skills"
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
        The Crew
      </h2>

      {/* Cast list */}
      <div>
        {SKILL_CATEGORIES.map((category, index) => (
          <motion.div
            key={category.heading}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={rowVariants}
          >
            {/* Separator above each row (including the first, sits above heading) */}
            {index === 0 && (
              <div
                style={{
                  borderTop: '1px solid var(--color-border)',
                  marginBottom: 0,
                }}
              />
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 'var(--space-6)',
                padding: 'var(--space-5) 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              {/* Category label */}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-accent)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontVariant: 'small-caps',
                  flexShrink: 0,
                  width: '160px',
                  lineHeight: 'var(--leading-body)',
                }}
              >
                {category.heading}
              </div>

              {/* Skills */}
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-body)',
                  flex: 1,
                }}
              >
                {category.members}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
