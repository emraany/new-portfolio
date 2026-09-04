'use client';

/**
 * TicketNav
 *
 * Floating bottom-center navigation (desktop) / bottom-right hamburger
 * that slides up a full-width drawer (mobile).
 *
 * Desktop (≥ 768px):
 *   - Fixed pill, bottom-center
 *   - Each section rendered as a ticket-stub button with a perforation
 *     divider between items
 *   - Active section: amber text + underline dot
 *   - Hover: y: -1px, brighter text
 *
 * Mobile (< 768px):
 *   - Hamburger button (three stacked bars with perf dots) fixed bottom-right
 *   - Tap opens a slide-up drawer with all nav items (48px touch targets)
 *   - Framer Motion AnimatePresence controls the drawer
 *
 * Reduced motion:
 *   - scrollIntoView uses 'instant' instead of 'smooth'
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentSection } from '@/components/persistent/scroll-provider';

/* ----------------------------------------------------------------
   Navigation sections
   ---------------------------------------------------------------- */

interface NavSection {
  id: string;
  label: string;
}

const SECTIONS: NavSection[] = [
  { id: 'hero',           label: 'TITLE CARD'    },
  { id: 'about',          label: 'SYNOPSIS'      },
  { id: 'filmography',    label: 'FILMOGRAPHY'   },
  { id: 'experience',     label: 'PRODUCTION CREDITS'       },
  { id: 'skills',         label: 'THE CREW'      },
  { id: 'archive',        label: 'OFF-SCREEN'    },
  { id: 'screening-room', label: 'SCREENING ROOM'},
  { id: 'credits',        label: 'THE END/CREDITS'       },
];

/* ----------------------------------------------------------------
   Helpers
   ---------------------------------------------------------------- */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? 'instant' : 'smooth',
  });
}

/* ----------------------------------------------------------------
   Shared styles (CSS-in-JS via inline + <style> tag)
   ---------------------------------------------------------------- */

const BASE_ITEM_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '8px 12px',
  position: 'relative' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '4px',
  transition: 'color 150ms ease',
};

/* ----------------------------------------------------------------
   Desktop nav item
   ---------------------------------------------------------------- */

interface DesktopNavItemProps {
  section: NavSection;
  isActive: boolean;
  isLast: boolean;
  onClick: (id: string) => void;
}

function DesktopNavItem({ section, isActive, isLast, onClick }: DesktopNavItemProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch' }}>
      <motion.button
        onClick={() => onClick(section.id)}
        whileHover={{ y: -1 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="cursor-target"
        style={{
          ...BASE_ITEM_STYLE,
          color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
        }}
        aria-current={isActive ? 'page' : undefined}
      >
        <span>{section.label}</span>
        {/* Amber underline dot for active state */}
        <span
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'var(--color-accent)',
            opacity: isActive ? 1 : 0,
            transition: 'opacity 200ms ease',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
      </motion.button>

      {/* Perforation divider between items */}
      {!isLast && (
        <div
          aria-hidden="true"
          style={{
            width: '1px',
            background: 'var(--color-border)',
            alignSelf: 'stretch',
            margin: '6px 0',
          }}
        />
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
   Mobile hamburger icon — three stacked rects with perf dots
   ---------------------------------------------------------------- */

function HamburgerIcon() {
  return (
    <svg
      width="22"
      height="18"
      viewBox="0 0 22 18"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Three horizontal bars, each with a perforation dot on the left */}
      {[0, 7, 14].map((y) => (
        <g key={y}>
          {/* Perf dot */}
          <circle cx="2" cy={y + 2} r="1.5" fill="var(--color-accent)" />
          {/* Bar */}
          <rect x="7" y={y} width="15" height="4" rx="1" fill="var(--color-accent)" />
        </g>
      ))}
    </svg>
  );
}

/* ----------------------------------------------------------------
   Mobile drawer
   ---------------------------------------------------------------- */

interface MobileDrawerProps {
  isOpen: boolean;
  activeSection: string;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

function MobileDrawer({ isOpen, activeSection, onClose, onNavigate }: MobileDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10, 10, 10, 0.6)',
              zIndex: 'calc(var(--z-nav) - 1)' as unknown as number,
            }}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.nav
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            aria-label="Site navigation"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 'var(--z-nav)' as unknown as number,
              background: 'rgba(20, 20, 20, 0.97)',
              backdropFilter: 'blur(12px)',
              borderTop: '1px solid var(--color-border)',
              borderRadius: '8px 8px 0 0',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Drawer handle */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '12px 0 4px',
              }}
              aria-hidden="true"
            >
              <div
                style={{
                  width: '36px',
                  height: '3px',
                  borderRadius: '2px',
                  background: 'var(--color-border)',
                }}
              />
            </div>

            {/* Nav items */}
            <ul
              role="list"
              style={{
                listStyle: 'none',
                margin: 0,
                padding: '8px 0 16px',
              }}
            >
              {SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <li key={section.id}>
                    <button
                      onClick={() => {
                        onNavigate(section.id);
                        onClose();
                      }}
                      style={{
                        width: '100%',
                        minHeight: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '0 24px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        textAlign: 'left',
                        transition: 'color 150ms ease',
                      }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {/* Perf dot accent */}
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                          flexShrink: 0,
                          transition: 'background 150ms ease',
                        }}
                        aria-hidden="true"
                      />
                      {section.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------------------------------------------
   Root component
   ---------------------------------------------------------------- */

export default function TicketNav() {
  const currentSection = useCurrentSection();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigate = useCallback((id: string) => {
    scrollToSection(id);
  }, []);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <>
      {/* ---- Desktop pill nav ---- */}
      <nav
        aria-label="Site navigation"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 'var(--z-nav)' as unknown as number,
          alignItems: 'stretch',
          background: 'rgba(20, 20, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--color-border)',
          borderRadius: '4px',
          padding: '0 4px',
        }}
        /* Hide on mobile via CSS below */
        className="ticket-nav-desktop"
      >
        {SECTIONS.map((section, i) => (
          <DesktopNavItem
            key={section.id}
            section={section}
            isActive={currentSection === section.id}
            isLast={i === SECTIONS.length - 1}
            onClick={handleNavigate}
          />
        ))}
      </nav>

      {/* ---- Mobile hamburger trigger ---- */}
      <div className="ticket-nav-mobile">
        <button
          onClick={toggleDrawer}
          aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={drawerOpen}
          className="ticket-nav-hamburger"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: 'calc(var(--perf-strip-width) + 12px)',
            zIndex: 'calc(var(--z-nav) + 1)' as unknown as number,
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(20, 20, 20, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <HamburgerIcon />
        </button>

        <MobileDrawer
          isOpen={drawerOpen}
          activeSection={currentSection}
          onClose={closeDrawer}
          onNavigate={handleNavigate}
        />
      </div>

      {/* ---- Responsive visibility rules ---- */}
      <style>{`
        .ticket-nav-desktop {
          display: flex;
        }
        .ticket-nav-mobile {
          display: none;
        }

        @media (max-width: 767px) {
          .ticket-nav-desktop {
            display: none;
          }
          .ticket-nav-mobile {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
