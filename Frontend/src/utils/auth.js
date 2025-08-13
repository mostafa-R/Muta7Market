// utils/auth.js

/**
 * التحقق من صلاحية الجلسة
 */
export const isSessionValid = () => {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("token");
  const tokenExpiration = localStorage.getItem("tokenExpiration");

  if (!token) return false;

  // التحقق من انتهاء صلاحية التوكن
  if (tokenExpiration) {
    const expirationDate = new Date(tokenExpiration);
    const now = new Date();

    if (now > expirationDate) {
      // الجلسة منتهية، امسح البيانات
      clearAuthData();
      return false;
    }
  }

  return true;
};

/**
 * الحصول على بيانات المستخدم الحالي
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

/**
 * الحصول على التوكن
 */
export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/**
 * تحديث بيانات المستخدم في localStorage
 */
export const updateStoredUser = (userData) => {
  if (typeof window === "undefined") return;

  try {
    const currentUser = getCurrentUser();
    const updatedUser = {
      ...currentUser,
      ...userData,
      // التأكد من أن profileImage محفوظ بشكل صحيح
      profileImage: userData.profileImage || currentUser?.profileImage || null,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    console.log("User data updated in localStorage:", updatedUser);
  } catch (error) {
    console.error("Error updating user data:", error);
  }
};

/**
 * مسح بيانات المصادقة
 */
export const clearAuthData = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("tokenExpiration");
  localStorage.setItem("isLoggedIn", "false");
};

/**
 * تجديد الجلسة (يمكن استخدامها مع refresh token)
 */
export const refreshSession = async () => {
  try {
    const token = getToken();
    if (!token) return false;

    // هنا يمكنك إضافة طلب API لتجديد التوكن
    // const response = await axios.post('/api/auth/refresh', {}, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });

    // إذا نجح التجديد، حدث البيانات
    // handleLoginSuccess(response.data);

    return true;
  } catch (error) {
    console.error("Session refresh failed:", error);
    clearAuthData();
    return false;
  }
};
