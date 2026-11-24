import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const BASE_URL = 'https://basicenglish.school';
const SITE_NAME = 'Basic English';
const PERSON_ID = 'https://johnbendfeldt.com/#person';

const ROUTES = [
  {
    path: '/alphabet',
    title: 'English Alphabet & Phonics | Basic English',
    description:
      'Learn the 26 letters of the English alphabet with phonics, pronunciation guides, and audio examples. Free interactive English alphabet chart for beginners.',
    heading: 'English Alphabet & Phonics',
    summary:
      'Master all 26 letters of the English alphabet with clear phonics sounds, IPA pronunciation guides, example words, and studio neural audio.',
  },
  {
    path: '/phrases',
    title: 'Basic English Phrases | Basic English',
    description:
      'Learn essential English phrases for beginners with native audio pronunciation. Greetings, introductions, everyday polite expressions, and travel essentials.',
    heading: 'Basic English Phrases for Beginners',
    summary:
      'Practice essential English greetings, introductions, polite expressions, and travel phrases with native studio audio pronunciation.',
  },
  {
    path: '/numbers',
    title: 'English Numbers & Time | Basic English',
    description:
      'Learn English numbers and how to tell time with native audio pronunciation. Count in English from 0 to 100 and beyond. Free interactive number lessons.',
    heading: 'English Numbers & Telling Time',
    summary:
      'Learn to count in English and tell time accurately with interactive pronunciation cards and studio neural audio.',
  },
  {
    path: '/words',
    title: 'Common English Words | Basic English',
    description:
      'Learn high-frequency English vocabulary with audio pronunciation and contextual definitions. Build your English vocabulary with everyday words.',
    heading: 'Common English Words & Vocabulary',
    summary:
      'Build your core ESL vocabulary with high-frequency everyday English words, clear contextual meanings, and studio neural audio.',
  },
  {
    path: '/quiz',
    title: 'English Quiz | Basic English',
    description:
      'Test your English knowledge with interactive quizzes covering alphabet, phonics, vocabulary, numbers, and everyday phrases. Free English language practice.',
    heading: 'Interactive English Practice Quiz',
    summary:
      'Test your English phonics, vocabulary, numbers, and everyday phrases with adaptive typo-tolerant spaced-repetition quizzes.',
  },
];

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export function buildRouteJsonLd(baseJsonLd, route) {
  const canonicalUrl = `${BASE_URL}${route.path}`;
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  const graph = Array.isArray(baseJsonLd['@graph']) ? [...baseJsonLd['@graph']] : [];

  graph.push(
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: route.title,
      description: route.description,
      inLanguage: 'en',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      about: { '@id': `${BASE_URL}/#course` },
      author: { '@id': PERSON_ID },
      breadcrumb: { '@id': breadcrumbId },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: SITE_NAME,
          item: `${BASE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: route.heading,
          item: canonicalUrl,
        },
      ],
    }
  );

  return {
    ...baseJsonLd,
    '@graph': graph,
  };
}

export function generateSeoRoutes() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Missing built index.html at ${indexPath}`);
  }

  const template = fs.readFileSync(indexPath, 'utf-8');
  const ldMatch = template.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  const baseJsonLd = ldMatch ? JSON.parse(ldMatch[1]) : null;

  for (const route of ROUTES) {
    const canonicalUrl = `${BASE_URL}${route.path}`;
    const escapedTitle = escapeHtml(route.title);
    const escapedDesc = escapeHtml(route.description);

    let html = template
      .replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapedTitle}</title>`)
      .replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        () => `<meta name="description" content="${escapedDesc}" />`
      )
      .replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
        () => `<link rel="canonical" href="${canonicalUrl}" />`
      )
      .replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
        () => `<meta property="og:url" content="${canonicalUrl}" />`
      )
      .replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
        () => `<meta property="og:title" content="${escapedTitle}" />`
      )
      .replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
        () => `<meta property="og:description" content="${escapedDesc}" />`
      )
      .replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
        () => `<meta name="twitter:title" content="${escapedTitle}" />`
      )
      .replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
        () => `<meta name="twitter:description" content="${escapedDesc}" />`
      )
      .replace(
        /<noscript>[\s\S]*?<\/noscript>/i,
        () => `<noscript>
      <h1>${escapeHtml(route.heading)}</h1>
      <p>${escapeHtml(route.summary)} Created by <a href="https://johnbendfeldt.com/" rel="author">John Bendfeldt</a>. Please enable JavaScript to use the full interactive app.</p>
      <nav aria-label="Lessons and resources">
        <ul>
          <li><a href="/">Basic English Home</a></li>
          <li><a href="/alphabet">English Alphabet &amp; Phonics</a></li>
          <li><a href="/phrases">Basic English Phrases</a></li>
          <li><a href="/numbers">English Numbers &amp; Time</a></li>
          <li><a href="/words">Common English Words</a></li>
          <li><a href="/quiz">English Quiz</a></li>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
        </ul>
      </nav>
    </noscript>`
      );

    if (baseJsonLd) {
      const routeJsonLd = buildRouteJsonLd(baseJsonLd, route);
      const serializedLd = JSON.stringify(routeJsonLd, null, 2).replace(/</g, '\\u003c');
      html = html.replace(
        /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
        () => `<script type="application/ld+json">\n${serializedLd}\n    </script>`
      );
    }

    const outFile = path.join(DIST_DIR, `${route.path.replace(/^\/+/, '')}.html`);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, html, 'utf-8');
  }

  // Stamp dist/sitemap.xml <lastmod> with the build date so deploys stay fresh
  const distSitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  if (fs.existsSync(distSitemapPath)) {
    const today = new Date().toISOString().slice(0, 10);
    const sitemapXml = fs
      .readFileSync(distSitemapPath, 'utf-8')
      .replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
    fs.writeFileSync(distSitemapPath, sitemapXml, 'utf-8');
  }

  console.log(`Generated ${ROUTES.length} static SEO route HTML files in dist/`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateSeoRoutes();
}

