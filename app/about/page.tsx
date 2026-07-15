import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingPortalDock from "@/components/FloatingPortalDock";
import { CheckCircle2, Award, Users, Heart } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: <Award className="text-emerald-400" size={24} />,
      title: "Premium Craftsmanship",
      desc: "Every corporate gift is designed with painstaking attention to detail and high-grade materials that leave a lasting mark.",
    },
    {
      icon: <Users className="text-blue-400" size={24} />,
      title: "Client Centricity",
      desc: "Over 500+ Indian corporate giants count on our prompt schedules, personalized preview tools, and seamless distribution.",
    },
    {
      icon: <Heart className="text-purple-400" size={24} />,
      title: "Innovative Design",
      desc: "We ditch boring standard corporate merchandise in favor of design-led utility items that employees actually love using daily.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream dark:bg-[#060b18] pt-32 pb-20 transition-colors duration-300">
        
        {/* Hero Section */}
        <section className="container-px max-w-6xl mx-auto text-center space-y-6 mb-20">
          <p className="text-[10px] font-black tracking-[0.35em] uppercase text-primary">Discover Our Story</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-ink leading-none">
            We Create Gifts That Make Brands <br className="hidden md:inline" />
            <span className="gradient-text">Unforgettable</span>
          </h1>
          <p className="text-neutral-500 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed font-light">
            India Forms Center is a premium corporate gifting brand. We supply design-led merchandise, custom onboarding welcome drops, and high-utility promotional gear tailored to corporate identities.
          </p>
        </section>

        {/* Story Section */}
        <section className="container-px max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-ink">Our Journey</h2>
            <p className="text-neutral-500 dark:text-slate-400 text-xs leading-relaxed font-light">
              Founded with the vision to replace mundane, low-quality corporate giveaways with items of genuine utility and luxury aesthetic, India Forms Center has grown to serve over 50,000 onboarding and event kits across India.
            </p>
            <p className="text-neutral-500 dark:text-slate-400 text-xs leading-relaxed font-light">
              From automated logo rendering tools to centralized warehouse operations, we offer premium businesses a truly modern gifting workflow.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-xs font-semibold text-neutral-700 dark:text-slate-300">ISO 9001 Certified Supplier</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-xs font-semibold text-neutral-700 dark:text-slate-300">Pan-India Warehousing & Logistics</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-xs font-semibold text-neutral-700 dark:text-slate-300">Sustainable & Eco-Life Options</span>
              </div>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200 dark:border-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
              alt="Team collaborating" 
              className="w-full h-80 object-cover" 
            />
          </div>
        </section>

        {/* Value Section */}
        <section className="bg-slate-50 dark:bg-slate-900/30 border-y border-neutral-100 dark:border-slate-800/50 py-20 mb-20">
          <div className="container-px max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <p className="text-[10px] font-black tracking-[0.35em] uppercase text-primary">Core Principles</p>
              <h2 className="text-3xl font-black text-ink">What We Stand For</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((v, i) => (
                <div key={i} className="bg-white dark:bg-[#0d1526]/80 border border-neutral-200/60 dark:border-slate-800/80 rounded-2xl p-7 space-y-4 hover:scale-102 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-neutral-50 dark:bg-slate-900 flex items-center justify-center border border-neutral-100 dark:border-slate-800">
                    {v.icon}
                  </div>
                  <h3 className="text-sm font-bold text-ink">{v.title}</h3>
                  <p className="text-xs text-neutral-400 dark:text-slate-400 leading-relaxed font-light">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <FloatingPortalDock />
    </>
  );
}
