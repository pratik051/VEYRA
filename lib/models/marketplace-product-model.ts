import { Schema, model, models, Document } from "mongoose";
import { MarketplaceProduct } from "../marketplace/types";

export interface IMarketplaceProductDoc extends Document, Omit<MarketplaceProduct, ""> {
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema(
  {
    name: { type: String, required: true },
    values: { type: [String], default: [] }
  },
  { _id: false }
);

const MarketplaceProductSchema = new Schema(
  {
    source: { type: String, required: true, index: true },
    sourceProductId: { type: String, required: true, index: true },
    sourceUrl: { type: String, required: true },
    originalSourceUrl: { type: String, default: "" },
    verifiedSourceUrl: { type: String, default: "" },
    canonicalSourceUrl: { type: String, default: "" },
    title: { type: String, required: true, index: "text" },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    brand: { type: String, default: "Generic", index: true },
    category: {
      type: String,
      required: true,
      index: true,
      enum: [
        "Fashion",
        "Footwear",
        "Watches",
        "Bags",
        "Accessories",
        "Beauty & Lifestyle",
        "Mobile Accessories",
        "Tech & Gadgets",
        "Everyday Essentials"
      ]
    },
    subcategory: { type: String, default: "", index: true },
    priceINR: { type: Number, required: true, index: true },
    originalPriceINR: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0, index: true },
    rating: { type: Number, default: 4.5, index: true },
    reviewCount: { type: Number, default: 0 },
    availability: {
      type: String,
      enum: ["in_stock", "out_of_stock", "pre_order", "limited"],
      default: "in_stock"
    },
    isFlashSale: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    bestsellerRank: { type: Number, default: null, index: true },
    isDeal: { type: Boolean, default: false, index: true },
    dealBadge: { type: String, default: "" },
    isNewArrival: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    trendingScore: { type: Number, default: 0, index: true },
    badges: { type: [String], default: [] },
    tags: { type: [String], default: [], index: true },
    variants: { type: [VariantSchema], default: [] },
    specs: { type: Map, of: String, default: {} },
    isActive: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false, index: true },
    lastSyncedAt: { type: Date, default: Date.now, index: true },
    // Verification & Quality Control
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
      index: true
    },
    verificationMethod: {
      type: String,
      enum: ["original_url", "ai_candidate", "api", "feed", "manual"],
      default: "original_url"
    },
    matchConfidence: { type: Number, default: null },
    verificationCheckedAt: { type: Date, default: Date.now },
    verificationError: { type: String, default: "" },
    published: { type: Boolean, default: true, index: true },
    imageVerified: { type: Boolean, default: false },
    priceVerified: { type: Boolean, default: false },
    imageValidationStatus: {
      type: String,
      enum: ["valid", "invalid", "pending"],
      default: "pending"
    },
    priceValidationStatus: {
      type: String,
      enum: ["valid", "invalid", "pending"],
      default: "pending"
    }
  },
  { timestamps: true }
);

// Compound Unique Index to prevent duplicate products per marketplace
MarketplaceProductSchema.index({ source: 1, sourceProductId: 1 }, { unique: true });

// Compound Indexes for high-performance storefront and verification queries
MarketplaceProductSchema.index({ isActive: 1, verificationStatus: 1, isFlashSale: 1, discountPercentage: -1 });
MarketplaceProductSchema.index({ isActive: 1, verificationStatus: 1, isBestSeller: 1, rating: -1 });
MarketplaceProductSchema.index({ isActive: 1, verificationStatus: 1, isTrending: 1, trendingScore: -1 });
MarketplaceProductSchema.index({ isActive: 1, verificationStatus: 1, isNewArrival: 1, createdAt: -1 });
MarketplaceProductSchema.index({ isActive: 1, verificationStatus: 1, category: 1, priceINR: 1 });
MarketplaceProductSchema.index({ isActive: 1, verificationStatus: 1, source: 1 });

export const MarketplaceProductModel =
  models.MarketplaceProduct || model<IMarketplaceProductDoc>("MarketplaceProduct", MarketplaceProductSchema);
