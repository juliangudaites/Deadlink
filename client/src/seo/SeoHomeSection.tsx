import { SITE } from './site';
import { LEARN_PAGES } from './pages';

export function SeoHomeSection() {
  const guides = Object.values(LEARN_PAGES).slice(0, 5);
  return (
    <section className="dl-seo-home" aria-label="Learn more">
      <details>
        <summary>Guides &amp; comparisons (SEO)</summary>
        <p className="dl-seo-home__intro">
          {SITE.name} — {SITE.tagline} Encrypted one-time secret links for passwords, API keys, and private files.
          No account. Burn after reading.
        </p>
        <ul className="dl-seo-home__links">
          {guides.map((g) => (
            <li key={g.slug}><a href={`/learn/${g.slug}`}>{g.h1}</a></li>
          ))}
          <li><a href="/learn/security">Security overview</a></li>
        </ul>
        <p className="dl-seo-home__sister">
          Sister product: <a href={SITE.sisterSite.url} rel="noopener">{SITE.sisterSite.name}</a>
        </p>
      </details>
    </section>
  );
}