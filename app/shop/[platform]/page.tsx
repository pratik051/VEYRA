import { notFound } from "next/navigation";
import Link from "next/link";
import { getMarketplaceProducts } from "@/lib/marketplace";
import { ProductCard, AnyProduct } from "@/components/ui/product-card";
import { MARKETPLACE_METAS, getMarketplaceMeta } from "@/lib/marketplace-constants";
import { LinkVerifier } from "@/components/ui/link-verifier";
import { MarketplaceLogo } from "@/components/ui/marketplace-logos";

export const revalidate = 60;

export async function generateStaticParams() {
  return MARKETPLACE_METAS.map((m) => ({
    platform: m.slug
  }));
}

interface PlatformPageProps {
  params: { platform: string };
  searchParams?: { section?: string; sort?: string };
}

export default async function PlatformShopPage({ params, searchParams }: PlatformPageProps) {
  const platformParam = params.platform?.toLowerCase().trim();
  const meta = getMarketplaceMeta(platformParam);

  if (!meta) {
    notFound();
  }

  const activeSection = (searchParams?.section || "all") as
    | "all"
    | "flash_sales"
    | "best_sellers"
    | "top_deals"
    | "trending"
    | "essentials"
    | "new_arrivals";

  const sortBy = searchParams?.sort || "newest";

  let products: AnyProduct[] = [];
  let total = 0;

  try {
    const res = await getMarketplaceProducts({
      source: meta.id,
      section: activeSection === "all" ? undefined : activeSection,
      sortBy: sortBy,
      limit: 60
    });
    products = res.products;
    total = res.total;
  } catch (err) {
    console.error(`Failed to load ${meta.name} products:`, err);
  }

  const sections = [
    { id: "all", label: "All Products" },
    { id: "flash_sales", label: "⚡ Flash Deals" },
    { id: "best_sellers", label: "🔥 Best Sellers" },
    { id: "top_deals", label: "🏷️ Top Deals" },
    { id: "trending", label: "📈 Trending" },
    { id: "essentials", label: "📦 Essentials" },
    { id: "new_arrivals", label: "✨ New Arrivals" }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      {/* ─── BREADCRUMB ─── */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
        <Link href="/" className="hover:text-neutral-900 transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-neutral-900 transition">
          Marketplaces
        </Link>
        <span>/</span>
        <span className="text-neutral-950 font-bold">{meta.name}</span>
      </nav>

      {/* ─── PLATFORM HERO BANNER WITH OFFICIAL LOGO ─── */}
      <div className="rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-amber-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Official {meta.name} Direct Sourcing Channel</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-neutral-200">
              <MarketplaceLogo marketplace={meta.id} className="h-8 w-auto" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {meta.name}
              </h1>
              <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                Verified Indian Marketplace • {meta.domain}
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-medium">
            {meta.tagline}. Every product is sourced directly from {meta.domain} with transparent INR ➔ NPR conversion and doorstep delivery to all 7 provinces of Nepal.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-3 py-1 rounded-xl bg-neutral-800/80 border border-neutral-700 text-xs font-bold text-neutral-200">
              ✓ 100% Genuine {meta.shortName} Sourced
            </span>
            <span className="px-3 py-1 rounded-xl bg-neutral-800/80 border border-neutral-700 text-xs font-bold text-neutral-200">
              ⚡ Real-Time Price Sync
            </span>
            <span className="px-3 py-1 rounded-xl bg-neutral-800/80 border border-neutral-700 text-xs font-bold text-neutral-200">
              🚚 Doorstep Delivery Across Nepal
            </span>
          </div>
        </div>
      </div>

      {/* ─── SWITCH MARKETPLACE NAVIGATION (OFFICIAL LOGOS) ─── */}
      <div className="space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
          Switch Marketplace Channel
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {MARKETPLACE_METAS.map((m) => {
            const isCurrent = m.id === meta.id;
            return (
              <Link
                key={m.id}
                href={m.shopUrl}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-neutral-950 text-white shadow-md scale-105"
                    : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <MarketplaceLogo marketplace={m.id} className="h-3.5 w-auto" />
                </div>
                <span>{m.shortName}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── PLATFORM SECTION TABS ─── */}
      <div className="space-y-3 border-b border-neutral-200 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {sections.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <Link
                  key={s.id}
                  href={`/shop/${meta.slug}?section=${s.id}&sort=${sortBy}`}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                    isActive
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>

          <Link
            href={`/request-product?url=${encodeURIComponent(`https://${meta.domain}`)}`}
            className="rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-black text-xs px-5 py-2 transition shadow-xs"
          >
            Custom {meta.shortName} Order ➔
          </Link>
        </div>
      </div>

      {/* ─── LINK VERIFIER FOR THIS PLATFORM ─── */}
      <div className="space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
          Paste Any {meta.name} URL for Instant Landed Quote
        </span>
        <LinkVerifier />
      </div>

      {/* ─── PRODUCTS SECTION ─── */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-neutral-950 tracking-tight">
              {meta.name} {sections.find((s) => s.id === activeSection)?.label || "Products"} ({products.length})
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Verified products sourced exclusively from {meta.name} ({meta.domain}). Never mixed with other platforms.
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center space-y-4">
            <div className="flex justify-center">
              <MarketplaceLogo marketplace={meta.id} className="h-10 w-auto opacity-70" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">
              No products found in this section for {meta.name}
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Our automated product crawler syncs periodically. You can order any product right now by pasting a {meta.domain} link into our request form!
            </p>
            <Link
              href="/request-product"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-6 py-2.5 text-xs font-bold text-white hover:bg-red-600 transition"
            >
              <span>Submit {meta.name} Link ➔</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.slug || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
