"use client";

import { useState, useEffect } from "react";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  UserCheck,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StoreHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  isClient: boolean;
}

const MAIN_NAV = [
  { label: "Shop", href: "#catalog-section" },
  { label: "Brands", href: "#trending-section" },
  { label: "Categories", href: "#catalog-section" },
  { label: "Offers", href: "#trending-section" },
  { label: "About", href: "#benefits-section" },
  { label: "Contact", href: "#contact-section" },
];

export default function StoreHeader({
  searchQuery,
  setSearchQuery,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAdmin,
  isClient,
}: StoreHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Floating Tactical HUD Navbar */}
      <header
        className={`sticky top-4 z-50 w-[calc(100%-2rem)] mx-auto transition-all duration-500 rounded-2xl border ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-gray-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.06),0_0_20px_rgba(242,106,33,0.04)] py-1.5"
            : "bg-white/60 backdrop-blur-sm border-gray-150 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[64px] flex items-center justify-between gap-4">
            
            {/* Logo - Glowing Box Button */}
            <a 
              href="#" 
              className="flex items-center gap-3 p-1.5 bg-white/40 border border-gray-150/80 hover:border-primary/50 hover:bg-white rounded-xl transition-all duration-500 group hover:shadow-[0_0_15px_rgba(242,106,33,0.12)] shrink-0"
            >
              <div className="w-10 h-10 rounded-lg bg-white p-1 transition-transform group-hover:scale-105 duration-300">
                <img
                  src="/assets/logo.png"
                  alt="Bajrangi Nutrition"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:flex flex-col leading-none pr-1">
                <span className="font-extrabold text-[13px] tracking-tight text-text-main group-hover:text-primary transition-colors duration-300">
                  BAJRANGI
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mt-0.5 text-neon-glow">
                  Nutrition
                </span>
              </div>
            </a>

            {/* Desktop Navigation - Futuristic Box Buttons */}
            <nav className="hidden xl:flex items-center gap-3">
              {MAIN_NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 border border-gray-150/40 bg-white/20 hover:bg-white hover:border-primary/50 text-[10px] font-black uppercase tracking-widest text-text-main hover:text-primary rounded-xl transition-all duration-300 hover:shadow-[0_4px_12px_rgba(242,106,33,0.1)] hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group"
                >
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              ))}
            </nav>

            {/* Search Bar - High Tech Box Style */}
            <div
              className={`hidden md:flex items-center transition-all duration-500 ${
                searchFocused ? "w-80" : "w-56"
              }`}
            >
              <div
                className={`relative w-full flex items-center bg-bg-light/80 rounded-xl px-4 py-2.5 border transition-all duration-500 ${
                  searchFocused
                    ? "border-primary/50 bg-white shadow-[0_0_15px_rgba(242,106,33,0.1)]"
                    : "border-gray-150/50 hover:border-gray-250"
                }`}
              >
                <Search className={`w-3.5 h-3.5 text-text-muted shrink-0 transition-colors duration-300 ${searchFocused ? "text-primary" : ""}`} />
                <input
                  type="text"
                  placeholder="Search store..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full bg-transparent ml-2.5 text-xs text-text-main placeholder:text-text-muted outline-none font-bold uppercase tracking-wider"
                />
              </div>
            </div>

            {/* Action Box Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenAdmin}
                className="hidden lg:flex w-10 h-10 rounded-xl border border-gray-150/40 bg-white/20 hover:bg-white hover:border-primary/50 items-center justify-center text-text-muted hover:text-primary hover:shadow-[0_4px_12px_rgba(242,106,33,0.1)] hover:-translate-y-0.5 transition-all duration-300"
                title="Admin Panel"
              >
                <UserCheck className="w-[16px] h-[16px]" />
              </button>

              <button
                className="w-10 h-10 rounded-xl border border-gray-150/40 bg-white/20 hover:bg-white hover:border-primary/50 items-center justify-center text-text-muted hover:text-primary hover:shadow-[0_4px_12px_rgba(242,106,33,0.1)] hover:-translate-y-0.5 transition-all duration-300"
                title="Account"
              >
                <User className="w-[16px] h-[16px]" />
              </button>

              <button
                onClick={onOpenWishlist}
                className="relative w-10 h-10 rounded-xl border border-gray-150/40 bg-white/20 hover:bg-white hover:border-primary/50 items-center justify-center text-text-muted hover:text-primary hover:shadow-[0_4px_12px_rgba(242,106,33,0.1)] hover:-translate-y-0.5 transition-all duration-300"
                title="Wishlist"
              >
                <Heart className="w-[16px] h-[16px]" />
                {isClient && wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-lg bg-primary text-white text-[9px] font-black flex items-center justify-center border border-white shadow-sm text-neon-glow"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </button>

              <button
                onClick={onOpenCart}
                className="relative w-10 h-10 rounded-xl border border-gray-150/40 bg-white/20 hover:bg-white hover:border-primary/50 items-center justify-center text-text-muted hover:text-primary hover:shadow-[0_4px_12px_rgba(242,106,33,0.1)] hover:-translate-y-0.5 transition-all duration-300"
                title="Cart"
              >
                <ShoppingBag className="w-[16px] h-[16px]" />
                {isClient && cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-lg bg-primary text-white text-[9px] font-black flex items-center justify-center border border-white shadow-sm animate-pulse text-neon-glow"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(true)}
                className="xl:hidden w-10 h-10 rounded-xl border border-gray-150/40 bg-white/20 hover:bg-white hover:border-primary/50 flex items-center justify-center text-text-main transition-all duration-300"
                aria-label="Open menu"
              >
                <Menu className="w-[18px] h-[18px]" />
              </button>
            </div>
            
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[60]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
              className="absolute top-0 right-0 h-full w-[min(320px,85vw)] bg-white/95 backdrop-blur-md border-l border-gray-100 shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <span className="font-extrabold text-sm uppercase tracking-wider">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-xl border border-gray-150/40 flex items-center justify-center hover:bg-bg-light transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="relative flex items-center bg-bg-light rounded-xl px-4 py-2.5 mb-8 border border-gray-200 focus-within:border-primary/20">
                  <Search className="w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent ml-3 text-xs outline-none"
                  />
                </div>

                <nav className="flex flex-col gap-2">
                  {MAIN_NAV.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-main border border-gray-100 hover:border-primary/20 hover:text-primary hover:bg-bg-light rounded-xl transition-all"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
