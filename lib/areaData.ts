import "server-only";
import { idxConfigured } from "@/lib/idx/config";
import { searchListings } from "@/lib/idx/search";
import type { ListingSummary } from "@/lib/idx/types";
import type { GalleryCard } from "@/content/site";
import { toMapListings, type MapArea, type MapListing } from "@/lib/mapData";

/* ==========================================================================
   Live data behind the maps and area pages.

   Area page: every active home in that MLS city (one cached targeted query).
   Service-area map: the cached market pool, counted per town for the pins.
   Everything degrades to empty when IDX is off, slow, or rate limited.
   ========================================================================== */

const AREA_PAGE_SIZE = 250;
/* A slow or rate-limited feed must never stall a page build: past this the
   page renders without live pins and ISR fills them in on the next refresh. */
const LIVE_DATA_TIMEOUT_MS = 12_000;

async function withinBudget<T>(work: Promise<T>, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), LIVE_DATA_TIMEOUT_MS);
  });
  try {
    return await Promise.race([work, timeout]);
  } catch {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Active homes for sale in one MLS city, newest first */
export async function getAreaListings(mlsCity: string): Promise<ListingSummary[]> {
  if (!idxConfigured()) return [];
  return withinBudget(
    searchListings({ city: mlsCity, status: "active", sort: "newest", pageSize: AREA_PAGE_SIZE }).then((r) => r.listings),
    [],
  );
}

/** The cached active pool across every market city */
export async function getMarketListings(): Promise<ListingSummary[]> {
  if (!idxConfigured()) return [];
  return withinBudget(
    searchListings({ status: "active", sort: "newest", pageSize: 1000 }).then((r) => r.listings),
    [],
  );
}

/** Service-area cards with coordinates, as map pins, with live counts when the pool is warm */
export function areasToPins(areas: GalleryCard[], pool: ListingSummary[]): MapArea[] {
  const counts = new Map<string, number>();
  for (const l of pool) {
    const key = l.address.city.trim().toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return areas.flatMap((area) => {
    if (!area.coords) return [];
    const count = pool.length > 0 ? counts.get(area.title.trim().toLowerCase()) : undefined;
    return [{
      title: area.title,
      href: area.href,
      description: area.description,
      coords: area.coords,
      ...(count !== undefined ? { count } : {}),
    }];
  });
}

export interface ServiceAreaMapData {
  areas: MapArea[];
  listings: MapListing[];
}

/** Pins for the all-towns map (homepage and /the-valley) */
export async function getServiceAreaMap(areas: GalleryCard[], withListings: boolean): Promise<ServiceAreaMapData> {
  const pool = await getMarketListings();
  return {
    areas: areasToPins(areas, pool),
    listings: withListings ? toMapListings(pool) : [],
  };
}
