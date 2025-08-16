import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { USER_ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
      minlength: [2, 'Name must be at least 2 characters']
    },
    profileImage: {
      url: String,
      public_id: String
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ],
      index: true // Add index for performance
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
      index: true // Add index for performance
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    phoneVerificationOTP: String,
    phoneVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
          expires: 604800 // 7 days
        }
      }
    ],
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: false
    },
    bio: {
      type: String,
      default: ""
    }
    
    // preferences: {
    //   language: {
    //     type: String,
    //     enum: ["en", "ar"],
    //     default: "en",
    //   },
    //   notifications: {
    //     email: { type: Boolean, default: true },
    //     sms: { type: Boolean, default: true },
    //     push: { type: Boolean, default: true },
    //   },
    // },
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {return next();}

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.cleanExpiredTokens = function () {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter((tokenObj) => {
    const tokenAge = now - tokenObj.createdAt;
    return tokenAge < 7 * 24 * 60 * 60 * 1000; // 7 days
  });
};

export default mongoose.model('User', userSchema);
