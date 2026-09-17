import React, { useState } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
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
      {/* Hero & Category Navigation Section */}
      <section className="flex flex-col lg:flex-row gap-6 items-stretch">
        <CategorySidebar />
        <HeroCarousel />
      </section>

      {/* Services & Guarantees */}
      <ServicesHighlight />

      {/* Flash Sales with Countdown */}
      <FlashSalesSection
        products={sampleProducts}
        onQuickView={(product) => setQuickViewProduct(product)}
      />

      {/* Instant Link Verifier Banner */}
      <LinkVerifier />

      {/* Browse by Category Grid */}
      <CategoryGrid />

      {/* Shop By Indian Marketplace Section */}
      <MarketplacePlatformSection
        initialProducts={sampleProducts}
        onQuickView={(product) => setQuickViewProduct(product)}
      />

      {/* Experience & Value Banner */}
      <ExperienceBanner />

      {/* New Arrivals & Trending Bento Grid */}
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
