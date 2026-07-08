import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories, type Product, type Category } from "@/lib/api";
import EnquiryForm from "@/components/EnquiryForm";
import ServiceCards from "@/components/ServiceCards";
import { Zap, Star, CheckCircle2 } from "lucide-react";

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




  const stats = [
    { value: "500+", label: "Corporate Clients" },
    { value: "50K+", label: "Kits Delivered" },
    { value: "98.6%", label: "Satisfaction Rate" },
    { value: "15+", label: "Years Experience" },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "HR Director, TechMahindra",
      text: "India Forms Center transformed our onboarding experience. The quality of the custom kits exceeded expectations.",
      stars: 5,
    },
    {
      name: "Rahul Gupta",
      role: "Events Lead, Infosys",
      text: "Seamless ordering process, stunning packaging, and delivered on time for our global summit. Highly recommended.",
      stars: 5,
    },
    {
      name: "Anita Verma",
      role: "Brand Manager, HCL",
      text: "The live logo preview tool alone saved us weeks of back-and-forth. A truly modern gifting experience.",
      stars: 5,
    },
  ];

  return (
    <>
      <Navbar />
      <Hero />

      {/* ── Stats Strip ───────────────────────────────── */}
      <section className="relative z-10 -mt-1 py-10" style={{ background: "linear-gradient(135deg, #020812, #06102a)" }}>
        <div className="absolute inset-0 border-y border-blue-900/30" />
        <div className="container-px max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl md:text-4xl font-black gradient-text">{s.value}</div>
                <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Section ──────────────────────────── */}
      <section id="about" className="relative py-28 overflow-hidden" style={{ background: "linear-gradient(180deg, #06102a 0%, #0a0f1e 100%)" }}>
        {/* Decorative orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-blue-700/40 to-transparent" />
        <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)" }} />

        <div className="container-px max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <p className="text-[10px] font-black tracking-[0.35em] uppercase text-blue-400">Our Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.1]">
              Everything You Need to<br />
              <span className="gradient-text">Gift Exceptionally</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We design, source, brand, and distribute premium corporate utility gifts, customized to fit your brand identity seamlessly.
            </p>
          </div>

          <ServiceCards />
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────── */}
      <section className="relative py-28 overflow-hidden bg-cream dark:bg-[#060b18] transition-colors duration-300">
        {/* Subtle top gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.05) 0%, transparent 50%)" }}
        />

        <div className="container-px max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-3">
              <p className="text-[10px] font-black tracking-[0.35em] uppercase text-primary">Our Collections</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-ink leading-[1.1]">
                Featured Corporate<br />
                <span className="gradient-text">Giftware</span>
              </h2>
            </div>
            <Link
              href="/shop"
              className="btn-primary self-start md:self-auto"
            >
              Browse All Products
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-3xl p-16 text-center text-neutral-400 dark:text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800">
              No products published yet — add some from the Partner Portal dashboard.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────── */}
      <section className="relative py-28 overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0f1e 0%, #06102a 100%)" }}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

        <div className="container-px max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-[10px] font-black tracking-[0.35em] uppercase text-emerald-400">Client Stories</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Loved by <span className="gradient-text">500+ Companies</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="group rounded-3xl p-7 space-y-5 shimmer-card relative overflow-hidden"
                style={{
                  background: "rgba(13,21,38,0.8)",
                  border: "1px solid rgba(59,130,246,0.12)",
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-slate-300 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>

                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-xs font-black">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{t.name}</div>
                    <div className="text-[10px] text-slate-500">{t.role}</div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-blue-600/10 to-emerald-600/10 blur-xl group-hover:scale-150 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / Enquiry ─────────────────────────── */}
      <section id="contact" className="relative py-28 overflow-hidden" style={{ background: "linear-gradient(135deg, #06102a, #020812)" }}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-600/40 to-transparent" />

        {/* Large glow blobs */}
        <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(29,78,216,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.10) 0%, transparent 70%)" }} />

        <div className="container-px max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div className="space-y-8 text-white">
              <div className="space-y-4">
                <p className="text-[10px] font-black tracking-[0.35em] uppercase text-emerald-400">Get a Quote</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">
                  Ready to make your<br />
                  <span className="gradient-text">brand unforgettable?</span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                  Send your business requirements, budgets, and distribution details. Our corporate consultant will reach out in under 2 hours with ideas and pricing.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Corporate Helpline", value: "+91 98765 43210" },
                  { label: "Email Us", value: "corporate@indiaformscenter.in" },
                  { label: "Office", value: "Level 6, Tech Park Center, Mumbai" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.label}</div>
                      <div className="text-sm font-semibold text-white">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Feature chips */}
              <div className="flex flex-wrap gap-2">
                {["Fast Turnaround", "Bulk Discounts", "Custom Packaging", "Pan-India Delivery"].map((f) => (
                  <span key={f} className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full" style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.20)", color: "#93c5fd" }}>
                    <Zap size={9} />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] opacity-60" style={{ background: "radial-gradient(ellipse, rgba(29,78,216,0.25) 0%, transparent 70%)", filter: "blur(24px)" }} />
              <div className="relative rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(59,130,246,0.20)" }}>
                <EnquiryForm className="border-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
