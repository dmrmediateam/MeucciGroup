import type { Metadata } from "next";
import { Suspense } from "react";
import ListingsShell from "@/components/idx/ListingsShell";
import ListingsBrowser from "@/components/idx/ListingsBrowser";
import ListingLeadGate from "@/components/idx/ListingLeadGate";
import ListingsSearchPlaceholder from "@/components/ListingsSearchPlaceholder";
import { site } from "@/content/site";
import { filtersFromParams } from "@/lib/idx/filterParams";
import { searchListings } from "@/lib/idx/search";
import { idxConfigured } from "@/lib/idx/config";
import { getPropertyTypes } from "@/lib/idx/propertyTypeIndex";

export const revalidate = 60;

type Params = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function toUrlSearchParams(params: Record<string, string | string[] | undefined>): URLSearchParams {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") searchParams.set(key, value);
    else if (Array.isArray(value) && value[0]) searchParams.set(key, value[0]);
  }
  return searchParams;
}

const areaNames = site.areas.slice(0, 4).map((a) => a.title).join(", ");

export async function generateMetadata({ searchParams }: Params): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = Object.keys(params).length > 0;
  const base: Metadata = {
    title: `${site.landing?.serviceArea ? `${site.landing.serviceArea} ` : ""}MLS Listings – ${site.brand.name}`,
    description: `Search every active MLS listing${areaNames ? ` across ${areaNames}` : ""} with ${site.brand.name}: filter by price, beds, baths, and neighborhood.`,
    // Every filter permutation canonicalises to the clean page, or Google
    // indexes thousands of near-duplicates of the same grid.
    alternates: { canonical: "/listings" },
  };
  // Filtered permutations stay crawlable but out of the index
  if (hasFilters) return { ...base, robots: { index: false, follow: true } };
  return base;
}

export default async function ListingsPage({ searchParams }: Params) {
  const params = await searchParams;
  const initialFilters = filtersFromParams(toUrlSearchParams(params));

  if (!idxConfigured()) {
    // Pre-IDX placeholder: native search UI over the agent's own portfolio
    const one = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : "");
    return (
      <ListingsShell
        content={site}
        title="Every Home in the Valley."
        lead={`Explore homes ${site.footer.agentName} has represented, from Sun Valley to Bellevue. Full MLS search is on its way.`}
      >
        <ListingsSearchPlaceholder
          listings={site.featured?.listings ?? []}
          initial={{
            city: one("city"), minPrice: one("minPrice"), maxPrice: one("maxPrice"),
            propertyTypes: one("propertyTypes"), minBeds: one("minBeds"),
            minBaths: one("minBaths"), minSqFt: one("minSqFt"), status: one("status"),
          }}
        />
      </ListingsShell>
    );
  }

  const [initialResponse, propertyTypeOptions] = await Promise.all([
    searchListings(initialFilters).catch(() => null),
    getPropertyTypes().catch(() => undefined),
  ]);

  return (
    <ListingsShell
      content={site}
      title="Every Home in the Valley."
      lead={`Search every active listing${areaNames ? ` across ${areaNames} and beyond` : " in the market"}, updated straight from the MLS.`}
    >
      <Suspense>
        <ListingsBrowser initialFilters={initialFilters} initialResponse={initialResponse} propertyTypeOptions={propertyTypeOptions} />
      </Suspense>
      {/* Carried here so a heart on a result card has something to ask with.
          autoOpen is off: the view counter belongs to detail pages. */}
      {site.listingGate?.enabled && (
        <ListingLeadGate
          address=""
          mlsNumber=""
          consent={site.footer.newsletter.consent}
          heading={site.listingGate.heading}
          subheading={site.listingGate.subheading}
          dismissible={site.listingGate.dismissible}
          autoOpen={false}
        />
      )}
    </ListingsShell>
  );
}
