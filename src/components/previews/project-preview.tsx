'use client';

import Image from 'next/image';
import type { Project } from '@/data/projects';
import { previewRegistry } from './registry';
import { usePreviewActive } from './use-preview-active';

/**
 * ProjectPreview
 *
 * Drop-in replacement for the static poster <Image> inside a PosterCard.
 * Fills its parent (which owns the 16/10 box), so card dimensions never
 * change.
 *
 * Renders the project's live animated preview when one is registered and
 * motion is allowed; otherwise the original poster screenshot. The poster
 * also sits underneath every preview as the first paint, so a card is
 * never blank while its preview chunk loads.
 *
 * The fade is keyed to `mounted`, not to the pause flag — a preview that
 * pauses at the edge of the viewport stays on screen holding its last
 * frame instead of dissolving back to the poster and re-dissolving in.
 */
export default function ProjectPreview({ project }: { project: Project }) {
  const { ref, mounted, active } = usePreviewActive<HTMLDivElement>();
  const Preview = previewRegistry[project.slug];

  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Image
        src={`/posters/${project.slug}.png`}
        alt={project.title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        style={{ objectFit: 'cover', objectPosition: 'top' }}
      />
      {Preview && mounted && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            animation: 'preview-in 500ms ease both',
          }}
        >
          <Preview active={active} />
          <style>{`
            @keyframes preview-in { from { opacity: 0 } to { opacity: 1 } }
          `}</style>
        </div>
      )}
    </div>
  );
}
