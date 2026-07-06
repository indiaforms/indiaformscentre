"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const role = localStorage.getItem("user_role");
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role || "employee");
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 transition-all duration-300">
      <nav className="container-px flex items-center justify-between h-20 max-w-7xl mx-auto">
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center text-white font-bold text-lg tracking-tighter">
            F
          </div>
          <span className="text-lg font-bold tracking-widest uppercase text-ink group-hover:opacity-75 transition-opacity">
            FUZO <span className="font-light text-neutral-500">CENTRE</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase">
          <Link href="/" className="text-neutral-700 hover:text-ink transition-colors">Home</Link>
          <Link href="/shop" className="text-neutral-700 hover:text-ink transition-colors">Catalogue</Link>
          <Link href="/#about" className="text-neutral-700 hover:text-ink transition-colors">About Us</Link>
          <Link href="/#contact" className="text-neutral-700 hover:text-ink transition-colors">Enquire</Link>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link 
              href="/admin/dashboard" 
              className="text-xs font-semibold tracking-widest uppercase bg-ink text-white px-5 py-2.5 rounded-full hover:bg-neutral-800 transition-all shadow-sm"
            >
              Dashboard ({userRole})
            </Link>
          ) : (
            <Link 
              href="/admin/login" 
              className="text-xs font-semibold tracking-widest uppercase border border-neutral-200 text-neutral-700 px-5 py-2.5 rounded-full hover:bg-neutral-50 hover:text-ink transition-all"
            >
              Portal Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
