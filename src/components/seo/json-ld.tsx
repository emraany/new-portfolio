/**
 * Structured data (JSON-LD).
 *
 * The machine-readable answer to "who is this and what is this site". Without
 * it a search engine has only prose to infer identity from — it can read the
 * name on the page but has nothing connecting it to a job title, a location,
 * or a set of accounts.
 *
 * `sameAs` is the load-bearing field: it is how a search engine links the name
 * to the profiles, and what makes a knowledge-panel-style result possible at
 * all. Everything else is supporting detail.
 *
 * Rendered as a plain <script> rather than next/script, because structured
 * data has to be in the server-rendered HTML — crawlers parse the document
 * rather than waiting for client-side execution.
 */

import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  JOB_TITLE,
  LOCATION,
  PROFILES,
} from '@/lib/site';

const PERSON = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: SITE_NAME,
  url: SITE_URL,
  jobTitle: JOB_TITLE,
  homeLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: LOCATION.city,
      addressRegion: LOCATION.region,
      addressCountry: LOCATION.country,
    },
  },
  sameAs: PROFILES,
};

const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: 'en-US',
  /* Referenced by @id rather than repeating the Person inline, which is the
     whole reason these share one @graph. */
  publisher: { '@id': `${SITE_URL}/#person` },
};

const GRAPH = {
  '@context': 'https://schema.org',
  '@graph': [PERSON, WEBSITE],
};

export function PersonJsonLd() {
  return (
    <script
      type="application/ld+json"
      /* JSON.stringify already escapes quotes; `<` is escaped so no value can
         terminate the script tag early. */
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(GRAPH).replace(/</g, '\\u003c'),
      }}
    />
  );
}
