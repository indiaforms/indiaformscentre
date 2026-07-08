"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sun, Moon, Briefcase, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [theme, setTheme] = useState("light");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const role = localStorage.getItem("user_role");
    if (token) { setIsLoggedIn(true); setUserRole(role || "employee"); }
    const activeTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(activeTheme);

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
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

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Catalogue" },
    { href: "/#about", label: "About Us" },
    { href: "/#contact", label: "Enquire" },
  ];

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
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-xs font-semibold tracking-[0.15em] uppercase text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 group-hover:w-full transition-all duration-300 rounded-full" />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
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

            {isLoggedIn ? (
              <Link
                href="/admin/dashboard"
                className="hidden md:flex btn-primary text-xs"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className={`hidden md:flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-xl transition-all duration-300 ${
                  scrolled || theme === "dark"
                    ? "border border-white/20 text-white bg-white/5 hover:bg-white/15 hover:border-white/35"
                    : "border border-black/10 text-slate-700 bg-white/60 hover:bg-white/90"
                }`}
              >
                Portal Login
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
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 glass-dark flex flex-col pt-24 px-8 pb-8 gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold tracking-widest uppercase text-white/80 hover:text-white border-b border-white/10 pb-4 transition-colors"
              >
                {link.label}
              </Link>
            ))}
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
    </>
  );
}
