"use client";

import { useState } from "react";
import { submitEnquiry } from "@/lib/api";
import { Send, CheckCircle2, MessageSquare, User, Building2, Phone, Mail, FileText } from "lucide-react";

type EnquiryFormProps = {
  productId?: number;
  productName?: string;
  onSuccess?: () => void;
  className?: string;
};

export default function EnquiryForm({ productId, productName, onSuccess, className = "" }: EnquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: productName
      ? `Hi, we would like to enquire about bulk ordering of "${productName}".`
      : "Hi, we are looking for premium corporate gifts and would like to get a quote.",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await submitEnquiry({ ...formData, product_id: productId });
      const targetPhone = "919876543210";
      const text = `*New Corporate Enquiry (ID: #${result.id})*\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Company:* ${formData.company || "—"}\n*Phone:* ${formData.phone}\n*Product:* ${productName || "General Gifting Query"}\n*Message:* ${formData.message}`;
      setWhatsappUrl(`https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={`p-8 text-center space-y-6 ${className}`} style={{ background: "rgba(13,21,38,0.95)" }}>
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: "2s" }} />
          </div>
          <div className="relative w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 size={32} />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black tracking-tight text-white">Enquiry Received!</h3>
          <p className="text-sm text-slate-400">Your corporate request has been saved in our system. We&apos;ll reach out shortly.</p>
        </div>
        <button
          onClick={() => whatsappUrl && window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
          className="w-full flex items-center justify-center gap-3 font-bold text-sm tracking-wide uppercase py-4 rounded-2xl transition-all duration-300"
          style={{ background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 8px 24px rgba(16,185,129,0.30)" }}
        >
          <MessageSquare size={16} />
          Connect via WhatsApp
        </button>
        <p className="text-[11px] text-slate-600">Click above to continue the conversation directly with our sales team.</p>
      </div>
    );
  }

  const inputBase = "w-full outline-none text-xs font-medium text-white placeholder:text-slate-600 transition-all duration-200 rounded-xl px-4 py-3 pl-10";
  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(59,130,246,0.15)",
  };

  return (
    <div className={`p-8 space-y-6 ${className}`} style={{ background: "rgba(13,21,38,0.95)" }}>
      <div className="space-y-1">
        <h3 className="text-base font-black tracking-wide uppercase text-white">
          {productName ? "Bulk Quote Request" : "Corporate Gifting Enquiry"}
        </h3>
        <p className="text-[11px] text-slate-500">Fill out the form and we&apos;ll respond within 2 hours.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name */}
        <div className="relative">
          <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500/60" />
          <input
            type="text" required
            className={inputBase}
            style={inputStyle}
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500/60" />
            <input
              type="email" required
              className={inputBase}
              style={inputStyle}
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
          <div className="relative">
            <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500/60" />
            <input
              type="tel" required
              className={inputBase}
              style={inputStyle}
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        {/* Company */}
        <div className="relative">
          <Building2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500/60" />
          <input
            type="text"
            className={inputBase}
            style={inputStyle}
            placeholder="Company Name (optional)"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {/* Message */}
        <div className="relative">
          <FileText size={13} className="absolute left-3.5 top-3.5 text-blue-500/60" />
          <textarea
            required rows={4}
            className={`${inputBase} resize-none`}
            style={{ ...inputStyle, paddingTop: "12px" }}
            placeholder="Describe your requirements (quantity, customization, timeline)..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 font-bold text-xs tracking-widest uppercase py-4 rounded-xl transition-all duration-300 disabled:opacity-50 text-white"
          style={{
            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
            boxShadow: "0 4px 20px rgba(29,78,216,0.35)",
          }}
        >
          {submitting ? (
            <span className="animate-pulse">Submitting...</span>
          ) : (
            <>
              Submit Enquiry
              <Send size={13} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
