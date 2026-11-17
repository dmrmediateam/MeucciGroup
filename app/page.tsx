import SitePage from "@/components/SitePage";
import { site } from "@/content/site";
import { getFeaturedForHome, getLiveStats } from "@/lib/homeData";
import { getServiceAreaMap } from "@/lib/areaData";

export const revalidate = 900;

export default async function Home() {
  const [liveListings, liveStats, areaMap] = await Promise.all([
    getFeaturedForHome(),
    getLiveStats(site.areas.map((area) => area.title)),
    getServiceAreaMap(site.areas, false),
  ]);
  return <SitePage content={site} liveListings={liveListings} liveStats={liveStats} mapAreas={areaMap.areas} />;
}
