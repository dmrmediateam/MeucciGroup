import SiteChrome from "@/components/SiteChrome";
import ContactForm from "@/components/leads/ContactForm";
import ListingsGrid from "@/components/ListingsGrid";
import ListingsSearchPlaceholder from "@/components/ListingsSearchPlaceholder";
import RecentClosings from "@/components/RecentClosings";
import PropertySearchExperience from "@/components/PropertySearchExperience";
import ValuationWizard from "@/components/ValuationWizard";
import AreaMap from "@/components/map/AreaMap";
import IdxListingCard from "@/components/idx/IdxListingCard";
import type { Listing, SiteContent, SubPage } from "@/content/site";
import type { ListingSummary } from "@/lib/idx/types";
import type { MapArea, MapListing } from "@/lib/mapData";

/** Live MLS data an area page or a mapped page receives from its route */
export interface SubPageLiveData {
  /** Active listings in this area page's MLS city */
  areaListings?: ListingSummary[];
  /** Pins for the all-towns map: service areas (with counts) + listing pins */
  mapAreas?: MapArea[];
  mapListings?: MapListing[];
}

/** Interior page: banner hero + editorial sections, or search/connect/listings/area variants */
export default function SubPageView({
  content,
  page,
  liveListings,
  idxEnabled = false,
  live,
}: {
  content: SiteContent;
  page: SubPage;
  liveListings?: Listing[] | null;
  /** True when the deployment has an IDX Broker key configured */
  idxEnabled?: boolean;
  live?: SubPageLiveData;
}) {
  const listings = liveListings ?? content.featured?.listings ?? [];
  const searchHref = content.pages.find((p) => p.type === "search")
    ? `${content.brand.homeHref === "/" || !content.brand.homeHref ? "" : content.brand.homeHref}/listings`
    : "/listings";
  const wizardIsHero = !!page.valuation;

  return (
    <SiteChrome content={content}>
      {/* ============ BANNER HERO (skipped when the wizard carries the hero) ============ */}
      {!wizardIsHero && (
      <section className="video-section video-section--banner">
        <div className="video-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={page.heroImage} alt="" />
        </div>
        <div className="overlay-component"></div>
        <div className="middle-content-wrapper">
          <div className="text-section">
            {page.preTitle && <h5 className="pre-title">{page.preTitle}</h5>}
            <h1 className="lp-h1">{page.title}</h1>
          </div>
        </div>
      </section>
      )}

      {/* ============ VALUATION WIZARD (doubles as the hero on sell pages) ============ */}
      {page.valuation && (
        <ValuationWizard
          image={page.valuationImage ?? page.heroImage}
          title={page.title}
          preTitle={page.preTitle}
          consent={content.footer.newsletter.consent}
          areaNames={content.areas.map((area) => area.title)}
          idxEnabled={idxEnabled}
        />
      )}

      {/* ============ INTRO ============ */}
      {page.intro && (
        <section className="solid-section">
          <div className="boxed-text lp-vertical-paddings">
            <div className="lp-container">
              <div className="boxed-text__description reveal">
                {page.intro.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ BODY ============ */}
      {page.type === "search" ? (
        <SearchBody content={content} />
      ) : page.type === "connect" ? (
        <ConnectBody content={content} />
      ) : page.type === "listings" ? (
        <ListingsBody listings={listings} />
      ) : page.type === "team" ? (
        <TeamBody content={content} page={page} />
      ) : page.type === "area" ? (
        <AreaBody page={page} areaListings={live?.areaListings ?? []} idxEnabled={idxEnabled} />
      ) : (
        <>
          {page.showMap && (
            <ServiceAreaMapSection
              areas={live?.mapAreas ?? areasWithoutCounts(content)}
              listings={live?.mapListings ?? []}
            />
          )}
          {page.searchPanel && (
            <section className="solid-section">
              <div className="search-band lp-vertical-paddings">
                <div className="lp-container reveal">
                  <span className="featured-band__kicker">{page.searchPanel.kicker ?? "Search Homes"}</span>
                  <h2 className="lp-h2 search-band__title">{page.searchPanel.title ?? "Find Your Next Home"}</h2>
                  <ListingsSearchPlaceholder listings={listings} compact />
                </div>
              </div>
            </section>
          )}
          {page.recentClosings && (
            <RecentClosings
              listings={listings.filter((l) => /sold|closed/i.test(l.status ?? ""))}
              intro={page.recentClosings.intro}
            />
          )}
          {page.search && (
            <PropertySearchExperience
              idxEnabled={idxEnabled}
              fallbackListings={listings}
              searchHref={searchHref}
            />
          )}
          <EditorialSections page={page} />
          {page.showListings && listings.length > 0 && (
            <section className="solid-section">
              <div className="featured-band lp-vertical-paddings">
                <div className="lp-container">
                  <div className="featured-band__head reveal">
                    <span className="featured-band__kicker">{page.listingsHeading?.kicker ?? "Active Listings"}</span>
                    <h2 className="lp-h2">{page.listingsHeading?.title ?? "Currently Represented"}</h2>
                  </div>
                  <ListingsGrid listings={listings} />
                </div>
              </div>
            </section>
          )}
          <PageCta page={page} />
        </>
      )}
    </SiteChrome>
  );
}

/** Service-area pins straight from the config (no live counts) */
function areasWithoutCounts(content: SiteContent): MapArea[] {
  return content.areas.flatMap((area) =>
    area.coords ? [{ title: area.title, href: area.href, description: area.description, coords: area.coords }] : [],
  );
}

/** Alternating image/text split sections shared by standard and area pages */
function EditorialSections({ page }: { page: SubPage }) {
  return (
    <>
      {page.sections?.map((section, i) => (
        <section className="solid-section" key={section.heading}>
          <div className={`split-section lp-vertical-paddings${i % 2 === 1 ? " split-section--flip" : ""}`}>
            <div className="lp-container split-section__row">
              {section.image && (
                <div className="split-section__media reveal">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={section.image} alt="" loading="lazy" />
                </div>
              )}
              <div className="split-section__text reveal" data-delay="100">
                <h2 className="lp-h2">{section.heading}</h2>
                <p>{section.text}</p>
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

function PageCta({ page }: { page: SubPage }) {
  if (!page.cta) return null;
  return (
    <section className="solid-section">
      <div className="boxed-text lp-vertical-paddings" style={{ textAlign: "center" }}>
        <a href={page.cta.href} className="lp-btn lp-btn--outline">{page.cta.label}</a>
      </div>
    </section>
  );
}

/** All-towns map: one pin per service area, plus live listing pins when the pool is warm */
function ServiceAreaMapSection({ areas, listings }: { areas: MapArea[]; listings: MapListing[] }) {
  if (areas.length === 0) return null;
  const center = areas[0].coords;
  return (
    <section className="solid-section">
      <div className="map-band lp-vertical-paddings">
        <div className="lp-container">
          <div className="featured-band__head reveal">
            <span className="featured-band__kicker">Find Your Place</span>
            <h2 className="lp-h2">The Towns on the Map</h2>
          </div>
          <div className="reveal" data-delay="100">
            <AreaMap center={center} zoom={10} areas={areas} listings={listings} fit="areas" />
          </div>
          <p className="map-band__note">Tap a town for a snapshot and a link to its page. Price tags are live MLS listings.</p>
        </div>
      </div>
    </section>
  );
}

/** Area page body: map of the town's active listings, the listing cards, then the editorial sections */
function AreaBody({ page, areaListings, idxEnabled }: { page: SubPage; areaListings: ListingSummary[]; idxEnabled: boolean }) {
  const area = page.area;
  const mlsCity = area?.mlsCity ?? page.title;
  const searchHref = `/listings?city=${encodeURIComponent(mlsCity)}`;
  const pins: MapListing[] = areaListings.flatMap((l) =>
    l.lat !== undefined && l.lng !== undefined
      ? [{
          lat: l.lat,
          lng: l.lng,
          price: l.price,
          address: l.address.street || l.address.full,
          city: l.address.city,
          href: l.detailUrl,
          photo: l.primaryPhoto?.url,
          beds: l.beds || undefined,
          baths: l.baths || undefined,
        }]
      : [],
  );
  const shown = areaListings.slice(0, 9);
  const count = areaListings.length;

  return (
    <>
      {area && (
        <section className="solid-section">
          <div className="map-band lp-vertical-paddings">
            <div className="lp-container">
              <div className="featured-band__head reveal">
                <span className="featured-band__kicker">On the Map</span>
                <h2 className="lp-h2">{count > 0 ? `Homes for Sale in ${page.title}` : `Around ${page.title}`}</h2>
              </div>
              <div className="reveal" data-delay="100">
                <AreaMap
                  center={area.center}
                  zoom={area.zoom ?? 13}
                  listings={pins}
                  fit={pins.length > 0 ? "listings" : "none"}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="solid-section">
        <div className="featured-band lp-vertical-paddings area-listings">
          <div className="lp-container">
            <div className="area-listings__head reveal">
              <div>
                <span className="featured-band__kicker">Live from the MLS</span>
                <h2 className="lp-h2">
                  {count > 0
                    ? `${count} ${count === 1 ? "Home" : "Homes"} for Sale in ${page.title}`
                    : `Homes for Sale in ${page.title}`}
                </h2>
              </div>
              <a className="area-listings__more" href={searchHref}>
                {count > shown.length ? `See All ${count} in ${page.title}` : `Search ${page.title}`}
              </a>
            </div>
            {shown.length > 0 ? (
              <div className="listings-grid">
                {shown.map((listing) => (
                  <IdxListingCard listing={listing} key={`${listing.idxId}-${listing.listingId}`} />
                ))}
              </div>
            ) : (
              <div className="area-listings__empty reveal">
                <p>
                  {idxEnabled
                    ? `Nothing active in ${page.title} at the moment. Inventory here moves quietly, so ask Mike what is coming.`
                    : `Live ${page.title} listings appear here once the MLS feed is connected.`}
                </p>
                <a className="lp-btn lp-btn--outline" href="/listings">Search the Whole Market</a>
              </div>
            )}
          </div>
        </div>
      </section>

      <EditorialSections page={page} />
      <PageCta page={page} />
    </>
  );
}

/** Quick-search form feeding the native /listings MLS search (no embeds) */
function SearchBody({ content }: { content: SiteContent }) {
  void content;
  return (
    <section className="solid-section">
      <div className="quick-search lp-vertical-paddings">
        <div className="lp-container quick-search__inner reveal">
          <form action="/listings" method="get" className="quick-search__form">
            <input type="text" name="city" placeholder="City or Neighborhood" aria-label="City" />
            <select name="minPrice" aria-label="Minimum price" defaultValue="">
              <option value="">Min Price</option>
              <option value="500000">$500K</option>
              <option value="1000000">$1M</option>
              <option value="2000000">$2M</option>
              <option value="5000000">$5M</option>
            </select>
            <select name="minBeds" aria-label="Bedrooms" defaultValue="">
              <option value="">Beds</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
            <button type="submit" className="lp-btn btn--primary-light">Search the MLS</button>
          </form>
          <p className="quick-search__note">Full MLS search with live listing data, price and size filters, and every active property in the market.</p>
        </div>
      </div>
    </section>
  );
}

/** Contact page: details + message form (front-end only; wire to CRM later) */
function ConnectBody({ content }: { content: SiteContent }) {
  return (
    <section className="solid-section">
      <div className="connect-grid lp-container lp-vertical-paddings">
        <div className="connect-grid__details reveal">
          <h2 className="lp-h2">{content.footer.agentName}</h2>
          <p className="connect-grid__brokerage">{content.footer.brokerage}</p>
          <address>
            {content.footer.addressLines.map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </address>
          {content.contact?.phone && <p><a href={`tel:${content.contact.phone.replace(/[^+\d]/g, "")}`}>{content.contact.phone}</a></p>}
          {content.contact?.email && <p><a href={`mailto:${content.contact.email}`}>{content.contact.email}</a></p>}
        </div>
        <ContactForm consent={content.footer.newsletter.consent} />
      </div>
    </section>
  );
}


/** Exclusive listings grid page */
function ListingsBody({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return (
      <section className="solid-section">
        <div className="boxed-text lp-vertical-paddings" style={{ textAlign: "center" }}>
          <div className="lp-container">
            <h2 className="lp-h2">Portfolio Coming Soon</h2>
            <div className="boxed-text__description">
              <p>Our current listings are being connected. Reach out and we will share what is available and what is coming to market quietly.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="solid-section">
      <div className="featured-band lp-vertical-paddings" style={{ paddingTop: 0 }}>
        <div className="lp-container">
          <ListingsGrid listings={listings} />
        </div>
      </div>
    </section>
  );
}


/** Team roster: tagline + member cards (Vignette/Legendary roster pattern) */
function TeamBody({ content, page }: { content: SiteContent; page: SubPage }) {
  const team = content.team;
  if (!team || team.members.length === 0) {
    return (
      <section className="solid-section">
        <div className="boxed-text lp-vertical-paddings" style={{ textAlign: "center" }}>
          <div className="lp-container">
            <h2 className="lp-h2">Meet the Team</h2>
            <div className="boxed-text__description">
              <p>Team profiles are on their way. In the meantime, reach out and we will introduce you directly.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <>
      <section className="solid-section">
        <div className="team-roster lp-vertical-paddings">
          <div className="lp-container">
            {team.tagline && <p className="team-roster__tagline reveal">{team.tagline}</p>}
            <div className="team-roster__grid">
              {team.members.map((member, i) => {
                const card = (
                  <>
                    <div className="team-card__media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={member.image} alt={member.name} loading="lazy" />
                    </div>
                    <div className="team-card__body">
                      <span className="team-card__role">{member.role}</span>
                      <h3 className="team-card__name">{member.name}</h3>
                      {member.bio && <p className="team-card__bio">{member.bio}</p>}
                      <div className="team-card__contact">
                        {member.phone && <a href={`tel:${member.phone.replace(/[^+\d]/g, "")}`}>{member.phone}</a>}
                        {member.email && <a href={`mailto:${member.email}`}>{member.email}</a>}
                      </div>
                      {member.license && <span className="team-card__license">{member.license}</span>}
                      {member.href && <span className="team-card__more">View Profile</span>}
                    </div>
                  </>
                );
                return member.href ? (
                  <a className="team-card reveal" data-delay={(i % 3) * 100 || undefined} href={member.href} key={member.name}>{card}</a>
                ) : (
                  <div className="team-card reveal" data-delay={(i % 3) * 100 || undefined} key={member.name}>{card}</div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <EditorialSections page={page} />
      <PageCta page={page} />
    </>
  );
}
