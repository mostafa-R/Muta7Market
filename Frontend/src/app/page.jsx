"use client";

import { useSettings } from "@/contexts/SettingsContext";
import { useAdvertisements } from "@/hooks/useAdvertisements";
import AdvertisementRenderer from "./component/advertisements/AdvertisementRenderer";
import PlayerSection from "./home/PlayerSection";

import SportsSection from "./home/SportsSection";
import StartJourneySection from "./home/StartJourneySection";

export default function Home() {
  const { settings, loading: settingsLoading } = useSettings();
  const { ads: homeBannerAds, loading: adsLoading } = useAdvertisements(
    "home",
    settings
  );

  const isLoading = settingsLoading || adsLoading;

  return (
    <>
      {/* Dynamic Ad Banner Section */}
      {isLoading ? (
        <AdvertisementRenderer loading={true} />
      ) : homeBannerAds && homeBannerAds.length > 0 ? (
        <>
          {homeBannerAds.map((ad) => (
            <AdvertisementRenderer key={ad._id} ad={ad} />
          ))}
        </>
      ) : (
        <AdvertisementRenderer /> /* Fallback to placeholder */
      )}

      <SportsSection />
      <PlayerSection />
      <StartJourneySection />
    </>
  );
}
