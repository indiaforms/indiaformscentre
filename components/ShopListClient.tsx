"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product, Category } from "@/lib/api";
import { 
  Search, 
  ArrowLeft, 
  SlidersHorizontal, 
  ArrowDownToLine, 
  RotateCcw,
  Check
} from "lucide-react";

type ShopListClientProps = {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
};

export default function ShopListClient({
  products,
  categories,
  initialCategory,
}: ShopListClientProps) {
  // State variables for active filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("default");

  // Keep state in sync with URL searchParams if category changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    } else {
      setSelectedCategories([]);
    }
    setSelectedSubcategories([]);
  }, [initialCategory]);

  // Extract all unique subcategories belonging to the currently selected categories (or all if empty)
  const availableSubcategories = useMemo(() => {
    const activeCats = selectedCategories.length > 0 
      ? categories.filter(c => selectedCategories.includes(c.slug))
      : categories;
      
    const subsSet = new Set<string>();
    activeCats.forEach(c => {
      if (c.subcategories) {
        c.subcategories.split(",")
          .map(s => s.trim())
          .filter(Boolean)
          .forEach(s => subsSet.add(s));
      }
    });
    return Array.from(subsSet).sort();
  }, [selectedCategories, categories]);

  // Reset selected subcategories if they are no longer in the list of available ones
  useEffect(() => {
    setSelectedSubcategories(prev => 
      prev.filter(sub => availableSubcategories.includes(sub))
    );
  }, [availableSubcategories]);

  // Toggle Category Checkbox
  const handleToggleCategory = (slug: string) => {
    setSelectedCategories(prev =>
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };

  // Toggle Subcategory Checkbox
  const handleToggleSubcategory = (sub: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  // Clear All Filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setMinPrice("");
    setMaxPrice("");
    setSortOrder("default");
  };

  // Filter and Sort Products client-side
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p => 
          p.name.toLowerCase().includes(q) || 
          p.description.toLowerCase().includes(q) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q))
      );
    }

    // Category match
    if (selectedCategories.length > 0) {
      result = result.filter(p => p.category && selectedCategories.includes(p.category.slug));
    }

    // Subcategory match
    if (selectedSubcategories.length > 0) {
      result = result.filter(p => p.subcategory && selectedSubcategories.includes(p.subcategory.trim()));
    }

    // Price range match
    if (minPrice) {
      result = result.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      result = result.filter(p => p.price <= parseFloat(maxPrice));
    }

    // Apply sorting
    if (sortOrder === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "name_desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [products, searchQuery, selectedCategories, selectedSubcategories, minPrice, maxPrice, sortOrder]);

  // Construct filtered PDF download link
  const handleDownloadPDF = () => {
    const params = new URLSearchParams();
    // reportlab PDF endpoint supports single category/subcategory filter parameters
    if (selectedCategories.length === 1) {
      params.set("category", selectedCategories[0]);
    }
    if (selectedSubcategories.length === 1) {
      params.set("subcategory", selectedSubcategories[0]);
    }
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    if (minPrice) {
      params.set("min_price", minPrice);
    }
    if (maxPrice) {
      params.set("max_price", maxPrice);
    }
    if (sortOrder !== "default") {
      params.set("sort", sortOrder);
    }
    
    const downloadUrl = `/api/products/catalogue/pdf?${params.toString()}`;
    window.open(downloadUrl, "_blank");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* FILTER SIDEBAR */}
      <aside className="w-full lg:w-72 bg-white dark:bg-[#0d1526] border border-neutral-200/80 dark:border-slate-800/80 rounded-3xl p-6 space-y-6 shrink-0 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-ink">
            <SlidersHorizontal size={13} className="text-primary" />
            Filters
          </div>
          <button 
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-primary transition-colors"
          >
            <RotateCcw size={10} />
            Reset
          </button>
        </div>

        {/* 1. Search */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Search Products</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Bottle, notebook, kit..."
              className="w-full bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-primary transition-all text-ink"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-neutral-400" size={13} />
          </div>
        </div>

        {/* 2. Categories Checkbox Facet */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Categories</label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {categories.map((c) => {
              const isChecked = selectedCategories.includes(c.slug);
              return (
                <label 
                  key={c.id} 
                  className="flex items-center gap-2.5 text-xs font-semibold text-neutral-600 dark:text-slate-300 cursor-pointer select-none group"
                >
                  <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                    isChecked 
                      ? "bg-primary border-primary text-white" 
                      : "border-neutral-300 dark:border-slate-700 bg-neutral-50 dark:bg-slate-900 group-hover:border-primary"
                  }`}>
                    {isChecked && <Check size={10} strokeWidth={3} />}
                  </div>
                  <input 
                    type="checkbox"
                    className="hidden"
                    checked={isChecked}
                    onChange={() => handleToggleCategory(c.slug)}
                  />
                  <span className="truncate group-hover:text-primary transition-colors">{c.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 3. Subcategories Checkbox Facet */}
        {availableSubcategories.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-slate-800/80">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Subcategories</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {availableSubcategories.map((sub) => {
                const isChecked = selectedSubcategories.includes(sub);
                return (
                  <label 
                    key={sub} 
                    className="flex items-center gap-2.5 text-xs font-semibold text-neutral-600 dark:text-slate-300 cursor-pointer select-none group"
                  >
                    <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                      isChecked 
                        ? "bg-primary border-primary text-white" 
                        : "border-neutral-300 dark:border-slate-700 bg-neutral-50 dark:bg-slate-900 group-hover:border-primary"
                    }`}>
                      {isChecked && <Check size={10} strokeWidth={3} />}
                    </div>
                    <input 
                      type="checkbox"
                      className="hidden"
                      checked={isChecked}
                      onChange={() => handleToggleSubcategory(sub)}
                    />
                    <span className="truncate group-hover:text-primary transition-colors">{sub}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Price Limits */}
        <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-slate-800/80">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Price Range (INR)</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[9px] text-neutral-400 uppercase mb-1">Min Price</span>
              <input 
                type="number"
                min="0"
                placeholder="₹0"
                className="w-full bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary text-ink"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <span className="block text-[9px] text-neutral-400 uppercase mb-1">Max Price</span>
              <input 
                type="number"
                min="0"
                placeholder="₹Max"
                className="w-full bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary text-ink"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 5. Sorting options */}
        <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-slate-800/80">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Sort Products</label>
          <select 
            className="w-full bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary text-neutral-700 dark:text-slate-300 font-semibold"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="default">Default (Newest First)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>

        {/* 6. Dynamic PDF catalogue generation */}
        <div className="pt-4 border-t border-neutral-100 dark:border-slate-800/80">
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 bg-[#e11d48] hover:bg-[#be123c] text-white py-3.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-md shadow-red-500/10 hover:shadow-lg"
          >
            <ArrowDownToLine size={13} />
            Download PDF Catalogue
          </button>
          <p className="text-[9px] text-neutral-400 text-center mt-2 leading-relaxed">
            Generates PDF consisting ONLY of the filtered products based on your active sidebar filter selections.
          </p>
        </div>
      </aside>

      {/* PRODUCTS DISPLAY GRID */}
      <div className="flex-1 w-full space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link 
            href="/shop"
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-primary transition-colors"
          >
            <ArrowLeft size={12} />
            Categories Collage
          </Link>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            Showing {filteredProducts.length} Catalogue Items
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl p-16 text-center text-neutral-400 dark:text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d1526]/50">
            No products found matching your current filter selections. Try relaxing some rules.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
