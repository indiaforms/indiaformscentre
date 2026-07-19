"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Package, Loader2 } from "lucide-react";
import { submitGiftFinderQuery, type Product } from "@/lib/api";
import Link from "next/link";

export default function AIGiftFinder({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ message: string; products: Product[] } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await submitGiftFinderQuery(query);
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header / Input */}
        <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-indigo-50 to-white relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-neutral-400 hover:text-ink transition-colors"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-xl font-bold text-indigo-950 flex items-center gap-2 mb-4">
            <Sparkles className="text-indigo-500" size={24} /> 
            AI Gift Finder
          </h2>
          
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g., Eco-friendly tech gadgets under ₹500 for a team of 100 people..."
              className="w-full bg-white border-2 border-indigo-100 hover:border-indigo-200 focus:border-indigo-500 rounded-2xl pl-5 pr-14 py-4 text-sm text-ink outline-none transition-all shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 w-10 h-10 bg-indigo-500 hover:bg-indigo-600 disabled:bg-neutral-200 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
          {!results && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60 py-10">
              <Sparkles size={32} className="text-indigo-300" />
              <p className="text-sm font-medium text-neutral-500 max-w-xs">
                Describe the perfect corporate gift kit, and our AI will curate the best options for you.
              </p>
            </div>
          )}
          
          {loading && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                <Sparkles size={16} className="text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 animate-pulse">
                Curating your gifts...
              </p>
            </div>
          )}

          {results && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-indigo-100/50 border border-indigo-100 rounded-xl p-4 text-indigo-900 text-sm leading-relaxed font-medium">
                {results.message}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.products.map((p) => (
                  <Link href={`/shop/${p.slug}`} key={p.id} onClick={onClose} className="group flex items-center gap-4 bg-white border border-neutral-200 rounded-xl p-3 hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="w-20 h-20 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                      {p.image_url ? (
                         <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-ink truncate group-hover:text-indigo-600 transition-colors">{p.name}</h4>
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">{p.category?.name || "Uncategorized"}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-indigo-700">₹{p.price}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          p.quantity > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        }`}>
                          {p.quantity > 0 ? `${p.quantity} Left` : "Out"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
