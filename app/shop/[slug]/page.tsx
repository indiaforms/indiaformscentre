import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProduct } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  let product;
  try {
    product = await getProduct(params.slug);
  } catch {
    notFound();
  }
  if (!product) notFound();

  const soldOut = product.stock_status === "out_of_stock";

  return (
    <>
      <Navbar />
      <section className="container-px py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative aspect-square bg-white rounded-2xl overflow-hidden">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className={`w-full h-full object-cover ${soldOut ? "grayscale opacity-60" : ""}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">No image</div>
          )}
        </div>

        <div>
          {product.category && (
            <p className="text-xs uppercase tracking-wide text-neutral-400 mb-2">{product.category.name}</p>
          )}
          <h1 className="text-3xl font-light mb-4">{product.name}</h1>
          <p className="text-xl mb-6">₹{product.price.toLocaleString("en-IN")}</p>
          <p className="text-neutral-600 leading-relaxed mb-8">{product.description}</p>

          {soldOut ? (
            <span className="btn-outline opacity-60 cursor-not-allowed">Sold Out</span>
          ) : (
            <button className="btn-primary">Enquire / Add to Cart</button>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
