import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories } from "@/lib/api";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const [products, categories] = await Promise.all([
    getProducts(searchParams.category).catch(() => []),
    getCategories().catch(() => []),
  ]);

  return (
    <>
      <Navbar />

      {/* Page Hero */}
      <section
        className="relative pt-36 pb-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #020812 0%, #06102a 60%, #0a0f1e 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full -translate-y-1/2" style={{ background: "radial-gradient(ellipse, rgba(29,78,216,0.15) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.10) 0%, transparent 70%)" }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent" />

        <div className="container-px max-w-7xl mx-auto relative z-10 text-center">
          <p className="text-[10px] font-black tracking-[0.35em] uppercase text-blue-400 mb-3">Our Collections</p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight mb-4">
            Corporate <span className="gradient-text">Catalogue</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Explore our range of customizable, functional merchandise built for branding. Select a category to filter.
          </p>
        </div>
      </section>

      {/* Catalogue Body */}
      <section
        className="min-h-screen py-16 transition-colors duration-300"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="container-px max-w-7xl mx-auto space-y-12">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-neutral-400 mr-2">
              <SlidersHorizontal size={12} />
              Filter
            </div>
            <Link
              href="/shop"
              className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase border transition-all duration-200 ${
                !searchParams.category
                  ? "bg-primary text-white border-primary shadow-lg shadow-blue-500/20"
                  : "border-border text-neutral-600 dark:text-neutral-400 hover:border-primary hover:text-primary"
              }`}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase border transition-all duration-200 ${
                  searchParams.category === c.slug
                    ? "bg-primary text-white border-primary shadow-lg shadow-blue-500/20"
                    : "border-border text-neutral-600 dark:text-neutral-400 hover:border-primary hover:text-primary"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Product grid */}
          {products.length === 0 ? (
            <div className="rounded-3xl p-16 text-center text-neutral-400 dark:text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800">
              No products found in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
