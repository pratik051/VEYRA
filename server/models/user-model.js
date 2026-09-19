import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, sparse: true, index: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true, index: true },
    passwordHash: { type: String, required: true },
    googleId: { type: String, sparse: true, unique: true, index: true },
    appleId: { type: String, sparse: true, unique: true, index: true },
    firebaseUid: { type: String, sparse: true, index: true },
    authProvider: { type: String, enum: ["local", "google", "apple", "phone"], default: "local" },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    province: { type: String, default: "" },
    district: { type: String, default: "" },
    city: { type: String, default: "" },
    ward: { type: String, default: "" },
    fullAddress: { type: String, default: "" },
    landmark: { type: String, default: "" },
    welcomeEmailSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export default UserModel;
