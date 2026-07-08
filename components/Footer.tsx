import { Briefcase } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-900 text-white pt-24 pb-12 border-t border-slate-950 mt-24">
      <div className="container-px max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
              <Briefcase size={16} />
            </div>
            <span className="text-lg font-bold tracking-widest uppercase text-white">
              India Forms <span className="font-light text-slate-400">Center</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            Premium corporate gifting solutions tailored for modern businesses. We curate design-led, high-utility items that elevate brand value.
          </p>
        </div>
        
        <div>
          <h4 className="text-xs tracking-widest uppercase mb-6 text-slate-300 font-bold">Product Catalogues</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li><a href="/shop?category=lifestyle" className="hover:text-white transition-colors">Lifestyle Essentials</a></li>
            <li><a href="/shop?category=travel" className="hover:text-white transition-colors">Travel Gear</a></li>
            <li><a href="/shop?category=office-essentials" className="hover:text-white transition-colors">Office & Desk Utilities</a></li>
            <li><a href="/shop?category=gadgets" className="hover:text-white transition-colors">Tech & Smart Gadgets</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-xs tracking-widest uppercase mb-6 text-slate-300 font-bold">Contact & Support</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Corporate Email</span>
              <a href="mailto:corporate@indiaformscenter.in" className="hover:text-white transition-colors">corporate@indiaformscenter.in</a>
            </li>
            <li>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Support Helpline</span>
              <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
            </li>
            <li>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">WhatsApp Inquiry</span>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-green-400 font-medium">Chat on WhatsApp</a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container-px max-w-7xl mx-auto border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          © {new Date().getFullYear()} India Forms Center. All rights reserved. Premium Corporate Merchandise.
        </div>
        <div className="flex gap-6">
          <a href="/#about" className="hover:text-slate-400 transition-colors">About Us</a>
          <a href="/admin/login" className="hover:text-slate-400 transition-colors">Partner Portal</a>
        </div>
      </div>
    </footer>
  );
}
