import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[80vh] min-h-[520px] flex items-center justify-center bg-slate-950 text-white overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 z-0" />
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 z-0 pointer-events-none" />

      <div className="relative text-center container-px max-w-4xl mx-auto z-10 space-y-6">
        <p className="tracking-[0.3em] text-xs font-bold uppercase text-emerald-400 mb-2">
          Design-Led • Purpose-Built • Customized
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
          Elevate Your Brand with<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Premium Corporate Gifts
          </span>
        </h1>
        <p className="text-sm md:text-base text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
          India Forms Center curates high-utility executive accessories, smart desktop tech, and custom onboarding kits tailored perfectly for your business identity.
        </p>
        
        <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/shop" className="btn-primary bg-white text-slate-900 hover:bg-slate-100 flex items-center gap-2">
            Explore Catalogue
            <ArrowRight size={15} />
          </Link>
          <a href="/#contact" className="btn-outline border-slate-700 text-white hover:bg-white/5 transition-all">
            Get Custom Quote
          </a>
        </div>
      </div>
    </section>
  );
}
