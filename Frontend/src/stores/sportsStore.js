import { apiClient } from "@/app/utils/api";
import { create } from "zustand";

const useSportsStore = create((set, get) => ({
  sports: [],
  isLoading: false,
  error: null,
  initialized: false,

  /**
   * Fetch sports data from the API
   */
  fetchSports: async () => {
    // Don't fetch if already loading
    if (get().isLoading) return;

    // If already initialized and have sports, don't fetch again
    if (get().initialized && get().sports.length > 0) return;

    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get("/sports/active");

      if (response.data && response.data.data) {
        set({
          sports: response.data.data,
          isLoading: false,
          error: null,
          initialized: true,
        });
      } else {
        throw new Error("No sports data received");
      }
    } catch (err) {
      console.error("Error fetching sports:", err);
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch sports",
        isLoading: false,
      });
    }
  },

  /**
   * Get a sport by its slug or ID
   * @param {string} slugOrId - The slug or ID of the sport
   * @returns {Object|null} - The sport object or null if not found
   */
  getSportBySlug: (slugOrId) => {
    const { sports } = get();
    return (
      sports.find(
        (sport) => sport.slug === slugOrId || sport._id === slugOrId
      ) || null
    );
  },

  /**
   * Get a sport's positions by sport slug or ID
   * @param {string} slugOrId - The slug or ID of the sport
   * @returns {Array} - Array of positions or empty array if not found
   */
  getSportPositions: (slugOrId) => {
    const sport = get().getSportBySlug(slugOrId);
    return sport?.positions || [];
  },

  /**
   * Get a sport's role types by sport slug or ID
   * @param {string} slugOrId - The slug or ID of the sport
   * @param {string} jobType - Optional filter by job type (player/coach)
   * @returns {Array} - Array of role types or empty array if not found
   */
  getSportRoleTypes: (slugOrId, jobType) => {
    const sport = get().getSportBySlug(slugOrId);
    if (!sport) return [];

    if (jobType) {
      return sport.roleTypes.filter((role) => role.jop === jobType) || [];
    }

    return sport.roleTypes || [];
  },

  /**
   * Reset the store state
   */
  resetStore: () => {
    set({
      sports: [],
      isLoading: false,
      error: null,
      initialized: false,
    });
  },
}));

export default useSportsStore;
