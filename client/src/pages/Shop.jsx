import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { sampleProducts, categoriesList } from '../data/mockData';
import { MARKETPLACE_METAS } from '../constants/marketplaces';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';
  const activeSort = searchParams.get('sort') || 'featured';
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  const filteredProducts = useMemo(() => {
    let list = [...sampleProducts];

    // Filter by Category
    if (activeCategory !== 'All') {
      list = list.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Filter by Platform
    if (selectedPlatform !== 'All') {
      list = list.filter(
        (p) =>
          (p.source && p.source.toLowerCase() === selectedPlatform.toLowerCase()) ||
          (p.brand && p.brand.toLowerCase() === selectedPlatform.toLowerCase())
      );
    }

    // Sort
    if (activeSort === 'price-low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (activeSort === 'price-high') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (activeSort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [activeCategory, activeSort, selectedPlatform]);

  const handleCategoryClick = (catName) => {
    if (catName === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catName);
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (e) => {
    searchParams.set('sort', e.target.value);
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="space-y-2 border-b border-neutral-100 pb-6">
        <span className="text-xs font-black uppercase tracking-wider text-red-600">
          Curated Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
          Explore Products & Verified Sourcing
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl">
          Browse items ready for instant delivery across Nepal or sourced directly from verified Indian marketplace platforms.
        </p>
      </div>

      {/* Filter and Sorting Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleCategoryClick('All')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === 'All'
                ? 'bg-neutral-950 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All Products ({sampleProducts.length})
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort by:</span>
          </div>
          <select
            value={activeSort}
            onChange={handleSortChange}
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
          >
            <option value="featured">Featured First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-3xl border border-dashed border-neutral-200 bg-white p-8">
          <h3 className="text-base font-bold text-neutral-900">
            No products found in this category
          </h3>
          <p className="text-xs text-neutral-500">
            Try selecting a different category or search term above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id || product.slug}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default Shop;
