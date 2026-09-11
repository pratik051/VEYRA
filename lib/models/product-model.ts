import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String, default: "LINKOVA" },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    badge: { type: String },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    description: { type: String, default: "" },
    specs: { type: Map, of: String, default: {} },
    image: { type: String, required: true },
    gallery: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const ProductModel = models.Product || model("Product", ProductSchema);
