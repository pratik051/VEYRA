import { Product } from "@/lib/types";

export const formatNpr = (value: number) => `Rs. ${value.toLocaleString("en-NP")}`;

export const discountPercent = (price: number, original: number) => Math.round(((original - price) / original) * 100);

export const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

export const searchProducts = (items: Product[], query: string) => {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter((p) =>
    [p.name, p.category, p.brand, ...p.tags]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
};

export const generateId = (prefix: "REQ" | "ORD") => `LINKOVA-${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
