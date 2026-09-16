import Link from "next/link";
import { getMarketplaceProducts } from "@/lib/marketplace";
import { CategorySidebar } from "@/components/home/category-sidebar";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { FlashSalesSection } from "@/components/home/flash-sales-section";
import { CategoryGrid } from "@/components/home/category-grid";
import { ExperienceBanner } from "@/components/home/experience-banner";
import { NewArrivalBento } from "@/components/home/new-arrival-bento";
import { ServicesHighlight } from "@/components/home/services-highlight";
import { ProductCard, AnyProduct } from "@/components/ui/product-card";
import { LinkVerifier } from "@/components/ui/link-verifier";
import { MarketplacePlatformSection } from "@/components/home/marketplace-platform-section";

export const revalidate = 60; // ISR revalidate every 60s

// Empty-state message shown when marketplace DB has no products yet
function MarketplaceEmptyState({ section }: { section: string }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center text-neutral-400">
      <span className="text-4xl">🇮🇳</span>
      <p className="text-sm font-bold">{section} are currently being updated from Indian marketplaces.</p>
      <p className="text-xs">Please check again shortly — our sync runs every 60 seconds.</p>
    </div>
  );
}

export default async function HomePage() {
  // Load ONLY Indian marketplace products from MongoDB — no personal catalog fallback
  let flashProducts: AnyProduct[] = [];
  let bestSellers: AnyProduct[] = [];
  let exploreProducts: AnyProduct[] = [];
  let trendingProducts: AnyProduct[] = [];
  let topDeals: AnyProduct[] = [];

  try {
    const [flashRes, bestRes, essentialsRes, trendingRes, dealsRes] = await Promise.all([
      getMarketplaceProducts({ section: "flash_sales", limit: 8 }),
      getMarketplaceProducts({ section: "best_sellers", limit: 4 }),
      getMarketplaceProducts({ section: "essentials", limit: 8 }),
      getMarketplaceProducts({ section: "trending", limit: 4 }),
      getMarketplaceProducts({ section: "top_deals", limit: 8 })
    ]);

    flashProducts = flashRes.products;
    bestSellers = bestRes.products;
    exploreProducts = essentialsRes.products;
    trendingProducts = trendingRes.products;
    topDeals = dealsRes.products;
  } catch (e) {
    console.error("Failed to load marketplace products on homepage:", e);
  }

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SAJILOMARTS",
    slogan: "Your Style. Your Essentials. India to Nepal Direct.",
    url: "https://sajilomarts.com.np",
    description: "Nepal premier Indian marketplace product discovery and doorstep delivery concierge platform.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+977-9800000000",
      contactType: "customer service",
      areaServed: "NP",
      availableLanguage: ["English", "Nepali"]
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20 pt-4 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />

      {/* ─── 1. HERO SECTION (Category Sidebar + Hero Carousel) ─── */}
      <section className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
        <CategorySidebar />
        <HeroCarousel />
      </section>

      {/* ─── 2. SHOP BY INDIAN MARKETPLACE (Amazon, Flipkart, Myntra, etc.) ─── */}
      <MarketplacePlatformSection />

      {/* ─── 3. TODAY'S FLASH SALES WITH LIVE COUNTDOWN ─── */}
      <FlashSalesSection products={flashProducts} />

      {/* ─── 4. EXPLORE ALL ESSENTIALS ─── */}
      <section className="space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black tracking-wider uppercase">
            📦 Curated Marketplace Essentials
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
            Explore All Essentials
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {exploreProducts.length > 0
            ? exploreProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))
            : <MarketplaceEmptyState section="Essentials" />
          }
        </div>

        <div className="border-b border-neutral-100 pt-8" />
      </section>

      {/* ─── 5. TRENDING ITEMS (DYNAMIC SCORE RANKING) ─── */}
      {trendingProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black tracking-wider uppercase">
                ⚡ Trending in India &amp; Nepal
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
                Trending Marketplace Picks
              </h2>
            </div>

            <Link
              href="/shop"
              className="self-start sm:self-end rounded-full bg-neutral-950 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-red-600 transition-all shadow-xs hover:scale-105"
            >
              View All Trending →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {trendingProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>

          <div className="border-b border-neutral-100 pt-8" />
        </section>
      )}

      {/* ─── 6. BEST SELLING PRODUCTS (INDIA MARKETPLACE FAVORITES) ─── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black tracking-wider uppercase">
              🔥 Customer Favorites
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
              Best Selling Products
            </h2>
          </div>

          <Link
            href="/shop"
            className="self-start sm:self-end rounded-full bg-neutral-950 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-red-600 transition-all shadow-xs hover:scale-105"
          >
            View All Best Sellers →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {bestSellers.length > 0
            ? bestSellers.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))
            : <MarketplaceEmptyState section="Best Sellers" />
          }
        </div>

        <div className="border-b border-neutral-100 pt-8" />
      </section>

      {/* ─── 7. TOP MARKETPLACE DEALS ─── */}
      {topDeals.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-wider uppercase">
                🏷️ Live &amp; Verified Offers
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
                Top Marketplace Deals
              </h2>
            </div>

            <Link
              href="/shop"
              className="self-start sm:self-end rounded-full bg-neutral-950 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-red-600 transition-all shadow-xs hover:scale-105"
            >
              View All Deals →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {topDeals.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>

          <div className="border-b border-neutral-100 pt-8" />
        </section>
      )}

      {/* ─── 8. BROWSE BY CATEGORY ─── */}
      <CategoryGrid />

      {/* ─── 9. HIGH-IMPACT EXPERIENCE BANNER ─── */}
      <ExperienceBanner />

      {/* ─── 8. INDIA LINK VERIFIER (CONCIERGE CHECKER) ─── */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-gradient-to-b from-neutral-50 to-white p-6 sm:p-12 shadow-sm">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-black text-amber-700">
            <span>🇮🇳 Sourcing: Amazon • Flipkart • Myntra • AJIO • Meesho • boAt • Noise • Croma</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-black text-neutral-950">
            Found A Product In India? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-amber-600">
              Paste Link &amp; Get Sourced
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Enter any Indian marketplace product URL to instantly verify availability and calculate transparent NPR landed prices delivered to your doorstep anywhere in Nepal.
          </p>

          <div className="w-full text-left">
            <LinkVerifier />
          </div>
        </div>
      </section>

      {/* ─── 9. NEW ARRIVAL BENTO GRID ─── */}
      <NewArrivalBento />

      {/* ─── 10. TRUST & SERVICES GUARANTEE ─── */}
      <ServicesHighlight />
    </div>
  );
}
