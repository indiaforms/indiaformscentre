import Link from "next/link";
import type { Product } from "@/lib/api";

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock_status === "out_of_stock";

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block"
      aria-disabled={soldOut}
    >
      <div className="relative aspect-square bg-white rounded-2xl overflow-hidden mb-4">
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
          <div className="w-full h-full flex items-center justify-center text-neutral-300 text-sm">
            No image
          </div>
        )}
        {soldOut && (
          <span className="absolute top-3 left-3 bg-ink text-white text-[11px] tracking-wide uppercase px-3 py-1 rounded-full">
            Sold Out
          </span>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium tracking-wide uppercase">{product.name}</h3>
        <span className="text-sm text-neutral-500">₹{product.price.toLocaleString("en-IN")}</span>
      </div>
      {product.category && (
        <p className="text-xs text-neutral-400 mt-1">{product.category.name}</p>
      )}
    </Link>
  );
}
