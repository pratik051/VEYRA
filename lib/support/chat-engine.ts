import { connectToDatabase } from "@/lib/db/mongodb";
import { MarketplaceProductModel } from "@/lib/models/marketplace-product-model";
import { IndiaOrderModel } from "@/lib/models/india-order-model";
import { OrderModel } from "@/lib/models/order-model";
import { calculateOrderPrice } from "@/lib/pricing/india-order";
import { formatNpr } from "@/lib/utils";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PageContext {
  pathname?: string;
  slug?: string;
  productName?: string;
  priceINR?: number;
  marketplace?: string;
}

export interface ChatResponse {
  answer: string;
  products?: any[];
  orders?: any[];
  suggestions?: string[];
  intent?: string;
}

const PLATFORM_MAP: Record<string, string> = {
  amazon: "amazon-india",
  "amazon india": "amazon-india",
  flipkart: "flipkart",
  myntra: "myntra",
  meesho: "meesho",
  nykaa: "nykaa",
  ajio: "ajio",
  tatacliq: "tatacliq",
  "tata cliq": "tatacliq",
  croma: "croma",
  boat: "boat",
  noise: "noise"
};

/**
 * Normalizes marketplace name to internal platform ID
 */
function extractPlatform(query: string): string | null {
  const q = query.toLowerCase();
  for (const [key, value] of Object.entries(PLATFORM_MAP)) {
    if (q.includes(key)) {
      return value;
    }
  }
  return null;
}

/**
 * Extracts price constraint like "under 1000", "under ₹2000", "below 1500"
 */
function extractPriceConstraint(query: string): number | null {
  const match = query.match(/(?:under|below|less than|within)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)/i);
  if (match && match[1]) {
    const num = parseInt(match[1].replace(/,/g, ""), 10);
    if (!isNaN(num) && num > 0) return num;
  }
  return null;
}

/**
 * Classifies customer shopping & support intents
 */
