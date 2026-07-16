"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShieldCheck, Award, Activity, Truck, Star, Quote } from "lucide-react";

// Intersection-Observer based Count-Up Component
interface CounterProps {
  value: number;
  duration?: number;
  suffix?: string;
}

function Counter({ value, duration = 2000, suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const end = value;
    if (start === end) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const currentCount = end * progress;
      
      if (progress === 1) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(currentCount);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, value, duration]);

  const formatCount = () => {
    if (value % 1 === 0) {
      return Math.floor(count).toLocaleString();
    } else {
      return count.toFixed(1);
    }
  };

  return (
    <span ref={elementRef} className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white">
      {formatCount()}
      <span className="text-primary ml-0.5">{suffix}</span>
    </span>
  );
}

export default function WhyBajrangi() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "100% Authentic Products",
      desc: "Direct import from manufacturers with certified brand scratch codes and FSSAI authentication tags. Zero compromises, zero middle-men.",
      badge: "Importer Certified"
    },
    {
      icon: <Award className="w-6 h-6 text-amber-500" />,
      title: "Top Global Brands",
      desc: "Authorized retailer for MyProtein, Optimum Nutrition, MuscleBlaze, and other leading international and Indian supplements.",
      badge: "Official Partner"
    },
    {
      icon: <Activity className="w-6 h-6 text-orange-500" />,
      title: "Expert Supplement Guidance",
      desc: "Connect directly with our physical trainers and nutrition experts for a customized supplement stack tailored to your goals.",
      badge: "Free Consultation"
    },
    {
      icon: <Truck className="w-6 h-6 text-amber-400" />,
      title: "Fast & Secure Delivery",
      desc: "Under 1 hour doorstep delivery for Kurukshetra University (KUK) students and hostels. Fast, insured nationwide shipping.",
      badge: "KUK 24/7 Delivery"
    }
  ];

  const stats = [
    { value: 5000, suffix: "+", label: "Happy Customers" },
    { value: 10000, suffix: "+", label: "Orders Delivered" },
    { value: 100, suffix: "+", label: "Premium Products" },
    { value: 4.9, suffix: "★", label: "Customer Rating" }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 sm:py-32 bg-white overflow-hidden border-t border-gray-200/80" 
      id="benefits-section"
    >
      {/* Premium Blurred Gradient Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: "3s" }} />
      </div>

      {/* Floating Sparkles/Particles using Framer Motion */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {mounted && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/20"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
            }}
            animate={{
              y: [-20, 20],
              x: [-10, 10],
              opacity: [0.2, 0.7, 0.2],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full inline-block"
          >
            Purity & Trust
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl mt-4 tracking-tight text-text-main uppercase"
          >
            Why Thousands Choose <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-primary">Bajrangi Nutrition</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-text-muted text-sm sm:text-base max-w-lg mx-auto mt-4 font-medium"
          >
            Bridging science and performance. We deliver verified, authenticated, and high-performance fuel straight to your doorstep.
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {features.map((item, idx) => (
            <motion.div 
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="bg-white border border-gray-150/80 rounded-3xl p-7 flex flex-col justify-between min-h-[290px] relative overflow-hidden group shadow-sm hover:shadow-[0_20px_45px_rgba(242,106,33,0.1)] border-neon-glow transition-shadow duration-500 cursor-default z-10"
            >
              {/* Inner ambient glow layer */}
              <div className="absolute inset-0 bg-radial-glow opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="relative z-10">
                {/* Badge */}
                <div className="flex justify-between items-center mb-6">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted border border-gray-200 bg-neutral-50 px-2.5 py-1 rounded-md">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-text-main tracking-tight mb-2.5 uppercase font-sans">
                  {item.title}
                </h3>
                <p className="text-text-muted text-xs sm:text-[13px] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Orange corner accent */}
              <div className="absolute bottom-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-transparent to-primary/20 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Stats Section (2 Columns equivalent) */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4 sm:gap-6">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Counter value={stat.value} suffix={stat.suffix} />
                <span className="text-text-muted text-xs sm:text-sm font-bold uppercase tracking-widest mt-2">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Testimonial Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white border border-gray-150 rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Background quote mark */}
            <div className="absolute top-6 right-6 text-primary/10 pointer-events-none">
              <Quote className="w-16 h-16 text-primary/5" />
            </div>

            <div>
              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-text-muted text-xs sm:text-[13px] leading-relaxed italic mb-6">
                "Finding genuine supplements in Kurukshetra used to be a gamble. Bajrangi Nutrition completely changed that. Their verify-on-spot policy and lightning delivery to my hostel at KUK are unmatched! A gym lifesaver."
              </p>
            </div>

            {/* Testimonial Author */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-500 border border-primary/20 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                AS
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-main leading-tight">Aryan Sharma</h4>
                <p className="text-[10px] text-text-muted font-semibold tracking-wide uppercase mt-0.5">
                  State Level Athlete • KUK
                </p>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
