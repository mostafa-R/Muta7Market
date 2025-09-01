import { useEffect, useState } from "react";

/**
 * Custom hook to manage user data with automatic updates
 * Listens for profile updates and refreshes user data from localStorage
 */
export const useUserData = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage
  const loadUserData = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error loading user data from localStorage:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadUserData();

    // Listen for user profile updates
    const handleUserUpdate = (event) => {
      if (event.detail?.user) {
        setUser(event.detail.user);
      } else {
        loadUserData(); // Fallback to reload from localStorage
      }
    };

    // Listen for the custom event
    window.addEventListener("userProfileUpdated", handleUserUpdate);

    // Also listen for storage changes (in case updated from another tab)
    const handleStorageChange = (event) => {
      if (event.key === "user") {
        loadUserData();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Cleanup listeners
    return () => {
      window.removeEventListener("userProfileUpdated", handleUserUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Method to manually refresh user data
  const refreshUser = () => {
    loadUserData();
  };

  return {
    user,
    isLoading,
    refreshUser,
    // Convenience properties
    userImage: user?.profileImage?.url || null,
    userName: user?.name || null,
    userEmail: user?.email || null,
  };
};

export default useUserData;
