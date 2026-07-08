"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, Briefcase } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const role = localStorage.getItem("user_role");
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role || "employee");
    }
    
    // Set theme state on load
    const activeTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(activeTheme);
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
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-neutral-100 dark:border-slate-800 transition-colors duration-300">
      <nav className="container-px flex items-center justify-between h-20 max-w-7xl mx-auto">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
            <Briefcase size={18} className="text-white" />
          </div>
          <span className="text-base font-extrabold tracking-wider uppercase text-ink">
            India Forms <span className="font-light text-neutral-400 dark:text-neutral-500">Center</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase text-ink">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/shop" className="hover:text-primary transition-colors">Catalogue</Link>
          <Link href="/#about" className="hover:text-primary transition-colors">About Us</Link>
          <Link href="/#contact" className="hover:text-primary transition-colors">Enquire</Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Light/Dark Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-slate-800 text-ink transition-colors border border-neutral-200 dark:border-neutral-700/50"
            aria-label="Toggle theme mode"
          >
            {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
          </button>

          {isLoggedIn ? (
            <Link 
              href="/admin/dashboard" 
              className="text-xs font-semibold tracking-widest uppercase bg-primary text-white px-5 py-2.5 rounded-full hover:bg-opacity-90 transition-all shadow-sm"
            >
              Dashboard ({userRole})
            </Link>
          ) : (
            <Link 
              href="/admin/login" 
              className="text-xs font-semibold tracking-widest uppercase border border-neutral-200 dark:border-neutral-700 text-ink px-5 py-2.5 rounded-full hover:bg-neutral-50 dark:hover:bg-slate-800 transition-all"
            >
              Portal
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
