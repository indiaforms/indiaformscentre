export default function Footer() {
  return (
    <footer id="contact" className="bg-ink text-white pt-24 pb-12 border-t border-neutral-900 mt-24">
      <div className="container-px max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-ink font-bold text-lg">
              F
            </div>
            <span className="text-lg font-bold tracking-widest uppercase text-white">
              FUZO <span className="font-light text-neutral-400">CENTRE</span>
            </span>
          </div>
          <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
            Premium corporate gifting solutions tailored for modern businesses. We curate design-led, high-utility items that elevate brand value.
          </p>
        </div>
        
        <div>
          <h4 className="text-xs tracking-widest uppercase mb-6 text-neutral-300 font-bold">Product Categories</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li><a href="/shop?category=lifestyle" className="hover:text-white transition-colors">Lifestyle Essentials</a></li>
            <li><a href="/shop?category=travel" className="hover:text-white transition-colors">Travel Gear</a></li>
            <li><a href="/shop?category=office-essentials" className="hover:text-white transition-colors">Office & Desk Utilities</a></li>
            <li><a href="/shop?category=gadgets" className="hover:text-white transition-colors">Tech & Smart Gadgets</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-xs tracking-widest uppercase mb-6 text-neutral-300 font-bold">Contact & Support</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li>
              <span className="block text-xs text-neutral-500 uppercase">Corporate Email</span>
              <a href="mailto:corporate@fuzocentre.in" className="hover:text-white transition-colors">corporate@fuzocentre.in</a>
            </li>
            <li>
              <span className="block text-xs text-neutral-500 uppercase">Support Helpline</span>
              <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
            </li>
            <li>
              <span className="block text-xs text-neutral-500 uppercase">WhatsApp Inquiry</span>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-green-400 font-medium">Chat on WhatsApp</a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container-px max-w-7xl mx-auto border-t border-neutral-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
        <div>
          © {new Date().getFullYear()} FUZO Centre. All rights reserved. Premium Corporate Merchandise.
        </div>
        <div className="flex gap-6">
          <a href="/#about" className="hover:text-neutral-400 transition-colors">About Us</a>
          <a href="/admin/login" className="hover:text-neutral-400 transition-colors">Partner Portal</a>
        </div>
      </div>
    </footer>
  );
}
