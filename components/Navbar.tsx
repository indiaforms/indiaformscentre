import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur border-b border-black/5">
      <nav className="container-px flex items-center justify-between h-20">
        <Link href="/" className="text-xl font-semibold tracking-widest uppercase">
          IndiaForms Centre
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm tracking-wide uppercase">
          <Link href="/" className="hover:opacity-60 transition-opacity">Home</Link>
          <Link href="/shop" className="hover:opacity-60 transition-opacity">Shop</Link>
          <Link href="/#about" className="hover:opacity-60 transition-opacity">About</Link>
          <Link href="/#contact" className="hover:opacity-60 transition-opacity">Contact</Link>
        </div>
        <Link href="/admin/login" className="text-sm tracking-wide uppercase hover:opacity-60 transition-opacity">
          Admin
        </Link>
      </nav>
    </header>
  );
}
