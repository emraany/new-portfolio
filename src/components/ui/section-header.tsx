interface SectionHeaderProps {
  label: string;   // film-themed uppercase label, e.g. "CREDITS"
  heading: string; // bracketed real name, e.g. "[Experience]"
}

export default function SectionHeader({ label, heading }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <style>{`
        .section-header { margin-bottom: var(--space-10); }
        @media (max-width: 768px) {
          .section-header { margin-bottom: var(--space-6); }
        }
      `}</style>
      <div style={{ borderTop: '1px solid var(--color-border)', marginBottom: 'var(--space-6)' }} />
      <h2
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-lg)',
          fontWeight: 400,
          color: 'var(--color-accent)',
          letterSpacing: 'var(--tracking-wide)',
          textTransform: 'uppercase',
          fontVariant: 'small-caps',
          margin: 0,
          lineHeight: 'var(--leading-body)',
        }}
      >
        {label}{' '}
        <span
          style={{
            color: 'var(--color-text-muted)',
            textTransform: 'none',
            fontVariant: 'normal',
            letterSpacing: '0.08em',
          }}
        >
          {heading}
        </span>
      </h2>
    </div>
  );
}
