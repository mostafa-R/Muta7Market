import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import playerModel from '../models/player.model.js';

export const update = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(401).json({ message: 'You must be logged in' });
    }

    // Define fields that should NOT be updated directly
    const restrictedFields = [
      '_id',
      'email', // Email should have separate verification process
      'role', // Role should be updated by admin only
      'isEmailVerified',
      'isPhoneVerified',
      'emailVerificationToken',
      'emailVerificationExpires',
      'phoneVerificationOTP',
      'phoneVerificationExpires',
      'passwordResetToken',
      'passwordResetExpires',
      'refreshTokens',
      'createdAt',
      'updatedAt',
      '__v'
    ];

    // Define fields that need special handling
    const specialFields = ['password', 'phone'];

    // Get all fields from schema that can be updated
    const schemaFields = Object.keys(User.schema.paths);
    const allowedFields = schemaFields.filter(
      (field) =>
        !restrictedFields.includes(field) && !specialFields.includes(field)
    );

    const updates = {};
    const errors = {};

    // Process regular fields
    for (const field of allowedFields) {
      if (field in req.body) {
        const value = req.body[field];

        // Handle nested objects (like preferences)
        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // For nested objects, merge with existing data
          const currentUser = await User.findById(id).select(field);
          if (currentUser && currentUser[field]) {
            updates[field] = { ...currentUser[field].toObject(), ...value };
          } else {
            updates[field] = value;
          }
        } else {
          // For simple fields
          updates[field] = typeof value === 'string' ? value.trim() : value;
        }
      }
    }

    // Handle phone update with verification check
    if (req.body.phone) {
      const phoneExists = await User.findOne({
        phone: req.body.phone,
        _id: { $ne: id }
      });

      if (phoneExists) {
        errors.phone = 'Phone number already in use';
      } else {
        updates.phone = req.body.phone.trim();
        // Reset phone verification when phone is changed
        updates.isPhoneVerified = false;
        updates.phoneVerificationOTP = undefined;
        updates.phoneVerificationExpires = undefined;
      }
    }

    // Handle password update
    if (req.body.newPassword) {
      // Validate old password is provided
      if (!req.body.oldPassword) {
        errors.password = 'Old password is required to set new password';
      } else {
        const user = await User.findById(id).select('+password');
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(
          req.body.oldPassword,
          user.password
        );
        if (!isMatch) {
          errors.password = 'Old password is incorrect';
        } else if (req.body.newPassword !== req.body.confirmPassword) {
          errors.password = 'New passwords do not match';
        } else if (req.body.newPassword.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else {
          const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
          updates.password = hashedPassword;
        }
      }
    }

    // Handle email update (with verification required)
    if (req.body.email && req.body.email !== req.user.email) {
      const emailExists = await User.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: id }
      });

      if (emailExists) {
        errors.email = 'Email already in use';
      } else {
        // You might want to send verification email here
        // For now, we'll just note that email change needs verification
        errors.email =
          'Email change requires verification. Please use the email change endpoint.';
      }
    }

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Validation errors',
        errors
      });
    }

    // Check if there are any updates to make
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'No valid fields to update'
      });
    }

    // Update lastLogin if it's a profile update
    updates.lastLogin = new Date();

    // Perform the update
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
        select:
          '-password -refreshTokens -emailVerificationToken -passwordResetToken -phoneVerificationOTP'
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare response with updated fields info
    const updatedFields = Object.keys(updates).filter(
      (key) => key !== 'lastLogin'
    );

    res.status(200).json({
      message: 'User updated successfully',
      updatedFields,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      Object.keys(error.errors).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field} already exists`,
        errors: { [field]: `This ${field} is already in use` }
      });
    }

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};
export const notPaied = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const player = await playerModel.findOne({ user: userId , isActive: false });
    console.log(player);
    if (!player) throw new ApiError(404, "Player not found");
    return res.status(200).json(player);
  } catch (error) {
    res.status(500).json({ error, message: error.message });
  }
};



// const extractPublicId = (url) => {
//   const parts = url.split("/");
//   const filename = parts[parts.length - 1];
//   const publicIdWithExtension = filename.split(".")[0];
//   return `sportsPlatform/users/${publicIdWithExtension}`;
// };

// export const profileImage = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     if (user.profileImage) {
//       const publicId = extractPublicId(user.profileImage);
//       await cloudinary.uploader.destroy(publicId);
//     }

//     // upload image to Cloudinary
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: "sportsPlatform/users",
//     });
//     //delete temporary file image
//     try {
//       fs.unlinkSync(req.file.path);
//     } catch (unlinkErr) {
//       console.warn("Failed to delete local file:", unlinkErr.message);
//     }

//     const newUser = await User.findByIdAndUpdate(
//       user._id,
//       { profileImage: result.secure_url },
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({ message: "Image uploaded successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Upload failed" });
//   }
// };

// export const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.user;
//     if (!id) {
//       return res.status(401).json({ message: "You must be logged in" });
//     }

//     const user = await User.findByIdAndUpdate(
//       id,
//       { deletedAt: date.now() },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("Delete error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const restoreUserbyId = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id) {
//       return res.status(400).json({ message: "User ID is required" });
//     }
//     const user = await User.findByIdAndUpdate(
//       id,
//       { deletedAt: null },
//       { new: true }
//     );
//     res.status(200).json({ message: "User restored successfully", user });
//   } catch (error) {
//     res.status(500).json({ error, message: error.message });
//   }
// };

// /// admin notifications

// export const getNotifictions = async (req, res) => {
//   try {
//     const notifications = await Notification.find({}).sort({ createdAt: -1 });

//     res.status(200).json(notifications);
//   } catch (error) {
//     console.error("Get Notifications Error:", error);
//     res.status(500).json({ message: "Failed to fetch notifications." });
//   }
// };
