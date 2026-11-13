import HomeClassic from "@/components/home/HomeClassic";
import type { HomeStat } from "@/lib/homeData";
import type { Listing, SiteContent } from "@/content/site";

/* This client uses the "classic" homepage design (locked by new-client). */

export default function SitePage({
  content,
  liveListings,
  liveStats,
}: {
  content: SiteContent;
  liveListings?: Listing[] | null;
  liveStats?: HomeStat[] | null;
}) {
  return <HomeClassic content={content} liveListings={liveListings} liveStats={liveStats} />;
}
