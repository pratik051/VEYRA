import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    googleId: { type: String, sparse: true, unique: true, index: true },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    province: { type: String, default: "" },
    district: { type: String, default: "" },
    city: { type: String, default: "" },
    ward: { type: String, default: "" },
    fullAddress: { type: String, default: "" },
    landmark: { type: String, default: "" }
  },
  { timestamps: true }
);

export const UserModel = models.User || model("User", UserSchema);
