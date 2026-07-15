import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingPortalDock from "@/components/FloatingPortalDock";
import Link from "next/link";
import { Sparkles, Gift, Truck, FileText, Settings, Heart } from "lucide-react";

export default function WhatWeDoPage() {
  const services = [
    {
      icon: <Gift className="text-emerald-400" size={22} />,
      title: "Onboarding Kits & Welcome Drops",
      desc: "Delight new joiners with customized welcome kits (journals, tech items, apparel) sent directly to their homes or desks.",
    },
    {
      icon: <Truck className="text-blue-400" size={22} />,
      title: "Multi-Location Logistics",
      desc: "We coordinate dispatch to hundreds of individual home addresses or corporate offices across India from our central warehouse.",
    },
    {
      icon: <FileText className="text-purple-400" size={22} />,
      title: "Design & Custom Branding",
      desc: "We offer professional engraving, embossing, embroidery, and screen printing services that maintain your brand's style guidelines.",
    },
    {
      icon: <Sparkles className="text-amber-400" size={22} />,
      title: "Corporate Event Merchandise",
      desc: "Premium merchandise custom-tailored for summits, product launches, shareholder events, and employee team building.",
    },
    {
      icon: <Settings className="text-indigo-400" size={22} />,
      title: "Eco-Life Gifting Alternatives",
      desc: "Environmentally friendly gifts, bamboo-crafted office utilities, and natural cork tech items for green branding.",
    },
    {
      icon: <Heart className="text-rose-400" size={22} />,
      title: "Holiday & Festivity Gifting",
      desc: "Tailor-made hampers for Diwali, New Year, and festivals featuring premium sweets, dry fruits, and utility ware.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream dark:bg-[#060b18] pt-32 pb-20 transition-colors duration-300">
        
        {/* Header Hero */}
        <section className="container-px max-w-6xl mx-auto text-center space-y-6 mb-20">
          <p className="text-[10px] font-black tracking-[0.35em] uppercase text-primary">What We Do</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-ink leading-none">
            Corporate Gifting, Made <br className="hidden md:inline" />
            <span className="gradient-text">Effortless</span>
          </h1>
          <p className="text-neutral-500 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed font-light">
            We handle everything from sourcing and customized design to bulk storage and home deliveries.
          </p>
        </section>

        {/* Services Grid */}
        <section className="container-px max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {services.map((s, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-[#0d1526]/80 border border-neutral-200/60 dark:border-slate-800/80 rounded-3xl p-8 hover:scale-102 transition-all duration-300 hover:shadow-xl space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-neutral-50 dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 flex items-center justify-center">
                  {s.icon}
                </div>
                <h3 className="text-sm font-bold text-ink">{s.title}</h3>
                <p className="text-xs text-neutral-400 dark:text-slate-400 leading-relaxed font-light">{s.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Call to action section */}
        <section className="container-px max-w-4xl mx-auto text-center bg-gradient-to-tr from-blue-900 to-indigo-950 text-white rounded-3xl p-12 shadow-xl border border-blue-800/50 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <p className="text-[10px] font-black tracking-[0.35em] uppercase text-emerald-400">Launch a Campaign</p>
          <h2 className="text-2xl md:text-3xl font-black">Need custom-branded kits for your employees?</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Get in touch with our gifting team. We provide sample mockups, customized pricing rates, and direct address shipment schedules.
          </p>
          <div className="pt-2">
            <Link href="/contact" className="btn-primary inline-flex bg-white text-blue-900 hover:bg-slate-100 font-bold uppercase py-3.5 px-8 rounded-xl text-xs shadow-md">
              Start Your Quote
            </Link>
          </div>
        </section>

      </main>
      <Footer />
      <FloatingPortalDock />
    </>
  );
}
