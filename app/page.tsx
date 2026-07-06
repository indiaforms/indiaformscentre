import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories, type Product, type Category } from "@/lib/api";
import EnquiryForm from "@/components/EnquiryForm";
import Link from "next/link";
import { ShieldCheck, Palette, Package2, Award } from "lucide-react";

export default async function HomePage() {
  let products: Product[] = [];
  let categories: Category[] = [];
  try {
    const [p, c] = await Promise.all([getProducts(), getCategories()]);
    products = p.slice(0, 8);
    categories = c;
  } catch {
    products = [];
    categories = [];
  }

  return (
    <>
      <Navbar />
      <Hero />

      {/* Services Showcase */}
      <section className="bg-white py-20 border-b border-neutral-100">
        <div className="container-px max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400">
              Corporate Ordering Solutions
            </h2>
            <h3 className="text-3xl font-light tracking-tight text-ink">
              Tailored Merchandising for Global Brands
            </h3>
            <p className="text-sm text-neutral-500">
              We design, source, brand, and distribute premium corporate utility gifts, customized to fit your brand identity seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-neutral-50 rounded-2xl p-6 space-y-4 hover:shadow-xl hover:shadow-neutral-200/30 transition-all border border-neutral-100">
              <div className="w-12 h-12 bg-ink text-white rounded-xl flex items-center justify-center">
                <Palette size={20} />
              </div>
              <h4 className="text-sm font-bold tracking-wider uppercase text-ink">Live Logo Preview</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Upload your brand assets directly on the product detail page and preview laser engraving or digital printing in real time.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-6 space-y-4 hover:shadow-xl hover:shadow-neutral-200/30 transition-all border border-neutral-100">
              <div className="w-12 h-12 bg-ink text-white rounded-xl flex items-center justify-center">
                <Package2 size={20} />
              </div>
              <h4 className="text-sm font-bold tracking-wider uppercase text-ink">Custom Gift Sets</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Curate custom onboarding kits or client appreciation sets tailored to your budget and theme requirements.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-6 space-y-4 hover:shadow-xl hover:shadow-neutral-200/30 transition-all border border-neutral-100">
              <div className="w-12 h-12 bg-ink text-white rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-sm font-bold tracking-wider uppercase text-ink">Verified Quality</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                All products undergo strict quality checks ensuring premium finishing, durable components, and brand alignment.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-6 space-y-4 hover:shadow-xl hover:shadow-neutral-200/30 transition-all border border-neutral-100">
              <div className="w-12 h-12 bg-ink text-white rounded-xl flex items-center justify-center">
                <Award size={20} />
              </div>
              <h4 className="text-sm font-bold tracking-wider uppercase text-ink">Pan-India Delivery</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                We handle multi-location employee distributions, onboarding drops, and global deliveries from our central warehouse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Catalogue Grid */}
      <section className="bg-cream py-24">
        <div className="container-px max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-2">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400">Our Collections</h2>
              <h3 className="text-3xl md:text-4xl font-light tracking-tight text-ink">Featured Corporate Giftware</h3>
            </div>
            <Link 
              href="/shop" 
              className="text-xs font-semibold tracking-widest uppercase bg-ink text-white px-6 py-3 rounded-full hover:bg-neutral-800 transition-colors shadow-sm self-start md:self-auto"
            >
              Browse Catalogue
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-neutral-400 shadow-sm border border-neutral-100">
              No products published yet — add some from the Partner Portal dashboard.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {products.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enquiry Form Integration */}
      <section id="contact" className="bg-neutral-900 py-24 text-white">
        <div className="container-px max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500">Get a Quote</h2>
            <h3 className="text-4xl md:text-5xl font-light tracking-tight">
              Ready to custom brand your merchandise?
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
              Send us your business requirements, target budgets, and distribution counts. Our corporate consultant will reach out in under 2 hours with customized ideas and pricing options.
            </p>
            <div className="space-y-4 pt-4 border-t border-neutral-800">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500">Corporate Helpline</span>
                <span className="text-lg font-semibold text-white">+91 98765 43210</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500">Office Location</span>
                <span className="text-neutral-400 text-sm">Level 6, Tech Park Center, Mumbai, India</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-neutral-800 to-neutral-700 rounded-2xl blur-lg opacity-35" />
            <EnquiryForm className="relative border-0 shadow-2xl" />
          </div>
        </div>
      </section>
    </>
  );
}
