import Link from "next/link";
import { Briefcase, Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    Catalogue: [
      { label: "Lifestyle Essentials", href: "/shop?category=lifestyle" },
      { label: "Travel Gear", href: "/shop?category=travel" },
      { label: "Office & Desk", href: "/shop?category=office-essentials" },
      { label: "Tech & Gadgets", href: "/shop?category=gadgets" },
      { label: "Eco Life", href: "/shop?category=eco-life" },
    ],
    Company: [
      { label: "About Us", href: "/#about" },
      { label: "Partner Portal", href: "/admin/login" },
      { label: "Enquire Now", href: "/#contact" },
    ],
  };

  return (
    <footer className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #020812 0%, #000408 100%)" }}>
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600/50 to-transparent" />

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-64 pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(29,78,216,0.07) 0%, transparent 70%)" }} />

      <div className="container-px max-w-7xl mx-auto pt-20 pb-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #059669)", boxShadow: "0 4px 16px rgba(29,78,216,0.35)" }}>
                <Briefcase size={18} />
              </div>
              <div>
                <div className="text-xs font-black tracking-[0.2em] uppercase text-white">India Forms</div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-slate-600">Center</div>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              India&apos;s leading premium corporate gifting platform. Design-led, purpose-built merchandise for modern enterprises.
            </p>
            <div className="space-y-3">
              {[
                { icon: <Phone size={12} />, text: "+91 98765 43210" },
                { icon: <Mail size={12} />, text: "corporate@indiaformscenter.in" },
                { icon: <MapPin size={12} />, text: "Level 6, Tech Park, Mumbai" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="text-blue-500">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section} className="space-y-4">
              <h4 className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-400">{section}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors duration-200"
                    >
                      {item.label}
                      <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / CTA */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-400">Quick Enquiry</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Need a quick quote? Chat with us directly on WhatsApp.</p>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2.5 rounded-xl transition-all duration-300 text-emerald-300"
              style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.20)" }}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {year} India Forms Center. All rights reserved. Premium Corporate Merchandise, India.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Use", "Sitemap"].map((item) => (
              <span key={item} className="text-xs text-slate-700 hover:text-slate-500 cursor-pointer transition-colors">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
