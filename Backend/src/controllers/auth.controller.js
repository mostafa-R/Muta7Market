import crypto from "crypto";
import userModel from "../models/user.model.js";
import { sendEmail } from "../services/sendgridEmail.service.js";
import { isEmailEnabled } from "../config/email.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateVerificationEmail } from "../utils/emailTemplates.js";
import { generateOTP, generateRandomString } from "../utils/helpers.js";
import { generateAccessToken } from "../utils/jwt.js";
import { ensurePendingInvoice } from "../services/invoice.service.js";

export const register = asyncHandler(async (req, res) => {
  const { name, phone, password, confirmPassword, email } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  // Check if user already exists by email or phone
  const existEmail = await userModel.findOne({ email });
  if (existEmail) {
    return res.status(400).json({ error: "Email already exists." });
  }

  const existPhone = await userModel.findOne({ phone });
  if (existPhone) {
    return res.status(400).json({ error: "Phone number already exists." });
  }

  // Generate Verification Tokens
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

  // Create new user instance
  const user = new userModel({
    name,
    profileImage: "",
    phone,
    email,
    password,
    emailVerificationToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    phoneVerificationOTP: phoneVerificationHashedOTP,
    phoneVerificationExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  // Save user
  await user.save();

  // Create a pending invoice for contacts access (one-time unlock)
  try {
    await ensurePendingInvoice({
      userId: user._id,
      product: "contacts_access",
    });
  } catch (e) {
    // Do not block signup if invoice creation fails
    console.error("ensurePendingInvoice(contacts_access) failed", e);
  }

  // Send Verification Email (non-blocking)
  const emailResult = await sendEmail(
    user.email,
    "Verify Your Email",
    `Your verification code is: ${emailToken}`,
    generateVerificationEmail(emailToken)
  );

  // Generate JWT Access Token
  const accessToken = generateAccessToken(user);

  // Persist any last updates on user (e.g., lastLogin if you add it later)
  await user.save();

  // Set Access Token Cookie (15 minutes)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 1000 * 60 * 15,
  });

  // Prepare Response (Do not return sensitive fields)
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  // In dev or when email disabled, expose verification codes for testing
  const exposeCodes =
    String(process.env.OTP_DEV_MODE || "0").toLowerCase() === "1" ||
    (!isEmailEnabled && process.env.NODE_ENV !== "production");

  const extraDev = exposeCodes
    ? {
        dev: { emailVerificationCode: emailToken, phoneOTP },
        emailSent: !!emailResult?.success,
      }
    : { emailSent: !!emailResult?.success };

  // Send Response
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

  // Find user by email
  const user = await userModel.findOne({ email }).select("+password");

  // Validate credentials
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Username or password is incorrect");
  }

  // Update last login (optional)
  user.lastLogin = new Date();

  // Generate Access Token
  const accessToken = generateAccessToken(user);

  // Save user
  await user.save();

  // Set Access Token Cookie (7 days)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  // Prepare sanitized user data
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

  // Send response (also return token in body for your frontend localStorage)
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
    _id: req.user.id, // Authenticated user
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

export const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    res.status(200).json({
      success: true,
      user,
      message: "Profile retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    throw new ApiError(404, "No user found with this email");
  }

  // Generate reset token
  const resetToken = generateRandomString();

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 mins

  await user.save();

  // Send Reset Email (non-blocking)
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

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { ok: true }, "password reset successful."));
});
