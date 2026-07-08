"use client";

import Link from "next/link";
import type { Product } from "@/lib/api";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock_status === "out_of_stock";
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxTilt = 12;
    setRotateY(((x - centerX) / centerX) * maxTilt);
    setRotateX(((centerY - y) / centerY) * maxTilt);
    setGlowX((x / rect.width) * 100);
    setGlowY((y / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setHovered(false);
  };

  return (
    <Link
      ref={cardRef}
      href={`/shop/${product.slug}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      aria-disabled={soldOut}
      className="group relative block shimmer-card"
      style={{
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${hovered ? "translateZ(8px)" : "translateZ(0)"}`,
        transition: hovered ? "transform 0.08s ease" : "transform 0.5s ease",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Gradient border glow on hover */}
      <div
        className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(59,130,246,0.5), rgba(16,185,129,0.3), transparent 70%)`,
        }}
      />

      {/* Card body */}
      <div
        className="relative z-10 rounded-3xl overflow-hidden"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          boxShadow: hovered
            ? `0 25px 60px rgba(29,78,216,0.18), 0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(59,130,246,0.15)`
            : "0 4px 20px rgba(0,0,0,0.06)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Image container */}
        <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${soldOut ? "grayscale opacity-50" : ""}`}
              style={{ transform: hovered ? `translateZ(20px) scale(1.08)` : "translateZ(0) scale(1)" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 dark:text-neutral-600 text-xs tracking-wider uppercase font-semibold">
              No Image
            </div>
          )}

          {/* Overlay shimmer */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* View arrow */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md transform translate-y-2 group-hover:translate-y-0">
            <ArrowUpRight size={14} className="text-slate-700 dark:text-white" />
          </div>

          {soldOut && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
              Sold Out
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          {product.category && (
            <span className="text-[9px] uppercase font-black tracking-[0.2em] text-primary">
              {product.category.name}
            </span>
          )}
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-bold tracking-tight text-ink group-hover:text-primary transition-colors duration-300 truncate">
              {product.name}
            </h3>
            <span className="text-sm font-black text-ink shrink-0">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
