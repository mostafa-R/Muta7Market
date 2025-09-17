import { api } from "@/utils/api";
import { useCallback, useEffect, useState } from "react";

export const useAdvertisements = (position, settings) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdvertisements = useCallback(async () => {
    if (!position || !settings) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let adSourceToFetch = "internal";

      // Check if the ads object and googleAds object exist before accessing enabled
      if (settings.googleAds?.enabled) {
        const randomNumber = Math.random() * 100;
        if (randomNumber > settings.internalAdsRatio) {
          adSourceToFetch = "google";
        }
      }

      const response = await api.get(
        `/advertisements/active/${position}?source=${adSourceToFetch}`
      );

      // Ensure we're setting the ads correctly
      if (response.data && Array.isArray(response.data)) {
        setAds(response.data || []);
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setAds(response.data.data || []);
      } else if (response.data && typeof response.data === "object") {
        // If data is an object but not in expected format, try to extract it
        const extractedAds = response.data.data || response.data || [];
        setAds(Array.isArray(extractedAds) ? extractedAds : [extractedAds]);
      } else {
        setAds([]);
      }
    } catch (err) {
      console.error(
        `Failed to fetch advertisements for position: ${position}`,
        err
      );
      setError(err);
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, [position, settings]);

  useEffect(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

  return { ads, loading, error };
};
