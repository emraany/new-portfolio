'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import DarkroomImage from '@/components/animations/darkroom-image';
import { projects } from '@/data/projects';
import type { Project } from '@/data/projects';
import ScreeningPanel from '@/components/sections/screening-panel';

/* ----------------------------------------------------------------
   Poster Card
   ---------------------------------------------------------------- */

interface PosterCardProps {
  project: Project;
  onSelect: (p: Project) => void;
}

function PosterCard({ project, onSelect }: PosterCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', cursor: 'pointer' }}
      onClick={() => onSelect(project)}
    >
      {/* Poster wrapper with hover overlay */}
      <DarkroomImage>
        <motion.div
          style={{ position: 'relative', width: '100%', aspectRatio: '2/3', overflow: 'hidden' }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          {/* Poster image */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <Image
              src={`/posters/${project.slug}.jpg`}
              alt={`${project.title} poster`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>

          {/* Hover overlay */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-4)',
            }}
          >
            {/* Play button */}
            <motion.span
              animate={{ opacity: hovered ? 1 : 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              aria-hidden="true"
              style={{
                color: 'var(--color-accent)',
                fontSize: '32px',
                lineHeight: 1,
                marginBottom: 'auto',
                marginTop: 'auto',
              }}
            >
              &#9654;
            </motion.span>

            {/* Logline at bottom */}
            <motion.p
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 'var(--space-4)',
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-body)',
                margin: 0,
              }}
            >
              {project.logline}
            </motion.p>
          </motion.div>
        </motion.div>
      </DarkroomImage>

      {/* Below-poster metadata */}
      <div>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-tight)',
            margin: 0,
          }}
        >
          {project.title}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wide)',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            margin: '4px 0 0',
          }}
        >
          {project.year}&nbsp;&middot;&nbsp;{project.genre}
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Filmography section
   ---------------------------------------------------------------- */

export default function Filmography() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <section
        id="filmography"
        aria-label="Filmography — project grid"
        style={{
          paddingTop: 'var(--space-16)',
          paddingBottom: 'var(--space-16)',
          paddingLeft: 'var(--space-8)',
          paddingRight: 'var(--space-8)',
        }}
      >
        {/* Frame line */}
        <div className="frame-line" style={{ marginBottom: 'var(--space-8)' }} />

        {/* Section label */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wide)',
            color: 'var(--color-accent)',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-10)',
          }}
        >
          Filmography
        </p>

        {/* 2-column grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-10)',
          }}
        >
          {projects.map((project) => (
            <PosterCard
              key={project.slug}
              project={project}
              onSelect={setSelectedProject}
            />
          ))}
        </div>
      </section>

      {/* Screening Panel */}
      <ScreeningPanel
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
