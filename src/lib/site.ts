/**
 * Canonical facts about the site, in one place.
 *
 * Metadata, robots, the sitemap and the structured data all have to agree
 * about the same handful of strings — and when they disagree, nothing errors,
 * the site just quietly tells search engines contradictory things.
 */

export const SITE_URL = 'https://emraanyusuf.com';

export const SITE_NAME = 'Emraan Yusuf';

export const SITE_DESCRIPTION =
  'Film portfolio — software engineer, ML researcher, and cinephile.';

export const LOCATION = { city: 'Dallas', region: 'TX', country: 'US' } as const;

export const JOB_TITLE = 'Software Engineer';

/**
 * Verified profiles.
 *
 * This becomes `sameAs` in the structured data, which is an assertion that
 * these accounts are the same person as the subject — so a wrong entry
 * actively misleads a search engine rather than merely wasting a line.
 */
export const PROFILES = [
  'https://github.com/emraany',
  'https://linkedin.com/in/emraanyusuf',
] as const;
