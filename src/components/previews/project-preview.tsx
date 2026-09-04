'use client';

import { useEffect } from 'react';
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
 * The poster is a fallback, not a first paint. It used to sit under every
 * preview, which meant every card played the same two-step: still, then a
 * 400ms crossfade into the animation. Because the posters are frames of these
 * previews but a mounting preview starts at scene zero, that crossfade
 * dissolved one image into a visibly different one — the snap. A card is now
 * one thing or the other, decided per device: the animation, or (where no
 * animation is ever coming — low tier, reduced motion, or a slug with no
 * entry in the registry) the still.
 *
 * ## The develop
 *
 * A mounting preview does not cut in; it develops, the way a print comes up
 * in a tray — soft and over-saturated, resolving to sharp. That is the site's
 * existing darkroom vocabulary (the `--develop-*` and `--ease-develop` tokens
 * variables.css has always declared) applied to the one moment that most
 * wanted it. With nothing underneath it now, the develop reveals the
 * animation out of the card's own surface rather than dissolving a still.
 *
 * Two constraints on it, both load-bearing:
 *
 * 1. **No geometry.** No scale, no translate — only opacity and filter. This
 *    element sits inside the card the Filmography grid measures for its FLIP
 *    expansion; a transform here would be read as the card's real position and
 *    the expansion would fly from the wrong place.
 * 2. **Keyed to `mounted`, not `active`.** A preview that pauses at the edge
 *    of the viewport holds its last frame instead of blanking out and
 *    re-developing every time it is scrolled past.
 *
 * The resting desaturation of a live preview is unchanged: it still comes
 * from `.pj-develop` on the wrapper, which is also what brightens on hover.
 */
export default function ProjectPreview({
  project,
  /** Mount now rather than on approach — opening the sheet already asked. */
  forceLive = false,
  /**
   * False for a card in the tree the current breakpoint hides. Filmography
   * keeps both the mobile carousel and the desktop grid mounted and toggles
   * them with CSS, so every project has two cards in the document at all
   * times. The hidden half never animated — a display:none element reports
   * no intersection — but it did construct two IntersectionObservers per
   * card for the privilege, fourteen cards' worth.
   */
  enabled = true,
}: {
  project: Project;
  forceLive?: boolean;
  enabled?: boolean;
}) {
  const { ref, mounted, active, activate, posterOnly } =
    usePreviewActive<HTMLDivElement>(enabled);
  const Preview = previewRegistry[project.slug];

  useEffect(() => {
    if (forceLive) activate();
  }, [forceLive, activate]);

  /* The hover and focus listeners that used to live here are gone with the
     motion poster they served: a card that is getting an animation now mounts
     it on approach, so there is nothing left to ask for. */

  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {(posterOnly || !Preview) && (
        <Image
          src={`/posters/${project.slug}.webp`}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: 'cover', objectPosition: 'top' }}
        />
      )}

      {Preview && mounted && (
        <div
          aria-hidden="true"
          className="pj-preview-develop"
          style={{ position: 'absolute', inset: 0 }}
        >
          <Preview active={active} />
        </div>
      )}
    </div>
  );
}
