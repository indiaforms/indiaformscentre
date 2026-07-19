"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Briefcase, Phone, Mail, MapPin, ArrowUpRight, ArrowDownToLine } from "lucide-react";
import { getSettings } from "@/lib/api";
import PWAInstallPrompt from "./PWAInstallPrompt";

export default function Footer() {
  const year = new Date().getFullYear();
  const [catalogueUrl, setCatalogueUrl] = useState("");

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    setCatalogueUrl(`${apiBase}/api/products/catalogue/pdf`);
  }, []);

  const links = {
    Catalogue: [
      { label: "Lifestyle Essentials", href: "/shop?category=lifestyle" },
      { label: "Travel Gear", href: "/shop?category=travel" },
      { label: "Office & Desk", href: "/shop?category=office-essentials" },
      { label: "Tech & Gadgets", href: "/shop?category=gadgets" },
      { label: "Eco Life", href: "/shop?category=eco-life" },
    ],
    Company: [
      { label: "What We Do", href: "/what-we-do" },
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Partner Portal", href: "/admin/login" },
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

          {/* Quick Actions */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-400">Quick Actions</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Need a quick custom quote? Connect on WhatsApp or get the catalogue.</p>
            <div className="flex flex-col gap-3">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2.5 rounded-xl transition-all duration-300 text-emerald-300 w-fit border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20"
              >
                WhatsApp Us
              </a>
              <a
                href={catalogueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2.5 rounded-xl transition-all duration-300 text-rose-300 w-fit border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20"
              >
                <ArrowDownToLine size={13} />
                Download Catalogue
              </a>
              <div className="mt-2">
                <PWAInstallPrompt />
              </div>
            </div>
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
