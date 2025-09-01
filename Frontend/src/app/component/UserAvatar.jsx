import { useUserData } from "@/hooks/useUserData";

/**
 * Example component that displays user avatar
 * Automatically updates when profile image changes
 */
const UserAvatar = ({ size = "44", className = "" }) => {
  const { user, userImage, userName, isLoading } = useUserData();

  if (isLoading) {
    return (
      <div
        className={`w-${size} h-${size} bg-gray-200 rounded-full animate-pulse ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  if (!user) {
    return (
      <div
        className={`w-${size} h-${size} bg-gray-400 rounded-full flex items-center justify-center text-white ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <span className="text-xs">?</span>
      </div>
    );
  }

  if (userImage) {
    return (
      <img
        src={userImage}
        alt={userName || "User"}
        className={`w-${size} h-${size} rounded-full object-cover ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        onError={(e) => {
          // Fallback if image fails to load
          e.target.style.display = "none";
          e.target.parentElement.innerHTML = `
            <div class="w-full h-full bg-gray-400 rounded-full flex items-center justify-center text-white">
              <span class="text-xs">${
                userName ? userName.charAt(0).toUpperCase() : "?"
              }</span>
            </div>
          `;
        }}
      />
    );
  }

  // Fallback to user initials
  return (
    <div
      className={`w-${size} h-${size} bg-blue-500 rounded-full flex items-center justify-center text-white font-medium ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <span className="text-sm">
        {userName ? userName.charAt(0).toUpperCase() : "?"}
      </span>
    </div>
  );
};

export default UserAvatar;
