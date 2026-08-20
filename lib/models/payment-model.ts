import { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    provider: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NPR" },
    status: { type: String, default: "Pending" },
    providerReference: { type: String, default: "" },
    rawPayload: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const PaymentModel = models.Payment || model("Payment", PaymentSchema);
