import AdBanner from "./home/AdBanner";
import PlayerSection from "./home/PlayerSection";
import SportsSection from "./home/SportsSection";
import StartJourneySection from "./home/StartJourneySection";

export default function Home() {
  return (
    <>
      <AdBanner />
      <SportsSection />
      <PlayerSection />
      {/* <SimpleHero /> */}
      <StartJourneySection />
    </>
  );
}
