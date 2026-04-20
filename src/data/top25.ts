export interface FilmEntry {
  title: string;
  tmdbId: number;
  rating: number;
  influenceNote?: string;
}

export const top25: FilmEntry[] = [
  { title: 'Heat', tmdbId: 949, rating: 5, influenceNote: 'systems, coordination, precision' },
  { title: 'Sicario', tmdbId: 273481, rating: 5, influenceNote: 'atmosphere, restraint, tension' },
  { title: 'The Batman', tmdbId: 414906, rating: 5 },
  { title: 'Blade Runner 2049', tmdbId: 335984, rating: 5 },
  { title: 'Uncut Gems', tmdbId: 473033, rating: 5, influenceNote: 'pressure, momentum, no exits' },
  { title: 'The Lighthouse', tmdbId: 503919, rating: 5, influenceNote: 'atmosphere, restraint, tension' },
  { title: 'There Will Be Blood', tmdbId: 840, rating: 5, influenceNote: 'intensity, ambition, singular voice' },
  { title: 'Whiplash', tmdbId: 244786, rating: 5, influenceNote: 'the cost of craft' },
  { title: 'No Country for Old Men', tmdbId: 6977, rating: 5 },
  { title: 'Parasite', tmdbId: 496243, rating: 5 },
  { title: 'The Godfather', tmdbId: 238, rating: 5 },
  { title: 'Mulholland Drive', tmdbId: 1018, rating: 5 },
  { title: 'Drive', tmdbId: 57158, rating: 5 },
  { title: 'Prisoners', tmdbId: 146233, rating: 5 },
  { title: 'Zodiac', tmdbId: 1949, rating: 5 },
  { title: 'The Social Network', tmdbId: 37799, rating: 5 },
  { title: 'Inception', tmdbId: 27205, rating: 5 },
  { title: 'Mad Max: Fury Road', tmdbId: 76341, rating: 5 },
  { title: 'Children of Men', tmdbId: 9693, rating: 5 },
  { title: 'Enemy', tmdbId: 149870, rating: 5 },
  { title: 'Nightcrawler', tmdbId: 227506, rating: 5 },
  { title: 'Gone Girl', tmdbId: 210577, rating: 5 },
  { title: 'The Master', tmdbId: 68737, rating: 5 },
  { title: 'A Prophet', tmdbId: 38807, rating: 5 },
  { title: 'Memories of Murder', tmdbId: 4550, rating: 5 },
];
