"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Dumbbell, Leaf, Award } from "lucide-react";
import Image from "next/image";

export default function BentoBenefits() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  return (
    <section className="py-20 bg-bg-light" id="benefits-section">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-bold text-xs uppercase tracking-widest"
          >
            Verified Performance
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-sans font-extrabold text-4xl md:text-5xl mt-2 tracking-tight text-text-main"
          >
            Why Choose <span className="text-primary">Bajrangi?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-text-muted text-md max-w-lg mx-auto mt-4"
          >
            Scientific nutrition meets traditional purity. We prove the benefits to your body visually.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1: 100% Authentic (Double Column on Desktop) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 glass-card rounded-3xl p-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-primary/10 to-transparent rounded-full -mr-20 -mt-20 blur-2xl"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 z-10">
              <div className="max-w-md">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-3">100% Purity & Authenticity</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  Every product on our shelves features certified brand scratch codes and FSSAI authentication tags. We import directly from manufacturers to eliminate middle-man tampering. 
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="text-xs font-semibold px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-600 rounded-full">✓ Scratch Verified</span>
                  <span className="text-xs font-semibold px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full">✓ Direct Import</span>
                  <span className="text-xs font-semibold px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-full">✓ FSSAI Approved</span>
                </div>
              </div>

              {/* Display Brand Logo */}
              <div className="flex justify-center items-center flex-shrink-0">
                <div className="relative w-44 h-44 rounded-full overflow-hidden shadow-lg border border-primary/10 bg-white p-2">
                  <Image 
                    src="/assets/logo.png" 
                    alt="Bajrangi Brand Seal" 
                    fill 
                    sizes="176px"
                    className="object-contain p-4"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Nutritional Equivalence Trigger */}
          <motion.div 
            variants={itemVariants}
            className="glass-card rounded-3xl p-8 flex flex-col justify-between min-h-[300px]"
          >
            <div>
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-3">Equivalent Body Fuel</h3>
              <p className="text-text-muted text-sm leading-relaxed mb-6">
                Just 1 scoop of our Whey Isolate provides equivalent protein to raw diets, digesting in under 30 minutes!
              </p>
            </div>
            
            <div className="space-y-3 bg-bg-light p-4 rounded-2xl border border-primary/5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>1 Scoop Whey Isolate</span>
                <span className="text-primary">25g Protein</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "95%" }}></div>
              </div>
              <div className="flex justify-between items-center text-xs text-text-muted">
                <span>Equivalent to: 5 Egg Whites</span>
                <span>or 150g Chicken</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Badam Ragda Traditional pre-workout (Double Column on Desktop) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 glass-card rounded-3xl p-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-orange-50/20 border-amber-100"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-amber-500/5 to-transparent rounded-full -mr-20 -mt-20 blur-2xl"></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 z-10">
              <div className="max-w-md">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-3">Bajrangi Badam Ragda</h3>
                <span className="inline-block text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full mb-3">100% Traditional Pre-Workout</span>
                <p className="text-text-muted text-sm leading-relaxed">
                  Experience Kurukshetra's famous natural power-shake! Made with almonds, saffron, cardamoms, and pistachios ground manually in a stone mortar. Zero artificial elements, providing high-density healthy fats and clean stamina.
                </p>
                <div className="flex gap-4 mt-6 text-xs font-bold text-amber-800">
                  <span>🔋 Natural Energy</span>
                  <span>🧠 Saffron Focus</span>
                  <span>🛡️ Antioxidant Rich</span>
                </div>
              </div>

              {/* Stall Board Representation */}
              <div className="w-48 h-32 relative rounded-2xl overflow-hidden shadow-md border border-amber-200/50 flex-shrink-0">
                <div className="absolute inset-0 bg-black/40 z-10 flex flex-col justify-end p-3">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Kurukshetra Outlet</span>
                  <span className="text-xs font-black text-white leading-tight">Badam Ragda Stall</span>
                </div>
                {/* Stall photo placeholder/image */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/hero_left.png')" }}></div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Local KUK Presence */}
          <motion.div 
            variants={itemVariants}
            className="glass-card rounded-3xl p-8 flex flex-col justify-between min-h-[300px]"
          >
            <div>
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-3">Kurukshetra Local Hub</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Located right near **Kurukshetra University (KUK)**. Stop by for taste-tests, free consults, or order for instant local doorstep delivery.
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-bold mt-6">
              <span className="text-primary flex items-center gap-1"><i className="fas fa-map-marker-alt"></i> Third Gate, KUK</span>
              <span className="text-text-muted">•</span>
              <span className="text-text-main">Delivery in 1 Hour</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
