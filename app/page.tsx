import SitePage from "@/components/SitePage";
import { site } from "@/content/site";
import { getFeaturedForHome, getLiveStats } from "@/lib/homeData";

export const revalidate = 900;

export default async function Home() {
  const [liveListings, liveStats] = await Promise.all([
    getFeaturedForHome(),
    getLiveStats(site.areas.length),
  ]);
  return <SitePage content={site} liveListings={liveListings} liveStats={liveStats} />;
}
