"use client";

import { useState, useRef } from "react";
import { ImageIcon, Upload, CheckCircle, RefreshCw, Briefcase } from "lucide-react";
import EnquiryForm from "./EnquiryForm";
import type { Product } from "@/lib/api";

type Props = {
  product: Product;
};

export default function ProductDetailClient({ product }: Props) {
  const [logo, setLogo] = useState<string | null>(null);
  const [logoPos, setLogoPos] = useState({ x: 50, y: 50 }); // percentages
  const [logoSize, setLogoSize] = useState(30); // scale width percentage
  const [logoOpacity, setLogoOpacity] = useState(85);
  const [isDragging, setIsDragging] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const soldOut = product.stock_status === "out_of_stock";

  // Handle image upload and convert to base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogo(event.target.result as string);
          setLogoPos({ x: 50, y: 50 }); // Reset to center
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag interaction
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate percentage position relative to container
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Constraint boundaries (10% to 90% boundary mapping)
    const boundX = Math.max(5, Math.min(95, x));
    const boundY = Math.max(5, Math.min(95, y));
    
    setLogoPos({ x: boundX, y: boundY });
  };

  const clearLogo = () => {
    setLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-7xl mx-auto container-px py-12 transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 text-left">
        
        {/* Left: Product Media with Drag-and-Drop Mockup Overlay */}
        <div className="space-y-6">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            className="relative aspect-square bg-card rounded-3xl overflow-hidden border border-border shadow-sm flex items-center justify-center select-none group"
            style={{ cursor: isDragging ? "grabbing" : "default" }}
          >
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className={`w-full h-full object-cover pointer-events-none ${soldOut ? "grayscale opacity-60" : ""}`}
              />
            ) : (
              <div className="text-neutral-300 dark:text-neutral-600 flex flex-col items-center gap-2">
                <ImageIcon size={48} strokeWidth={1} />
                <span className="text-xs uppercase tracking-wider">No Preview Image</span>
              </div>
            )}

            {/* Custom Logo Overlay */}
            {logo && !soldOut && (
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 border border-dashed rounded-lg transition-shadow duration-200 select-none ${
                  isDragging ? "border-emerald-500 shadow-lg bg-white/20 dark:bg-slate-900/20 backdrop-blur-[2px]" : "border-white/50 hover:border-emerald-400 cursor-grab"
                }`}
                style={{
                  left: `${logoPos.x}%`,
                  top: `${logoPos.y}%`,
                  width: `${logoSize}%`,
                  opacity: logoOpacity / 100,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt="Branding Logo" className="w-full h-auto pointer-events-none" />
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  Drag to Position
                </span>
              </div>
            )}

            {soldOut && (
              <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow">
                Sold Out
              </div>
            )}
            
            {!soldOut && logo && (
              <button 
                onClick={clearLogo}
                className="absolute top-4 right-4 bg-white/95 dark:bg-slate-800/95 text-neutral-600 dark:text-neutral-300 hover:text-ink text-xs px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-neutral-100 dark:border-slate-700/50 backdrop-blur transition-all"
              >
                <RefreshCw size={12} />
                Reset Logo
              </button>
            )}
          </div>

          {/* Logo Customizer Controls Widget */}
          {!soldOut && (
            <div className="bg-neutral-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-neutral-100 dark:border-slate-800/60 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-slate-700/50 pb-3">
                <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 flex items-center gap-2">
                  <Upload size={14} />
                  Custom Branding Mockup
                </h3>
                {logo && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle size={10} /> Logo Active
                  </span>
                )}
              </div>

              {!logo ? (
                <div className="text-center py-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="mx-auto inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold tracking-wider uppercase px-6 py-3 rounded-full hover:bg-opacity-95 transition-all cursor-pointer shadow-sm"
                  >
                    <Upload size={14} />
                    Upload Company Logo
                  </label>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-3">
                    Supports transparent PNG, SVG, or JPG. Drag logo on image to position.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">
                      <span>Logo Scale ({logoSize}%)</span>
                      <span className="text-ink">{logoSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={logoSize}
                      onChange={(e) => setLogoSize(Number(e.target.value))}
                      className="w-full h-1 bg-neutral-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">
                      <span>Logo Opacity ({logoOpacity}%)</span>
                      <span className="text-ink">{logoOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={logoOpacity}
                      onChange={(e) => setLogoOpacity(Number(e.target.value))}
                      className="w-full h-1 bg-neutral-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div className="flex justify-between gap-4 pt-2">
                    <button
                      onClick={() => setLogoPos({ x: 50, y: 50 })}
                      className="flex-1 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 py-2.5 rounded-xl transition-all"
                    >
                      Center Alignment
                    </button>
                    <button
                      onClick={clearLogo}
                      className="flex-1 bg-red-50 dark:bg-red-950/10 hover:bg-red-100 dark:hover:bg-red-950/20 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 py-2.5 rounded-xl transition-all"
                    >
                      Remove Logo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Product Details & Request Quote */}
        <div className="space-y-8">
          <div>
            {product.category && (
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-primary">
                {product.category.name}
              </span>
            )}
            <h1 className="text-4xl font-light tracking-tight text-ink mt-2 mb-4">{product.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-ink">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">/ per unit (negotiable in bulk)</span>
            </div>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-400 dark:text-neutral-500">Description</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">{product.description}</p>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Availability</span>
                <span className={`text-sm font-semibold ${soldOut ? "text-red-500" : "text-emerald-600"}`}>
                  {soldOut ? "Out of Stock" : `In Stock (${product.quantity} units)`}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Branding Method</span>
                <span className="text-sm font-semibold text-ink">Laser Engraving, UV Print</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            {soldOut ? (
              <div className="space-y-4">
                <button
                  disabled
                  className="w-full bg-neutral-200 dark:bg-slate-800 text-neutral-400 dark:text-neutral-600 text-sm font-semibold tracking-wider uppercase py-4.5 rounded-full cursor-not-allowed text-center"
                >
                  Out of Stock
                </button>
                <p className="text-xs text-center text-neutral-400 dark:text-neutral-500">
                  Contact our support team to enquire about incoming stocks or restock dates.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {!showEnquiry ? (
                  <button
                    onClick={() => setShowEnquiry(true)}
                    className="w-full bg-primary text-white hover:bg-opacity-95 text-sm font-semibold tracking-wider uppercase py-4.5 rounded-full transition-all text-center shadow shadow-blue-500/10 hover:shadow-lg"
                  >
                    Request Bulk Price Quote
                  </button>
                ) : (
                  <div className="animate-fade-in">
                    <EnquiryForm
                      productId={product.id}
                      productName={product.name}
                      onSuccess={() => {
                        // Keep open
                      }}
                    />
                    <button
                      onClick={() => setShowEnquiry(false)}
                      className="w-full text-xs text-neutral-400 dark:text-neutral-500 underline text-center block mt-4 hover:text-ink"
                    >
                      Hide Quote Form
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
