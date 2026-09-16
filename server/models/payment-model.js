import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    orderId: { type: String, required: true, index: true },
    paymentMethod: { type: String, enum: ["Khalti", "eSewa", "MyPay", "Bank Transfer", "Cash on Delivery"] },
    provider: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NPR" },
    transactionCode: { type: String, trim: true, sparse: true, unique: true, index: true },
    screenshot: { type: String, default: "" },
    status: { type: String, enum: ["pending", "submitted", "verified", "rejected", "Pending", "Completed", "Failed"], default: "pending" },
    submittedAt: { type: Date },
    verifiedAt: { type: Date },
    providerReference: { type: String, default: "" },
    rawPayload: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
export default PaymentModel;
