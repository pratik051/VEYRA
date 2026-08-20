import { Schema, model, models } from "mongoose";

const PasswordResetTokenSchema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

export const PasswordResetTokenModel =
  models.PasswordResetToken || model("PasswordResetToken", PasswordResetTokenSchema);
