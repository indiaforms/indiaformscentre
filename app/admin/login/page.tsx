"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminLogin } from "@/lib/api";
import { Lock, User, Briefcase, UserCog } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role"); // "admin" or "employee"

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem("admin_token")) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminLogin(username, password);

      // Enforce role checks on portal login
      if (roleParam === "admin" && res.role !== "admin") {
        throw new Error("Access denied. This login is reserved for administrators.");
      }
      if (roleParam === "employee" && res.role !== "employee") {
        throw new Error("Access denied. This login is reserved for employee accounts.");
      }

      localStorage.setItem("admin_token", res.access_token);
      localStorage.setItem("user_role", res.role);
      localStorage.setItem("username", res.username);
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid username or password credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Determine portal branding elements based on URL query
  let portalTitle = "Partner Portal Login";
  let portalSubtitle = "Admin and Employee Access";
  let iconGradient = "from-blue-700 to-emerald-600";
  let PortalIcon = Briefcase;
  let accentColorClass = "focus:border-primary";
  let buttonBgClass = "bg-primary hover:bg-opacity-95";

  if (roleParam === "admin") {
    portalTitle = "Admin Portal Login";
    portalSubtitle = "Administrator Access Only";
    iconGradient = "from-blue-700 to-indigo-600";
    PortalIcon = UserCog;
    accentColorClass = "focus:border-blue-600";
    buttonBgClass = "bg-blue-600 hover:bg-blue-700";
  } else if (roleParam === "employee") {
    portalTitle = "Employee Portal Login";
    portalSubtitle = "Staff & Employee Access";
    iconGradient = "from-emerald-600 to-teal-500";
    PortalIcon = Briefcase;
    accentColorClass = "focus:border-emerald-600";
    buttonBgClass = "bg-emerald-600 hover:bg-emerald-700";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6 transition-colors duration-300">
      <div className="w-full max-w-md bg-card border border-border p-10 rounded-3xl shadow-sm space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className={`w-12 h-12 bg-gradient-to-tr ${iconGradient} text-white rounded-2xl flex items-center justify-center mx-auto shadow-md`}>
            <PortalIcon size={22} className="text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-widest uppercase text-ink">
            {portalTitle}
          </h1>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-semibold">
            {portalSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" size={16} />
            <input
              className={`w-full bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-700/50 ${accentColorClass} outline-none rounded-xl pl-11 pr-4 py-3.5 text-xs text-ink placeholder:text-neutral-400`}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" size={16} />
            <input
              className={`w-full bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-700/50 ${accentColorClass} outline-none rounded-xl pl-11 pr-4 py-3.5 text-xs text-ink placeholder:text-neutral-400`}
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs font-semibold text-center">{error}</p>}

          <button 
            type="submit"
            className={`w-full ${buttonBgClass} text-white text-xs font-bold uppercase tracking-wider py-4 rounded-xl transition-all shadow-sm disabled:opacity-50`} 
            disabled={loading}
          >
            {loading ? "Verifying Credentials…" : "Sign In to Portal"}
          </button>
        </form>
        
        <div className="text-center pt-2">
          <a href="/" className="text-xs text-neutral-400 hover:text-primary dark:text-neutral-500 dark:hover:text-primary underline">
            Return to Storefront
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 animate-pulse">
          Loading login portal...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

