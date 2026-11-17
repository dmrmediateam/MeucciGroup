"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapArea, MapListing, MapPoint } from "@/lib/mapData";
import { shortPrice } from "@/lib/mapData";

/* ==========================================================================
   Leaflet map over Esri's World Topographic basemap (free with attribution,
   no API key; CARTO's basemaps now require one). Terrain suits a mountain
   market. Town pins link to the area pages; listing pins open a small card
   that links to the listing. Rendered client-side only (see AreaMap).
   ========================================================================== */

const TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
const TILE_ATTRIBUTION = "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, USGS, NGA, OpenStreetMap contributors";
/** On the all-towns map, listing price tags only appear once zoomed in past this */
const LISTING_PINS_MIN_ZOOM = 11;
/** A crowded area map shows dots instead of price tags until zoomed past this */
const DENSE_LISTING_COUNT = 20;
const DENSE_LABEL_MIN_ZOOM = 14;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function areaIcon(title: string, labelAbove: boolean): L.DivIcon {
  return L.divIcon({
    className: `map-pin map-pin--area${labelAbove ? " map-pin--area-up" : ""}`,
    html: `<span class="map-pin__dot"></span><span class="map-pin__label">${escapeHtml(title)}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -14],
  });
}

function listingIcon(price: number): L.DivIcon {
  return L.divIcon({
    className: "map-pin map-pin--listing",
    html: `<span class="map-pin__price">${escapeHtml(shortPrice(price))}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -18],
  });
}

function labelAbove(area: MapArea, all: MapArea[]): boolean {
  let nearest: MapArea | undefined;
  let best = Infinity;
  for (const other of all) {
    if (other === area) continue;
    const d = Math.hypot(other.coords.lat - area.coords.lat, (other.coords.lng - area.coords.lng) * Math.cos((area.coords.lat * Math.PI) / 180));
    if (d < best) { best = d; nearest = other; }
  }
  // Neighbour to the south (or none): label above, away from it
  return !nearest || nearest.coords.lat <= area.coords.lat;
}

function areaPopup(area: MapArea): string {
  const count = area.count !== undefined
    ? `<span class="map-popup__count">${area.count} ${area.count === 1 ? "home" : "homes"} for sale</span>`
    : "";
  const desc = area.description ? `<p class="map-popup__desc">${escapeHtml(area.description)}</p>` : "";
  return `<div class="map-popup map-popup--area">
    <h3 class="map-popup__title">${escapeHtml(area.title)}</h3>
    ${count}${desc}
    <a class="map-popup__link" href="${escapeHtml(area.href)}">Explore ${escapeHtml(area.title)}</a>
  </div>`;
}

function listingPopup(listing: MapListing): string {
  const photo = listing.photo ? `<img class="map-popup__photo" src="${escapeHtml(listing.photo)}" alt="" loading="lazy" />` : "";
  const meta = [
    listing.beds && `${listing.beds} Beds`,
    listing.baths && `${listing.baths} Baths`,
  ].filter(Boolean).join(" · ");
  return `<a class="map-popup map-popup--listing" href="${escapeHtml(listing.href)}">
    ${photo}
    <span class="map-popup__price">${escapeHtml(shortPrice(listing.price))}</span>
    <span class="map-popup__address">${escapeHtml(listing.address)}, ${escapeHtml(listing.city)}</span>
    ${meta ? `<span class="map-popup__meta">${meta}</span>` : ""}
    <span class="map-popup__link">View Listing</span>
  </a>`;
}

export interface LeafletMapProps {
  center: MapPoint;
  zoom: number;
  areas?: MapArea[];
  listings?: MapListing[];
  /** Zoom the map to contain these pins (after the initial center/zoom) */
  fit?: "areas" | "listings" | "all" | "none";
  /** Title of the area whose popup should be open (hover sync with a list) */
  focus?: string;
  className?: string;
}

export default function LeafletMap({ center, zoom, areas = [], listings = [], fit = "none", focus, className }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const areaMarkers = useRef(new Map<string, L.Marker>());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: [center.lat, center.lng],
      zoom,
      scrollWheelZoom: false,
      // Half-step zooms let fitBounds land tighter on narrow phone maps
      zoomSnap: 0.5,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 18 }).addTo(map);

    const areaLayer = L.layerGroup().addTo(map);
    const listingLayer = L.layerGroup().addTo(map);

    areas.forEach((area) => {
      // Put the label on the side away from the nearest other town so close
      // neighbours (Sun Valley/Ketchum, Hailey/Bellevue) never overlap.
      const marker = L.marker([area.coords.lat, area.coords.lng], { icon: areaIcon(area.title, labelAbove(area, areas)), zIndexOffset: 1000, keyboard: true, title: area.title })
        .bindPopup(areaPopup(area), { className: "map-popup-wrap", maxWidth: 260, autoPan: false })
        .addTo(areaLayer);
      areaMarkers.current.set(area.title, marker);
    });
    for (const listing of listings) {
      L.marker([listing.lat, listing.lng], { icon: listingIcon(listing.price), title: listing.address })
        .bindPopup(listingPopup(listing), { className: "map-popup-wrap", maxWidth: 240 })
        .addTo(listingLayer);
    }

    const fitPoints: MapPoint[] = [
      ...(fit === "areas" || fit === "all" ? areas.map((a) => a.coords) : []),
      ...(fit === "listings" || fit === "all" ? listings : []),
    ];
    if (fitPoints.length > 1) {
      const pad = container.clientWidth < 600 ? 28 : 48;
      map.fitBounds(L.latLngBounds(fitPoints.map((p) => [p.lat, p.lng] as [number, number])), { padding: [pad, pad], maxZoom: 14 });
    } else if (fitPoints.length === 1) {
      map.setView([fitPoints[0].lat, fitPoints[0].lng], Math.max(zoom, 12));
    }

    // With town pins present, price tags would bury them when zoomed out:
    // show listings only once the visitor zooms toward a town.
    if (areas.length > 0 && listings.length > 0) {
      const syncListings = () => {
        const show = map.getZoom() >= LISTING_PINS_MIN_ZOOM;
        if (show && !map.hasLayer(listingLayer)) listingLayer.addTo(map);
        if (!show && map.hasLayer(listingLayer)) map.removeLayer(listingLayer);
      };
      map.on("zoomend", syncListings);
      syncListings();
    }

    // Many listings in one town: price tags would overlap into a black
    // blob, so show dots until the visitor zooms in to a neighbourhood.
    if (listings.length > DENSE_LISTING_COUNT) {
      const syncDensity = () => {
        container.classList.toggle("area-map__canvas--dense", map.getZoom() < DENSE_LABEL_MIN_ZOOM);
      };
      map.on("zoomend", syncDensity);
      syncDensity();
    }

    // Containers inside reveal/animated sections can be measured at 0px once
    const resize = () => map.invalidateSize();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    observer?.observe(container);

    return () => {
      observer?.disconnect();
      areaMarkers.current.clear();
      map.remove();
    };
  }, [center.lat, center.lng, zoom, areas, listings, fit]);

  useEffect(() => {
    if (!focus) return;
    areaMarkers.current.get(focus)?.openPopup();
  }, [focus]);

  return <div ref={containerRef} className={`area-map__canvas${className ? ` ${className}` : ""}`} role="region" aria-label="Map" />;
}
