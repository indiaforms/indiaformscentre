import Link from "next/link";
import type { Product } from "@/lib/api";

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock_status === "out_of_stock";

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block bg-card border border-border/50 rounded-3xl p-4 transition-all hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-black/20 duration-300"
      aria-disabled={soldOut}
    >
      <div className="relative aspect-square bg-neutral-100 dark:bg-slate-900 rounded-2xl overflow-hidden mb-4 border border-neutral-100 dark:border-slate-800">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              soldOut ? "grayscale opacity-60" : ""
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 dark:text-neutral-600 text-xs tracking-wider uppercase font-semibold">
            No Image
          </div>
        )}
        {soldOut && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-sm">
            Sold Out
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {product.category && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
            {product.category.name}
          </span>
        )}
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold tracking-wide uppercase text-ink group-hover:text-primary transition-colors truncate">
            {product.name}
          </h3>
          <span className="text-sm font-bold text-ink shrink-0">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </Link>
  );
}
