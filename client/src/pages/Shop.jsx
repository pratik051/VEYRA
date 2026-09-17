import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { sampleProducts, categoriesList } from '../data/mockData';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  LayoutGrid,
  RotateCcw,
  Check,
  Star,
  Sparkles
} from 'lucide-react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2X'];

const COLOR_SWATCHES = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Beige', hex: '#e8dfd8' },
  { name: 'Navy', hex: '#1e293b' },
  { name: 'Olive', hex: '#4d5b43' },
  { name: 'Grey', hex: '#9ca3af' },
  { name: 'Brown', hex: '#78593a' },
  { name: 'Blue', hex: '#2563eb' }
];

const FIT_OPTIONS = ['Boxy Fit', 'Slim Fit', 'Relaxed Fit', 'Oversized', 'Regular'];

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and URL parameters
  const activeCategory = searchParams.get('category') || 'All';
  const activeSort = searchParams.get('sort') || 'featured';

  // Interactive filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [availability, setAvailability] = useState({ inStock: true, outOfStock: false });
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedFits, setSelectedFits] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedRating, setSelectedRating] = useState(0);

  // Accordion open/close states (matching Figma filters)
  const [openSections, setOpenSections] = useState({
    size: true,
    availability: true,
    category: true,
    colors: true,
    price: true,
    fits: false,
    ratings: false
  });

  // UI States
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [gridCols, setGridCols] = useState(3); // 3 or 4 columns
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Toggle accordion section
  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Toggle Size
  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Toggle Color
  const toggleColor = (colorName) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  // Toggle Fit
  const toggleFit = (fit) => {
    setSelectedFits((prev) =>
      prev.includes(fit) ? prev.filter((f) => f !== fit) : [...prev, fit]
    );
  };

  // Handle Category selection
  const handleCategoryClick = (catName) => {
    if (catName === 'All' || catName === 'All Products') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catName);
    }
    setSearchParams(searchParams);
  };

  // Handle Sort Change
  const handleSortChange = (e) => {
    searchParams.set('sort', e.target.value);
    setSearchParams(searchParams);
  };

  // Reset all active filters
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedSizes([]);
    setAvailability({ inStock: true, outOfStock: false });
    setSelectedColors([]);
    setSelectedFits([]);
    setPriceRange({ min: '', max: '' });
    setSelectedRating(0);
    searchParams.delete('category');
    searchParams.set('sort', 'featured');
    setSearchParams(searchParams);
  };

  // Total active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== 'All' && activeCategory !== 'All Products') count++;
    if (searchQuery.trim()) count++;
    if (selectedSizes.length > 0) count += selectedSizes.length;
    if (availability.outOfStock) count++;
    if (!availability.inStock) count++;
    if (selectedColors.length > 0) count += selectedColors.length;
    if (selectedFits.length > 0) count += selectedFits.length;
    if (priceRange.min || priceRange.max) count++;
    if (selectedRating > 0) count++;
    return count;
  }, [
    activeCategory,
    searchQuery,
    selectedSizes,
    availability,
    selectedColors,
    selectedFits,
    priceRange,
    selectedRating
  ]);

  // Filtered and Sorted Products computation
  const filteredProducts = useMemo(() => {
    let list = [...sampleProducts];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.subline && p.subline.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // 2. Category Filter
    if (activeCategory !== 'All' && activeCategory !== 'All Products') {
      const targetCat = activeCategory.toLowerCase();
      list = list.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const sub = (p.subline || '').toLowerCase();
        if (targetCat === 't-shirts') return cat.includes('t-shirt') || sub.includes('t-shirt');
        if (targetCat === 'shirts') return cat.includes('shirt') || sub.includes('shirt');
        if (targetCat === 'polos') return cat.includes('polo') || sub.includes('polo');
        if (targetCat === 'jackets' || targetCat.includes('jackets')) return cat.includes('jacket') || cat.includes('coat') || sub.includes('jacket');
        if (targetCat === 'jeans' || targetCat.includes('denim')) return cat.includes('jean') || cat.includes('denim');
        if (targetCat === 'pants' || targetCat.includes('trousers')) return cat.includes('pant') || cat.includes('trouser');
        if (targetCat === 'footwear') return cat.includes('footwear') || cat.includes('shoe') || cat.includes('sneaker');
        if (targetCat === 'accessories') return cat.includes('accessories') || cat.includes('bag') || cat.includes('wallet');
        return cat.includes(targetCat);
      });
    }

    // 3. Size Filter
    if (selectedSizes.length > 0) {
      list = list.filter((p) => {
        if (!p.sizes || p.sizes.length === 0) return false;
        return selectedSizes.some((sz) => p.sizes.includes(sz));
      });
    }

    // 4. Availability Filter
    if (availability.inStock && !availability.outOfStock) {
      list = list.filter((p) => (p.stock || 0) > 0);
    } else if (!availability.inStock && availability.outOfStock) {
      list = list.filter((p) => (p.stock || 0) === 0);
    }

    // 5. Color Filter
    if (selectedColors.length > 0) {
      list = list.filter((p) => {
        if (!p.colors || p.colors.length === 0) return false;
        return selectedColors.some((c) =>
          p.colors.some((prodColor) => prodColor.toLowerCase().includes(c.toLowerCase()))
        );
      });
    }

    // 6. Fit Filter
    if (selectedFits.length > 0) {
      list = list.filter((p) => p.fit && selectedFits.includes(p.fit));
    }

    // 7. Price Range Filter
    if (priceRange.min) {
      const minVal = parseFloat(priceRange.min);
      if (!isNaN(minVal)) list = list.filter((p) => (p.price || 0) >= minVal);
    }
    if (priceRange.max) {
      const maxVal = parseFloat(priceRange.max);
      if (!isNaN(maxVal)) list = list.filter((p) => (p.price || 0) <= maxVal);
    }

    // 8. Rating Filter
    if (selectedRating > 0) {
      list = list.filter((p) => (p.rating || 0) >= selectedRating);
    }

    // 9. Sorting
    if (activeSort === 'price-low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (activeSort === 'price-high') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (activeSort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (activeSort === 'newest') {
      list.sort((a, b) => (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0));
    }

    return list;
  }, [
    searchQuery,
    activeCategory,
    selectedSizes,
    availability,
    selectedColors,
    selectedFits,
    priceRange,
    selectedRating,
    activeSort
  ]);

  // Quick horizontal category chips matching Figma layout
  const quickCategories = [
    'All',
    'T-Shirts',
    'Shirts',
    'Polos',
    'Jackets & Coats',
    'Jeans & Denim',
    'Pants & Trousers',
    'Footwear',
    'Accessories'
  ];

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* 1. Breadcrumb & Figma Minimalist Title Area */}
      <div className="space-y-2 pt-2">
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
          <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-neutral-900 font-bold">Products</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-neutral-200/80 pb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight uppercase">
              Products
            </h1>
            <span className="text-xs font-bold text-neutral-400">
              ({filteredProducts.length} items)
            </span>
          </div>

          {/* Slogan / Sourcing Note */}
          <p className="text-xs font-medium text-neutral-500 max-w-md">
            Direct marketplace catalog &amp; curated fashion essentials delivered across Nepal.
          </p>
        </div>
      </div>

      {/* 2. Top Controls: Search Bar & Horizontal Category Pills matching Figma */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, fabric, style..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-neutral-200 bg-white text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Drawer Trigger & Sort */}
          <div className="flex items-center gap-2.5 shrink-0 justify-between md:justify-end">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-950 text-white text-xs font-bold shadow-sm"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="h-4 w-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Desktop Grid Layout Density Switcher (3 cols vs 4 cols) */}
            <div className="hidden lg:flex items-center border border-neutral-200 rounded-xl p-1 bg-white shadow-2xs">
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 rounded-lg transition ${
                  gridCols === 3
                    ? 'bg-neutral-950 text-white'
                    : 'text-neutral-400 hover:text-neutral-800'
                }`}
                title="3 Columns (Spacious Fashion View)"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 rounded-lg transition ${
                  gridCols === 4
                    ? 'bg-neutral-950 text-white'
                    : 'text-neutral-400 hover:text-neutral-800'
                }`}
                title="4 Columns (Compact Grid)"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-neutral-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 hidden sm:inline">
                Sort:
              </span>
              <select
                value={activeSort}
                onChange={handleSortChange}
                aria-label="Sort products"
                className="bg-transparent text-xs font-bold text-neutral-900 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Horizontal Category Filter Pills (matching Figma header category buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickCategories.map((cat) => {
            const isSelected =
              (cat === 'All' && (activeCategory === 'All' || activeCategory === 'All Products')) ||
              activeCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-950 text-white shadow-sm scale-102'
                    : 'bg-white border border-neutral-200/80 text-neutral-600 hover:text-neutral-950 hover:border-neutral-950'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Active Filters Removable Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-neutral-400 mr-1">Active:</span>

            {activeCategory !== 'All' && activeCategory !== 'All Products' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950 text-white text-[11px] font-bold">
                Category: {activeCategory}
                <X className="h-3 w-3 cursor-pointer hover:opacity-75" onClick={() => handleCategoryClick('All')} />
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-800 text-[11px] font-bold">
                Query: &quot;{searchQuery}&quot;
                <X className="h-3 w-3 cursor-pointer hover:opacity-75" onClick={() => setSearchQuery('')} />
              </span>
            )}

            {selectedSizes.map((sz) => (
              <span key={sz} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-800 text-[11px] font-bold">
                Size: {sz}
                <X className="h-3 w-3 cursor-pointer hover:opacity-75" onClick={() => toggleSize(sz)} />
              </span>
            ))}

            {selectedColors.map((col) => (
              <span key={col} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-800 text-[11px] font-bold">
                Color: {col}
                <X className="h-3 w-3 cursor-pointer hover:opacity-75" onClick={() => toggleColor(col)} />
              </span>
            ))}

            {selectedFits.map((fit) => (
              <span key={fit} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-800 text-[11px] font-bold">
                Fit: {fit}
                <X className="h-3 w-3 cursor-pointer hover:opacity-75" onClick={() => toggleFit(fit)} />
              </span>
            ))}

            {selectedRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-800 text-[11px] font-bold">
                Rating: {selectedRating}★+
                <X className="h-3 w-3 cursor-pointer hover:opacity-75" onClick={() => setSelectedRating(0)} />
              </span>
            )}

            <button
              onClick={handleClearAllFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 underline ml-2 cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* 3. Main Catalog Section: Sidebar (Desktop) + Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDEBAR FILTERS (Desktop) */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-3 bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-6 sticky top-24">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-neutral-900" />
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-950">
                Filters
              </h2>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Section 1: Size Selector (Square Buttons matching Figma) */}
          <div className="space-y-3 border-b border-neutral-100 pb-5">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('size')}
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Size
              </h3>
              {openSections.size ? (
                <ChevronUp className="h-3.5 w-3.5 text-neutral-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              )}
            </div>

            {openSections.size && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {SIZES.map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`h-10 rounded-xl font-black text-xs transition-all duration-150 flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-950 text-white shadow-xs scale-102'
                          : 'bg-white border border-neutral-200 text-neutral-800 hover:border-neutral-950 hover:bg-neutral-50'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Availability (Checkboxes matching Figma) */}
          <div className="space-y-3 border-b border-neutral-100 pb-5">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('availability')}
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Availability
              </h3>
              {openSections.availability ? (
                <ChevronUp className="h-3.5 w-3.5 text-neutral-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              )}
            </div>

            {openSections.availability && (
              <div className="space-y-2.5 pt-1 text-xs">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={availability.inStock}
                      onChange={(e) =>
                        setAvailability((prev) => ({ ...prev, inStock: e.target.checked }))
                      }
                      className="h-4 w-4 rounded text-neutral-950 focus:ring-neutral-950 border-neutral-300"
                    />
                    <span className="font-semibold text-neutral-800 group-hover:text-black">
                      Available (In Stock)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                    {sampleProducts.filter((p) => (p.stock || 0) > 0).length}
                  </span>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={availability.outOfStock}
                      onChange={(e) =>
                        setAvailability((prev) => ({ ...prev, outOfStock: e.target.checked }))
                      }
                      className="h-4 w-4 rounded text-neutral-950 focus:ring-neutral-950 border-neutral-300"
                    />
                    <span className="font-semibold text-neutral-800 group-hover:text-black">
                      Out of Stock
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                    {sampleProducts.filter((p) => (p.stock || 0) === 0).length}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Section 3: Colors (Swatches matching Figma) */}
          <div className="space-y-3 border-b border-neutral-100 pb-5">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('colors')}
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Colors
              </h3>
              {openSections.colors ? (
                <ChevronUp className="h-3.5 w-3.5 text-neutral-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              )}
            </div>

            {openSections.colors && (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {COLOR_SWATCHES.map((swatch) => {
                  const isSelected = selectedColors.includes(swatch.name);
                  return (
                    <button
                      key={swatch.name}
                      type="button"
                      onClick={() => toggleColor(swatch.name)}
                      title={swatch.name}
                      className={`h-7 w-7 rounded-full border flex items-center justify-center transition-all cursor-pointer relative ${
                        isSelected
                          ? 'ring-2 ring-neutral-950 ring-offset-2 scale-110'
                          : 'hover:scale-110 border-neutral-300'
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    >
                      {isSelected && (
                        <Check
                          className={`h-3.5 w-3.5 ${
                            swatch.name === 'White' || swatch.name === 'Beige'
                              ? 'text-neutral-950'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Price Range (NPR) */}
          <div className="space-y-3 border-b border-neutral-100 pb-5">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('price')}
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Price Range (NPR)
              </h3>
              {openSections.price ? (
                <ChevronUp className="h-3.5 w-3.5 text-neutral-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              )}
            </div>

            {openSections.price && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Min NPR</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                      }
                      className="w-full p-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Max NPR</label>
                    <input
                      type="number"
                      placeholder="10,000"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                      }
                      className="w-full p-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Quick Price presets */}
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <button
                    onClick={() => setPriceRange({ min: '', max: '2000' })}
                    className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                  >
                    &lt; 2,000
                  </button>
                  <button
                    onClick={() => setPriceRange({ min: '2000', max: '4000' })}
                    className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                  >
                    2k - 4k
                  </button>
                  <button
                    onClick={() => setPriceRange({ min: '4000', max: '' })}
                    className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                  >
                    &gt; 4,000
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Fit / Style */}
          <div className="space-y-3 border-b border-neutral-100 pb-5">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('fits')}
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Fit &amp; Cut
              </h3>
              {openSections.fits ? (
                <ChevronUp className="h-3.5 w-3.5 text-neutral-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              )}
            </div>

            {openSections.fits && (
              <div className="space-y-2 pt-1 text-xs">
                {FIT_OPTIONS.map((fit) => {
                  const isChecked = selectedFits.includes(fit);
                  return (
                    <label key={fit} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFit(fit)}
                        className="h-4 w-4 rounded text-neutral-950 focus:ring-neutral-950 border-neutral-300"
                      />
                      <span className="font-semibold text-neutral-800 group-hover:text-black">
                        {fit}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 6: Customer Ratings */}
          <div className="space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('ratings')}
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Ratings
              </h3>
              {openSections.ratings ? (
                <ChevronUp className="h-3.5 w-3.5 text-neutral-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              )}
            </div>

            {openSections.ratings && (
              <div className="space-y-2 pt-1 text-xs">
                {[4, 3].map((starCount) => (
                  <button
                    key={starCount}
                    onClick={() => setSelectedRating(selectedRating === starCount ? 0 : starCount)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border transition ${
                      selectedRating === starCount
                        ? 'bg-neutral-950 text-white border-black'
                        : 'bg-white border-neutral-200 text-neutral-800 hover:border-black'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {Array.from({ length: starCount }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="font-bold ml-1 text-xs">&amp; up</span>
                    </div>
                    {selectedRating === starCount && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT MAIN CATALOG: Product Cards Grid */}
        <main className="col-span-1 md:col-span-9 lg:col-span-9 space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-neutral-300 bg-white p-8">
              <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-xl">
                🔍
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900">
                  No products match your selected filters
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Try adjusting your size, category, price range or color filters to discover available products.
                </p>
              </div>
              <button
                onClick={handleClearAllFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-2 ${
                gridCols === 4 ? 'sm:grid-cols-3 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
              } gap-4 sm:gap-6`}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id || product.slug}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* 4. Responsive Mobile Filter Slide-Over Drawer (matching Figma mobile view) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-xs bg-white h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <h2 className="text-base font-black uppercase tracking-tight">Filter Products</h2>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full hover:bg-neutral-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sizes in Drawer */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">Sizes</h3>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((sz) => {
                    const isSelected = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center ${
                          isSelected
                            ? 'bg-neutral-950 text-white'
                            : 'border border-neutral-200 text-neutral-800 bg-white'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors in Drawer */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">Colors</h3>
                <div className="flex flex-wrap gap-2.5">
                  {COLOR_SWATCHES.map((swatch) => {
                    const isSelected = selectedColors.includes(swatch.name);
                    return (
                      <button
                        key={swatch.name}
                        onClick={() => toggleColor(swatch.name)}
                        className={`h-7 w-7 rounded-full border flex items-center justify-center ${
                          isSelected ? 'ring-2 ring-black ring-offset-2' : 'border-neutral-300'
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                      >
                        {isSelected && (
                          <Check
                            className={`h-3.5 w-3.5 ${
                              swatch.name === 'White' || swatch.name === 'Beige'
                                ? 'text-black'
                                : 'text-white'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">Price (NPR)</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
                    className="p-2 text-xs rounded-xl border border-neutral-200"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
                    className="p-2 text-xs rounded-xl border border-neutral-200"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Drawer Actions */}
            <div className="pt-6 border-t border-neutral-200 space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 rounded-2xl bg-neutral-950 text-white font-black text-xs uppercase tracking-wider hover:bg-neutral-800 shadow-md"
              >
                Apply Filters ({filteredProducts.length} items)
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearAllFilters}
                  className="w-full py-2.5 rounded-2xl border border-neutral-200 text-neutral-800 font-bold text-xs hover:bg-neutral-50"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default Shop;
