import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SubPageView, { type SubPageLiveData } from "@/components/SubPageView";
import { getFeaturedListings, mergeFeatured } from "@/lib/idxbroker";
import { idxConfigured } from "@/lib/idx/config";
import { getAreaListings, getServiceAreaMap } from "@/lib/areaData";
import { site } from "@/content/site";

export function generateStaticParams() {
  // /listings is the native IDX search route; the config's "listings" page
  // remains available in client-slug scopes only
  return site.pages.filter((page) => page.slug !== "listings").map((page) => ({ slug: page.slug }));
}

export const dynamicParams = false;

// Area pages and the valley map carry live MLS listings; refresh them like the homepage.
export const revalidate = 900;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = site.pages.find((p) => p.slug === slug);
  const title = page
    ? page.type === "area"
      ? `Homes for Sale in ${page.title}, Idaho – ${site.brand.name}`
      : `${page.title} – ${site.brand.name}`
    : site.meta.title;
  return {
    title,
    description: page?.intro?.[0] ?? site.meta.description,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = site.pages.find((p) => p.slug === slug);
  if (!page) notFound();
  const liveListings =
    page.type === "listings" || page.showListings
      ? mergeFeatured(await getFeaturedListings(), site.featured?.listings)
      : null;

  let live: SubPageLiveData | undefined;
  if (page.type === "area") {
    live = { areaListings: await getAreaListings(page.area?.mlsCity ?? page.title) };
  } else if (page.showMap) {
    const map = await getServiceAreaMap(site.areas, true);
    live = { mapAreas: map.areas, mapListings: map.listings };
  }

  return <SubPageView idxEnabled={idxConfigured()} liveListings={liveListings} content={site} page={page} live={live} />;
}
