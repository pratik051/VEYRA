export const MARKETPLACE_METAS = [
  {
    id: "amazon-india",
    slug: "amazon",
    name: "Amazon India",
    shortName: "Amazon",
    tagline: "Electronics, Global Best Sellers, Gadgets & Accessories",
    emoji: "🅰️",
    accentBg: "bg-amber-500",
    accentText: "text-amber-500",
    badgeBg: "bg-amber-50 text-amber-900 border-amber-200",
    badgeBorder: "border-amber-500",
    domain: "amazon.in",
    shopUrl: "/order?source=amazon"
  },
  {
    id: "flipkart",
    slug: "flipkart",
    name: "Flipkart",
    shortName: "Flipkart",
    tagline: "India's Mega Marketplace for Tech, Home & Everyday Deals",
    emoji: "⚡",
    accentBg: "bg-blue-600",
    accentText: "text-blue-600",
    badgeBg: "bg-blue-50 text-blue-900 border-blue-200",
    badgeBorder: "border-blue-500",
    domain: "flipkart.com",
    shopUrl: "/order?source=flipkart"
  },
  {
    id: "myntra",
    slug: "myntra",
    name: "Myntra",
    shortName: "Myntra",
    tagline: "Premier Indian Fashion, Trending Apparel & Footwear",
    emoji: "👗",
    accentBg: "bg-rose-500",
    accentText: "text-rose-500",
    badgeBg: "bg-rose-50 text-rose-900 border-rose-200",
    badgeBorder: "border-rose-500",
    domain: "myntra.com",
    shopUrl: "/order?source=myntra"
  },
  {
    id: "meesho",
    slug: "meesho",
    name: "Meesho",
    shortName: "Meesho",
    tagline: "Unbeatable Direct-from-Manufacturer Budget & Ethnic Finds",
    emoji: "🛍️",
    accentBg: "bg-pink-600",
    accentText: "text-pink-600",
    badgeBg: "bg-pink-50 text-pink-900 border-pink-200",
    badgeBorder: "border-pink-500",
    domain: "meesho.com",
    shopUrl: "/order?source=meesho"
  },
  {
    id: "nykaa",
    slug: "nykaa",
    name: "Nykaa",
    shortName: "Nykaa",
    tagline: "100% Authentic Luxury & Daily Beauty, Cosmetics & Skincare",
    emoji: "💄",
    accentBg: "bg-fuchsia-600",
    accentText: "text-fuchsia-600",
    badgeBg: "bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200",
    badgeBorder: "border-fuchsia-500",
    domain: "nykaa.com",
    shopUrl: "/order?source=nykaa"
  },
  {
    id: "ajio",
    slug: "ajio",
    name: "AJIO",
    shortName: "AJIO",
    tagline: "Modern Streetwear, Western Styles & Reliance Fashion Brands",
    emoji: "🏷️",
    accentBg: "bg-emerald-700",
    accentText: "text-emerald-700",
    badgeBg: "bg-emerald-50 text-emerald-900 border-emerald-200",
    badgeBorder: "border-emerald-500",
    domain: "ajio.com",
    shopUrl: "/order?source=ajio"
  },
  {
    id: "tatacliq",
    slug: "tatacliq",
    name: "Tata CLiQ",
    shortName: "Tata CLiQ",
    tagline: "Tata's Certified Luxury Brands, Watches & Premium Tech",
    emoji: "💎",
    accentBg: "bg-red-700",
    accentText: "text-red-700",
    badgeBg: "bg-red-50 text-red-900 border-red-200",
    badgeBorder: "border-red-500",
    domain: "tatacliq.com",
    shopUrl: "/order?source=tatacliq"
  },
  {
    id: "croma",
    slug: "croma",
    name: "Croma",
    shortName: "Croma",
    tagline: "India's Tech & Smart Appliance Specialist by Tata",
    emoji: "🔌",
    accentBg: "bg-teal-600",
    accentText: "text-teal-600",
    badgeBg: "bg-teal-50 text-teal-900 border-teal-200",
    badgeBorder: "border-teal-500",
    domain: "croma.com",
    shopUrl: "/order?source=croma"
  },
  {
    id: "boat",
    slug: "boat",
    name: "boAt Lifestyle",
    shortName: "boAt",
    tagline: "India's Audio and Wearables Brand",
    emoji: "🎧",
    accentBg: "bg-red-600",
    accentText: "text-red-600",
    badgeBg: "bg-red-50 text-red-900 border-red-200",
    badgeBorder: "border-red-500",
    domain: "boat-lifestyle.com",
    shopUrl: "/order?source=boat"
  },
  {
    id: "noise",
    slug: "noise",
    name: "Noise",
    shortName: "Noise",
    tagline: "Smart Wearables and Connected Lifestyle",
    emoji: "⌚",
    accentBg: "bg-indigo-600",
    accentText: "text-indigo-600",
    badgeBg: "bg-indigo-50 text-indigo-900 border-indigo-200",
    badgeBorder: "border-indigo-500",
    domain: "gonoise.com",
    shopUrl: "/order?source=noise"
  }
];

export function getMarketplaceMeta(idOrSlug) {
  if (!idOrSlug) return undefined;
  const norm = idOrSlug.toLowerCase().trim().replace(/_/g, "-");
  return MARKETPLACE_METAS.find(
    (m) =>
      m.id === norm ||
      m.slug === norm ||
      m.shortName.toLowerCase() === norm ||
      (norm === "amazon" && m.id === "amazon-india") ||
      (norm === "boat" && m.id === "boat") ||
      (norm === "tata-cliq" && m.id === "tatacliq")
  );
}
