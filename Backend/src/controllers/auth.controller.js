import crypto from "crypto";
import userModel from "../models/user.model.js";
import { sendEmail } from "../services/sendgridEmail.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Payment from "../models/payment.model.js";
import { PRICING } from "../config/constants.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateVerificationEmail } from "../utils/emailTemplates.js";
import { generateOTP, generateRandomString } from "../utils/helpers.js";
import { generateAccessToken } from "../utils/jwt.js";

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

  console.log("Email Token:", emailToken);
  console.log("Phone OTP:", phoneOTP);

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
    phoneVerificationExpires: Date.now() + 10 * 60 * 1000,
  });

  // Save user
  await user.save();

  // Create pending activation payment if not already exists or completed
  try {
    const existingCompleted = await Payment.findOne({
      user: user._id,
      type: "activate_user",
      status: { $in: ["completed", "refunded"] },
    });
    const existingPending = await Payment.findOne({
      user: user._id,
      type: "activate_user",
      status: "pending",
    });
    if (!existingCompleted && !existingPending) {
      await Payment.create({
        user: user._id,
        type: "activate_user",
        amount: PRICING.ACTIVATE_USER,
        currency: "SAR",
        status: "pending",
        description: "One-time activation to view all players' contacts",
        gateway: process.env.PAYMENT_GATEWAY || "paylink",
      });
    }
  } catch {}

  // Send Verification Email & SMS OTP
  const emailResult = await sendEmail(
    user.email,
    "Verify Your Email",
    `Your verification code is: ${emailToken}`,
    generateVerificationEmail(emailToken)
  );

  // await smsService.sendOTP(user.phone, phoneOTP);

  if (!emailResult.success) {
    await userModel.findByIdAndDelete(user._id);
    return res.status(500).json({
      error: "Failed to send verification email. Please try again.",
    });
  }

  // Generate JWT Tokens
  const accessToken = generateAccessToken(user);

  // Save refresh token
  await user.save();

  // Prepare Response (Don't return password or sensitive data)
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  // Set Access Token Cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 1000 * 60 * 15, // 15 mins
  });

  // Send Response
  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: userData,
        accessToken,
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

  // Allow login even if inactive; gating will be handled in features

  // Update last login & clean expired refresh tokens
  user.lastLogin = new Date();

  // Generate Tokens
  const accessToken = generateAccessToken(user);

  // Save user
  await user.save();

  // Set Access Token Cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 15 mins
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

  // Send response (No Tokens in Body since they are in Cookies)
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

export const logout = asyncHandler(async (req, res) => {
  // Clear Cookies
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
    emailVerificationExpires: { $gt: Date.now() }, // Check expiry
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
    _id: req.user.id, // Assuming req.user is populated (Authenticated User)
    phoneVerificationOTP: hashedOTP,
    phoneVerificationExpires: { $gt: Date.now() }, // OTP not expired
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // Mark phone as verified and clear OTP fields
  user.isPhoneVerified = true;
  user.phoneVerificationOTP = undefined;
  user.phoneVerificationExpires = undefined;

  await user.save();

  // Send Response
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

// export const getProfile = asyncHandler(async (req, res) => {

//   const user = await userModel.findById(req.user.id).select("-password ");

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   res
//     .status(200)
//     .json(new ApiResponse(200, { user }, "Profile retrieved successfully"));
// });

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

  // Send Reset Email
  await sendEmail(
    user.email,
    "Password Reset",
    `Your password reset code is: ${resetToken}`,
    generateVerificationEmail(resetToken)
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "Password reset email sent" },
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
    passwordResetToken: hashedToken, // fixed field name
    passwordResetExpires: { $gt: Date.now() }, // fixed field name
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
