"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api";
import { Lock, User } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md bg-white border border-neutral-100 p-10 rounded-3xl shadow-sm space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-ink text-white rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
            F
          </div>
          <h1 className="text-lg font-bold tracking-widest uppercase text-ink">
            Partner Portal Login
          </h1>
          <p className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
            Admin and Employee Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              className="w-full bg-neutral-50 border border-neutral-200 focus:border-ink outline-none rounded-xl pl-11 pr-4 py-3.5 text-xs text-ink placeholder:text-neutral-300"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              className="w-full bg-neutral-50 border border-neutral-200 focus:border-ink outline-none rounded-xl pl-11 pr-4 py-3.5 text-xs text-ink placeholder:text-neutral-300"
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
            className="w-full bg-ink text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider py-4 rounded-xl transition-all shadow-sm disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? "Verifying Credentials…" : "Sign In to Portal"}
          </button>
        </form>
        
        <div className="text-center pt-2">
          <a href="/" className="text-xs text-neutral-400 hover:text-ink underline">
            Return to Storefront
          </a>
        </div>
      </div>
    </div>
  );
}
