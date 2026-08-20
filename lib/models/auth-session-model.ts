import { Schema, model, models } from "mongoose";

const AuthSessionSchema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

export const AuthSessionModel = models.AuthSession || model("AuthSession", AuthSessionSchema);
