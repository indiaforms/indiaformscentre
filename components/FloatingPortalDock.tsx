"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserCog, Briefcase, LayoutDashboard } from "lucide-react";

export default function FloatingPortalDock() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {isLoggedIn ? (
        <Link
          href="/admin/dashboard"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl hover:scale-110 transition-all duration-300 border border-white/10"
        >
          <LayoutDashboard size={20} />
          {/* Tooltip */}
          <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 dark:bg-slate-800 text-white text-[9px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap pointer-events-none">
            Go to Dashboard
          </span>
        </Link>
      ) : (
        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800/80 p-1.5 rounded-2xl shadow-xl">
          {/* Employee Login Button */}
          <Link
            href="/admin/login?role=employee"
            className="group relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-sm hover:scale-105 transition-all duration-300"
            aria-label="Employee Portal Login"
          >
            <Briefcase size={15} />
            {/* Tooltip */}
            <span className="absolute right-12 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 dark:bg-slate-800 text-white text-[9px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap pointer-events-none">
              Employee Portal
            </span>
          </Link>

          {/* Admin Login Button */}
          <Link
            href="/admin/login?role=admin"
            className="group relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white shadow-sm hover:scale-105 transition-all duration-300"
            aria-label="Admin Portal Login"
          >
            <UserCog size={15} />
            {/* Tooltip */}
            <span className="absolute right-12 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 dark:bg-slate-800 text-white text-[9px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap pointer-events-none">
              Admin Portal
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
