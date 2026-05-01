import type { Metadata } from 'next';
import { Archivo_Narrow, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import FilmGrain from '@/components/persistent/film-grain';
import FilmPerforations from '@/components/persistent/film-perforations';
import ScrollDriver from '@/components/persistent/scroll-driver';
import ScrollReset from '@/components/persistent/scroll-reset';
import ProjectorCursor from '@/components/persistent/projector-cursor';
import FrameCounter from '@/components/persistent/frame-counter';
import TicketNav from '@/components/persistent/ticket-nav';
import AmbientType from '@/components/persistent/ambient-type';

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

        {/* Drives --scroll-y CSS var and fast-scroll class on body */}
        <ScrollDriver />

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
        <div className="film-content">
          {children}
        </div>
      </body>
    </html>
  );
}
