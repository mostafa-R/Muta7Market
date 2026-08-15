import mongoose from "mongoose";
import { decryptMessage } from "../services/chatEncryption.service.js";

const NegotiationMessageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NegotiationRoom",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 12000,
    },
    encryption: {
      algorithm: { type: String, default: "aes-256-gcm" },
      iv: { type: String, default: null },
      tag: { type: String, default: null },
      content: { type: String, default: null },
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

NegotiationMessageSchema.index({ room: 1, createdAt: 1 });

NegotiationMessageSchema.methods.getPlaintext = function () {
  const encrypted = this.encryption;
  if (encrypted && encrypted.content && encrypted.iv && encrypted.tag) {
    return decryptMessage(encrypted);
  }
  return this.message;
};

NegotiationMessageSchema.methods.toClientJSON = function (populatedSender) {
  return {
    _id: this._id,
    room: this.room,
    sender: populatedSender || this.sender,
    message: this.getPlaintext(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model("NegotiationMessage", NegotiationMessageSchema);