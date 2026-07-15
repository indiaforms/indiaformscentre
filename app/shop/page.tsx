import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopListClient from "@/components/ShopListClient";
import { getProducts, getCategories } from "@/lib/api";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; view?: string };
}) {
  const [products, categories] = await Promise.all([
    getProducts().catch(() => []),
    getCategories().catch(() => []),
  ]);

  const showListView = searchParams.view === "list" || !!searchParams.category;

  // Compute cover image for each category dynamically based on uploaded products
  const categoriesWithCovers = categories.map((cat) => {
    const catProducts = products.filter((p) => p.category?.id === cat.id);
    const coverImage = catProducts.length > 0 
      ? catProducts[0].image_url 
      : (cat.image_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80"); // fallback template image
    return {
      ...cat,
      coverImage,
      productCount: catProducts.length
    };
  });

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
          <p className="text-[10px] font-black tracking-[0.35em] uppercase text-blue-400 mb-3">
            {showListView ? "Browse Products" : "Corporate Gifting"}
          </p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight mb-4 animate-fade-in">
            {showListView ? "Product " : "Corporate "}<span className="gradient-text">{showListView ? "Catalogue" : "Collections"}</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            {showListView 
              ? "Refine your selection using the sidebar filter and download your customized PDF catalog instantly." 
              : "Discover premium customized brand merchandise. Explore individual product categories below."}
          </p>
        </div>
      </section>

      {/* Catalogue Body */}
      <section
        className="min-h-[60vh] py-16 transition-colors duration-300"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="container-px max-w-7xl mx-auto">
          {showListView ? (
            // LIST VIEW WITH INTERACTIVE SIDEBAR FILTER
            <ShopListClient 
              products={products} 
              categories={categories} 
              initialCategory={searchParams.category} 
            />
          ) : (
            // LANDING VIEW: CATEGORIES COLLAGE / GALLERY
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
                {categoriesWithCovers.map((c, idx) => {
                  // Span layout for collage variation
                  let spanClass = "md:col-span-1";
                  if (idx % 4 === 0) {
                    spanClass = "md:col-span-2 md:row-span-1"; // Wide collage accent
                  }

                  return (
                    <Link
                      key={c.id}
                      href={`/shop?category=${c.slug}`}
                      className={`group relative block rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-[1.015] border border-neutral-200/40 dark:border-slate-800/40 h-[280px] md:h-[320px] ${spanClass}`}
                    >
                      {/* Image zoom on hover */}
                      <div className="w-full h-full bg-neutral-100 dark:bg-slate-900 overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.coverImage}
                          alt={c.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-75 group-hover:opacity-85 transition-opacity duration-300" />

                      {/* Info on Card */}
                      <div className="absolute bottom-6 left-6 right-6 text-white flex items-end justify-between">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            <Layers size={10} />
                            {c.productCount} items
                          </span>
                          <h3 className="text-xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                            {c.name}
                          </h3>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm group-hover:bg-primary transition-all duration-300 transform group-hover:translate-x-1.5">
                          <ArrowRight size={15} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* View All Products button at the end of the page */}
              <div className="flex flex-col items-center justify-center pt-8 space-y-3">
                <Link
                  href="/shop?view=list"
                  className="btn-primary inline-flex items-center justify-center gap-2.5 px-10 py-4.5 rounded-full font-bold uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20 hover:scale-102 hover:shadow-xl transition-all duration-300"
                >
                  View All Products
                </Link>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Browse complete catalogue with sidebar filters
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
