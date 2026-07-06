export default function Footer() {
  return (
    <footer id="contact" className="bg-ink text-white mt-24">
      <div className="container-px py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-lg tracking-widest uppercase mb-4">IndiaForms Centre</h3>
          <p className="text-sm text-white/60 max-w-xs">
            Thoughtfully curated products, designed for everyday use.
          </p>
        </div>
        <div>
          <h4 className="text-sm tracking-wide uppercase mb-4 text-white/80">Quick Links</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><a href="/shop" className="hover:text-white">All Products</a></li>
            <li><a href="/#about" className="hover:text-white">About Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm tracking-wide uppercase mb-4 text-white/80">Contact</h4>
          <p className="text-sm text-white/60">care@indiaformscentre.in</p>
          <p className="text-sm text-white/60">+91 00000 00000</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} IndiaForms Centre. All rights reserved.
      </div>
    </footer>
  );
}
