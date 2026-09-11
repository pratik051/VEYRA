import { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
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
    rawPayload: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const PaymentModel = models.Payment || model("Payment", PaymentSchema);
