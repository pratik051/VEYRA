export type Badge = "NEW" | "TRENDING" | "BEST SELLER" | "LIMITED" | "SALE" | "OUT OF STOCK";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  stock: number;
  badge?: Badge;
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  tags: string[];
  colors: string[];
  sizes?: string[];
  description: string;
  specs: Record<string, string>;
  image: string;
  gallery: string[];
};

export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
};
