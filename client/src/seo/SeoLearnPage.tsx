import { LEARN_PAGES } from './pages';
import { SITE } from './site';
import { useSeo } from './useSeo';
import '../App.css';

interface SeoLearnPageProps {
  slug: string;
}

export function SeoLearnPage({ slug }: SeoLearnPageProps) {
  const page = LEARN_PAGES[slug];
  if (!page) {
    return (
      <div className="dl-page" style={{ textAlign: 'center', paddingTop: 48 }}>
        <h1>Page not found</h1>
        <a href="/" style={{ color: 'var(--neon-cyan)' }}>← Home</a>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'DEADLINK', item: SITE.url },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE.url}/learn` },
          { '@type': 'ListItem', position: 3, name: page.h1, item: `${SITE.url}/learn/${page.slug}` },
        ],
      },
      {
        '@type': 'Article',
        headline: page.h1,
        description: page.description,
        url: `${SITE.url}/learn/${page.slug}`,
        dateModified: '2026-06-25',
        publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  useSeo({
    title: page.title,
    description: page.description,
    path: `/learn/${page.slug}`,
    type: 'article',
    jsonLd,
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
        <h1>{page.h1}</h1>
        {page.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </section>
        ))}
        <section className="dl-seo-faq">
          <h2>FAQ</h2>
          {page.faq.map((f) => (
            <div key={f.q} className="dl-seo-faq__item">
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>
        <p className="dl-seo-sister">
          Also see <a href={SITE.sisterSite.url}>{SITE.sisterSite.name}</a> — {SITE.sisterSite.blurb}.
        </p>
        <div className="dl-seo-cta">
          <a href="/" className="dl-cta dl-seo-cta__btn">CREATE DEAD LINK FREE →</a>
        </div>
        <nav className="dl-seo-related">
          <h2>Related</h2>
          <ul>
            {page.related.map((r) => (
              <li key={r}><a href={`/learn/${r}`}>{LEARN_PAGES[r]?.h1 ?? r}</a></li>
            ))}
            <li><a href="/">Create a dead link →</a></li>
          </ul>
        </nav>
      </article>
    </div>
  );
}