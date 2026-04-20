import type { Metadata } from 'next';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import FilmGrain from '@/components/persistent/film-grain';
import FilmPerforations from '@/components/persistent/film-perforations';
import ScrollDriver from '@/components/persistent/scroll-driver';

/* ----------------------------------------------------------------
   Google Fonts — loaded at build time via next/font.
   Each font exposes a CSS variable that globals.css picks up
   via var(--font-playfair), var(--font-inter), var(--font-jetbrains).
   ---------------------------------------------------------------- */

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-playfair',
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
        playfair.variable,
        inter.variable,
        jetbrainsMono.variable,
        'h-full antialiased',
      ].join(' ')}
    >
      <body className="min-h-full overflow-x-hidden">
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
