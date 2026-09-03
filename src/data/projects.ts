export interface Project {
  slug: string;
  title: string;
  year: number;
  genre?: string;
  logline: string;
  synopsis: string;
  starring: string[];
  rating?: string;
  productionNotes?: string;
  liveUrl?: string;
  repoUrl?: string;
  videoUrl?: string;
  award?: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    slug: 'conflict-coordinate',
    title: 'Conflict Coordinate',
    year: 2026,
    genre: 'ML / Geospatial',
    logline: 'Real-time conflict event mapping using conflict tracking sources and ML classification.',
    synopsis: 'The Conflict Coordinate is a neutral, source-cited platform that visualizes active global conflicts on an interactive 3D globe, ingesting live data from ACLED, GDELT, and UCDP to track events in real time, giving you a place to clearly track the world\'s conflicts. Built on a FastAPI + PostgreSQL backend with a React/TypeScript frontend, every claim on the platform is traceable to a cited primary source — no editorial spin, no AI-generated summaries. Soon to come are named entity recognition across conflict reports, actor network graphing, and ML-trained escalation forecasting.',
    starring: ['FastAPI', 'PostgreSQL', 'React', 'TypeScript', 'spaCy', 'PyTorch'],
    featured: true,
  },
  {
    slug: 'datacenter-operations-platform',
    title: 'Datacenter Operations Platform',
    year: 2025,
    genre: 'Infrastructure / AI',
    logline: 'Centralizing and simplifying complex data-center operations into one intuitive platform.',
    synopsis: 'A full-stack Next.js + TypeScript platform that acts as a single command center to aid data-center management. It features AI-powered ticket creation directly from Slack and email, a multi-constraint routing engine that accounts for floor elevation, elevators, and technician health, ticket bundling using cosine similarity on task descriptions to save technicians time, and predictive inventory forecasting based on real-time usage trends. Includes interactive 3D rack visualization, role-based views, and a polished dark-theme UI designed for large-scale infrastructure.',
    starring: ['Next.js', 'React', 'MongoDB', 'Tailwind CSS', 'Three.js'],
    repoUrl: 'https://github.com/emraany/hackutd2025',
    videoUrl: 'https://www.youtube.com/watch?v=sbdnZRNmm8o',
    productionNotes: 'Won 3rd Place at HackUTD 2025 — a hackathon with over 1200 competitors and the largest 24 hour hackathon in North America',
    featured: false,
  },
  {
    slug: 'quranscope',
    title: 'QuranScope',
    year: 2025,
    genre: 'NLP / Search',
    logline: 'Semantic search across Quranic text with support for AI-powered summaries and questions.',
    synopsis: 'A full-stack Next.js + Python platform for exploring the Qur\'an, combining advanced search and theme navigation with responsive design. It features integrated AI-powered explanations and summaries at both the verse and surah level.',
    starring: ['Next.js', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'OpenAI API'],
    liveUrl: 'https://quranscope.vercel.app/',
    repoUrl: 'https://github.com/emraany/quranscope',
    productionNotes: 'Negotiated licensing with two mosques to be used in their Quran Education systems, reaching 250+ students.',
    featured: false,
  },
  {
    slug: 'hypertrophy-tracker',
    title: 'Hypertrophy Tracker',
    year: 2025,
    genre: 'Health Technology',
    logline: 'Science-based workout logging and progressive overload tracking for hypertrophy.',
    synopsis: 'A full-stack React + Node.js fitness tracker for logging workouts, tracking progression, and visualizing strength gains. It features interactive charts, custom exercise support, and real-time progress insights for both desktop and mobile users.',
    starring: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB'],
    liveUrl: 'https://hypertrophytracker.vercel.app/',
    repoUrl: 'https://github.com/emraany/hypertrophy-tracker-frontend',
    featured: false,
  },
  {
    slug: 'bjj-simulator',
    title: 'BJJ Simulator',
    year: 2024,
    genre: 'Sports / Simulation',
    logline: 'Interactive Brazilian Jiu-Jitsu position and submission viewer.',
    synopsis: 'A Java simulation engine that encodes Brazilian Jiu-Jitsu as a branching state model, simulating positions, transitions, and submissions with control and energy dynamics. Built with Spring Boot for persistence and a console-first interface (JavaFX planned), it demonstrates algorithmic modeling of grappling flow for training and competition preparation.',
    starring: ['Java'],
    repoUrl: 'https://github.com/emraany/bjj-simulator',
    featured: false,
  },
  {
    slug: 'caketopia',
    title: 'Caketopia',
    year: 2025,
    genre: 'Game Development',
    logline: 'Cake stacking game in Greenfoot with physics elements implemented.',
    synopsis: 'A Java-based stacking game built in the Greenfoot environment where players stack moving cake layers to build the tallest tower possible. It features keyboard-controlled movement timing, collision detection for randomly appearing bird obstacles, and a trimming mechanic that makes the stacking surface smaller when layers are misaligned, increasing the difficulty as the game progresses. Includes an optional turn-based multiplayer mode, a scoring system based on tower height and placement accuracy, and clear game-over conditions.',
    starring: ['Java', 'Greenfoot'],
    repoUrl: 'https://github.com/emraany/caketopia',
    featured: false,
  },
  {
    slug: 'assembly-game',
    title: 'Assembly Multiplication Game',
    year: 2023,
    genre: 'Educational',
    logline: 'Multiplication card game built entirely in MIPS Assembly.',
    synopsis: 'A MIPS assembly game that allows for the practice of multiplication skills through a memory-flip mechanic. Players uncover cards, match problems with their correct answers, and progress by sharpening recall and accuracy. Designed with low-level logic and register operations, it highlights efficiency and control flow at the hardware-near level of programming.',
    starring: ['MIPS Assembly'],
    repoUrl: 'https://github.com/emraany/CompArch-Term-Project',
    featured: false,
  },
];

export const featuredProject = projects.find(p => p.featured)!;
