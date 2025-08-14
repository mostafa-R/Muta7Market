import AdBanner from "./AdBanner";
import PlayerSection from "./PlayerSection";
import SimpleHero from "./SimpleHero";
import SportsSection from "./SportsSection";
import StartJourneySection from "./StartJourneySection";

function page() {
  return (
    <div className="">
      <SimpleHero />
      <PlayerSection />
      <AdBanner />
      <SportsSection />
      <StartJourneySection />
    </div>
  );
}

export default page;
