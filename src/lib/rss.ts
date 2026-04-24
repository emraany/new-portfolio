import { XMLParser } from 'fast-xml-parser';

export interface LetterboxdEntry {
  title: string;
  rating: number | null;
  watchDate: string;
  filmUrl: string;
}

const DIARY_URL = 'https://letterboxd.com/diinii32/rss/';
const WATCHLIST_URL = 'https://letterboxd.com/diinii32/watchlist/rss/';

function formatDate(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function extractTitle(rawTitle: string): string {
  // Letterboxd diary titles look like: "Watched Film Title, YYYY" or just "Film Title"
  // Strip leading "Watched " prefix if present
  let t = rawTitle.trim();
  if (t.toLowerCase().startsWith('watched ')) {
    t = t.slice(8);
  }
  // Strip trailing ", YYYY" year suffix if present
  t = t.replace(/,\s*\d{4}\s*$/, '');
  return t.trim();
}

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  'letterboxd:memberRating'?: number | string;
}

interface RSSChannel {
  item?: RSSItem | RSSItem[];
}

interface RSSFeed {
  rss?: {
    channel?: RSSChannel;
  };
}

export async function fetchLetterboxdFeed(
  type: 'diary' | 'watchlist'
): Promise<LetterboxdEntry[]> {
  const url = type === 'diary' ? DIARY_URL : WATCHLIST_URL;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const xml = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: true,
      parseAttributeValue: true,
    });

    const parsed = parser.parse(xml) as RSSFeed;
    const channel = parsed?.rss?.channel;
    if (!channel) return [];

    const rawItems = channel.item;
    if (!rawItems) return [];

    const items: RSSItem[] = Array.isArray(rawItems) ? rawItems : [rawItems];

    const entries: LetterboxdEntry[] = items.slice(0, 20).map((item) => {
      const rawTitle = typeof item.title === 'string' ? item.title : String(item.title ?? '');
      const title = extractTitle(rawTitle);

      const rawRating = item['letterboxd:memberRating'];
      let rating: number | null = null;
      if (rawRating !== undefined && rawRating !== null) {
        const n = Number(rawRating);
        if (!isNaN(n)) rating = n;
      }

      const watchDate = item.pubDate ? formatDate(String(item.pubDate)) : '';
      const filmUrl = typeof item.link === 'string' ? item.link : '';

      return { title, rating, watchDate, filmUrl };
    });

    return entries;
  } catch {
    return [];
  }
}
