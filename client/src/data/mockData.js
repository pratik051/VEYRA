export const coupons = [
  {
    code: "WELCOME10",
    discountType: "percentage",
    amount: 10,
    minOrder: 1500,
    description: "10% off on your order (Minimum order Rs. 1,500)"
  },
  {
    code: "SAJILOMARTS500",
    discountType: "fixed",
    amount: 500,
    minOrder: 3500,
    description: "Flat Rs. 500 discount on orders above Rs. 3,500"
  },
  {
    code: "REF10",
    discountType: "percentage",
    amount: 10,
    minOrder: 500,
    description: "10% referral discount on orders above Rs. 500"
  }
];

export const supportedPlatforms = [
  { id: "amazon-india", name: "Amazon India", badge: "Most Popular", desc: "Electronics, Lifestyle & Daily Tech" },
  { id: "flipkart", name: "Flipkart", badge: "Trending", desc: "Fashion, Footwear & Smart Gadgets" },
  { id: "myntra", name: "Myntra", badge: "Fashion Pick", desc: "Apparel, Premium Brands & Footwear" },
  { id: "ajio", name: "AJIO", badge: "Curated Style", desc: "Streetwear, International Labels & Bags" },
  { id: "meesho", name: "Meesho", badge: "Budget Finds", desc: "Accessories, Wearables & Everyday Home" },
  { id: "nykaa", name: "Nykaa", badge: "Beauty & Care", desc: "Skincare, Beauty & Wellness Products" },
  { id: "tatacliq", name: "Tata CLiQ", badge: "Luxury & Tech", desc: "Premium Electronics, Watches & Apparel" },
  { id: "croma", name: "Croma", badge: "Appliances", desc: "Laptops, Smart Home & Gadgets" },
  { id: "boat", name: "boAt", badge: "Audio Leader", desc: "Audio & Wearables" },
  { id: "noise", name: "Noise", badge: "Smart Wearables", desc: "Smartwatches & Wearables" }
];

export const nepalProvinces = [
  "Koshi Province (Province 1)",
  "Madhesh Province (Province 2)",
  "Bagmati Province (Province 3)",
  "Gandaki Province (Province 4)",
  "Lumbini Province (Province 5)",
  "Karnali Province (Province 6)",
  "Sudurpashchim Province (Province 7)"
];

export const orderTimeline = [
  "Order Placed",
  "Payment Confirmed",
  "Product Processing",
  "Product Sourced",
  "In Transit",
  "Arrived in Nepal",
  "Out for Delivery",
  "Delivered"
];
