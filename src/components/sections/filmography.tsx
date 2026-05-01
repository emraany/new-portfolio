'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import DarkroomImage from '@/components/animations/darkroom-image';
import { FrameMarks } from '@/components/ui/frame-marks';
import { projects } from '@/data/projects';
import type { Project } from '@/data/projects';
import ScreeningPanel from '@/components/sections/screening-panel';
import SectionHeader from '@/components/ui/section-header';

/* ----------------------------------------------------------------
   Poster Card
   ---------------------------------------------------------------- */

interface PosterCardProps {
  project: Project;
  index: number;
  onSelect: (p: Project) => void;
}

function PosterCard({ project, index, onSelect }: PosterCardProps) {
  const [hovered, setHovered] = useState(false);
  const frameLabel = `${String(index + 1).padStart(2, '0')}A`;

  return (
    <div
      className="cursor-target"
      style={{ cursor: 'pointer', position: 'relative', width: '100%' }}
      onClick={() => onSelect(project)}
    >
      <DarkroomImage className="darkroom-block">
        <FrameMarks style={{ width: '100%', display: 'block' }}>
          <motion.div
            style={{ position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden' }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
          >
            {/* Frame number badge */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 'var(--space-2)',
                left: 'var(--space-2)',
                zIndex: 2,
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'var(--color-text-muted)',
                opacity: 0.6,
                lineHeight: 1,
                pointerEvents: 'none',
              }}
            >
              {frameLabel}
            </span>

            {/* Image */}
            <div style={{ position: 'absolute', inset: 0 }}>
              <Image
                src={`/posters/${project.slug}.png`}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ objectFit: 'cover', objectPosition: 'top' }}
              />
            </div>

            {/* Bottom scrim + metadata */}
            <motion.div
              animate={{ opacity: hovered ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 'var(--space-6) var(--space-4) var(--space-4)',
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-tight)',
                margin: 0,
              }}>
                {project.title}
              </p>
            </motion.div>

            {/* Hover overlay */}
            <motion.div
              animate={{ opacity: hovered ? 1 : 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.72)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
                padding: 'var(--space-4)',
              }}
            >
              <motion.span
                animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
                initial={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                aria-hidden="true"
                className="cursor-target"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-bg)',
                  fontSize: '26px',
                  lineHeight: 1,
                  paddingLeft: '4px',
                  boxShadow: '0 0 0 6px rgba(201,183,152,0.18)',
                }}
              >
                &#9654;
              </motion.span>

              {/* Bottom-left caption */}
              <motion.div
                animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
                initial={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3, delay: 0.08 }}
                style={{
                  position: 'absolute',
                  bottom: 'var(--space-4)',
                  left: 'var(--space-4)',
                  right: 'var(--space-4)',
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-tight)',
                  margin: '0 0 var(--space-1)',
                }}>{project.title}</p>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-body)',
                  margin: 0,
                }}>{project.logline}</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </FrameMarks>
      </DarkroomImage>
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
      <style>{`
        .filmography-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-10);
        }
        @media (max-width: 1023px) {
          .filmography-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-6);
          }
        }
        @media (max-width: 599px) {
          .filmography-grid {
            grid-template-columns: 1fr;
            gap: var(--space-6);
          }
        }
      `}</style>

      <section
        id="filmography"
        aria-label="Filmography — project grid"
        style={{
          paddingTop: 'var(--space-16)',
          paddingBottom: 'var(--space-16)',
          paddingLeft: 'var(--section-pad-x)',
          paddingRight: 'var(--section-pad-x)',
        }}
      >
        <SectionHeader label="FILMOGRAPHY" heading="[Projects]" />

        <div className="filmography-grid">
          {projects.map((project, index) => (
            <PosterCard
              key={project.slug}
              project={project}
              index={index}
              onSelect={setSelectedProject}
            />
          ))}
        </div>
      </section>

      <ScreeningPanel
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
