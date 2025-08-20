import Image from "next/image";
import SimpleHero from "./home/SimpleHero";
import AdBanner from "./home/AdBanner";
import SportsSection from "./home/SportsSection";
import StartJourneySection from "./home/StartJourneySection";
import PlayerSection from "./home/PlayerSection";

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
