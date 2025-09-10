"use client";

import axios from "axios";
import { create } from "zustand";

const useSeoStore = create((set) => ({
  // Default SEO values
  seo: {
    metaTitle: {
      ar: "متاح ماركت - منصة الرياضة الرائدة",
      en: "Muta7Market - Leading Sports Platform",
    },
    metaDescription: {
      ar: "منصة متاح ماركت - أكبر سوق رياضي في المنطقة. اكتشف أفضل اللاعبين والمدربين في كرة القدم، كرة السلة، التنس، والمزيد.",
      en: "Muta7Market - The leading sports marketplace connecting players and coaches across all sports.",
    },
    keywords: ["رياضة", "كرة قدم", "تدريب", "sports", "football", "coaching"],
    googleAnalyticsId: "",
    ogImage: "/trophy.png",
  },
  isLoading: false,
  error: null,

  // Fetch SEO settings from backend
  fetchSeoSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

      const response = await axios.get(`${API_BASE_URL}/settings`);

      if (response.data?.success && response.data?.data?.seo) {
        const { seo } = response.data.data;

        // Update store with backend SEO data
        set({
          seo: {
            metaTitle: seo.metaTitle || {
              ar: "متاح ماركت - منصة الرياضة الرائدة",
              en: "Muta7Market - Leading Sports Platform",
            },
            metaDescription: seo.metaDescription || {
              ar: "منصة متاح ماركت - أكبر سوق رياضي في المنطقة. اكتشف أفضل اللاعبين والمدربين في كرة القدم، كرة السلة، التنس، والمزيد.",
              en: "Muta7Market - The leading sports marketplace connecting players and coaches across all sports.",
            },
            keywords: seo.keywords || [
              "رياضة",
              "كرة قدم",
              "تدريب",
              "sports",
              "football",
              "coaching",
            ],
            googleAnalyticsId: seo.googleAnalyticsId || "",
            ogImage: seo.ogImage?.url || "/trophy.png",
          },
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useSeoStore;
