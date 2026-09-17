import React, { useState } from 'react';
import { HeroCarousel, IndiaSourcingHero } from '../components/HeroCarousel';
import { CategorySidebar, CategoryGrid } from '../components/CategorySidebar';
import { FlashSalesSection } from '../components/FlashSalesSection';
import { MarketplacePlatformSection } from '../components/MarketplacePlatformSection';
import { NewArrivalBento, ExperienceBanner, ServicesHighlight } from '../components/NewArrivalBento';
import { LinkVerifier } from '../components/LinkVerifier';
import { QuickViewModal } from '../components/QuickViewModal';
import { sampleProducts } from '../data/mockData';

export function Home() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">

      {/* ── 1. INSTANT INDIAN URL VERIFICATION & QUOTE ── */}
      <LinkVerifier />

      {/* ── 2. Hero Carousel (full-width) ── */}
      <HeroCarousel />

      {/* ── 3. Services & Guarantees ── */}
      <ServicesHighlight />

      {/* ── 4. Today's Flash Sales ── */}
      <FlashSalesSection
        products={sampleProducts}
        onQuickView={(product) => setQuickViewProduct(product)}
      />

      {/* ── 5. India Sourcing Section:
               LEFT  = Category Sidebar
               RIGHT = India Sourcing Hero ── */}
      <section className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="w-full lg:w-64 shrink-0">
          <CategorySidebar />
        </div>
        <div className="flex-1 min-w-0">
          <IndiaSourcingHero />
        </div>
      </section>

      {/* ── 6. Shop By Indian Marketplace ── */}
      <MarketplacePlatformSection
        initialProducts={sampleProducts}
        onQuickView={(product) => setQuickViewProduct(product)}
      />

      {/* ── 7. Browse by Category Grid ── */}
      <CategoryGrid />

      {/* ── 8. Experience & Value Banner ── */}
      <ExperienceBanner />

      {/* ── 9. New Arrivals & Trending Bento Grid ── */}
      <NewArrivalBento />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default Home;
