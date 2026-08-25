import { Schema, model, models } from "mongoose";

const QuoteSchema = new Schema(
  {
    indianProductPrice: { type: Number, default: 0 },
    exchangeRate: { type: Number, default: 0 },
    shippingIndiaToNepal: { type: Number, default: 0 },
    customsTaxes: { type: Number, default: 0 },
    handlingFee: { type: Number, default: 0 },
    nepalDeliveryFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    finalEstimatedPrice: { type: Number, default: 0 },
    customerQuote: { type: Number, default: 0 },
    quoteExpiry: { type: String, default: "" },
    expectedDeliveryTime: { type: String, default: "" },
    adminNotes: { type: String, default: "" }
  },
  { _id: false }
);

const ProductRequestSchema = new Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    deliveryLocation: { type: String, default: "" },
    productUrl: { type: String, required: true },
    productName: { type: String, default: "" },
    productCategory: { type: String, default: "" },
    detectedPlatform: { type: String, default: "" },
    preferredSize: { type: String, default: "" },
    preferredColor: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    additionalNotes: { type: String, default: "" },
    maximumBudget: { type: String, default: "" },
    preferredDeliveryTime: { type: String, default: "" },
    screenshotUrl: { type: String, default: "" },
    status: { type: String, default: "Pending" },
    quote: { type: QuoteSchema, default: {} }
  },
  { timestamps: true }
);

export const ProductRequestModel = models.ProductRequest || model("ProductRequest", ProductRequestSchema);
