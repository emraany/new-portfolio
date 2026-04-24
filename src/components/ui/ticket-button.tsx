'use client';

import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TicketButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: ReactNode;
  /** primary = amber fill on hover | ghost = red fill on hover */
  variant?: 'primary' | 'ghost';
  target?: '_blank' | '_self';
  disabled?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '10px 24px',
  // Solid top/bottom border, dashed left/right for perforation tear effect
  borderTop:    '1px solid var(--color-accent)',
  borderBottom: '1px solid var(--color-accent)',
  borderLeft:   '1px dashed var(--color-accent)',
  borderRight:  '1px dashed var(--color-accent)',
  background:   'transparent',
  color:        'var(--color-accent)',
  fontFamily:   'var(--font-mono)',
  fontSize:     'var(--text-xs)',
  letterSpacing:'var(--tracking-wide)',
  textTransform:'uppercase' as const,
  cursor:       'pointer',
  textDecoration:'none',
  transition:   'background-color 200ms ease, color 200ms ease, border-color 200ms ease',
  whiteSpace:   'nowrap' as const,
  lineHeight:   1,
};

const HOVER_PRIMARY: CSSProperties = {
  backgroundColor: 'var(--color-accent)',
  color:           'var(--color-bg)',
  borderTopColor:    'var(--color-accent)',
  borderBottomColor: 'var(--color-accent)',
  borderLeftColor:   'var(--color-accent)',
  borderRightColor:  'var(--color-accent)',
};

const HOVER_GHOST: CSSProperties = {
  backgroundColor: 'var(--color-accent-red)',
  color:           'var(--color-text-primary)',
  borderTopColor:    'var(--color-accent-red)',
  borderBottomColor: 'var(--color-accent-red)',
  borderLeftColor:   'var(--color-accent-red)',
  borderRightColor:  'var(--color-accent-red)',
};

const DISABLED_STYLE: CSSProperties = {
  opacity: 0.4,
  cursor:  'not-allowed',
  pointerEvents: 'none',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TicketButton({
  label,
  onClick,
  href,
  icon,
  variant = 'primary',
  target,
  disabled = false,
  className,
}: TicketButtonProps) {
  const [hovered, setHovered] = useState(false);

  const hoverStyle = variant === 'ghost' ? HOVER_GHOST : HOVER_PRIMARY;

  const computedStyle: CSSProperties = {
    ...BASE_STYLE,
    ...(hovered && !disabled ? hoverStyle : {}),
    ...(disabled ? DISABLED_STYLE : {}),
  };

  const sharedProps = {
    style:        computedStyle,
    className,
    onMouseEnter: () => { if (!disabled) setHovered(true); },
    onMouseLeave: () => setHovered(false),
  };

  const content = (
    <>
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {label}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        {...sharedProps}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...sharedProps}
    >
      {content}
    </button>
  );
}
