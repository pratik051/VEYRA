import mongoose from "mongoose";

const PasswordResetOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: "10m" } },
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const PasswordResetOtpModel =
  mongoose.models.PasswordResetOtp || mongoose.model("PasswordResetOtp", PasswordResetOtpSchema);
export default PasswordResetOtpModel;
