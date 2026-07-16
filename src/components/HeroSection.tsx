"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, MessageSquare, Zap } from "lucide-react";
import Canvas3D from "./Canvas3D";

function StatCounter({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      setCount(value * progress);
      if (progress === 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="flex flex-col">
      <span className="font-display text-3xl sm:text-4xl font-black text-text-main tracking-tight">
        {Math.floor(count).toLocaleString()}
        <span className="text-primary">{suffix}</span>
      </span>
      <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-1">{label}</span>
    </div>
  );
}

export default function HeroSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToProducts = () => {
    document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full bg-white overflow-hidden min-h-[90vh] flex items-center pt-8 pb-16">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Typography & CTAs */}
        <div className="lg:col-span-7 space-y-8 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest text-neon-glow w-fit">
              <Zap className="w-3.5 h-3.5 animate-pulse" /> 100% Brand-Authentic Seals
            </div>
            
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-text-main leading-[0.9] uppercase text-reveal-mask">
              Fuel Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-primary text-neon-glow">
                Wrath & Gain
              </span>
            </h1>
            
            <p className="text-text-muted text-sm sm:text-base leading-relaxed max-w-xl">
              Kurukshetra's ultimate supplement destination. Unlock certified international proteins, 
              intense pre-workouts, micronized creatine, and natural Badam Ragda. 
              Delivered straight to your university hostel.
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={scrollToProducts}
              className="btn-futuristic-primary group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-xs uppercase tracking-widest cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" /> Explore Supplements
            </button>
            
            <a
              href="https://wa.me/919588715527"
              target="_blank"
              className="btn-futuristic-secondary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-xs uppercase tracking-widest border border-primary/30"
            >
              <MessageSquare className="w-4 h-4 text-primary" /> Free Trainer Consult
            </a>
          </motion.div>

          {/* Statistics Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="pt-8 border-t border-gray-100 grid grid-cols-3 gap-6"
          >
            <StatCounter value={5000} suffix="+" label="Happy Clients" />
            <StatCounter value={10000} suffix="+" label="Deliveries" />
            <StatCounter value={100} suffix="%" label="Certified Purity" />
          </motion.div>
        </div>

        {/* Right Column: 3D Supplement Canister Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 h-[400px] sm:h-[500px] relative flex items-center justify-center rounded-3xl"
        >
          {/* Subtle halo backdrop light inside 3D canister box */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 rounded-3xl border border-gray-150/40 p-4 shadow-[inset_0_0_40px_rgba(242,106,33,0.02)] overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          </div>

          {isClient && (
            <div className="w-full h-full relative z-10">
              <Canvas3D />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
