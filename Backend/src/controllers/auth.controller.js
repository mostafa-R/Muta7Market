import crypto from "crypto";
import { isEmailEnabled, sendEmail } from "../config/email.js";
import Invoice from "../models/invoice.model.js";
import userModel from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateVerificationEmail } from "../utils/emailTemplates.js";
import { generateOTP, generateRandomString } from "../utils/helpers.js";
import { generateAccessToken } from "../utils/jwt.js";
import { makeOrderNumber } from "../utils/orderNumber.js";
import { getPricingSettings } from "../utils/pricingUtils.js";

export const register = asyncHandler(async (req, res) => {
  const { name, phone, password, confirmPassword, email } = req.body;

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match.");
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
    profileImage: "",
    phone,
    email,
    password,
    emailVerificationToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
    phoneVerificationOTP: phoneVerificationHashedOTP,
    phoneVerificationExpires: Date.now() + 10 * 60 * 1000,
  });

  await user.save();

  try {
    const exists = await Invoice.findOne({
      userId: user._id,
      product: "contacts_access",
      status: "pending",
    });

    if (!exists) {
      const pricing = await getPricingSettings();
      const orderNo = makeOrderNumber("contacts_access", String(user._id));
      await Invoice.create({
        orderNumber: orderNo,
        invoiceNumber: orderNo,
        userId: user._id,
        product: "contacts_access",
        targetType: null,
        profileId: null,
        durationDays:
          pricing.contacts_access_days || pricing.ONE_YEAR_DAYS || 365,
        featureType: null,
        amount: pricing.contacts_access_price || pricing.contacts_access_year,
        currency: "SAR",
        status: "pending",

        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }
  } catch (e) {
    console.error("seed contacts_access draft failed", e);
  }

  const emailResult = await sendEmail(
    user.email,
    "Verify Your Email",
    `Your verification code is: ${emailToken}`,
    generateVerificationEmail(emailToken)
  );

  const accessToken = generateAccessToken(user);

  await user.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 1000 * 60 * 15,
  });

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  const exposeCodes =
    String(process.env.OTP_DEV_MODE || "0").toLowerCase() === "1" ||
    (!isEmailEnabled && process.env.NODE_ENV !== "production");

  const extraDev = exposeCodes
    ? {
        dev: { emailVerificationCode: emailToken, phoneOTP },
        emailSent: !!emailResult?.success,
      }
    : { emailSent: !!emailResult?.success };

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: userData,
        accessToken,
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

  user.lastLogin = new Date();

  const accessToken = generateAccessToken(user);

  await user.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

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
        { user: sanitizedUser, token: accessToken },
        "Login successful"
      )
    );
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
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
  const user = await userModel.findById(req.user.id).select("-password");

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
    String(process.env.OTP_DEV_MODE || "0").toLowerCase() === "1" ||
    (!isEmailEnabled && process.env.NODE_ENV !== "production");

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

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { ok: true }, "password reset successful."));
});
