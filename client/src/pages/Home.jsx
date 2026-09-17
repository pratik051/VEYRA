import React, { useState } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { CategorySidebar, CategoryGrid } from '../components/CategorySidebar';
import { FlashSalesSection } from '../components/FlashSalesSection';
import { MarketplacePlatformSection } from '../components/MarketplacePlatformSection';
import { NewArrivalBento, ExperienceBanner, ServicesHighlight } from '../components/NewArrivalBento';

import { QuickViewModal } from '../components/QuickViewModal';
import { sampleProducts } from '../data/mockData';

export function Home() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero & Category Navigation Section */}
      <section className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="order-2 lg:order-1 w-full lg:w-64 shrink-0">
          <CategorySidebar />
        </div>
        <div className="order-1 lg:order-2 flex-1 min-w-0">
          <HeroCarousel />
        </div>
      </section>

      {/* Services & Guarantees */}
      <ServicesHighlight />

      {/* Flash Sales with Countdown */}
      <FlashSalesSection
        products={sampleProducts}
        onQuickView={(product) => setQuickViewProduct(product)}
      />



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
