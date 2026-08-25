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
  itemCount?: number;
};

export type Coupon = {
  code: string;
  discountType: "percentage" | "fixed";
  amount: number;
  minOrder: number;
  description: string;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
};

export type QuoteDetails = {
  indianProductPrice?: number;
  exchangeRate?: number;
  shippingIndiaToNepal?: number;
  customsTaxes?: number;
  handlingFee?: number;
  nepalDeliveryFee?: number;
  serviceFee?: number;
  finalEstimatedPrice?: number;
  customerQuote?: number;
  quoteExpiry?: string;
  expectedDeliveryTime?: string;
  adminNotes?: string;
};

export type RequestStatus =
  | "Pending"
  | "Checking"
  | "Available"
  | "Unavailable"
  | "Manual Verification"
  | "Quote Sent"
  | "Customer Confirmed"
  | "Ordered"
  | "In Transit"
  | "Completed"
  | "Cancelled";

export type VerificationStatus =
  | "available"
  | "unavailable"
  | "manual_required"
  | "unsupported_platform"
  | "invalid_url"
  | "blocked";

export type ProductRequestItem = {
  _id?: string;
  requestId: string;
  fullName: string;
  phone: string;
  email?: string;
  deliveryLocation?: string;
  productUrl: string;
  productName?: string;
  productCategory?: string;
  detectedPlatform?: string;
  verificationStatus?: VerificationStatus;
  preferredSize?: string;
  preferredColor?: string;
  quantity: number;
  additionalNotes?: string;
  maximumBudget?: string;
  preferredDeliveryTime?: string;
  screenshotUrl?: string;
  status: RequestStatus;
  quote?: QuoteDetails;
  createdAt?: string;
};

export type SourcingPlatformConfig = {
  id: string;
  name: string;
  displayName: string;
  domains: string[];
  enabled: boolean;
  verificationMethod: "structural" | "manual";
  manualVerificationAllowed: boolean;
};
