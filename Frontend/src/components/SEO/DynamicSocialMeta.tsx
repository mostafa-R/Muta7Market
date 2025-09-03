"use client";

import Head from "next/head";
import { useEffect, useState } from "react";

interface DynamicSocialMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "profile" | "article";
  playerData?: {
    name: string;
    sport: string;
    nationality: string;
    age?: number;
    category?: string;
    status?: string;
    isCoach?: boolean;
  };
}

export default function DynamicSocialMeta({
  title,
  description,
  image = "/trophy.png",
  url,
  type = "website",
  playerData,
}: DynamicSocialMetaProps) {
  const [currentUrl, setCurrentUrl] = useState(url || "");

  useEffect(() => {
    if (!url && typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, [url]);

  // Generate dynamic content if playerData is provided
  const dynamicTitle = playerData
    ? `${playerData.name} - ${
        playerData.isCoach ? "Coach" : "Player"
      } Profile | Muta7Market`
    : title || "Muta7Market - Sports Marketplace";

  const dynamicDescription = playerData
    ? playerData.isCoach
      ? `Professional ${playerData.sport} coach from ${playerData.nationality}. View coaching profile and connect directly on Muta7Market.`
      : `${playerData.category || ""} ${playerData.sport} player from ${
          playerData.nationality
        }${playerData.age ? `, age ${playerData.age}` : ""}. ${
          playerData.status === "available" ? "Available for transfer." : ""
        } View full profile with videos and stats.`
    : description ||
      "The leading sports marketplace connecting players and coaches across all sports";

  const fullImageUrl = image?.startsWith("http")
    ? image
    : `https://muta7markt.com${image}`;

  return (
    <Head>
      {/* Enhanced Open Graph Tags */}
      <meta property="og:title" content={dynamicTitle} />
      <meta property="og:description" content={dynamicDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:secure_url" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={dynamicTitle} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="ar_SA" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:site_name" content="Muta7Market" />
      <meta property="og:updated_time" content={new Date().toISOString()} />

      {/* Profile-specific Open Graph */}
      {playerData && type === "profile" && (
        <>
          <meta
            property="profile:first_name"
            content={playerData.name.split(" ")[0] || ""}
          />
          <meta
            property="profile:last_name"
            content={playerData.name.split(" ").slice(1).join(" ") || ""}
          />
          <meta
            property="profile:username"
            content={playerData.name.replace(/\s+/g, "").toLowerCase()}
          />
        </>
      )}

      {/* Enhanced Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@muta7market" />
      <meta name="twitter:creator" content="@muta7market" />
      <meta name="twitter:title" content={dynamicTitle} />
      <meta name="twitter:description" content={dynamicDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={dynamicTitle} />
      <meta property="twitter:domain" content="muta7markt.com" />
      <meta property="twitter:url" content={currentUrl} />

      {/* WhatsApp/Telegram Optimization */}
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:rich_attachment" content="true" />

      {/* LinkedIn Optimization */}
      <meta
        property="og:see_also"
        content="https://linkedin.com/company/muta7market"
      />
      <meta name="linkedin:owner" content="Muta7Market" />

      {/* Pinterest Rich Pins */}
      <meta name="pinterest-rich-pin" content="true" />
      <meta property="article:author" content="Muta7Market" />
      {playerData && (
        <>
          <meta
            property="article:section"
            content={playerData.isCoach ? "Coaches" : "Players"}
          />
          <meta
            property="article:tag"
            content={`${playerData.sport}, ${playerData.nationality}, Sports`}
          />
        </>
      )}

      {/* Discord Embed Optimization */}
      <meta name="theme-color" content="#2B5CE6" />
      <meta property="og:color" content="#2B5CE6" />

      {/* Facebook/Instagram Optimization */}
      <meta property="fb:app_id" content="1234567890123456" />
      <meta property="og:determiner" content="the" />

      {/* Mobile App Deep Links */}
      <meta name="apple-itunes-app" content="app-id=muta7market-ios" />
      <meta name="google-play-app" content="app-id=com.muta7market.android" />

      {/* Additional Social Platform Tags */}
      <meta name="referrer" content="origin-when-cross-origin" />
      <meta property="og:video" content="" />
      <meta property="og:audio" content="" />

      {/* Telegram Specific */}
      <meta property="telegram:channel" content="@muta7market" />

      {/* Geographic Information for Local SEO */}
      <meta property="og:locality" content="Riyadh" />
      <meta property="og:region" content="Riyadh Province" />
      <meta property="og:country-name" content="Saudi Arabia" />
      <meta property="og:postal-code" content="12345" />

      {/* Contact Information */}
      <meta property="og:email" content="info@muta7markt.com" />
      <meta property="og:phone_number" content="+966500000000" />

      {/* Cache Control for Social Media */}
      <meta property="og:ttl" content="604800" />
    </Head>
  );
}
