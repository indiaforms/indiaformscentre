"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated floating particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; color: string }[] = [];
    const colors = ["rgba(59,130,246,", "rgba(16,185,129,", "rgba(99,102,241,"];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #020812 0%, #06102a 40%, #020c1e 70%, #060b18 100%)" }}>

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Layered Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(ellipse, rgba(29,78,216,0.18) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(ellipse, rgba(5,150,105,0.14) 0%, transparent 70%)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full pointer-events-none z-0 opacity-30" style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 60%)", filter: "blur(40px)" }} />

      {/* 3D Grid Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-48" style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: "perspective(400px) rotateX(70deg)",
          transformOrigin: "bottom center",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
        }} />
      </div>

      {/* Floating 3D Glass Cards in Background */}
      <div className="absolute top-24 right-[8%] w-52 animate-float pointer-events-none z-[1] hidden lg:block" style={{ animationDelay: "0s" }}>
        <div className="glass-dark rounded-2xl p-4 glow-blue" style={{ transform: "perspective(600px) rotateY(-12deg) rotateX(6deg)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-bold tracking-widest uppercase text-emerald-400">Live Orders</span>
          </div>
          <div className="text-2xl font-black text-white">2,847</div>
          <div className="text-[10px] text-slate-400 mt-1">Corporate kits shipped</div>
          <div className="mt-3 h-1 rounded-full bg-white/10">
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-32 left-[8%] w-44 animate-float pointer-events-none z-[1] hidden lg:block" style={{ animationDelay: "1.5s" }}>
        <div className="glass-dark rounded-2xl p-4" style={{ transform: "perspective(600px) rotateY(10deg) rotateX(-4deg)" }}>
          <div className="text-[9px] font-bold tracking-widest uppercase text-blue-400 mb-2">Satisfaction</div>
          <div className="text-2xl font-black text-white">98.6%</div>
          <div className="flex gap-1 mt-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="text-amber-400 text-xs">★</div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-36 left-[10%] w-40 animate-float-slow pointer-events-none z-[1] hidden lg:block" style={{ animationDelay: "3s" }}>
        <div className="glass-dark rounded-2xl p-3" style={{ transform: "perspective(600px) rotateY(8deg) rotateX(8deg)" }}>
          <div className="text-[9px] font-bold tracking-widest uppercase text-purple-400 mb-1">Pan India</div>
          <div className="text-lg font-black text-white">500+</div>
          <div className="text-[10px] text-slate-400">Corporate clients</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center container-px max-w-5xl mx-auto pt-32 pb-16 space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-dark rounded-full px-5 py-2 glow-blue">
          <Sparkles size={12} className="text-blue-400" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-blue-300">
            Design-Led • Purpose-Built • Customized
          </span>
          <Sparkles size={12} className="text-emerald-400" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-white">
          Elevate Your
          <br />
          <span className="gradient-text">Brand Identity</span>
          <br />
          <span className="font-light text-white/70">with Premium Gifts</span>
        </h1>

        {/* Subtext */}
        <p className="text-base md:text-lg text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
          India Forms Center curates design-led, high-utility corporate merchandise — from executive desk kits to custom-branded tech accessories — tailored to your business identity.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          <Link href="/shop" className="btn-primary group">
            <span>Explore Catalogue</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="/#contact" className="btn-outline">
            Get Custom Quote
          </a>
        </div>

        {/* Trusted By Row */}
        <div className="pt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-700" />
            Trusted by leading brands across India
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-700" />
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Tata Group", "Infosys", "HCL Tech", "Wipro", "Cognizant"].map((brand) => (
              <span key={brand} className="text-[11px] font-black tracking-widest uppercase text-slate-600 hover:text-slate-400 transition-colors cursor-default">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-float-slow">
        <span className="text-[9px] tracking-[0.3em] uppercase text-slate-500">Scroll</span>
        <ChevronDown size={16} className="text-slate-500" />
      </div>
    </section>
  );
}
