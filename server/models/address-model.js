import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
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

AddressSchema.index({ userId: 1, isDefault: 1 });

export const AddressModel = mongoose.models.Address || mongoose.model("Address", AddressSchema);
export default AddressModel;
