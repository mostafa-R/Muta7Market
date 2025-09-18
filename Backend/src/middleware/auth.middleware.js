import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      ...decoded,
      _id: decoded.id,
      id: decoded.id,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
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
  const { isEmailVerified } = req.user;

  if (isEmailVerified === false) {
    throw new ApiError(403, "Please verify your email and phone to continue");
  }

  next();
});
