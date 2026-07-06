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
      <section className="container-px py-16">
        <h1 className="section-title">Shop</h1>

        <div className="flex flex-wrap gap-3 mb-12">
          <Link
            href="/shop"
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-wide border ${
              !searchParams.category ? "bg-ink text-white border-ink" : "border-black/20"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wide border ${
                searchParams.category === c.slug ? "bg-ink text-white border-ink" : "border-black/20"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="text-neutral-400">No products found in this category.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
