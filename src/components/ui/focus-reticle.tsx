import type { CSSProperties } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FocusReticleProps {
  /** Rendered width and height in px. Default 24. */
  size?: number;
  /** Stroke color. Default 'currentColor'. */
  color?: string;
  /** When true, the SVG rotates once every 8 seconds. Default false. */
  spinning?: boolean;
  /** Stroke width. Default 1. */
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FocusReticle({
  size = 24,
  color = 'currentColor',
  spinning = false,
  strokeWidth = 1,
  className,
  style,
}: FocusReticleProps) {
  const spinStyle: CSSProperties = spinning
    ? {
        animation: 'focusReticleSpin 8s linear infinite',
        transformOrigin: '12px 12px',
      }
    : {};

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {spinning && (
        <style>{`
          @keyframes focusReticleSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      )}

      <g style={spinStyle}>
        {/* Outer ring */}
        <circle
          cx="12"
          cy="12"
          r="8"
          stroke={color}
          strokeWidth={strokeWidth}
        />

        {/* Top spoke — from edge to circle perimeter */}
        <line
          x1="12" y1="2"
          x2="12" y2="4"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Bottom spoke */}
        <line
          x1="12" y1="20"
          x2="12" y2="22"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Left spoke */}
        <line
          x1="2" y1="12"
          x2="4" y2="12"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Right spoke */}
        <line
          x1="20" y1="12"
          x2="22" y2="12"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Corner tick marks at 45° (NE, SE, SW, NW) */}
        {/* NE corner */}
        <line
          x1="17.66" y1="6.34"
          x2="18.95" y2="5.05"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* SE corner */}
        <line
          x1="17.66" y1="17.66"
          x2="18.95" y2="18.95"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* SW corner */}
        <line
          x1="6.34" y1="17.66"
          x2="5.05" y2="18.95"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* NW corner */}
        <line
          x1="6.34" y1="6.34"
          x2="5.05" y2="5.05"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle
          cx="12"
          cy="12"
          r="1"
          fill={color}
        />
      </g>
    </svg>
  );
}
