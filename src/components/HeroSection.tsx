"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const scrollToProducts = () => {
    document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full h-screen bg-[#F9F6F1] overflow-hidden">
      <div className="relative w-full h-full max-w-[1920px] mx-auto">
        {/* Hero Image - 16:9 ratio, 100vh height */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative w-full h-full"
        >
          <img
            src="/assets/hero-backdrop.png"
            alt="Bajrangi Nutrition — Fuel Your Strength. Premium supplements for performance and recovery."
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
            style={{ aspectRatio: "16/9" }}
          />

          {/* Glassmorphism overlay - Darker for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 backdrop-blur-sm" />
        </motion.div>

        {/* Brand Logo - Top Left Corner */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20"
        >
          <img
            src="/assets/logo.png"
            alt="Bajrangi Nutrition"
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-24 object-contain drop-shadow-2xl bg-white/10 backdrop-blur-sm rounded-full p-1.5 sm:p-2 border border-white/20"
          />
        </motion.div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 text-center pt-16 sm:pt-20 pb-8">
          {/* Large Bold Heading - Mobile optimized */}
          <motion.h1
            className="text-[24px] sm:text-[32px] md:text-[48px] lg:text-[64px] xl:text-[90px] font-black text-white leading-tight tracking-tight mb-2 sm:mb-3 md:mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] px-2"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          >
            BAJRANGI NUTRITION
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              KURUKSHETRA
            </span>
          </motion.h1>

          {/* Animated Subtitle - Mobile optimized */}
          <motion.p
            className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-white font-bold mb-4 sm:mb-6 md:mb-8 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] px-2 uppercase tracking-wider bg-black/30 backdrop-blur-sm py-2 px-4 rounded-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            100% Genuine Product, Buy With Confidence
          </motion.p>

          {/* CTA Button with animations - Mobile optimized */}
          <motion.button
            onClick={scrollToProducts}
            className="group relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl text-white font-bold text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.12em] sm:tracking-[0.18em] transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 mb-4 sm:mb-6 md:mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Explore Products</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-2" />

            {/* Button glow effect */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
          </motion.button>

          {/* Glassmorphism Card - Below Button - Mobile optimized */}
          <motion.div
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-2xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          >
            <p className="text-white/80 text-[10px] sm:text-xs md:text-sm font-medium">
              Trusted by <span className="text-white font-bold">10,000+</span> athletes
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
