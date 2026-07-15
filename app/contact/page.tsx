import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingPortalDock from "@/components/FloatingPortalDock";
import EnquiryForm from "@/components/EnquiryForm";
import { Mail, Phone, MapPin, Zap } from "lucide-react";

export default function ContactPage() {
  const details = [
    {
      icon: <Phone className="text-emerald-500 shrink-0" size={18} />,
      label: "Corporate Helpline",
      value: "+91 98765 43210",
    },
    {
      icon: <Mail className="text-blue-500 shrink-0" size={18} />,
      label: "Email Support",
      value: "corporate@indiaformscenter.in",
    },
    {
      icon: <MapPin className="text-purple-500 shrink-0" size={18} />,
      label: "Central Office",
      value: "Level 6, Tech Park Center, Mumbai",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream dark:bg-[#060b18] pt-32 pb-20 transition-colors duration-300">
        
        {/* Title */}
        <section className="container-px max-w-6xl mx-auto text-center space-y-4 mb-16">
          <p className="text-[10px] font-black tracking-[0.35em] uppercase text-primary">Get in Touch</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-ink">
            Start Your Gifting <span className="gradient-text">Campaign</span>
          </h1>
          <p className="text-neutral-500 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed font-light">
            We response to all custom corporate inquiries within 2 business hours with full catalogs and mockups.
          </p>
        </section>

        {/* Contact split section */}
        <section className="container-px max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-10">
          
          {/* Info Side */}
          <div className="space-y-8 bg-white dark:bg-[#0d1526]/80 border border-neutral-200/60 dark:border-slate-800/80 p-8 rounded-3xl h-full flex flex-col justify-between">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-ink">Contact Details</h2>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Feel free to call our dedicated corporate manager, drop us an email, or visit our central offices for merchandise sample inspections.
              </p>
              
              <div className="space-y-5">
                {details.map((d, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 flex items-center justify-center">
                      {d.icon}
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{d.label}</span>
                      <span className="text-xs font-semibold text-ink">{d.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 pt-6 border-t border-neutral-100 dark:border-slate-800">
              {["Fast Turnaround", "Bulk Pricing", "Pan India Shipment", "Sample Kits"].map((f) => (
                <span 
                  key={f} 
                  className="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 text-neutral-500"
                >
                  <Zap size={9} />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Form Side */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-blue-600/10 to-emerald-600/10 opacity-60 blur-xl pointer-events-none" />
            <div className="relative rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-xl">
              <EnquiryForm className="border-0 bg-white dark:bg-slate-900" />
            </div>
          </div>

        </section>

      </main>
      <Footer />
      <FloatingPortalDock />
    </>
  );
}
