export interface Project {
  slug: string;
  title: string;
  year: number;
  genre: string;
  logline: string;
  synopsis: string;
  starring: string[];
  rating: number;
  productionNotes: string;
  repoUrl?: string;
  demoUrl?: string;
  award?: string;
}

export const projects: Project[] = [
  {
    slug: 'conflict-coordinate',
    title: 'Conflict Coordinate',
    year: 2025,
    genre: 'Geospatial Intelligence',
    logline: 'Real-time conflict tracking and visualization at global scale.',
    synopsis: 'Placeholder synopsis.',
    starring: ['React', 'FastAPI', 'PostgreSQL', 'PostGIS'],
    rating: 5,
    productionNotes: 'Placeholder production notes.',
  },
  {
    slug: 'dc-daddy',
    title: 'DC Daddy',
    year: 2025,
    genre: 'Civic Technology',
    logline: 'Making DC council data accessible to constituents.',
    synopsis: 'Placeholder synopsis.',
    starring: ['Next.js', 'Python', 'Supabase'],
    rating: 4,
    productionNotes: 'Placeholder production notes.',
    award: 'HackUTD 2025 — 3rd Place',
  },
  {
    slug: 'quranscope',
    title: 'QuranScope',
    year: 2024,
    genre: 'NLP / Search',
    logline: 'Semantic search across Quranic text using transformer models.',
    synopsis: 'Placeholder synopsis.',
    starring: ['Python', 'Hugging Face', 'Flask'],
    rating: 4,
    productionNotes: 'Placeholder production notes.',
  },
  {
    slug: 'hypertrophy-tracker',
    title: 'Hypertrophy Tracker',
    year: 2024,
    genre: 'Health Technology',
    logline: 'Science-based workout logging and volume tracking.',
    synopsis: 'Placeholder synopsis.',
    starring: ['React', 'Node.js', 'MongoDB'],
    rating: 4,
    productionNotes: 'Placeholder production notes.',
  },
  {
    slug: 'bjj-simulator',
    title: 'BJJ Simulator',
    year: 2024,
    genre: 'Sports Simulation',
    logline: 'Interactive Brazilian Jiu-Jitsu position and submission trainer.',
    synopsis: 'Placeholder synopsis.',
    starring: ['TypeScript', 'React'],
    rating: 3,
    productionNotes: 'Placeholder production notes.',
  },
  {
    slug: 'assembly-game',
    title: 'Assembly Multiplication Game',
    year: 2023,
    genre: 'Educational',
    logline: 'Multiplication game built entirely in x86 Assembly.',
    synopsis: 'Placeholder synopsis.',
    starring: ['x86 Assembly'],
    rating: 3,
    productionNotes: 'Placeholder production notes.',
  },
];
