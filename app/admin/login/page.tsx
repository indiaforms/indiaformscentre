"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api";
import { Lock, User, Briefcase } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6 transition-colors duration-300">
      <div className="w-full max-w-md bg-card border border-border p-10 rounded-3xl shadow-sm space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-700 to-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Briefcase size={22} className="text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-widest uppercase text-ink">
            Partner Portal Login
          </h1>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-semibold">
            Admin and Employee Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" size={16} />
            <input
              className="w-full bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-700/50 focus:border-primary outline-none rounded-xl pl-11 pr-4 py-3.5 text-xs text-ink placeholder:text-neutral-400"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" size={16} />
            <input
              className="w-full bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-700/50 focus:border-primary outline-none rounded-xl pl-11 pr-4 py-3.5 text-xs text-ink placeholder:text-neutral-400"
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
            className="w-full bg-primary text-white hover:bg-opacity-95 text-xs font-bold uppercase tracking-wider py-4 rounded-xl transition-all shadow-sm disabled:opacity-50" 
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
