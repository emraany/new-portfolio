'use client';

import ProjectPreview from '@/components/previews/project-preview';
import type { Project } from '@/data/projects';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { ProjectYearBadge } from './project-card';

/**
 * The project detail sheet — ported from `ProjectDetailContent` in
 * ../Website/src/components/portfolio/ProjectDrawer.tsx
 *
 * Same anatomy: a full-bleed live hero from the very top with the drag
 * handle floating over it, a fixed title row, a scrollable description +
 * tags body, and full-width action buttons pinned to the bottom.
 *
 * Must be rendered inside a `Drawer` root — that context is what arms the
 * grab-zone drag-to-close.
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
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
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

export default function ProjectSheet({
  project,
  open,
}: {
  project: Project;
  /** The root's open state — the live hero mounts only while open. */
  open: boolean;
}) {
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
    <DrawerContent overlayHandle className="project-sheet" aria-describedby={undefined}>
      {/* Live hero — full-bleed from the very top, handle floating over it */}
      <div className="sheet-hero">
        {/* Opening the sheet is already an explicit request for this
            project, so the preview does not wait to be hovered. */}
        {open && <ProjectPreview project={project} forceLive />}
        <div className="sheet-hero-scrim" aria-hidden="true" />
      </div>

      {/* Fixed title */}
      <DrawerHeader className="sheet-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <DrawerTitle style={{ fontSize: 'var(--text-2xl)', flex: 1 }}>
            {project.title}
          </DrawerTitle>
          <ProjectYearBadge year={project.year} />
        </div>
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
          {project.genre}
        </p>
      </DrawerHeader>

      {/* Scrollable description + tags */}
      <div className="sheet-body">
        <DrawerDescription
          style={{
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-body)',
            color: 'var(--color-text-secondary)',
            textWrap: 'pretty',
            margin: 0,
          }}
        >
          {project.synopsis}
        </DrawerDescription>

        {project.starring.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: 'var(--space-5)' }}>
            {project.starring.map((tag) => (
              <span key={tag} className="sheet-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {project.productionNotes && (
          <p
            style={{
              marginTop: 'var(--space-5)',
              marginBottom: 0,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-body)',
              color: 'var(--color-text-muted)',
              borderLeft: '1px solid var(--color-border)',
              paddingLeft: 'var(--space-3)',
            }}
          >
            {project.productionNotes}
          </p>
        )}
      </div>

      {/* Action buttons — pinned to the bottom, full width */}
      <div className="sheet-actions">
        {primary && (
          <a href={primary.href} target="_blank" rel="noopener noreferrer" className="pj-btn pj-btn-primary sheet-btn">
            {primary.icon}
            {primary.label}
          </a>
        )}
        {secondaries.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="pj-btn pj-btn-secondary sheet-btn">
            {s.icon}
            {s.label}
          </a>
        ))}
      </div>
    </DrawerContent>
  );
}

/** The sheet plus its own root, mirroring his `ProjectDrawer`. */
export function ProjectDrawer({
  project,
  open,
  onOpenChange,
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!project) return null;
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <ProjectSheet project={project} open={open} />
    </Drawer>
  );
}
