"use client";

import AdBanner from "./AdBanner";
import FeaturedAd from "./FeaturedAd";
import GoogleAd from "./GoogleAd";
import InlineAd from "./InlineAd";
import PopupAd from "./PopupAd";
import SidebarAd from "./SidebarAd";

const AdvertisementRenderer = ({ ad, loading }) => {
  if (!ad && !loading) {
    return null;
  }

  // Handle Google Ads first
  if (ad?.source === "google") {
    return <GoogleAd ad={ad} />;
  }

  // Handle internal ads by type
  switch (ad?.type) {
    case "popup":
      return <PopupAd ad={ad} loading={loading} />;

    case "banner":
      return <AdBanner ad={ad} loading={loading} />;

    case "sidebar":
      return <SidebarAd ad={ad} loading={loading} />;

    case "featured":
      return <FeaturedAd ad={ad} loading={loading} />;

    case "inline":
      return <InlineAd ad={ad} loading={loading} />;

    default:
      return <AdBanner ad={ad} loading={loading} />;
  }
};

export default AdvertisementRenderer;
