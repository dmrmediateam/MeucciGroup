import type { ListingSummary } from "@/lib/idx/types";

/* ==========================================================================
   Map pins: the small, serializable shape the client-side map receives.
   Built on the server from normalized listings, never from raw IDX data.
   ========================================================================== */

export interface MapPoint {
  lat: number;
  lng: number;
}

export interface MapArea {
  title: string;
  href: string;
  description?: string;
  coords: MapPoint;
  /** Active homes for sale, when known (shown in the pin's popup) */
  count?: number;
}

export interface MapListing extends MapPoint {
  price: number;
  address: string;
  city: string;
  href: string;
  photo?: string;
  beds?: number;
  baths?: number;
}

export function toMapListings(listings: ListingSummary[]): MapListing[] {
  return listings.flatMap((l) =>
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
}

/** "$1.25M", "$875K": the label on a listing pin */
export function shortPrice(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return `$${m >= 10 ? m.toFixed(0) : m.toFixed(2).replace(/\.?0+$/, "")}M`;
  }
  if (price >= 1_000) return `$${Math.round(price / 1_000)}K`;
  return `$${price}`;
}
