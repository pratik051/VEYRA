import mongoose from "mongoose";

const AuthSessionSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

export const AuthSessionModel = mongoose.models.AuthSession || mongoose.model("AuthSession", AuthSessionSchema);
export default AuthSessionModel;
