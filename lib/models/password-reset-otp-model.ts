import { Schema, model, models } from "mongoose";

export interface IPasswordResetOtp {
  email: string;
  otp: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const PasswordResetOtpSchema = new Schema<IPasswordResetOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: "10m" } },
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const PasswordResetOtpModel =
  models.PasswordResetOtp || model<IPasswordResetOtp>("PasswordResetOtp", PasswordResetOtpSchema);
