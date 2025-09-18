import bcrypt from "bcryptjs";
import { generatePublicUrl } from "../config/localStorage.js";
import Invoice from "../models/invoice.model.js";
import User from "../models/user.model.js";
import { deleteMediaFromLocal } from "../utils/localMediaUtils.js";

export const update = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(401).json({ message: "You must be logged in" });
    }

    const currentUser = await User.findById(id)
      .select("+password +profileImage")
      .lean();
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const restrictedFields = [
      "_id",
      "email",
      "role",
      "isEmailVerified",
      "isPhoneVerified",
      "emailVerificationToken",
      "emailVerificationExpires",
      "phoneVerificationOTP",
      "phoneVerificationExpires",
      "passwordResetToken",
      "passwordResetExpires",
      "refreshTokens",
      "createdAt",
      "updatedAt",
      "__v",
    ];

    const specialFields = ["password", "profileImage"];

    const schemaFields = Object.keys(User.schema.paths);
    const allowedFields = schemaFields.filter(
      (field) =>
        !restrictedFields.includes(field) && !specialFields.includes(field)
    );

    const updates = {};
    const errors = {};

    for (const field of allowedFields) {
      if (
        field in req.body &&
        req.body[field] !== undefined &&
        req.body[field] !== null &&
        req.body[field] !== ""
      ) {
        const value = req.body[field];

        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          updates[field] =
            currentUser && currentUser[field]
              ? { ...currentUser[field], ...value }
              : value;
        } else {
          updates[field] = typeof value === "string" ? value.trim() : value;
        }
      }
    }

    let imageFile = null;

    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      imageFile = req.files.profileImage[0];
    } else if (req.file) {
      imageFile = req.file;
    } else if (req.files && Array.isArray(req.files) && req.files[0]) {
      imageFile = req.files[0];
    }

    if (imageFile) {
      if (!imageFile.mimetype || !imageFile.mimetype.startsWith("image/")) {
        return res
          .status(400)
          .json({ message: "Invalid image file. Must be an image." });
      }

      if (currentUser.profileImage && currentUser.profileImage.public_id) {
        try {
          await deleteMediaFromLocal(
            currentUser.profileImage.public_id,
            "image"
          );
        } catch (deleteError) {
          console.error("Error deleting old image:", deleteError);
        }
      }

      const publicUrl = generatePublicUrl(req, imageFile.path);

      updates.profileImage = {
        url: publicUrl,
        public_id: imageFile.filename,
      };
    }

    if (req.body.phone && req.body.phone !== currentUser.phone) {
      const phoneExists = await User.findOne({
        phone: req.body.phone,
        _id: { $ne: id },
      });

      if (phoneExists) {
        errors.phone = "Phone number already in use";
      } else {
        updates.phone = req.body.phone.trim();
        updates.isPhoneVerified = false;
        updates.phoneVerificationOTP = undefined;
        updates.phoneVerificationExpires = undefined;
      }
    }

    if (req.body.newPassword) {
      if (!req.body.oldPassword) {
        errors.password = "Old password is required to set new password";
      } else {
        const isMatch = await bcrypt.compare(
          req.body.oldPassword,
          currentUser.password
        );

        if (!isMatch) {
          errors.password = "Old password is incorrect";
        } else if (req.body.newPassword !== req.body.confirmPassword) {
          errors.password = "New passwords do not match";
        } else if (req.body.newPassword.length < 8) {
          errors.password = "Password must be at least 8 characters";
        } else {
          const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
          updates.password = hashedPassword;
        }
      }
    }

    if (req.body.email && req.body.email.toLowerCase() !== currentUser.email) {
      const emailExists = await User.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: id },
      });

      if (emailExists) {
        errors.email = "Email already in use";
      } else {
        errors.email =
          "Email change requires verification. Please use the email change endpoint.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation errors", errors });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    updates.lastLogin = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
        select:
          "-password -refreshTokens -emailVerificationToken -passwordResetToken -phoneVerificationOTP",
      }
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedFields = Object.keys(updates).filter(
      (key) => key !== "lastLogin"
    );

    res.status(200).json({
      message: "User updated successfully",
      updatedFields,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update error:", error);

    if (error.name === "ValidationError") {
      const validationErrors = {};
      Object.keys(error.errors).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });
      return res
        .status(400)
        .json({ message: "Validation error", errors: validationErrors });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field} already exists`,
        errors: { [field]: `This ${field} is already in use` },
      });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const notPaied = async (req, res) => {
  try {
    const userId = req.user.id;

    const unpaidPayments = await Payment.find({
      user: userId,
      status: { $nin: ["completed", "refunded"] },
    })
      .sort({ createdAt: -1 })
      .select("-gatewayResponse.raw")
      .lean();

    const invoices = await Invoice.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ unpaidPayments, invoices });
  } catch (error) {
    res.status(500).json({ error, message: error.message });
  }
};
