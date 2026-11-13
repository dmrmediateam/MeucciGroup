import type { ReactNode } from "react";
import SiteChrome from "@/components/SiteChrome";
import type { SiteContent } from "@/content/site";

/* ==========================================================================
   Listings page shell: photo hero with the search console lifted over its
   bottom edge, quick links into each town, the results, and a closing
   "we search off-market too" band. Shared by the live IDX browser and the
   pre-IDX placeholder so the page looks identical before and after the key
   goes in.
   ========================================================================== */

export default function ListingsShell({
  content,
  title,
  lead,
  children,
}: {
  content: SiteContent;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  const page = content.pages.find((p) => p.slug === "listings");
  const image = page?.heroImage ?? content.hero.image;
  const towns = content.areas.slice(0, 4);
  const first = content.footer.agentName.split(" ")[0];

  return (
    <SiteChrome content={content}>
      <section className="video-section ls-hero">
        <div className="ls-hero__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" />
        </div>
        <div className="ls-hero__shade" aria-hidden="true" />
        <div className="ls-hero__content">
          <span className="ls-hero__eyebrow">{page?.preTitle ?? content.landing?.serviceArea ?? "Property Search"}</span>
          <h1 className="ls-hero__title">{title}</h1>
          <span className="ls-hero__rule" aria-hidden="true" />
          <p className="ls-hero__lead">{lead}</p>
        </div>
        {towns.length > 0 && (
          <nav className="ls-hero__towns" aria-label="Browse by town">
            {towns.map((town) => (
              <a key={town.title} href={`/listings?city=${encodeURIComponent(town.title)}`}>{town.title}</a>
            ))}
          </nav>
        )}
      </section>

      <section className="solid-section ls-body">
        <div className="lp-container">
          {children}
        </div>
      </section>

      <section className="solid-section ls-offmarket">
        <div className="lp-container ls-offmarket__inner">
          <div>
            <span className="ls-offmarket__eyebrow">Before It Hits the Market</span>
            <h2 className="ls-offmarket__title">Not seeing it yet? {first} probably knows where it is.</h2>
            <p className="ls-offmarket__text">
              Some of the best homes in the Valley trade quietly. Tell {first} what you are looking for and he will
              put you in front of private and pre-market opportunities that never reach the portals.
            </p>
          </div>
          <div className="ls-offmarket__actions">
            <a href="/connect" className="btn btn--primary-light">Tell {first} What You Want</a>
            {content.contact?.phone && (
              <a href={`tel:${content.contact.phone.replace(/[^+\d]/g, "")}`} className="ls-offmarket__phone">
                or call {content.contact.phone}
              </a>
            )}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
