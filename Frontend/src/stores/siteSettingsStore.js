import { create } from "zustand";

const useSiteSettingsStore = create((set) => ({
  siteName: {
    ar: "متاح ماركت",
    en: "Muta7Market",
  },
  logo: null,
  favicon: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        set({
          siteName: {
            ar: data.data.siteName?.ar || "متاح ماركت",
            en: data.data.siteName?.en || "Muta7Market",
          },
          logo: data.data.logo || null,
          favicon: data.data.favicon || null,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useSiteSettingsStore;
