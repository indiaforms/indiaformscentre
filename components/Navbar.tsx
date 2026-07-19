"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Sun, 
  Moon, 
  Briefcase, 
  Menu, 
  X, 
  UserCog, 
  ChevronDown, 
  ArrowDownToLine,
  Sparkles
} from "lucide-react";
import { getCategories, getSettings, type Category } from "@/lib/api";
import PWAInstallPrompt from "./PWAInstallPrompt";
import AIGiftFinder from "./AIGiftFinder";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [theme, setTheme] = useState("light");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAIFinder, setShowAIFinder] = useState(false);
  
  // Custom states for settings & mega-dropdown
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalogueUrl, setCatalogueUrl] = useState("");
  const [hoveringProducts, setHoveringProducts] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const role = localStorage.getItem("user_role");
    if (token) { 
      setIsLoggedIn(true); 
      setUserRole(role || "employee"); 
    }
    const activeTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(activeTheme);

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Set dynamic, auto-updating catalogue endpoint
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    setCatalogueUrl(`${apiBase}/api/products/catalogue/pdf`);

    // Fetch dynamic navbar categories
    getCategories().then(setCategories).catch(() => {});

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass dark:glass-dark shadow-lg shadow-blue-900/10 dark:shadow-black/30"
            : "bg-transparent"
        }`}
      >
        <nav className="container-px max-w-7xl mx-auto h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div
              className="relative w-10 h-10 rounded-2xl flex items-center justify-center text-white overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #059669)",
                boxShadow: "0 4px 20px rgba(29,78,216,0.40)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Briefcase size={18} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-black tracking-[0.2em] uppercase text-ink">
                India Forms
              </span>
              <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-neutral-400 dark:text-neutral-500">
                Center
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link 
              href="/" 
              className="relative text-xs font-bold tracking-[0.15em] uppercase text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors group py-2"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 group-hover:w-full transition-all duration-300 rounded-full" />
            </Link>

            {/* Products Mega-Menu trigger */}
            <div
              className="relative group py-2"
              onMouseEnter={() => setHoveringProducts(true)}
              onMouseLeave={() => setHoveringProducts(false)}
            >
              <button 
                className="flex items-center gap-1 text-xs font-bold tracking-[0.15em] uppercase text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors outline-none"
              >
                <span>Products</span>
                <ChevronDown size={11} className={`transition-transform duration-300 ${hoveringProducts ? "rotate-180 text-primary" : ""}`} />
              </button>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 group-hover:w-full transition-all duration-300 rounded-full" />
            </div>

            <Link 
              href="/what-we-do" 
              className="relative text-xs font-bold tracking-[0.15em] uppercase text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors group py-2"
            >
              What We Do
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 group-hover:w-full transition-all duration-300 rounded-full" />
            </Link>

            <Link 
              href="/about" 
              className="relative text-xs font-bold tracking-[0.15em] uppercase text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors group py-2"
            >
              About Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 group-hover:w-full transition-all duration-300 rounded-full" />
            </Link>

            <Link 
              href="/contact" 
              className="relative text-xs font-bold tracking-[0.15em] uppercase text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors group py-2"
            >
              Contact Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 group-hover:w-full transition-all duration-300 rounded-full" />
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            
            <PWAInstallPrompt />

            {/* AI Gift Finder Trigger */}
            <button
              onClick={() => setShowAIFinder(true)}
              className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-[10px] font-black tracking-widest uppercase px-5.5 py-2.5 rounded-full transition-all duration-300 shadow-md shadow-indigo-500/20 hover:scale-102 hover:shadow-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Sparkles size={13} className="animate-pulse relative z-10" />
              <span className="relative z-10">AI Gift Finder</span>
            </button>

            {/* Download Catalogue button (red Fuzo style) */}
            <a
              href={catalogueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 bg-[#e11d48] hover:bg-[#be123c] text-white text-[10px] font-black tracking-widest uppercase px-5.5 py-2.5 rounded-full transition-all duration-300 shadow-md shadow-red-500/10 hover:scale-102 hover:shadow-lg"
            >
              <ArrowDownToLine size={13} />
              <span>Download Catalogue</span>
            </a>

            <button
              onClick={toggleTheme}
              className={`relative p-2.5 rounded-xl transition-all duration-300 overflow-hidden ${
                scrolled || theme === "dark"
                  ? "bg-white/10 hover:bg-white/20 border border-white/15 text-white"
                  : "bg-black/5 hover:bg-black/10 border border-black/10 text-slate-700"
              }`}
              aria-label="Toggle theme"
            >
              <div className={`transition-all duration-300 ${theme === "dark" ? "rotate-0" : "rotate-180"}`}>
                {theme === "dark"
                  ? <Sun size={14} className="text-amber-400" />
                  : <Moon size={14} className="text-slate-600" />
                }
              </div>
            </button>

            {!isLoggedIn && (
              <div className="hidden md:flex items-center gap-2">
                {/* Employee Login Button */}
                <Link
                  href="/admin/login?role=employee"
                  className={`group relative p-2.5 rounded-xl transition-all duration-300 ${
                    scrolled || theme === "dark"
                      ? "bg-white/10 hover:bg-white/20 border border-white/15 text-white hover:text-emerald-400"
                      : "bg-black/5 hover:bg-black/10 border border-black/10 text-slate-700 hover:text-emerald-600"
                  }`}
                  aria-label="Employee Portal"
                >
                  <Briefcase size={14} />
                  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap pointer-events-none">
                    Employee Login
                  </span>
                </Link>

                {/* Admin Login Button */}
                <Link
                  href="/admin/login?role=admin"
                  className={`group relative p-2.5 rounded-xl transition-all duration-300 ${
                    scrolled || theme === "dark"
                      ? "bg-white/10 hover:bg-white/20 border border-white/15 text-white hover:text-blue-400"
                      : "bg-black/5 hover:bg-black/10 border border-black/10 text-slate-700 hover:text-blue-600"
                  }`}
                  aria-label="Admin Portal"
                >
                  <UserCog size={14} />
                  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap pointer-events-none">
                    Admin Login
                  </span>
                </Link>
              </div>
            )}
            {isLoggedIn && (
              <Link
                href="/admin/dashboard"
                className="hidden md:flex btn-primary text-xs"
              >
                Dashboard
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl border border-white/20 text-white bg-white/5"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Mega Menu Dropdown */}
        {hoveringProducts && (
          <div 
            className="absolute top-20 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-900 shadow-2xl py-10 z-50 transition-all duration-300"
            onMouseEnter={() => setHoveringProducts(true)}
            onMouseLeave={() => setHoveringProducts(false)}
          >
            <div className="container-px max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-8">
              {categories.map((c) => {
                const subcats = c.subcategories ? c.subcategories.split(",").map(s => s.trim()).filter(Boolean) : [];
                return (
                  <div key={c.id} className="space-y-3.5">
                    <Link 
                      href={`/shop?category=${c.slug}`}
                      className="block text-xs font-black uppercase tracking-widest text-ink hover:text-primary transition-colors border-b border-neutral-100 dark:border-neutral-800/80 pb-2"
                    >
                      {c.name}
                    </Link>
                    <ul className="space-y-2">
                      {subcats.map((s, idx) => (
                        <li key={idx}>
                          <Link 
                            href={`/shop?category=${c.slug}&sub=${encodeURIComponent(s)}`}
                            className="text-[11px] font-semibold text-neutral-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors block py-0.5"
                          >
                            {s}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              {/* All Products Column */}
              <div className="space-y-3.5">
                <Link 
                  href="/shop"
                  className="block text-xs font-black uppercase tracking-widest text-ink hover:text-primary transition-colors border-b border-neutral-100 dark:border-neutral-800/80 pb-2"
                >
                  All Products
                </Link>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/shop"
                      className="text-[11px] font-bold text-primary dark:text-emerald-400 hover:underline transition-colors block py-0.5"
                    >
                      Browse Catalogue
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 glass-dark flex flex-col pt-24 px-8 pb-8 gap-6 overflow-y-auto">
            
            {/* Primary navigation */}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-bold tracking-widest uppercase text-white/80 hover:text-white border-b border-white/10 pb-4 transition-colors"
            >
              Home
            </Link>

            {/* Mobile Categories list */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-black tracking-widest uppercase text-white/40 border-b border-white/5 pb-1">
                Products Categories
              </span>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${c.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-xs font-bold tracking-widest uppercase text-white/80 hover:text-white pl-4 py-1"
                >
                  {c.name}
                </Link>
              ))}
              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="text-xs font-bold tracking-widest uppercase text-primary pl-4 py-1"
              >
                All Products
              </Link>
            </div>

            <Link
              href="/what-we-do"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-bold tracking-widest uppercase text-white/80 hover:text-white border-b border-white/10 pb-4 transition-colors"
            >
              What We Do
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-bold tracking-widest uppercase text-white/80 hover:text-white border-b border-white/10 pb-4 transition-colors"
            >
              About Us
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-bold tracking-widest uppercase text-white/80 hover:text-white border-b border-white/10 pb-4 transition-colors"
            >
              Contact Us
            </Link>

            {/* Mobile download catalogue CTA */}
            <a
              href={catalogueUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-1.5 bg-[#e11d48] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              <ArrowDownToLine size={14} />
              <span>Download Catalogue</span>
            </a>

            <div className="flex justify-center mt-2">
              <PWAInstallPrompt />
            </div>

            {/* Dashboard / Login */}
            <Link
              href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
              onClick={() => setMobileOpen(false)}
              className="btn-primary text-center mt-4"
            >
              {isLoggedIn ? "Dashboard" : "Portal Login"}
            </Link>
          </div>
        </div>
      )}

      <AIGiftFinder isOpen={showAIFinder} onClose={() => setShowAIFinder(false)} />
    </>
  );
}
