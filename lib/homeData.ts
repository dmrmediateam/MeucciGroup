import type { Listing } from "@/content/site";
import { getFeaturedListings } from "@/lib/idxbroker";
import { idxConfigured, OUR_OFFICE_IDS } from "@/lib/idx/config";
import { searchListings } from "@/lib/idx/search";
import { formatPrice, formatSqFt } from "@/lib/idx/display";
import type { ListingSummary } from "@/lib/idx/types";

/* ==========================================================================
   Homepage live data.

   Featured band: the agent's own IDX featured listings first; otherwise the
   brokerage's active listings (IDX_OFFICE_IDS); otherwise the strongest
   active homes on the market. Stats band: real counts from the MLS pool.
   Everything degrades to the config when IDX is off or slow.
   ========================================================================== */

export interface HomeStat { value: string; label: string }

const STATUS_LABEL: Record<string, string> = {
  active: "For Sale", pending: "Pending", sold: "Sold", comingSoon: "Coming Soon",
};

function toListing(l: ListingSummary): Listing {
  return {
    price: formatPrice(l.price),
    address: l.address.full,
    propertyType: l.propertyType,
    beds: l.beds ? String(l.beds) : undefined,
    baths: l.baths ? String(l.baths) : undefined,
    sqft: l.sqFt ? formatSqFt(l.sqFt) : undefined,
    status: STATUS_LABEL[l.status] ?? "For Sale",
    mls: l.mlsNumber,
    image: l.primaryPhoto?.url ?? "",
    href: l.detailUrl,
  };
}

/** A home worth putting on the front page: photographed, a real address, not a lot or a rental. */
function showcaseWorthy(l: ListingSummary): boolean {
  if (!l.primaryPhoto?.url) return false;
  if (/^(tbd|lot|parcel|tract)\b/i.test(l.address.street)) return false;
  if (!l.beds || l.beds < 2) return false;
  if (l.price < 750_000) return false;
  return true;
}

export async function getFeaturedForHome(): Promise<Listing[] | null> {
  const own = await getFeaturedListings();
  if (own && own.length >= 3) return own;
  if (!idxConfigured()) return own;

  const picked: ListingSummary[] = [];
  const seen = new Set<string>();
  const add = (list: ListingSummary[]) => {
    for (const l of list) {
      const key = `${l.idxId}-${l.listingId}`;
      if (seen.has(key) || !showcaseWorthy(l)) continue;
      seen.add(key);
      picked.push(l);
      if (picked.length >= 6) return;
    }
  };

  try {
    if (OUR_OFFICE_IDS.length > 0) {
      const shop = await searchListings({ status: "active", sort: "priceDesc", pageSize: 40, officeIds: OUR_OFFICE_IDS });
      add(shop.listings);
    }
    if (picked.length < 3) {
      const market = await searchListings({ status: "active", sort: "priceDesc", pageSize: 40 });
      add(market.listings);
    }
  } catch {
    /* fall through to whatever we have */
  }

  const mapped = picked.slice(0, 3).map(toListing);
  if (mapped.length === 0) return own;
  // Lead with any of the agent's own listings, then the picks
  return [...(own ?? []), ...mapped].slice(0, 3);
}

export async function getLiveStats(townCount: number): Promise<HomeStat[] | null> {
  if (!idxConfigured()) return null;
  try {
    const pool = await searchListings({ status: "active", sort: "newest", pageSize: 250 });
    if (!pool.totalCount) return null;
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const fresh = pool.listings.filter((l) => (l.listedAt ?? 0) >= since).length;
    const stats: HomeStat[] = [
      { value: pool.totalCount.toLocaleString(), label: "Homes for sale across the valley right now" },
    ];
    if (fresh > 0) stats.push({ value: fresh.toLocaleString(), label: "New listings in the last 30 days" });
    stats.push({ value: String(townCount), label: "Towns, one valley: Sun Valley, Ketchum, Hailey, Bellevue" });
    return stats;
  } catch {
    return null;
  }
}
