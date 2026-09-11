import { Schema, model, models } from "mongoose";

export const PRODUCT_REQUEST_STATUSES = [
  "Pending",
  "Reviewing",
  "Alternative Found",
  "Waiting for User",
  "Approved",
  "Rejected",
  "Converted to Order",
  "Closed"
] as const;

export type ProductRequestStatus = (typeof PRODUCT_REQUEST_STATUSES)[number];

export interface IAlternativeProduct {
  marketplace: string;
  productUrl: string;
  verifiedProductUrl?: string;
  sourceProductId?: string;
  productName: string;
  productImage?: string;
  variant?: string;
  size?: string;
  color?: string;
  priceINR: number;
  finalAmountNPR: number;
  verified: boolean;
  orderable: boolean;
  stockStatus: string;
  deliveryAvailable: boolean;
  adminNote?: string;
  verifiedAt?: Date;
}

export interface IProductRequest {
  _id?: string;
  requestId: string;
  userId?: string;
  userName: string;
  phone: string;
  email?: string;
  deliveryLocation?: string;
  // Original requested item details
  originalMarketplace?: string;
  originalProductUrl: string;
  sourceProductId?: string;
  productName: string;
  productImage?: string;
  productCategory?: string;
  requestedVariant?: string;
  requestedSize?: string;
  requestedColor?: string;
  requestedQuantity: number;
  currentKnownPrice?: number;
  // Verification failure reason if requested due to direct order failure
  reason?: string;
  verificationSnapshot?: {
    urlVerified: boolean;
    stockStatus: string;
    deliveryAvailable: boolean;
    priceAvailable: boolean;
    failureReason: string;
    checkedAt: string;
  };
  // Admin-provided verified alternative product
  alternativeProduct?: IAlternativeProduct;
  customerAction?: "none" | "accepted" | "declined";
  convertedOrderId?: string;
  status: ProductRequestStatus;
  additionalNotes?: string;
  maximumBudget?: string;
  preferredDeliveryTime?: string;
  screenshotUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AlternativeProductSchema = new Schema<IAlternativeProduct>(
  {
    marketplace: { type: String, default: "" },
    productUrl: { type: String, default: "" },
    verifiedProductUrl: { type: String, default: "" },
    sourceProductId: { type: String, default: "" },
    productName: { type: String, default: "" },
    productImage: { type: String, default: "" },
    variant: { type: String, default: "" },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    priceINR: { type: Number, default: 0 },
    finalAmountNPR: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    orderable: { type: Boolean, default: false },
    stockStatus: { type: String, default: "In Stock" },
    deliveryAvailable: { type: Boolean, default: true },
    adminNote: { type: String, default: "" },
    verifiedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ProductRequestSchema = new Schema<IProductRequest>(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: "", index: true },
    userName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    deliveryLocation: { type: String, default: "" },
    // Original requested product details
    originalMarketplace: { type: String, default: "" },
    originalProductUrl: { type: String, required: true },
    sourceProductId: { type: String, default: "" },
    productName: { type: String, default: "" },
    productImage: { type: String, default: "" },
    productCategory: { type: String, default: "" },
    requestedVariant: { type: String, default: "" },
    requestedSize: { type: String, default: "" },
    requestedColor: { type: String, default: "" },
    requestedQuantity: { type: Number, default: 1, min: 1 },
    currentKnownPrice: { type: Number, default: 0 },
    reason: { type: String, default: "" },
    verificationSnapshot: {
      urlVerified: { type: Boolean, default: false },
      stockStatus: { type: String, default: "" },
      deliveryAvailable: { type: Boolean, default: false },
      priceAvailable: { type: Boolean, default: false },
      failureReason: { type: String, default: "" },
      checkedAt: { type: String, default: "" }
    },
    // Admin alternative link details
    alternativeProduct: { type: AlternativeProductSchema, default: null },
    customerAction: { type: String, enum: ["none", "accepted", "declined"], default: "none" },
    convertedOrderId: { type: String, default: "" },
    status: {
      type: String,
      enum: PRODUCT_REQUEST_STATUSES,
      default: "Pending",
      index: true
    },
    additionalNotes: { type: String, default: "" },
    maximumBudget: { type: String, default: "" },
    preferredDeliveryTime: { type: String, default: "" },
    screenshotUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

export const ProductRequestModel =
  models.ProductRequest || model<IProductRequest>("ProductRequest", ProductRequestSchema);
