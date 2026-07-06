import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    products = (await getProducts()).slice(0, 8);
  } catch {
    products = [];
  }

  return (
    <>
      <Navbar />
      <Hero />

      <section className="container-px py-24">
        <h2 className="section-title">Featured</h2>
        {products.length === 0 ? (
          <p className="text-neutral-400">No products published yet — add some from the Admin dashboard.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section id="about" className="container-px py-24 max-w-3xl">
        <h2 className="section-title">About Us</h2>
        <p className="text-neutral-600 leading-relaxed">
          IndiaForms Centre curates thoughtfully designed, functional products for
          everyday life — combining clean aesthetics with genuine utility.
        </p>
      </section>

      <Footer />
    </>
  );
}
