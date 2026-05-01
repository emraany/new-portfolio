'use client';

import { useState } from 'react';
import SectionHeader from '@/components/ui/section-header';

export default function Contact() {
  const [emailHovered, setEmailHovered] = useState(false);

  return (
    <section
      id="contact"
      className="contact-section"
      style={{
        paddingTop: 'var(--space-24)',
        paddingBottom: 'var(--space-24)',
        paddingLeft: 'var(--section-pad-x)',
        paddingRight: 'var(--section-pad-x)',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .contact-section {
            padding-top: var(--space-12) !important;
            padding-bottom: var(--space-12) !important;
          }
        }
      `}</style>
      <SectionHeader label="FINAL TAKE" heading="[Contact]" />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-6)',
        }}
      >
        <a
          href="mailto:emraany1220@gmail.com"
          onMouseEnter={() => setEmailHovered(true)}
          onMouseLeave={() => setEmailHovered(false)}
          className="cursor-target"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: emailHovered ? 'var(--color-bg)' : 'var(--color-accent)',
            backgroundColor: emailHovered ? 'var(--color-accent)' : 'transparent',
            textDecoration: 'none',
            letterSpacing: 'var(--tracking-wide)',
            padding: '2px 8px',
            transition: 'background-color 200ms, color 200ms',
          }}
        >
          emraany1220@gmail.com
        </a>

        <a
          href="https://github.com/emraany"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-accent)',
            textDecoration: 'none',
            letterSpacing: 'var(--tracking-wide)',
          }}
        >
          github.com/emraany
        </a>

        <a
          href="https://www.linkedin.com/in/emraanyusuf"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-accent)',
            textDecoration: 'none',
            letterSpacing: 'var(--tracking-wide)',
          }}
        >
          linkedin.com/in/emraanyusuf
        </a>
      </div>
    </section>
  );
}
