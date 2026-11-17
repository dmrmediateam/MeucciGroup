import HomeClassic from "@/components/home/HomeClassic";
import type { HomeStat } from "@/lib/homeData";
import type { Listing, SiteContent } from "@/content/site";
import type { MapArea } from "@/lib/mapData";

/* This client uses the "classic" homepage design (locked by new-client). */

export default function SitePage({
  content,
  liveListings,
  liveStats,
  mapAreas,
}: {
  content: SiteContent;
  liveListings?: Listing[] | null;
  liveStats?: HomeStat[] | null;
  /** Service-area pins (with live counts) for the homepage map */
  mapAreas?: MapArea[];
}) {
  return <HomeClassic content={content} liveListings={liveListings} liveStats={liveStats} mapAreas={mapAreas} />;
}
