"use client";

const services = [
  {
    icon: "palette",
    title: "Live Logo Preview",
    desc: "Upload your brand assets and preview laser engraving or digital printing in real time before bulk ordering.",
    gradient: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
    glow: "rgba(59,130,246,0.35)",
  },
  {
    icon: "package",
    title: "Custom Gift Sets",
    desc: "Curate bespoke onboarding kits or client appreciation sets, tailored to your budget, theme, and timeline.",
    gradient: "linear-gradient(135deg, #059669, #34d399)",
    glow: "rgba(16,185,129,0.35)",
  },
  {
    icon: "shield",
    title: "Verified Quality",
    desc: "All products undergo strict QA checks for premium finishing, durable construction, and brand alignment.",
    gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    glow: "rgba(139,92,246,0.35)",
  },
  {
    icon: "globe",
    title: "Pan-India Delivery",
    desc: "Multi-location employee distributions, onboarding drops, and global deliveries from our central hub.",
    gradient: "linear-gradient(135deg, #d97706, #fbbf24)",
    glow: "rgba(245,158,11,0.35)",
  },
];

const iconMap: Record<string, React.ReactNode> = {
  palette: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  ),
  package: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
    </svg>
  ),
};

export default function ServiceCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {services.map((service, i) => (
        <div
          key={i}
          className="group relative rounded-3xl p-6 space-y-5 cursor-default shimmer-card overflow-hidden"
          style={{
            background: "rgba(13,21,38,0.8)",
            border: "1px solid rgba(59,130,246,0.12)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-8px) perspective(800px) rotateX(4deg)";
            (e.currentTarget as HTMLElement).style.boxShadow = `0 30px 60px ${service.glow}, 0 8px 24px rgba(0,0,0,0.3)`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "";
            (e.currentTarget as HTMLElement).style.boxShadow = "";
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
            style={{ background: service.gradient, boxShadow: `0 8px 24px ${service.glow}` }}
          >
            {iconMap[service.icon]}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold tracking-wide uppercase text-white">{service.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{service.desc}</p>
          </div>
          <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      ))}
    </div>
  );
}
