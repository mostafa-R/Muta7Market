"use client";

import { useEffect } from "react";

const GoogleAd = ({ ad }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("Failed to push Google Ad:", err);
    }
  }, []);

  if (!ad?.googleAd?.adSlotId) {
    return (
      <div className="text-center text-red-500 bg-red-100 p-4 rounded-md my-4">
        Google Ad Error: Missing Ad Slot ID.
      </div>
    );
  }

  return (
    <div className="my-4 text-center" key={ad._id}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}
        data-ad-slot={ad.googleAd.adSlotId}
        data-ad-format={ad.googleAd.adFormat || "auto"}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default GoogleAd;
