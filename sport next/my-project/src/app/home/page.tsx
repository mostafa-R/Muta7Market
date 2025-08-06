import React from "react";
import SimpleHero from "./SimpleHero";
import AdBanner from "./AdBanner";
import SportsSection from "./SportsSection";
import PlayerSection from "./PlayerSection";
import StartJourneySection from "./StartJourneySection";

function page() {
  return (
    <div className="">
      <SimpleHero />
      <AdBanner />
      <SportsSection />
      <PlayerSection />
      <StartJourneySection />
    </div>
  );
}

export default page;
