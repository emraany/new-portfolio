'use client';

import type { Project } from '@/data/projects';
import { ProjectTags } from './project-card';

/**
 * Expanded project view — ported from
 * ../Website/src/components/portfolio/ExpandedProjectTile.tsx
 *
 * Two columns inside the overlay: a transparent left panel that the card
 * itself flies into (it is the real card, FLIP-animated over this space),
 * and the detail content on the right. The close button sits top-right
 * over both, exactly as in his.
 */

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="16"
      height="16"
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

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function ExpandedProject({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  /* Primary action mirrors his: the live site if there is one, otherwise
     the video. Anything left over becomes a secondary button. */
  const primary = project.liveUrl
    ? { href: project.liveUrl, label: 'Visit Live', icon: <ExternalIcon /> }
    : project.videoUrl
      ? { href: project.videoUrl, label: 'Watch Video', icon: <PlayIcon /> }
      : null;

  const secondaries = [
    project.liveUrl && project.videoUrl
      ? { href: project.videoUrl, label: 'Watch Video', icon: <PlayIcon /> }
      : null,
    project.repoUrl ? { href: project.repoUrl, label: 'Source', icon: <GithubIcon /> } : null,
  ].filter(Boolean) as Array<{ href: string; label: string; icon: React.ReactNode }>;

  return (
    <div className="pj-expanded">
      {/* Left panel — transparent; the FLIP-animated card lands here */}
      <div className="pj-expanded-panel" aria-hidden="true" />

      {/* Detail content */}
      <div data-expand-content className="pj-expanded-content">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              letterSpacing: 'var(--tracking-tight)',
              lineHeight: 'var(--leading-tight)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {project.title}
          </h3>
        </div>

        {/* Slate line — the film-branded metadata strip */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wide)',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}
        >
          {[project.year, project.genre].filter(Boolean).join(' · ')}
        </p>

        {/* Full description — no line clamp */}
        <p
          style={{
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-body)',
            color: 'var(--color-text-secondary)',
            textWrap: 'pretty',
            margin: 0,
          }}
        >
          {project.synopsis}
        </p>

        {/* All tags */}
        <ProjectTags tags={project.starring} limit={Infinity} />

        {project.productionNotes && (
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-body)',
              color: 'var(--color-text-muted)',
              borderLeft: '1px solid var(--color-border)',
              paddingLeft: 'var(--space-3)',
              margin: 0,
            }}
          >
            {project.productionNotes}
          </p>
        )}

        {/* Action buttons — pushed to the bottom */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            paddingTop: '4px',
          }}
        >
          {primary && (
            <a
              href={primary.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pj-btn pj-btn-primary cursor-target"
            >
              {primary.icon}
              {primary.label}
            </a>
          )}
          {secondaries.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pj-btn pj-btn-secondary cursor-target"
            >
              {s.icon}
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Close button */}
      <button
        type="button"
        data-expand-close
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="pj-close cursor-target"
        aria-label="Close expanded view"
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
