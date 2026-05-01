import React from 'react';

const SIZE = 8
const OFFSET = 6

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

function CornerMark({ pos }: { pos: Corner }) {
  const top = pos.startsWith('top')
  const left = pos.endsWith('left')
  return (
    <svg
      width={SIZE} height={SIZE}
      style={{
        position: 'absolute',
        top: top ? OFFSET : 'auto',
        bottom: top ? 'auto' : OFFSET,
        left: left ? OFFSET : 'auto',
        right: left ? 'auto' : OFFSET,
        pointerEvents: 'none',
      }}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
    >
      <line
        x1={left ? 0 : SIZE} y1={top ? 0 : SIZE}
        x2={SIZE} y2={top ? 0 : SIZE}
        stroke="var(--color-text-primary)" strokeOpacity={0.35} strokeWidth="1"
      />
      <line
        x1={left ? 0 : SIZE} y1={0}
        x2={left ? 0 : SIZE} y2={SIZE}
        stroke="var(--color-text-primary)" strokeOpacity={0.35} strokeWidth="1"
      />
    </svg>
  )
}

export function FrameMarks({ children, className, style }: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }} className={className}>
      {children}
      <CornerMark pos="top-left" />
      <CornerMark pos="top-right" />
      <CornerMark pos="bottom-left" />
      <CornerMark pos="bottom-right" />
    </div>
  )
}
