export const isSessionValid = () => {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("token");
  const tokenExpiration = localStorage.getItem("tokenExpiration");

  if (!token) return false;

  if (tokenExpiration) {
    const expirationDate = new Date(tokenExpiration);
    const now = new Date();

    if (now > expirationDate) {
      clearAuthData();
      return false;
    }
  }

  return true;
};

/**
 */
export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const updateStoredUser = (userData) => {
  if (typeof window === "undefined") return;

  try {
    const currentUser = getCurrentUser();
    const updatedUser = {
      ...currentUser,
      ...userData,
      profileImage: userData.profileImage || currentUser?.profileImage || null,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
  } catch (error) {
    console.error("Error updating user data:", error);
  }
};

export const clearAuthData = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("tokenExpiration");
  localStorage.setItem("isLoggedIn", "false");
};

export const refreshSession = async () => {
  try {
    const token = getToken();
    if (!token) return false;

    return true;
  } catch (error) {
    console.error("Session refresh failed:", error);
    clearAuthData();
    return false;
  }
};
