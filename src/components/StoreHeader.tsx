"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X
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
      {/* Completely transparent borderless header wrapper */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 py-5 ${
          isScrolled ? "bg-white/70 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.01)]" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-6 sm:px-10">
          <div className="flex items-center justify-between gap-6">
            
            {/* 1. Left Section: Logo - Clean & floating */}
            <a 
              href="#" 
              className="flex items-center gap-3 group shrink-0"
            >
              <div className="w-11 h-11 rounded-full bg-white/70 border border-gray-150 p-1.5 transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(242,106,33,0.15)] group-hover:border-primary/50">
                <img
                  src="/assets/logo.png"
                  alt="Bajrangi Nutrition"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-extrabold text-[14px] tracking-tight text-text-main group-hover:text-primary transition-colors duration-300">
                  BAJRANGI
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mt-0.5">
                  Nutrition
                </span>
              </div>
            </a>

            {/* 2. Center Section: Floating Navigation Capsule */}
            <div className="hidden xl:flex items-center justify-center">
              <nav className="bg-white/75 backdrop-blur-md border border-gray-150/80 px-6 py-2.5 rounded-full flex items-center gap-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                {MAIN_NAV.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-[10px] font-black uppercase tracking-[0.15em] text-text-main hover:text-primary transition-colors duration-300 relative py-1 nav-link"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* 3. Right Section: Search & Actions */}
            <div className="flex items-center gap-3.5 shrink-0">
              
              {/* Search Bar - Capsule Style */}
              <div
                className={`hidden md:flex items-center transition-all duration-500 ${
                  searchFocused ? "w-64" : "w-44"
                }`}
              >
                <div
                  className={`relative w-full flex items-center bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 border transition-all duration-500 ${
                    searchFocused
                      ? "border-primary/40 bg-white shadow-[0_0_15px_rgba(242,106,33,0.06)]"
                      : "border-gray-150/60 hover:border-gray-250"
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
                    className="w-full bg-transparent ml-2 text-[10px] text-text-main placeholder:text-text-muted outline-none font-bold uppercase tracking-wider"
                  />
                </div>
              </div>

              {/* Admin Button - Glowing Orange Capsule (Matches reference 'ADMIN') */}
              <button
                onClick={onOpenAdmin}
                className="hidden lg:flex px-4 py-2 rounded-full border border-primary/30 bg-white/70 hover:bg-white hover:border-primary text-[9px] font-black uppercase tracking-widest text-primary shadow-sm hover:shadow-[0_0_12px_rgba(242,106,33,0.15)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shrink-0"
                title="Admin Panel"
              >
                ADMIN
              </button>

              {/* Wishlist Icon - Glass Circle */}
              <button
                onClick={onOpenWishlist}
                className="relative w-9 h-9 rounded-full border border-gray-150 bg-white/70 hover:bg-white hover:border-primary/50 flex items-center justify-center text-text-muted hover:text-primary hover:shadow-[0_4px_12px_rgba(242,106,33,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                title="Wishlist"
              >
                <Heart className="w-3.5 h-3.5" />
                {isClient && wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-[16px] h-[16px] rounded-full bg-primary text-white text-[8px] font-black flex items-center justify-center border border-white shadow-sm"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </button>

              {/* Cart Button - Glowing Black Capsule (Matches reference 'JOIN') */}
              <button
                onClick={onOpenCart}
                className="px-4 py-2 rounded-full border border-black bg-white/75 hover:bg-white hover:border-black hover:shadow-[0_0_12px_rgba(0,0,0,0.1)] text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-1.5 hover:-translate-y-0.5 transition-all duration-300 relative cursor-pointer shrink-0"
                title="Cart"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>CART</span>
                {isClient && cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 rounded-full bg-primary text-white text-[8px] font-black flex items-center justify-center shadow-sm"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile Menu trigger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="xl:hidden w-9 h-9 rounded-full border border-gray-150 bg-white/70 hover:bg-white flex items-center justify-center text-text-main transition-all duration-300"
                aria-label="Open menu"
              >
                <Menu className="w-4 h-4" />
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
