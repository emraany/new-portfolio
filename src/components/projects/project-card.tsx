'use client';

import type { CSSProperties, ReactNode } from 'react';
import ProjectPreview from '@/components/previews/project-preview';
import type { Project } from '@/data/projects';

/**
 * Project card — structure ported from
 * ../Website/src/components/portfolio/tiles/ProjectTile.tsx
 *
 * Same anatomy as his: a visual area on top, then a content block that
 * flexes — title + year badge, two-line description, tag chips, and a
 * link row pinned to the bottom. Same 12px radius, 20px padding, 10px
 * content gap, and the same 3px hover raise that drops instantly once a
 * card is expanded (`data-expanded`), so the FLIP measures it un-raised.
 *
 * Kept from the film treatment: the frame-number slate, the corner frame
 * marks, the darkroom develop-on-hover, and the play button.
 */

/* ── Icons ────────────────────────────────────────────────────────────── */

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function ExternalIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function PlayIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/* ── Shared pieces (his ProjectTitle / YearBadge / Description / Tags / Links) ── */

export function ProjectTitle({ title, style }: { title: string; style?: CSSProperties }) {
  return (
    <h3
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-xl)',
        letterSpacing: 'var(--tracking-tight)',
        lineHeight: 'var(--leading-tight)',
        color: 'var(--color-text-primary)',
        textWrap: 'balance',
        flex: 1,
        margin: 0,
        ...style,
      }}
    >
      {title}
    </h3>
  );
}

export function ProjectYearBadge({ year }: { year: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        flexShrink: 0,
        borderRadius: '999px',
        border: '1px solid var(--color-border)',
        background: 'rgba(216,213,204,0.06)',
        padding: '4px 10px',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: 'var(--tracking-wide)',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.2,
      }}
    >
      {year}
    </span>
  );
}

export function ProjectDescription({ text, clamp = 2 }: { text: string; clamp?: number }) {
  return (
    <p
      style={{
        fontSize: 'var(--text-sm)',
        lineHeight: 'var(--leading-body)',
        color: 'var(--color-text-secondary)',
        textWrap: 'pretty',
        margin: 0,
        ...(clamp > 0
          ? {
              display: '-webkit-box',
              WebkitLineClamp: clamp,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }
          : {}),
      }}
    >
      {text}
    </p>
  );
}

export function ProjectTags({ tags, limit = 4 }: { tags: string[]; limit?: number }) {
  if (!tags || tags.length === 0) return null;
  const visible = limit >= tags.length ? tags : tags.slice(0, limit);
  const overflow = tags.length - visible.length;

  const chip: CSSProperties = {
    borderRadius: '6px',
    background: 'rgba(216,213,204,0.07)',
    padding: '2px 8px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-wide)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {visible.map((tag) => (
        <span key={tag} style={chip}>
          {tag}
        </span>
      ))}
      {overflow > 0 && (
        <span style={{ ...chip, color: 'var(--color-text-muted)' }}>+{overflow}</span>
      )}
    </div>
  );
}

export function ProjectLinks({ project }: { project: Project }) {
  return (
    <div
      style={{
        marginTop: 'auto',
        display: 'flex',
        gap: 'var(--space-4)',
        paddingTop: '4px',
        marginBottom: '-4px',
      }}
    >
      {project.repoUrl && (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pj-link cursor-target"
          onClick={(e) => e.stopPropagation()}
        >
          <GithubIcon />
          Source
        </a>
      )}
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pj-link cursor-target"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalIcon />
          Live
        </a>
      )}
      {project.videoUrl && (
        <a
          href={project.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pj-link cursor-target"
          onClick={(e) => e.stopPropagation()}
        >
          <PlayIcon />
          Video
        </a>
      )}
    </div>
  );
}

/* ── Visual area ──────────────────────────────────────────────────────── */

const CORNER = 8;
const CORNER_INSET = 6;

/** Corner frame marks, drawn inside the visual (from FrameMarks). */
function CornerMarks() {
  const corners: Array<[boolean, boolean]> = [
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ];
  return (
    <>
      {corners.map(([top, left]) => (
        <svg
          key={`${top}-${left}`}
          width={CORNER}
          height={CORNER}
          viewBox={`0 0 ${CORNER} ${CORNER}`}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: top ? CORNER_INSET : 'auto',
            bottom: top ? 'auto' : CORNER_INSET,
            left: left ? CORNER_INSET : 'auto',
            right: left ? 'auto' : CORNER_INSET,
            pointerEvents: 'none',
            zIndex: 4,
          }}
        >
          <line
            x1={left ? 0 : CORNER}
            y1={top ? 0 : CORNER}
            x2={CORNER}
            y2={top ? 0 : CORNER}
            stroke="var(--color-text-primary)"
            strokeOpacity={0.35}
            strokeWidth="1"
          />
          <line
            x1={left ? 0 : CORNER}
            y1={0}
            x2={left ? 0 : CORNER}
            y2={CORNER}
            stroke="var(--color-text-primary)"
            strokeOpacity={0.35}
            strokeWidth="1"
          />
        </svg>
      ))}
    </>
  );
}

export function ProjectVisual({
  children,
  frameLabel,
  showPlay = true,
}: {
  children?: ReactNode;
  frameLabel?: string;
  showPlay?: boolean;
}) {
  return (
    <div className="pj-visual">
      <div className="pj-develop" style={{ position: 'absolute', inset: 0 }}>
        {children}
      </div>

      {/* Frame-number slate */}
      {frameLabel && (
        <span aria-hidden="true" className="pj-slate">
          {frameLabel}
        </span>
      )}

      <CornerMarks />

      {/* Bottom inner shadow — his `from-background/40` fade into the content */}
      <div
        aria-hidden="true"
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          insetInline: 0,
          bottom: 0,
          height: '48px',
          background: 'linear-gradient(to top, rgba(14,18,16,0.55), transparent)',
          zIndex: 2,
        }}
      />

      {/* Play button — revealed on hover */}
      {showPlay && (
        <div aria-hidden="true" className="pj-play-layer">
          <span className="pj-play">&#9654;</span>
        </div>
      )}
    </div>
  );
}

/* ── The card ─────────────────────────────────────────────────────────── */

export default function ProjectCard({
  project,
  index,
  onClick,
  onKeyDown,
}: {
  project: Project;
  index: number;
  onClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const frameLabel = `${String(index + 1).padStart(2, '0')}A`;

  return (
    <div
      data-tile-root
      role="button"
      tabIndex={0}
      aria-label={`Open ${project.title} details`}
      className="pj-card cursor-target"
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <ProjectVisual frameLabel={frameLabel}>
        <ProjectPreview project={project} />
      </ProjectVisual>

      <div className="pj-content">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-2)',
            marginBottom: '2px',
          }}
        >
          <ProjectTitle title={project.title} />
          <ProjectYearBadge year={project.year} />
        </div>

        <ProjectDescription text={project.logline} />
        <ProjectTags tags={project.starring} />
        <ProjectLinks project={project} />
      </div>
    </div>
  );
}
