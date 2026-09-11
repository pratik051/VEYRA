import { Schema, model, models } from "mongoose";

export const ORDER_STATUSES = [
  "Requested",
  "Verified",
  "Confirmed",
  "Purchased",
  "In Transit",
  "Arrived in Nepal",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
] as const;

export const PAYMENT_STATUSES = [
  "Pending",
  "PAID",
  "Failed",
  "Refunded"
] as const;

export const PAYMENT_METHODS = [
  "COD",
  "FULL_PAYMENT"
] as const;

export interface IIndiaOrder {
  _id?: string;
  orderId: string;
  invoiceNumber: string;
  userId?: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  deliveryInstructions?: string;
  shippingAddress?: {
    fullName: string;
    phone: string;
    email?: string;
    deliveryAddress: string;
    city?: string;
    district?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    deliveryInstructions?: string;
  };
  // Immutable Marketplace Snapshot
  marketplace?: string;           // e.g. "amazon-india", "myntra", "flipkart"
  sourceProductId?: string;       // e.g. "B08N5XSG8Z"
  productUrl: string;             // Active product URL
  originalSourceUrl?: string;     // URL originally submitted/imported
  verifiedSourceUrl?: string;     // Verified working URL
  canonicalSourceUrl?: string;    // Marketplace canonical product URL
  productName: string;
  productImage?: string;
  brand?: string;
  category?: string;
  productVariant?: string;
  size?: string;
  color?: string;
  quantity: number;
  indianPriceINR: number;
  conversionAmountNPR: number;
  serviceChargeNPR: number;
  deliveryChargeNPR: number;
  finalAmountNPR: number;
  paymentMethod: "COD" | "FULL_PAYMENT";
  paymentStatus: "Pending" | "PAID" | "Failed" | "Refunded";
  paymentTransactionId?: string;
  orderStatus: (typeof ORDER_STATUSES)[number];
  invoiceUrl?: string;
  stockStatus?: string;
  deliveryStatus?: string;
  postalCodeChecked?: string;
  canOrder?: boolean;
  availabilityCheckedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const IndiaOrderSchema = new Schema<IIndiaOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: "", index: true },
    customerId: { type: String, default: "", index: true },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    deliveryAddress: { type: String, required: true, trim: true },
    city: { type: String, default: "", trim: true },
    district: { type: String, default: "", trim: true },
    province: { type: String, default: "", trim: true },
    postalCode: { type: String, default: "", trim: true },
    deliveryInstructions: { type: String, default: "", trim: true },
    shippingAddress: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      deliveryAddress: { type: String, default: "" },
      city: { type: String, default: "" },
      district: { type: String, default: "" },
      province: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "Nepal" },
      deliveryInstructions: { type: String, default: "" }
    },
    // Marketplace snapshot fields
    marketplace: { type: String, default: "", index: true },
    sourceProductId: { type: String, default: "" },
    productUrl: { type: String, required: true, trim: true },
    originalSourceUrl: { type: String, default: "" },
    verifiedSourceUrl: { type: String, default: "" },
    canonicalSourceUrl: { type: String, default: "" },
    productName: { type: String, required: true, trim: true },
    productImage: { type: String, default: "" },
    brand: { type: String, default: "" },
    category: { type: String, default: "" },
    productVariant: { type: String, default: "" },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    indianPriceINR: { type: Number, required: true, min: 1 },
    conversionAmountNPR: { type: Number, required: true },
    serviceChargeNPR: { type: Number, required: true },
    deliveryChargeNPR: { type: Number, required: true, default: 200 },
    finalAmountNPR: { type: Number, required: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "Pending", index: true },
    paymentTransactionId: { type: String, default: "" },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: "Confirmed", index: true },
    invoiceUrl: { type: String, default: "" },
    // Sourcing Availability Snapshot
    stockStatus: { type: String, default: "In Stock" },
    deliveryStatus: { type: String, default: "Delivery available" },
    postalCodeChecked: { type: String, default: "" },
    canOrder: { type: Boolean, default: true },
    availabilityCheckedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const IndiaOrderModel = models.IndiaOrder || model<IIndiaOrder>("IndiaOrder", IndiaOrderSchema);
