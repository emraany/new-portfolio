export interface Top10Film {
  rank: number;
  title: string;
  tmdbId: number;
  year: number;
  myRating: number;
  posterPath?: string;
}

export const top10Films: Top10Film[] = [
  {
  rank: 1,
  title: 'The Shining',
  tmdbId: 694,
  year: 1980,
  myRating: 5,
  posterPath: '/fFYAlrOudDJRYs8tvuHbUk0OGdL.jpg',
},
  { rank: 2,  title: 'Dune: Part Two',             tmdbId: 693134, year: 2024, myRating: 5, posterPath: '/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg' },
  { rank: 3,  title: 'Uncut Gems',                tmdbId: 473033,    year: 2019, myRating: 5, posterPath: '/5GOEm3hNPWWhn2smyzptN7NmxOa.jpg' },
  { rank: 4,  title: 'Punch-Drunk Love',           tmdbId: 8051,   year: 2002, myRating: 5, posterPath: '/m4PnumkMQ1qSzCC88OBer4ofDaC.jpg' },
  { rank: 5,  title: 'The Lighthouse',             tmdbId: 503919, year: 2019, myRating: 5, posterPath: '/xLtSALnb2QiNBWkpaEJaVSNUach.jpg' },
  { rank: 6,  title: 'There Will Be Blood',        tmdbId: 7345,   year: 2007, myRating: 5, posterPath: '/g4GBTSONyMCrDE0D193LQypeKXW.jpg' },
  { rank: 7,  title: 'Phantom Thread',             tmdbId: 400617, year: 2017, myRating: 5, posterPath: '/mgeVXLTdqtA5gf0cm0ZVd9GAvsm.jpg' },
  { rank: 8,  title: 'Heat',                       tmdbId: 949,    year: 1995, myRating: 5, posterPath: '/3EaheZ4fRjr7K1WT4A88ENnUT9Q.jpg' },
  { rank: 9, title: 'Thief',                      tmdbId: 11524,  year: 1981, myRating: 5, posterPath: '/jes9bFLaKSu6LrBUIODrtZ7FJkM.jpg' },
  { rank: 10,  title: 'Eyes Wide Shut',             tmdbId: 345,     year: 1999, myRating: 5, posterPath: '/bYixINmclYNkF64iVRHhp6LE8xn.jpg' },
];
