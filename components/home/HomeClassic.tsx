import type { CSSProperties } from "react";
import SiteChrome from "@/components/SiteChrome";
import ListingsGrid from "@/components/ListingsGrid";
import SeasonsHero from "@/components/home/SeasonsHero";
import Splash from "@/components/home/Splash";
import type { GalleryCard, Listing, SiteContent } from "@/content/site";
import type { HomeStat } from "@/lib/homeData";

/* ==========================================================================
   Home variant "classic": the original LP-derived design. Centered serif
   hero, floating search card, editorial cards, stats band, overlay areas,
   circular about portrait, fixed-background CTA.
   ========================================================================== */

export default function HomeClassic({
  content,
  liveListings,
  liveStats,
}: {
  content: SiteContent;
  /** Listings fetched from IDX Broker at request time; overrides config fallback */
  liveListings?: Listing[] | null;
  /** Market counts from the MLS; overrides the config stats */
  liveStats?: HomeStat[] | null;
}) {
  const featuredListings = liveListings ?? content.featured?.listings ?? [];
  const stats = liveStats && liveStats.length > 0 ? liveStats : content.stats;
  return (
    <SiteChrome content={content} animateIn>
      {content.brand.decal && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="site-decal" src={content.brand.decal} alt="" aria-hidden="true" />
      )}
      {content.brand.logo && <Splash logo={content.brand.logo.dark} line={content.hero.preTitle} />}

      {/* ============ HERO (four-season crossfade) ============ */}
      <SeasonsHero hero={content.hero} />

      {/* ============ SERVICES GALLERY ============ */}
      <div id="after-hero" />
      <GallerySection cards={content.services} columns={3} />

      {/* ============ ABOUT (consolidated intro): portrait, statement, CTAs ============ */}
      <section className="solid-section" id="about">
        <div className="about-flow lp-vertical-paddings">
          <div className="lp-container">
            <div className="about-flow__body reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.about.image}
                alt={content.about.title}
                className={content.about.imageStyle === "photo" ? "about-flow__photo" : "about-flow__portrait"}
              />
              <h2 className="lp-h2">{content.about.title}</h2>
              <div className="lp-text--subtitle">
                <h5>{content.about.subtitle}</h5>
                {content.about.blocks.map((block, i) => (
                  <div key={i}>
                    {block.heading && <p><strong>{block.heading}</strong></p>}
                    <p>{block.text}</p>
                  </div>
                ))}
              </div>
              {content.about.ctas && content.about.ctas.length > 0 && (
                <div className="about-flow__ctas">
                  {content.about.ctas.map((cta, i) => (
                    <a key={cta.href} href={cta.href} className={i === 0 ? "btn btn--primary-light" : "lp-btn lp-btn--outline"}>
                      {cta.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS BAND ============ */}
      {stats && (
        <section className="solid-section">
          <div className="stats-band lp-container reveal">
            {stats.map((stat) => (
              <div className="stats-band__item" key={stat.label}>
                <span className="stats-band__value">{stat.value}</span>
                <span className="stats-band__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============ FEATURED PROPERTIES (client's own listings) ============ */}
      {content.featured && featuredListings.length > 0 && (
        <section className="solid-section">
          <div className="featured-band lp-vertical-paddings">
            <div className="lp-container">
              <div className="featured-band__head reveal">
                {content.featured.subtitle && <span className="featured-band__kicker">{content.featured.subtitle}</span>}
                <h2 className="lp-h2">{content.featured.title}</h2>
              </div>
              <ListingsGrid listings={featuredListings.slice(0, 3)} />
              {content.featured.cta && (
                <div className="featured-band__foot reveal" data-delay="100">
                  <a href={content.featured.cta.href} className="lp-btn lp-btn--outline">{content.featured.cta.label}</a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ AREAS GALLERY (overlay cards, hover reveal) ============ */}
      <GallerySection cards={content.areas} columns={2} variant="overlay" />

      {/* ============ CTA (parallax) ============ */}
      <section
        className="image-section parallax-enabled"
        id="cta-parallax"
        style={{
          "--sectionBackground": `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${content.cta.image}')`,
        } as CSSProperties}
      >
        <div className="work-with-us">
          <div className="container">
            <h2 className="reveal">{content.cta.title}</h2>
            <div className="description reveal" data-delay="100">{content.cta.description}</div>
            <div className="btn-container reveal" data-delay="200">
              <a href={content.cta.buttonHref} className="btn btn--primary-light">{content.cta.buttonLabel}</a>
            </div>
          </div>
        </div>
      </section>

    </SiteChrome>
  );
}

function GallerySection({
  cards,
  columns,
  variant = "editorial",
}: {
  cards: GalleryCard[];
  columns: 2 | 3;
  variant?: "editorial" | "overlay";
}) {
  return (
    <section className="solid-section">
      <div className="gallery-component">
        <div className="lp-container">
          <div className={`gallery-row cols-${columns}`}>
            {cards.map((card, i) => (
              <div className="gallery-col reveal" key={card.title} data-delay={i % columns === 0 ? undefined : (i % columns) * 100}>
                {variant === "overlay" ? (
                  <a className="gallery-card gallery-card--overlay gallery-card--short" href={card.href}>
                    <div className="gallery-card__preview">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={card.image} alt="" loading="lazy" />
                    </div>
                    <div className="gallery-card__veil"></div>
                    <div className="gallery-card__panel">
                      <h3 className="gallery-card__panel-title">{card.title}</h3>
                      {card.description && <p className="gallery-card__panel-desc">{card.description}</p>}
                    </div>
                  </a>
                ) : (
                  <a className={`gallery-card${columns === 2 ? " gallery-card--short" : ""}`} href={card.href}>
                    <div className="gallery-card__preview">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={card.image} alt="" loading="lazy" />
                    </div>
                    <div className="gallery-card__label">
                      <div className="gallery-card__text">
                        {card.preTitle && <span className="gallery-card__pre">{card.preTitle}</span>}
                        <h3 className="gallery-card__title">{card.title}</h3>
                        {card.cta && <span className="gallery-card__cta">{card.cta}</span>}
                      </div>
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

