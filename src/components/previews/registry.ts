'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/** Every project preview receives this. `active` is the run/pause flag. */
export interface PreviewProps {
  active: boolean;
}

/**
 * Maps a project slug to its live animated preview.
 *
 * Each entry is a separate chunk — a card only downloads its preview's JS
 * when the card mounts. A slug with no entry falls back to the static
 * poster PNG, so this registry is the single place to add or remove a
 * live preview.
 */
export const previewRegistry: Record<string, ComponentType<PreviewProps>> = {
  'conflict-coordinate': dynamic(() => import('./projects/conflict-coordinate')),
  'datacenter-operations-platform': dynamic(
    () => import('./projects/datacenter-operations-platform')
  ),
  quranscope: dynamic(() => import('./projects/quranscope')),
  'hypertrophy-tracker': dynamic(() => import('./projects/hypertrophy-tracker')),
  'bjj-simulator': dynamic(() => import('./projects/bjj-simulator')),
  caketopia: dynamic(() => import('./projects/caketopia')),
  'assembly-game': dynamic(() => import('./projects/assembly-game')),
};
