import Image from "next/image";
import AreaMap from "@/components/map/AreaMap";
import type { SiteContent, SubPage } from "@/content/site";
import type { ListingSummary } from "@/lib/idx/types";
import { formatPrice } from "@/lib/idx/display";
import { toMapListings } from "@/lib/mapData";

/* ==========================================================================
   Area page body (type: "area"). Sits under the shared banner hero:
   facts strip, two-column editorial, photo mosaic, map beside a compact
   listing rail, neighbourhood sections, the other towns, and a CTA band.
   ========================================================================== */

const MAX_RAIL = 4;

function median(values: number[]): number | null {
  const v = values.filter((n) => n > 0).sort((a, b) => a - b);
  if (v.length === 0) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : Math.round((v[mid - 1] + v[mid]) / 2);
}

export default function AreaPage({
  content,
  page,
  areaListings,
  idxEnabled,
}: {
  content: SiteContent;
  page: SubPage;
  areaListings: ListingSummary[];
  idxEnabled: boolean;
}) {
  const area = page.area;
  const mlsCity = area?.mlsCity ?? page.title;
  const searchHref = `/listings?city=${encodeURIComponent(mlsCity)}`;
  const first = content.footer.agentName.split(" ")[0];
  const phone = content.contact?.phone;

  const count = areaListings.length;
  const prices = areaListings.map((l) => l.price).filter((p) => p > 0);
  const med = median(prices);
  const low = prices.length ? Math.min(...prices) : null;
  const pins = toMapListings(areaListings);
  const rail = areaListings.slice(0, MAX_RAIL);

  const liveFacts = idxEnabled && count > 0
    ? [
        { label: "For sale now", value: `${count} ${count === 1 ? "home" : "homes"}` },
        ...(med ? [{ label: "Median list price", value: formatPrice(med) }] : []),
        ...(low ? [{ label: "Starting at", value: formatPrice(low) }] : []),
      ]
    : [];
  const facts = [...liveFacts, ...(page.facts ?? [])].slice(0, 5);

  const [lede, ...rest] = page.intro ?? [];
  const otherTowns = content.areas.filter((a) => a.href !== `/${page.slug}`).slice(0, 4);

  return (
    <>
      {/* ---- Facts strip ---- */}
      {facts.length > 0 && (
        <section className="solid-section">
          <div className="lp-container">
            <dl className="area-facts reveal">
              {facts.map((f) => (
                <div className="area-facts__item" key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* ---- Editorial intro ---- */}
      {lede && (
        <section className="solid-section">
          <div className="area-intro lp-vertical-paddings">
            <div className="lp-container area-intro__grid">
              <div className="area-intro__lede reveal">
                <span className="featured-band__kicker">{page.preTitle ?? page.title}</span>
                <p className="area-intro__big">{page.lede ?? lede}</p>
              </div>
              <div className="area-intro__body reveal" data-delay="100">
                {(page.lede ? [lede, ...rest] : rest).map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
                <a className="area-intro__link" href="/connect">Ask {first} about {page.title}</a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---- Photo mosaic ---- */}
      {page.gallery && page.gallery.length > 0 && (
        <section className="solid-section">
          <div className="lp-container">
            <div className={`area-gallery area-gallery--${Math.min(page.gallery.length, 3)} reveal`}>
              {page.gallery.slice(0, 3).map((photo, i) => (
                <figure className="area-gallery__item" key={photo.src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.src} alt={photo.alt ?? ""} loading={i === 0 ? "eager" : "lazy"} />
                  {(photo.caption || photo.credit) && (
                    <figcaption>
                      {photo.caption}
                      {photo.credit && <span className="area-gallery__credit">{photo.credit}</span>}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- Map + listing rail ---- */}
      {area && (
        <section className="solid-section">
          <div className="area-market lp-vertical-paddings">
            <div className="lp-container">
              <div className="area-market__head reveal">
                <div>
                  <span className="featured-band__kicker">Live from the MLS</span>
                  <h2 className="lp-h2">
                    {count > 0
                      ? `${count} ${count === 1 ? "Home" : "Homes"} for Sale in ${page.title}`
                      : `Homes for Sale in ${page.title}`}
                  </h2>
                </div>
                <a className="area-listings__more" href={searchHref}>
                  {count > rail.length ? `See All ${count}` : `Search ${page.title}`}
                </a>
              </div>
              <div className="area-market__grid reveal" data-delay="100">
                <div className="area-market__map">
                  <AreaMap
                    center={area.center}
                    zoom={area.zoom ?? 13}
                    listings={pins}
                    fit={pins.length > 0 ? "listings" : "none"}
                  />
                </div>
                <div className="area-market__rail">
                  {rail.length > 0 ? (
                    <>
                      <ol className="listing-rail">
                        {rail.map((l) => (
                          <li key={`${l.idxId}-${l.listingId}`}>
                            <a className="listing-rail__item" href={l.detailUrl}>
                              <span className="listing-rail__thumb">
                                {l.primaryPhoto ? (
                                  <Image src={l.primaryPhoto.url} alt="" fill sizes="120px" quality={60} />
                                ) : (
                                  <span className="listing-rail__nophoto" />
                                )}
                              </span>
                              <span className="listing-rail__body">
                                <span className="listing-rail__price">{formatPrice(l.price)}</span>
                                <span className="listing-rail__address">{l.address.street || l.address.full}</span>
                                <span className="listing-rail__meta">
                                  {[l.beds && `${l.beds} bd`, l.baths && `${l.baths} ba`, l.sqFt && `${l.sqFt.toLocaleString()} sf`]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </span>
                              </span>
                              <span className="listing-rail__arrow" aria-hidden="true">&rarr;</span>
                            </a>
                          </li>
                        ))}
                      </ol>
                      <a className="lp-btn lp-btn--outline area-market__all" href={searchHref}>
                        {count > rail.length ? `All ${count} ${page.title} Listings` : `Search ${page.title}`}
                      </a>
                    </>
                  ) : (
                    <div className="area-market__empty">
                      <p>
                        {idxEnabled
                          ? `Nothing active in ${page.title} right now. Inventory here moves quietly, so ask ${first} what is coming.`
                          : `Live ${page.title} listings appear here once the MLS feed is connected.`}
                      </p>
                      <a className="lp-btn lp-btn--outline" href="/listings">Search the Whole Market</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---- Neighbourhood sections ---- */}
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

      {/* ---- Other towns ---- */}
      {otherTowns.length > 0 && (
        <section className="solid-section">
          <div className="area-more lp-vertical-paddings">
            <div className="lp-container">
              <div className="featured-band__head reveal">
                <span className="featured-band__kicker">Keep Exploring</span>
                <h2 className="lp-h2">The Other Towns</h2>
              </div>
              <div className="area-more__grid">
                {otherTowns.map((town, i) => (
                  <a className="area-more__card reveal" data-delay={(i % 4) * 80 || undefined} href={town.href} key={town.title}>
                    <span className="area-more__media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={town.image} alt="" loading="lazy" />
                    </span>
                    <span className="area-more__name">{town.title}</span>
                    {town.description && <span className="area-more__desc">{town.description}</span>}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---- CTA band ---- */}
      <section className="solid-section">
        <div className="area-cta">
          <div className="lp-container area-cta__inner reveal">
            {content.about.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="area-cta__portrait" src={content.about.image} alt={content.footer.agentName} />
            )}
            <div className="area-cta__text">
              <span className="featured-band__kicker">Thinking about {page.title}?</span>
              <h2 className="lp-h2">{page.cta?.label ?? `Talk with ${first}`}</h2>
              <p>
                A straight answer about {page.title} prices, neighborhoods, and timing, from someone who lives here.
                No pressure, no pitch.
              </p>
            </div>
            <div className="area-cta__actions">
              <a className="lp-btn lp-btn--light" href={page.cta?.href ?? "/connect"}>Let&rsquo;s Connect</a>
              {phone && <a className="area-cta__phone" href={`tel:${phone.replace(/[^+\d]/g, "")}`}>Call or text {phone}</a>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
