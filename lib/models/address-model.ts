import { Schema, model, models } from "mongoose";

export interface IAddress {
  _id?: string;
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  province: string;
  district: string;
  city: string;
  ward?: string;
  fullAddress: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  country: string;
  landmark?: string;
  label?: string; // e.g. "Home", "Office", "Other"
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const AddressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    province: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    ward: { type: String, default: "", trim: true },
    fullAddress: { type: String, required: true, trim: true },
    addressLine1: { type: String, default: "", trim: true },
    addressLine2: { type: String, default: "", trim: true },
    postalCode: { type: String, default: "", trim: true },
    country: { type: String, default: "Nepal", trim: true },
    landmark: { type: String, default: "", trim: true },
    label: { type: String, default: "Home", trim: true },
    isDefault: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

// Compound index for querying user's default address quickly
AddressSchema.index({ userId: 1, isDefault: 1 });

export const AddressModel = models.Address || model("Address", AddressSchema);
