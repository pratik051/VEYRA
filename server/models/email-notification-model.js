import mongoose from "mongoose";

const EmailNotificationSchema = new mongoose.Schema(
  {
    recipient: { type: String, required: true, trim: true, lowercase: true, index: true },
    emailType: {
      type: String,
      required: true,
      enum: ["WELCOME", "ORDER_CONFIRMATION", "STATUS_UPDATE", "DELIVERED", "PASSWORD_RESET_OTP"],
      index: true
    },
    orderId: { type: String, default: "", index: true },
    userId: { type: String, default: "", index: true },
    status: { type: String, default: "", index: true },
    subject: { type: String, default: "" },
    messageId: { type: String, default: "" },
    success: { type: Boolean, default: true, index: true },
    error: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: () => ({}) }
  },
  { timestamps: true }
);

// Compound index for fast idempotency lookups
EmailNotificationSchema.index({ orderId: 1, emailType: 1, status: 1 });
EmailNotificationSchema.index({ userId: 1, emailType: 1 });
EmailNotificationSchema.index({ recipient: 1, emailType: 1 });

export const EmailNotificationModel =
  mongoose.models.EmailNotification || mongoose.model("EmailNotification", EmailNotificationSchema);

export default EmailNotificationModel;
