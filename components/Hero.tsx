import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-[80vh] min-h-[520px] flex items-center justify-center bg-ink text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
      <div className="relative text-center container-px">
        <p className="tracking-[0.3em] text-xs uppercase text-white/70 mb-4">
          Design-led. Purpose-built.
        </p>
        <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-6">
          Products made for<br />modern everyday life
        </h1>
        <Link href="/shop" className="btn-primary bg-white text-ink hover:bg-white/90">
          Explore the Shop
        </Link>
      </div>
    </section>
  );
}
