export interface Project {
  slug: string;           // used for poster path: /public/posters/[slug].jpg
  title: string;
  year: number;
  genre: string;          // e.g. "ML / Full-Stack"
  logline: string;        // one sentence
  synopsis: string;       // 2-3 sentences
  starring: string[];     // key technologies
  rating: string;         // e.g. "PG-13" or "R" — cinematic joke rating
  productionNotes: string;
  liveUrl?: string;
  repoUrl?: string;
  award?: string;         // e.g. "Best Picture — HackUTD 2024"
  featured: boolean;      // true for "Now Playing" spotlight
}

export const projects: Project[] = [
  {
    slug: 'conflict-coordinate',
    title: 'Conflict Coordinate',
    year: 2024,
    genre: 'ML / Geospatial',
    logline: 'Real-time conflict event mapping using satellite imagery and NLP classification.',
    synopsis: 'Placeholder synopsis. Emraan will fill this in.',
    starring: ['Python', 'PyTorch', 'React', 'Mapbox', 'FastAPI'],
    rating: 'R',
    productionNotes: 'Placeholder production notes.',
    liveUrl: undefined,
    repoUrl: undefined,
    award: 'Best Use of Data — HackUTD 2024',
    featured: true,
  },
  {
    slug: 'dc-daddy',
    title: 'DC Daddy',
    year: 2025,
    genre: 'Civic Technology',
    logline: 'Making DC council data accessible to constituents and held officials accountable.',
    synopsis: 'Placeholder synopsis.',
    starring: ['Next.js', 'Python', 'Supabase'],
    rating: 'PG-13',
    productionNotes: 'Placeholder production notes.',
    award: 'HackUTD 2025 — 3rd Place',
    featured: false,
  },
  {
    slug: 'quranscope',
    title: 'QuranScope',
    year: 2024,
    genre: 'NLP / Search',
    logline: 'Semantic search across Quranic text using transformer models.',
    synopsis: 'Placeholder synopsis.',
    starring: ['Python', 'Hugging Face', 'Flask'],
    rating: 'G',
    productionNotes: 'Placeholder production notes.',
    featured: false,
  },
  {
    slug: 'hypertrophy-tracker',
    title: 'Hypertrophy Tracker',
    year: 2024,
    genre: 'Health Technology',
    logline: 'Science-based workout logging and progressive overload tracking for hypertrophy.',
    synopsis: 'Placeholder synopsis.',
    starring: ['React', 'Node.js', 'MongoDB'],
    rating: 'PG',
    productionNotes: 'Placeholder production notes.',
    featured: false,
  },
  {
    slug: 'bjj-simulator',
    title: 'BJJ Simulator',
    year: 2024,
    genre: 'Sports Simulation',
    logline: 'Interactive Brazilian Jiu-Jitsu position and submission trainer.',
    synopsis: 'Placeholder synopsis.',
    starring: ['TypeScript', 'React'],
    rating: 'G',
    productionNotes: 'Placeholder production notes.',
    featured: false,
  },
  {
    slug: 'assembly-game',
    title: 'Assembly Multiplication Game',
    year: 2023,
    genre: 'Educational',
    logline: 'Multiplication game built entirely in x86 Assembly — no shortcuts.',
    synopsis: 'The very site you are watching.',
    starring: ['x86 Assembly'],
    rating: 'PG',
    productionNotes: 'Self-referential. Very meta.',
    featured: false,
  },
];

export const featuredProject = projects.find(p => p.featured)!;
