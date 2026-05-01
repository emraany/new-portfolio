'use client';

import { motion, type Variants, type Easing } from 'framer-motion';
import SectionHeader from '@/components/ui/section-header';

interface SkillCategory {
  heading: string;
  members: string;
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    heading: 'Programming Languages',
    members: 'Java, Python, JavaScript, TypeScript, C, C++, HTML5, CSS, SQL, LaTeX',
  },
  {
    heading: 'Frameworks & Libraries',
    members: 'React, Next.js, Spring Boot, Flask, Pandas, PyTorch, NumPy, FastAPI, Tailwind CSS, Recharts',
  },
  {
    heading: 'Databases & Tools',
    members: 'Git, GitHub, PostgreSQL, Snowflake, Node.js, MySQL, MongoDB, Linux, Vercel, Railway, JSON, YAML',
  },
];

const EASE_OUT: Easing = 'easeOut';

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: EASE_OUT },
  }),
};

export default function Skills() {
  return (
    <section
      id="skills"
      style={{
        padding: 'var(--section-pad-y) var(--section-pad-x)',
      }}
    >
      <style>{`
        .skills-row {
          display: flex;
          align-items: baseline;
          gap: var(--space-6);
          padding: var(--space-5) 0;
          border-bottom: 1px solid var(--color-border);
        }
        .skills-row__heading {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--color-accent);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-variant: small-caps;
          flex-shrink: 0;
          width: 200px;
          line-height: var(--leading-body);
        }
        .skills-row__members {
          font-family: var(--font-mono);
          font-size: var(--text-base);
          color: var(--color-text-secondary);
          line-height: var(--leading-body);
          flex: 1;
        }
        @media (max-width: 768px) {
          .skills-row {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
          }
          .skills-row__heading {
            width: auto;
          }
        }
      `}</style>

      <SectionHeader label="THE CREW" heading="[Skills]" />

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
            <div className="skills-row">
              <div className="skills-row__heading">{category.heading}</div>
              <div className="skills-row__members">{category.members}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
