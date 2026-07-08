"use client";

import { useState } from "react";
import { submitEnquiry } from "@/lib/api";
import { Send, CheckCircle2, MessageSquare } from "lucide-react";

type EnquiryFormProps = {
  productId?: number;
  productName?: string;
  onSuccess?: () => void;
  className?: string;
};

export default function EnquiryForm({
  productId,
  productName,
  onSuccess,
  className = "",
}: EnquiryFormProps) {
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
      // Save to database via API
      const result = await submitEnquiry({
        ...formData,
        product_id: productId,
      });

      // Prepare WhatsApp redirection link
      const targetPhone = "919876543210"; // corporate whatsapp number
      const text = `*New Corporate Enquiry (ID: #${result.id})*\n` +
        `*Name:* ${formData.name}\n` +
        `*Email:* ${formData.email}\n` +
        `*Company:* ${formData.company || "—"}\n` +
        `*Phone:* ${formData.phone}\n` +
        `*Product:* ${productName || "General Gifting Query"}\n` +
        `*Message:* ${formData.message}`;
      
      const encoded = encodeURIComponent(text);
      const waLink = `https://wa.me/${targetPhone}?text=${encoded}`;
      
      setWhatsappUrl(waLink);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsappRedirect = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (success) {
    return (
      <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl p-8 text-center space-y-6 shadow-2xl max-w-xl mx-auto animate-fade-in border border-slate-800 dark:border-slate-700">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-wide uppercase">Enquiry Received</h3>
          <p className="text-sm text-slate-300">
            Thank you! Your corporate request has been saved in our system.
          </p>
        </div>
        <div className="pt-4 space-y-3">
          <button
            onClick={handleWhatsappRedirect}
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold tracking-wider uppercase py-4 rounded-full transition-all shadow-lg hover:shadow-emerald-950/20"
          >
            <MessageSquare size={18} />
            Connect via WhatsApp
          </button>
          <p className="text-[11px] text-slate-400">
            Click above to route this request instantly to our corporate gifting sales lead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-2xl p-8 shadow-sm ${className}`}>
      <h3 className="text-lg font-bold tracking-wider uppercase mb-6 text-ink">
        {productName ? "Bulk Quote Request" : "Corporate Gifting Enquiry"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            className="w-full border border-neutral-200 dark:border-neutral-700/50 bg-white dark:bg-slate-900 focus:border-primary outline-none rounded-xl px-4 py-3 text-sm transition-colors text-ink placeholder:text-neutral-400"
            placeholder="John Doe"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              className="w-full border border-neutral-200 dark:border-neutral-700/50 bg-white dark:bg-slate-900 focus:border-primary outline-none rounded-xl px-4 py-3 text-sm transition-colors text-ink placeholder:text-neutral-400"
              placeholder="john@company.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 mb-1.5">
              Mobile Number
            </label>
            <input
              type="tel"
              className="w-full border border-neutral-200 dark:border-neutral-700/50 bg-white dark:bg-slate-900 focus:border-primary outline-none rounded-xl px-4 py-3 text-sm transition-colors text-ink placeholder:text-neutral-400"
              placeholder="+91 98765 43210"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 mb-1.5">
            Company Name
          </label>
          <input
            type="text"
            className="w-full border border-neutral-200 dark:border-neutral-700/50 bg-white dark:bg-slate-900 focus:border-primary outline-none rounded-xl px-4 py-3 text-sm transition-colors text-ink placeholder:text-neutral-400"
            placeholder="ACME Corp"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 mb-1.5">
            Requirements / Quantity
          </label>
          <textarea
            className="w-full border border-neutral-200 dark:border-neutral-700/50 bg-white dark:bg-slate-900 focus:border-primary outline-none rounded-xl px-4 py-3 text-sm transition-colors text-ink placeholder:text-neutral-400"
            placeholder="Describe your corporate gifting requirement (e.g. quantity, printing needs, timeline)..."
            rows={4}
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white hover:bg-opacity-95 text-sm font-semibold tracking-wider uppercase py-4 rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Submit Enquiry"}
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