export async function processCustomerChat(
  message: string,
  user: any | null,
  history: ChatMessage[] = [],
  pageContext?: PageContext
): Promise<ChatResponse> {
  const text = message.trim();
  const lower = text.toLowerCase();

  await connectToDatabase();

  // ──────────────────────────────────────────────────────────────────────────
  // 0. INTERNAL / ADMIN / SENSITIVE QUERY GUARD
  // ──────────────────────────────────────────────────────────────────────────
  const isInternalAdminQuery =
    lower.includes("admin") ||
    lower.includes("password") ||
    lower.includes("secret") ||
    lower.includes("database") ||
    lower.includes("mongodb") ||
    lower.includes("schema") ||
    lower.includes("api key") ||
    lower.includes("source code") ||
    lower.includes("pin code") ||
    lower.includes("staff") ||
    lower.includes("backend") ||
    lower.includes("margin") ||
    lower.includes("profit");

  if (isInternalAdminQuery) {
    return {
      answer:
        "I am your LINKOVA Customer Shopping Assistant. I can only assist with customer shopping, product sourcing from India, landed price calculations, delivery in Nepal, and user account support. For internal or administrative inquiries, please contact LINKOVA management directly.",
      suggestions: ["Show trending products", "Today's best deals", "How does India sourcing work?"]
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. ORDER INQUIRY INTENTS ("Where is my order", "My orders", "Order status")
  // ──────────────────────────────────────────────────────────────────────────
  const isOrderQuery =
    lower.includes("order") ||
    lower.includes("track") ||
    lower.includes("my package") ||
    lower.includes("where is my") ||
    lower.includes("order status") ||
    lower.includes("latest order");

  if (isOrderQuery && !lower.includes("how to order") && !lower.includes("place an order") && !lower.includes("request product")) {
    if (!user) {
      return {
        answer:
          "To check your order status and track shipments, please sign in to your LINKOVA account. We protect your order privacy by requiring authentication.",
        suggestions: ["How do I place an order?", "What payment options are available?", "How does India sourcing work?"]
      };
    }

    const userId = String(user._id || user.id || "");
    const userPhone = user.phone || "";
    const userEmail = user.email || "";

    // Query user's orders from both IndiaOrderModel and standard OrderModel
    const [indiaOrders, standardOrders] = await Promise.all([
      IndiaOrderModel.find({
        $or: [
          ...(userId ? [{ userId }] : []),
          ...(userPhone ? [{ phone: userPhone }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      OrderModel.find({
        $or: [
          ...(userId ? [{ userId }] : []),
          ...(userPhone ? [{ phone: userPhone }] : [])
        ]
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    const combinedOrders: any[] = [
      ...indiaOrders.map((o: any) => ({
        orderId: o.orderId,
        date: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        productName: o.productName,
        marketplace: o.marketplace,
        quantity: o.quantity || 1,
        totalNPR: o.finalAmountNPR,
        paymentMethod: o.paymentMethod === "FULL_PAYMENT" ? "Full Online Payment" : "Cash on Delivery",
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        isIndiaOrder: true,
        invoiceUrl: o.invoiceUrl || `/api/india-order/invoice/${o.orderId}`,
        trackingUrl: `/track-order?orderId=${o.orderId}`
      })),
      ...standardOrders.map((o: any) => ({
        orderId: o.orderId,
        date: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        productName: "LINKOVA Standard Order",
        marketplace: "LINKOVA Store",
        quantity: o.items?.length || 1,
        totalNPR: o.total,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        isIndiaOrder: false,
        trackingUrl: `/track-order?orderId=${o.orderId}`
      }))
    ];

    if (combinedOrders.length === 0) {
      return {
        answer:
          "I checked your account, but you don't have any active or past orders yet. Ready to start shopping? Explore verified products from Amazon India, Flipkart, Myntra, and more!",
        suggestions: ["Show trending products", "Today's best deals", "How does India sourcing work?"]
      };
    }

    if (combinedOrders.length === 1) {
      const ord = combinedOrders[0];
      return {
        answer: `Here is your latest order details:\n\n• **Order ID:** \`${ord.orderId}\`\n• **Item:** ${ord.productName}\n• **Status:** **${ord.orderStatus}**\n• **Payment:** ${ord.paymentMethod} (${ord.paymentStatus})\n• **Amount:** ${formatNpr(ord.totalNPR)}\n• **Order Date:** ${ord.date}`,
        orders: [ord],
        suggestions: ["Track this order", "Browse trending products", "Contact customer support"]
      };
    }

    return {
      answer: `I found **${combinedOrders.length} recent orders** in your account. You can click on any order card below to track its live logistics status:`,
      orders: combinedOrders,
      suggestions: ["How long does delivery take?", "What payment options are available?", "Browse trending products"]
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. SMART PAGE CONTEXT ("Is this available?", "How much is this?")
  // ──────────────────────────────────────────────────────────────────────────
  if (
    pageContext?.slug &&
    (lower.includes("this product") ||
      lower.includes("this item") ||
      lower.includes("is this available") ||
      lower.includes("is it available") ||
      lower.includes("how much is it") ||
      lower.includes("similar") ||
      lower.includes("in stock"))
  ) {
    const activeProduct: any = await MarketplaceProductModel.findOne({
      slug: pageContext.slug,
      isActive: true,
      verificationStatus: "verified"
    }).lean();

    if (activeProduct) {
      if (lower.includes("similar") || lower.includes("like this")) {
        const similar = await MarketplaceProductModel.find({
          category: activeProduct.category,
          slug: { $ne: activeProduct.slug },
          isActive: true,
          verificationStatus: "verified"
        })
          .limit(4)
          .lean();

        return {
          answer: `Here are popular products similar to **${activeProduct.title}** in ${activeProduct.category}:`,
          products: similar,
          suggestions: ["Show today's best deals", "How is the landed price calculated?", "Order this item"]
        };
      }

      const landed = calculateOrderPrice(activeProduct.priceINR);
      return {
        answer: `Yes, **${activeProduct.title}** is **in stock and verified** from ${activeProduct.source ? activeProduct.source.toUpperCase() : "India"}!\n\n• **Marketplace Price:** ₹${activeProduct.priceINR.toLocaleString()} INR\n• **Estimated Landed Nepal Price:** **${formatNpr(landed.finalAmount)}** (All-inclusive doorstep delivery)\n• **Availability:** In Stock`,
        products: [activeProduct],
        suggestions: ["How do I place an order?", "Show similar products", "What payment options are available?"]
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. PRICING & CALCULATION INTENTS ("How much will ₹1000 cost", "Price formula")
  // ──────────────────────────────────────────────────────────────────────────
  const inrPriceMatch = lower.match(/(?:inr|₹|rs\.?)\s*([0-9,]+)/i) || lower.match(/([0-9,]+)\s*(?:inr|rupees|rs)/i);
  if (
    (lower.includes("how much") || lower.includes("calculate") || lower.includes("cost in nepal") || lower.includes("convert") || lower.includes("price formula")) &&
    inrPriceMatch &&
    inrPriceMatch[1]
  ) {
    const rawVal = parseInt(inrPriceMatch[1].replace(/,/g, ""), 10);
    if (!isNaN(rawVal) && rawVal > 0) {
      const calc = calculateOrderPrice(rawVal);
      return {
        answer: `For an Indian marketplace product priced at **₹${rawVal.toLocaleString()} INR**, the transparent landed Nepal price is:\n\n• **Currency Conversion (1 INR = 1.65 NPR):** ${formatNpr(calc.conversionAmount)}\n• **Customs & Sourcing Handling Fee (20%):** ${formatNpr(calc.serviceCharge)}\n• **Doorstep Delivery to Nepal:** ${formatNpr(calc.deliveryCharge)}\n\n👉 **Total Landed Payable Amount:** **${formatNpr(calc.finalAmount)}**\n\n*No hidden fees. You can pay via Cash on Delivery or online via eSewa/Khalti.*`,
        suggestions: ["Paste an Indian product link", "What payment options are available?", "How long does delivery take?"]
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. TRENDING / BESTSELLERS / DEALS INTENTS
  // ──────────────────────────────────────────────────────────────────────────
  const isTrending = lower.includes("trend") || lower.includes("popular") || lower.includes("what are people buying");
  const isBestseller = lower.includes("best seller") || lower.includes("bestseller") || lower.includes("top selling") || lower.includes("most bought");
  const isDeals = lower.includes("deal") || lower.includes("discount") || lower.includes("offer") || lower.includes("sale");
  const platform = extractPlatform(text);
  const maxPrice = extractPriceConstraint(text);

  if (isTrending || isBestseller || isDeals || platform || maxPrice || lower.includes("find") || lower.includes("show me") || lower.includes("shoes") || lower.includes("headphone") || lower.includes("watch") || lower.includes("electronics")) {
    const filter: Record<string, any> = {
      isActive: true,
      verificationStatus: "verified"
    };

    if (platform) {
      filter.source = platform;
    }

    if (maxPrice) {
      filter.priceINR = { $lte: maxPrice };
    }

    if (isDeals) {
      filter.$or = [{ isDeal: true }, { discountPercentage: { $gte: 15 } }];
    }

    // Keyword & Category extraction
    const keywords: string[] = [];
    if (lower.includes("shoe") || lower.includes("sneaker") || lower.includes("footwear")) keywords.push("Shoes", "Footwear", "Sneakers");
    if (lower.includes("headphone") || lower.includes("earphone") || lower.includes("earbuds") || lower.includes("audio")) keywords.push("Headphones", "Audio", "Earbuds");
    if (lower.includes("watch") || lower.includes("smartwatch")) keywords.push("Watch", "Smartwatch");
    if (lower.includes("fashion") || lower.includes("clothing") || lower.includes("shirt") || lower.includes("kurti") || lower.includes("dress")) keywords.push("Fashion", "Kurti", "Polo");
    if (lower.includes("electronic") || lower.includes("tech") || lower.includes("gadget") || lower.includes("speaker")) keywords.push("Electronics", "Tech", "Speaker", "Power Bank");
    if (lower.includes("beauty") || lower.includes("skincare") || lower.includes("serum")) keywords.push("Beauty", "Serum", "Cream");

    if (keywords.length > 0) {
      const regexPattern = keywords.join("|");
      filter.$or = [
        { category: { $regex: regexPattern, $options: "i" } },
        { title: { $regex: regexPattern, $options: "i" } },
        { tags: { $in: keywords } }
      ];
    }

    // Sort order
    let sortObj: Record<string, any> = { trendingScore: -1, bestsellerRank: 1, createdAt: -1 };
    if (isDeals) {
      sortObj = { discountPercentage: -1, isDeal: -1 };
    } else if (isBestseller) {
      sortObj = { isBestSeller: -1, bestsellerRank: 1 };
    }

    const matchedProducts = await MarketplaceProductModel.find(filter)
      .sort(sortObj)
      .limit(6)
      .lean();

    if (matchedProducts.length > 0) {
      const targetPlatformName = platform
        ? platform.replace("amazon-india", "Amazon India").replace("tatacliq", "Tata CLiQ").replace("boat", "boAt").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "Indian Marketplaces";

      const titlePrefix = isDeals
        ? `🔥 Top Deals from ${targetPlatformName}`
        : isBestseller
        ? `⭐ Best-Selling Products from ${targetPlatformName}`
        : isTrending
        ? `📈 Trending Products from ${targetPlatformName}`
        : `Verified Products Matching Your Request`;

      return {
        answer: `I found **${matchedProducts.length} verified products** on ${targetPlatformName}${maxPrice ? ` under ₹${maxPrice.toLocaleString()} INR` : ""}:\n\nClick **View Product** on any card to see full specifications, landed NPR pricing, or place an order.`,
        products: matchedProducts,
        suggestions: [
          "Show best sellers",
          "Show products under ₹1,000",
          "How is landed price calculated in Nepal?",
          "What payment options do you support?"
        ]
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. PAYMENT & ORDERING PROCESS INTENTS
  // ──────────────────────────────────────────────────────────────────────────
  if (lower.includes("payment") || lower.includes("cod") || lower.includes("cash on delivery") || lower.includes("esewa") || lower.includes("khalti")) {
    return {
      answer:
        "LINKOVA supports flexible local payment options in Nepal:\n\n1. **Cash on Delivery (COD):** Pay directly in cash to the courier when your order arrives at your doorstep in Nepal.\n2. **Full Online Payment:** Pay securely via **eSewa**, **Khalti**, or **MyPay QR** for expedited priority dispatch from Indian hubs.\n\n*All payments are verified server-side with transparent NPR receipts.*",
      suggestions: ["How long does delivery take?", "Show trending products", "How do I request a product from India?"]
    };
  }

  if (lower.includes("delivery") || lower.includes("shipping") || lower.includes("how long") || lower.includes("time") || lower.includes("arrive")) {
    return {
      answer:
        "Here are our delivery timelines across Nepal:\n\n• **Kathmandu Valley:** 2–4 Business Days\n• **Major Cities (Pokhara, Biratnagar, Chitwan, Butwal):** 3–5 Business Days\n• **Other Provinces & Rural Areas:** 4–7 Business Days\n\n*All orders include end-to-end tracking from Indian marketplace dispatch to your doorstep in Nepal.*",
      suggestions: ["Where is my order?", "Show today's best deals", "What payment options are available?"]
    };
  }

  if (lower.includes("how to order") || lower.includes("how does it work") || lower.includes("request product") || lower.includes("source")) {
    return {
      answer:
        "Ordering Indian products to Nepal is easy with LINKOVA:\n\n1. **Browse or Paste Link:** Browse verified catalog products or paste any product link from Amazon India, Flipkart, Myntra, Meesho, Nykaa, etc., at `/request-product`.\n2. **Clear NPR Landed Price:** We calculate the exact NPR price with customs, freight, and doorstep delivery included.\n3. **Choose Payment:** Select Cash on Delivery (COD) or Online Payment (eSewa / Khalti).\n4. **Doorstep Delivery:** We procure the authentic product directly from India and deliver it to your address across all 7 provinces.",
      suggestions: ["Paste Indian Product Link", "Show trending products", "What are today's best deals?"]
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. DEFAULT FALLBACK WITH TOP PICKS
  // ──────────────────────────────────────────────────────────────────────────
  const fallbackProducts = await MarketplaceProductModel.find({
    isActive: true,
    verificationStatus: "verified"
  })
    .sort({ trendingScore: -1, bestsellerRank: 1 })
    .limit(4)
    .lean();

  return {
    answer:
      "I am your LINKOVA Shopping & Sourcing Assistant! I can help you find verified products from Amazon India, Flipkart, Myntra, track your live orders, calculate landed prices in Nepal, and explain payment options.\n\nHere are some of today's most popular verified Indian products:",
    products: fallbackProducts,
    suggestions: [
      "🔥 What's trending today?",
      "⭐ Show best sellers",
      "🏷 Today's best deals",
      "📦 Where is my order?",
      "💳 Payment options in Nepal"
    ]
  };
}
