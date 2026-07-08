import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories } from "@/lib/api";
import Link from "next/link";

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
      <section className="bg-cream py-16 min-h-screen transition-colors duration-300">
        <div className="container-px max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4 text-left">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-ink">Corporate Catalogue</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-lg leading-relaxed">
              Explore our range of customizable, functional merchandise built for branding. Select a category below to filter our collections.
            </p>
          </div>

          {/* Categories Grid Filter */}
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/shop"
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all ${
                !searchParams.category
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-card text-neutral-600 dark:text-neutral-300 border-border hover:border-neutral-400 dark:hover:border-neutral-500"
              }`}
            >
              All Products
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all ${
                  searchParams.category === c.slug
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-card text-neutral-600 dark:text-neutral-300 border-border hover:border-neutral-400 dark:hover:border-neutral-500"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Product Listing */}
          {products.length === 0 ? (
            <div className="bg-card rounded-2xl p-16 text-center text-neutral-400 dark:text-neutral-500 shadow-sm border border-border">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {products.map((p) => (
                <div key={p.id} className="animate-fade-in">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
