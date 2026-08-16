import crypto from "crypto";
import { isEmailEnabled, sendEmail } from "../config/email.js";
import { PUBLIC_REGISTERABLE_ROLES } from "../config/constants.js";
import userModel from "../models/user.model.js";
import smsService from "../services/sms.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateVerificationEmail } from "../utils/emailTemplates.js";
import { generateOTP, generateRandomString } from "../utils/helpers.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  REFRESH_TOKEN_MAX_AGE_MS,
} from "../utils/jwt.js";

const isSmsConfigured = () =>
  Boolean(
    process.env.SMS_API_KEY &&
      process.env.SMS_API_URL &&
      String(process.env.SMS_API_URL).startsWith("http")
  );

const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
};

const issueRefreshToken = async (user) => {
  const refreshToken = generateRefreshToken(user);
  user.cleanExpiredTokens();
  user.refreshTokens.push({
    token: hashRefreshToken(refreshToken),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
  });
  await user.save();
  return refreshToken;
};

export const register = asyncHandler(async (req, res) => {
  const { name, phone, password, confirmPassword, email, role } = req.body;

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match.");
  }

  if (role && !PUBLIC_REGISTERABLE_ROLES.includes(role)) {
    throw new ApiError(400, "Invalid role.");
  }

  const existEmail = await userModel.findOne({ email });
  if (existEmail) {
    throw new ApiError(400, "Email already exists.");
  }

  const existPhone = await userModel.findOne({ phone });
  if (existPhone) {
    throw new ApiError(400, "Phone number already exists.");
  }

  const emailToken = generateRandomString();
  const phoneOTP = generateOTP();

  const emailVerificationToken = crypto
    .createHash("sha256")
    .update(emailToken)
    .digest("hex");

  const phoneVerificationHashedOTP = crypto
    .createHash("sha256")
    .update(phoneOTP)
    .digest("hex");

  const user = new userModel({
    name,
    phone,
    email,
    password,
    emailVerificationToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
    phoneVerificationOTP: phoneVerificationHashedOTP,
    phoneVerificationExpires: Date.now() + 10 * 60 * 1000,
    role: role || undefined,
  });

  await user.save();

  const emailResult = await sendEmail(
    user.email,
    "Verify Your Email",
    `Your verification code is: ${emailToken}`,
    generateVerificationEmail(emailToken)
  );

  let smsSent = false;
  if (isSmsConfigured()) {
    try {
      await smsService.sendOTP(user.phone, phoneOTP, 10);
      smsSent = true;
    } catch (error) {
      console.error("Failed to send phone OTP via SMS:", error.message);
    }
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = await issueRefreshToken(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 1000 * 60 * 15,
  });
  setRefreshTokenCookie(res, refreshToken);

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  const exposeCodes =
    process.env.NODE_ENV !== "production" &&
    (String(process.env.OTP_DEV_MODE || "0").toLowerCase() === "1" ||
      !isEmailEnabled);

  const extraDev = exposeCodes
    ? {
        dev: { emailVerificationCode: emailToken, phoneOTP },
        emailSent: !!emailResult?.success,
        smsSent,
      }
    : { emailSent: !!emailResult?.success, smsSent };

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: userData,
        accessToken,
        refreshToken,
        ...extraDev,
      },
      "User registered successfully"
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Username or password is incorrect");
  }

  if (user.deletedAt) {
    throw new ApiError(
      403,
      "Your account has been deactivated. Please contact support"
    );
  }

  user.lastLogin = new Date();

  const accessToken = generateAccessToken(user);
  const refreshToken = await issueRefreshToken(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  setRefreshTokenCookie(res, refreshToken);

  const sanitizedUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    lastLogin: user.lastLogin,
    profileImage: user.profileImage,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,
  };

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: sanitizedUser, token: accessToken, refreshToken },
        "Login successful"
      )
    );
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshToken) {
    try {
      const user = await userModel.findById(req.user?.id).select("+refreshTokens");
      if (user) {
        user.revokeRefreshToken(hashRefreshToken(refreshToken));
        await user.save();
      }
    } catch (error) {
      console.error("Logout refresh token revocation failed:", error.message);
    }
  }

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await userModel.findById(decoded.id).select("+refreshTokens");
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (!user.tokensMatch(hashRefreshToken(refreshToken))) {
    throw new ApiError(401, "Refresh token has been revoked");
  }

  user.revokeRefreshToken(hashRefreshToken(refreshToken));
  const newRefreshToken = await issueRefreshToken(user);

  const accessToken = generateAccessToken(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  setRefreshTokenCookie(res, newRefreshToken);

  res.status(200).json(
    new ApiResponse(
      200,
      { accessToken, refreshToken: newRefreshToken },
      "Tokens refreshed successfully"
    )
  );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    throw new ApiError(400, "Verification code is required");
  }

  const hashedToken = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await userModel.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  if (user.pendingEmail) {
    const taken = await userModel.findOne({
      $or: [
        { email: user.pendingEmail },
        { pendingEmail: user.pendingEmail },
      ],
      _id: { $ne: user._id },
    });

    if (taken) {
      user.pendingEmail = undefined;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      throw new ApiError(400, "This email is already in use");
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "Email verified successfully" },
        "Email verified successfully"
      )
    );
});

export const verifyPhone = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    throw new ApiError(400, "OTP is required");
  }

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await userModel.findOne({
    _id: req.user.id,
    phoneVerificationOTP: hashedOTP,
    phoneVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.isPhoneVerified = true;
  user.phoneVerificationOTP = undefined;
  user.phoneVerificationExpires = undefined;

  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "Phone verified successfully" },
        "Phone verified successfully"
      )
    );
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new passwords are required");
  }

  const user = await userModel.findById(req.user.id).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "Password changed successfully" },
        "Password changed successfully"
      )
    );
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel
    .findById(req.user.id)
    .select(
      "-password -refreshTokens -emailVerificationToken -emailVerificationExpires -phoneVerificationOTP -phoneVerificationExpires -passwordResetToken -passwordResetExpires"
    );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { user }, "Profile retrieved successfully"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    throw new ApiError(404, "No user found with this email");
  }

  const resetToken = generateRandomString();

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 mins

  await user.save();

  const fpEmailResult = await sendEmail(
    user.email,
    "Password Reset",
    `Your password reset code is: ${resetToken}`,
    generateVerificationEmail(resetToken)
  );

  const exposeCodes =
    process.env.NODE_ENV !== "production" &&
    (String(process.env.OTP_DEV_MODE || "0").toLowerCase() === "1" ||
      !isEmailEnabled);

  const extraDev = exposeCodes
    ? {
        dev: { passwordResetCode: resetToken },
        emailSent: !!fpEmailResult?.success,
      }
    : { emailSent: !!fpEmailResult?.success };

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "Password reset email sent", ...extraDev },
        "Password reset email sent"
      )
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { otp, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const hashedToken = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { ok: true }, "password reset successful."));
});
