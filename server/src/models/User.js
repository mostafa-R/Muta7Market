import mongoose from 'mongoose';
import { ALL_ROLES, LANGUAGES } from '../config/constants.js';
import { hashPassword, comparePassword } from '../utils/password.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, select: false, minlength: 8 },
    firstName: { type: String, trim: true, maxlength: 60 },
    lastName: { type: String, trim: true, maxlength: 60 },
    displayName: { type: String, trim: true, maxlength: 120 },
    role: { type: String, enum: ALL_ROLES, required: true, index: true },
    lang: { type: String, enum: LANGUAGES, default: 'en' },
    avatar: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpiresAt: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
    bannedAt: { type: Date, default: null },
    bannedReason: { type: String, default: null },
    lastLoginAt: { type: Date, default: null },
    termsAcceptedAt: { type: Date, default: null },
    registeredIp: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return comparePassword(candidate, this.password);
};

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationTokenHash;
  delete obj.emailVerificationExpiresAt;
  delete obj.passwordResetTokenHash;
  delete obj.passwordResetExpiresAt;
  return obj;
};

userSchema.index({ role: 1, isActive: 1, createdAt: -1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model('User', userSchema);
