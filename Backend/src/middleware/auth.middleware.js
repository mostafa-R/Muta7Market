import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const token =
    req.header("Authorization")?.replace("Bearer ", "") ||
    req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }

  const user = await User.findById(decoded.id)
    .select("-password -refreshTokens -emailVerificationToken -passwordResetToken -phoneVerificationOTP")
    .lean();

  if (!user) {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (user.deletedAt) {
    return res.status(403).json({ message: "Account has been deactivated" });
  }

  if (user.deletedAt) {
    return res
      .status(403)
      .json({ message: "Your account has been deactivated" });
  }

  req.user = {
    ...decoded,
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    profileImage: user.profileImage,
    verifiedBadge: user.verifiedBadge,
    kycStatus: user.kycStatus,
  };

  next();
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action"
      );
    }
    next();
  };
};

export const verifiedOnly = asyncHandler(async (req, res, next) => {
  if (req.user.isEmailVerified === false) {
    throw new ApiError(403, "Please verify your email to continue");
  }
  next();
});
