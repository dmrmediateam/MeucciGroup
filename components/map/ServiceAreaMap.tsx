"use client";

import { useState } from "react";
import AreaMap from "@/components/map/AreaMap";
import type { MapArea, MapListing } from "@/lib/mapData";

/* ==========================================================================
   "The Towns on the Map": a town list beside the map. Hovering or focusing a
   town opens its pin; tapping the name goes to the area page. Shared by the
   homepage and /the-valley.
   ========================================================================== */

export default function ServiceAreaMap({
  areas,
  listings = [],
  kicker = "Find Your Place",
  title = "The Towns on the Map",
  note,
}: {
  areas: MapArea[];
  listings?: MapListing[];
  kicker?: string;
  title?: string;
  note?: string;
}) {
  const [focus, setFocus] = useState<string | undefined>(undefined);
  if (areas.length === 0) return null;

  return (
    <section className="solid-section">
      <div className="map-band lp-vertical-paddings">
        <div className="lp-container">
          <div className="featured-band__head reveal">
            <span className="featured-band__kicker">{kicker}</span>
            <h2 className="lp-h2">{title}</h2>
          </div>
          <div className="map-band__grid reveal" data-delay="100">
            <ol className="town-list" aria-label="Towns">
              {areas.map((area, i) => (
                <li
                  key={area.title}
                  className={`town-list__item${focus === area.title ? " is-active" : ""}`}
                  onMouseEnter={() => setFocus(area.title)}
                  onFocus={() => setFocus(area.title)}
                >
                  <a className="town-list__link" href={area.href}>
                    <span className="town-list__index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="town-list__body">
                      <span className="town-list__name">{area.title}</span>
                      {area.count !== undefined && (
                        <span className="town-list__count">
                          {area.count} {area.count === 1 ? "home" : "homes"} for sale
                        </span>
                      )}
                      {area.description && <span className="town-list__desc">{area.description}</span>}
                    </span>
                    <span className="town-list__arrow" aria-hidden="true">&rarr;</span>
                  </a>
                </li>
              ))}
            </ol>
            <div className="map-band__map">
              <AreaMap center={areas[0].coords} zoom={9} areas={areas} listings={listings} fit="areas" focus={focus} />
            </div>
          </div>
          {note && <p className="map-band__note">{note}</p>}
        </div>
      </div>
    </section>
  );
}
