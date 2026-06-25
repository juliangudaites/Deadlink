import { LEARN_PAGES } from './pages';
import { SITE } from './site';
import { useSeo } from './useSeo';
import '../App.css';

export function SeoLearnIndex() {
  const pages = Object.values(LEARN_PAGES);

  useSeo({
    title: 'DEADLINK Guides — One-Time Secrets, Security & Comparisons',
    description: 'Guides for one-time secret links, burn-after-reading, Privnote alternatives, and secure password sharing.',
    path: '/learn',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'DEADLINK Guides',
      url: `${SITE.url}/learn`,
      description: 'SEO guides and comparisons for one-time secret sharing.',
      hasPart: pages.map((p) => ({
        '@type': 'Article',
        name: p.h1,
        url: `${SITE.url}/learn/${p.slug}`,
      })),
    },
  });

  return (
    <div className="dl-page">
      <header className="dl-header">
        <a href="/" className="dl-logo" style={{ textDecoration: 'none' }}>
          <img src="/brand/logo.svg" alt="" />
          <h1>DEADLINK</h1>
        </a>
      </header>
      <article className="dl-seo-article">
        <h1>Guides</h1>
        <p>One-time secrets, security, and tool comparisons.</p>
        <ul className="dl-learn-index">
          {pages.map((p) => (
            <li key={p.slug}>
              <a href={`/learn/${p.slug}`}>
                <strong>{p.h1}</strong>
                <span>{p.description}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="dl-seo-sister">
          <a href="/">← Create a dead link</a>
        </p>
      </article>
    </div>
  );
}