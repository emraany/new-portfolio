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
 * The poster sits underneath every preview as the first paint, so a card is
 * never blank while its preview chunk loads — and on a device that has earned
 * only posters, it is simply what the card is.
 *
 * ## The develop
 *
 * A mounting preview does not cut in; it develops, the way a print comes up
 * in a tray — soft and over-saturated, resolving to sharp. That is the site's
 * existing darkroom vocabulary (the `--develop-*` and `--ease-develop` tokens
 * variables.css has always declared) applied to the one moment that most
 * wanted it. On the middle capability tier, where the card rests as a poster
 * until it is hovered, this develop is the whole effect: a motion poster.
 *
 * Two constraints on it, both load-bearing:
 *
 * 1. **No geometry.** No scale, no translate — only opacity and filter. This
 *    element sits inside the card the Filmography grid measures for its FLIP
 *    expansion; a transform here would be read as the card's real position and
 *    the expansion would fly from the wrong place.
 * 2. **Keyed to `mounted`, not `active`.** A preview that pauses at the edge
 *    of the viewport holds its last frame instead of dissolving back to the
 *    poster and re-developing every time it is scrolled past.
 *
 * The resting desaturation of a live preview is unchanged: it still comes
 * from `.pj-develop` on the wrapper, which is also what brightens on hover.
 */
export default function ProjectPreview({
  project,
  /** Skip the hover gate — the sheet opening is already an explicit request. */
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
  const { ref, mounted, active, activate } = usePreviewActive<HTMLDivElement>(enabled);
  const Preview = previewRegistry[project.slug];

  useEffect(() => {
    if (forceLive) activate();
  }, [forceLive, activate]);

  /* Hover and focus live on the card, not here — the visual is only the top
     of the card, and someone reading the synopsis has plainly asked to see
     the project. So the activation listeners go on the card root when there
     is one, and fall back to this element when there is not (the sheet).
     Reaching for the ancestor keeps both the card and the sheet unaware that
     capability tiers exist at all. */
  useEffect(() => {
    if (forceLive || !enabled) return;
    const el = ref.current;
    if (!el) return;

    const target = el.closest('[data-tile-root]') ?? el;
    const onPointerEnter = (e: Event) => {
      /* A tap fires pointerenter too, and on touch that same gesture is
         already opening the detail sheet. */
      if ((e as PointerEvent).pointerType === 'touch') return;
      activate();
    };

    target.addEventListener('pointerenter', onPointerEnter);
    target.addEventListener('focusin', activate);
    return () => {
      target.removeEventListener('pointerenter', onPointerEnter);
      target.removeEventListener('focusin', activate);
    };
  }, [ref, activate, forceLive, enabled]);

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
          className="pj-preview-develop"
          style={{ position: 'absolute', inset: 0 }}
        >
          <Preview active={active} />
        </div>
      )}
    </div>
  );
}
