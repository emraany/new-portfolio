import type { Metadata } from 'next';
import {
  Archivo_Narrow,
  Inter,
  JetBrains_Mono,
  IBM_Plex_Mono,
  Special_Elite,
  Marcellus,
  Scheherazade_New,
} from 'next/font/google';
import './globals.css';
import FilmGrain from '@/components/persistent/film-grain';
import FilmPerforations from '@/components/persistent/film-perforations';
import ScrollEngine from '@/components/persistent/scroll-provider';
import ScrollReset from '@/components/persistent/scroll-reset';
import ProjectorCursor from '@/components/persistent/projector-cursor';
import FrameCounter from '@/components/persistent/frame-counter';
import TicketNav from '@/components/persistent/ticket-nav';
import AmbientType from '@/components/persistent/ambient-type';
import { CapabilityProvider } from '@/lib/capability/capability-context';

/* ----------------------------------------------------------------
   Google Fonts — loaded at build time via next/font.
   Each font exposes a CSS variable that globals.css picks up
   via var(--font-archivo), var(--font-inter), var(--font-jetbrains).
   ---------------------------------------------------------------- */

const archivo = Archivo_Narrow({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-archivo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

/* ----------------------------------------------------------------
   Project-preview fonts.

   The animated project previews in the Filmography grid render each
   project's real UI, so they need each project's real typeface — the
   previews live on this page, not inside those apps, so the fonts have
   to be loaded here. Weights are kept to the single cut each preview
   actually draws with.
   ---------------------------------------------------------------- */

/* The Conflict Coordinate — frontend/index.html */
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

/* The Conflict Coordinate — tokens.ts `fonts.stamp` */
const specialElite = Special_Elite({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-special-elite',
  display: 'swap',
});

/* QuranScope — layout.tsx `--font-brand` */
const marcellus = Marcellus({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-marcellus',
  display: 'swap',
});

/* QuranScope — layout.tsx `--font-arabic` */
const scheherazade = Scheherazade_New({
  subsets: ['arabic'],
  weight: '400',
  variable: '--font-arabic',
  display: 'swap',
});

/* ----------------------------------------------------------------
   Metadata
   ---------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Emraan Yusuf',
  description:
    'Film portfolio — software engineer, ML researcher, and cinephile.',
  icons: {
    icon: '/favicon.ico',
  },
};

/* ----------------------------------------------------------------
   Root Layout
   ---------------------------------------------------------------- */

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={[
        archivo.variable,
        inter.variable,
        jetbrainsMono.variable,
        plexMono.variable,
        specialElite.variable,
        marcellus.variable,
        scheherazade.variable,
        'h-full antialiased',
      ].join(' ')}
    >
      <body className="min-h-full overflow-x-hidden">
        {/* Refresh always lands on the title page — disable the browser's
            automatic scroll restoration on mount and reset to (0, 0). */}
        <ScrollReset />
        {/* --------------------------------------------------------
            Persistent film-strip elements.
            These sit above content at all times (z-index defined
            in variables.css). They never unmount.
            -------------------------------------------------------- */}

        {/* Animated noise grain — fixed, full-viewport */}
        <FilmGrain />

        {/* Left & right perforation strips */}
        <FilmPerforations />

        {/* The site's single scroll subscription: publishes the current
            section and the HUD frame count, and writes --scroll-y. Nothing
            runs while the page is still. */}
        <ScrollEngine />

        {/* Custom focus-reticle cursor — desktop only */}
        <ProjectorCursor />

        {/* Section name ghost text — fixed, full-viewport, pointer-events: none */}
        <AmbientType />

        {/* REEL/frame HUD — top-right, hidden on mobile */}
        <FrameCounter />

        {/* Pill nav (desktop) / hamburger drawer (mobile) */}
        <TicketNav />

        {/* --------------------------------------------------------
            Content area — inset from the perforation strips.
            film-content class applies the margin-left / margin-right
            defined in perforations.css.
            -------------------------------------------------------- */}
        {/* Decides how many of the seven live previews this device runs.
            Only the previews are gated — grain, perforations, cursor,
            ambient type and the intro are the site's identity and are never
            taken away. */}
        <CapabilityProvider>
          <div className="film-content">
            {children}
          </div>
        </CapabilityProvider>
      </body>
    </html>
  );
}
