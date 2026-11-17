import type { Listing } from "@/content/site";

/* ==========================================================================
   IDX Broker Partners API: the client's own active listings.

   Set IDX_API_KEY in the deployment's env vars (never in the repo) and the
   featured/listings sections render live data; without it they fall back to
   the config's manual `featured.listings`, or hide when neither exists.
   Docs: https://middleware.idxbroker.com/docs/api/methods/index.html
   ========================================================================== */

interface IdxFeaturedItem {
  address?: string;
  cityName?: string;
  state?: string;
  listingPrice?: string;
  price?: string;
  bedrooms?: number | string;
  totalBaths?: number | string;
  sqFt?: string | number;
  listingID?: string;
  idxID?: string;
  propStatus?: string;
  idxStatus?: string;
  fullDetailsURL?: string;
  image?: Record<string, { url?: string } | number | string>;
}

/** "4462 Fallsbrae Rd", "Fallbrook", "California" -> "4462-fallsbrae-rd-fallbrook-california" */
function addressSlug(...parts: Array<string | undefined>): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function firstImage(image: IdxFeaturedItem["image"]): string | undefined {
  if (!image) return undefined;
  for (const [key, value] of Object.entries(image)) {
    if (key === "totalCount") continue;
    if (typeof value === "object" && value?.url) return value.url;
    if (typeof value === "string" && value.startsWith("http")) return value;
  }
  return undefined;
}

/*
 * IDX Broker's placeholder board. When an account has no featured listings
 * linked, /clients/featured and /clients/soldpending answer with sample
 * records from this MLS (Texarkana, Texas homes) instead of an empty set.
 * They must never reach a client's homepage.
 */
const IDX_SAMPLE_MLS_ID = "a999";

/** idxIDs this account is approved for (e.g. ["b675"]); empty when unknown */
async function approvedMlsIds(accesskey: string): Promise<string[]> {
  const configured = process.env.IDX_MLS_ID?.trim();
  if (configured) return [configured];
  try {
    const res = await fetch("https://api.idxbroker.com/mls/approvedmls", {
      headers: { accesskey, outputtype: "json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ id?: string }> | undefined;
    return (data ?? []).map((m) => String(m.id ?? "").trim()).filter(Boolean);
  } catch {
    return [];
  }
}

/** True when a record belongs to this account's own MLS, not IDX's sample board */
function fromOurMls(item: { idxID?: string }, approved: string[]): boolean {
  const id = (item.idxID ?? "").trim().toLowerCase();
  if (id === IDX_SAMPLE_MLS_ID) return false;
  return approved.length === 0 || approved.some((a) => a.toLowerCase() === id);
}

export async function getFeaturedListings(): Promise<Listing[] | null> {
  const accesskey = process.env.IDX_API_KEY;
  if (!accesskey) return null;
  try {
    const [res, approved] = await Promise.all([
      fetch("https://api.idxbroker.com/clients/featured", {
        headers: { accesskey, outputtype: "json" },
        next: { revalidate: 3600 },
      }),
      approvedMlsIds(accesskey),
    ]);
    if (!res.ok) return null;
    const data = await res.json();
    // The API wraps results: { total, first, last, next, previous, data: {...} }
    const payload = !Array.isArray(data) && data && typeof data === "object" && "data" in data
      ? (data as { data: unknown }).data
      : data;
    const items: IdxFeaturedItem[] = Array.isArray(payload)
      ? payload
      : Object.values((payload ?? {}) as Record<string, IdxFeaturedItem>);
    const listings = items
      .filter((item) => item && typeof item === "object" && item.address && fromOurMls(item, approved))
      .map((item): Listing => {
        const image = firstImage(item.image);
        const cityState = [item.cityName, item.state].filter(Boolean).join(", ");
        return {
          price: item.listingPrice ?? item.price ?? "",
          address: cityState ? `${item.address}, ${cityState}` : String(item.address),
          beds: item.bedrooms ? String(item.bedrooms) : undefined,
          baths: item.totalBaths ? String(item.totalBaths) : undefined,
          sqft: item.sqFt ? String(item.sqFt) : undefined,
          status: item.propStatus ?? item.idxStatus ?? "For Sale",
          mls: item.listingID,
          image: image ?? "",
          // Keep visitors on our own SEO-indexed detail route, not IDX's host
          href:
            item.idxID && item.listingID
              ? `/listing/${item.idxID}-${item.listingID}-${addressSlug(item.address, item.cityName, item.state)}`
              : item.fullDetailsURL ?? "#",
        };
      })
      .filter((listing) => listing.price && listing.image);
    return listings.length > 0 ? listings : null;
  } catch {
    return null;
  }
}

/**
 * Live listings first, then any configured listings the feed doesn't carry.
 *
 * IDX "featured" returns only what the agent has active right now, so on its
 * own it would drop the sold portfolio the homepage and buy page lean on.
 * Matching is by MLS number, so a home that goes live in the feed replaces
 * its manual entry rather than appearing twice.
 */
export function mergeFeatured(
  live: Listing[] | null,
  configured: Listing[] | undefined,
): Listing[] | null {
  if (!live || live.length === 0) return null;
  const liveMls = new Set(live.map((l) => (l.mls ?? "").trim()).filter(Boolean));
  const extras = (configured ?? []).filter((l) => !liveMls.has((l.mls ?? "").trim()));
  return [...live, ...extras];
}
