import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProduct } from "@/lib/api";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import type { Metadata } from "next";

type Props = {
  params: { slug: string };
};

// SEO Metadata support
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await getProduct(params.slug);
    if (!product) return { title: "Product Not Found" };
    return {
      title: `${product.name} | Customized Corporate Gift - FUZO Centre`,
      description: product.description.slice(0, 160) || `Buy custom branded ${product.name} in bulk.`,
    };
  } catch {
    return { title: "FUZO Centre Catalogue" };
  }
}

export default async function ProductPage({ params }: Props) {
  let product;
  try {
    product = await getProduct(params.slug);
  } catch {
    notFound();
  }
  if (!product) notFound();

  return (
    <>
      <Navbar />
      <section className="bg-cream min-h-screen">
        <ProductDetailClient product={product} />
      </section>
      <Footer />
    </>
  );
}
