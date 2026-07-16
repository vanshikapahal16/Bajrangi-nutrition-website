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
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-gray-100/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)] py-2"
            : "bg-transparent border-b border-transparent py-4"
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-6 lg:px-10">
          <div className="h-[72px] flex items-center gap-6 lg:gap-10 justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 shrink-0 group">
              <div className="w-12 h-12 rounded-full bg-white border border-gray-150 p-1.5 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(242,106,33,0.3)] group-hover:border-primary/50 relative overflow-hidden">
                <img
                  src="/assets/logo.png"
                  alt="Bajrangi Nutrition"
                  className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-extrabold text-[15px] tracking-tight text-text-main group-hover:text-primary transition-colors duration-300">
                  BAJRANGI
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mt-0.5 text-neon-glow">
                  Nutrition
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-8 justify-center">
              {MAIN_NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="nav-link text-[12px] font-bold uppercase tracking-widest text-text-main hover:text-primary transition-colors duration-300 relative py-1"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Search Bar - Expanding smoothly */}
            <div
              className={`hidden md:flex items-center transition-all duration-500 ${
                searchFocused ? "w-96" : "w-64"
              }`}
            >
              <div
                className={`relative w-full flex items-center bg-bg-light rounded-full px-5 py-2.5 border transition-all duration-500 ${
                  searchFocused
                    ? "border-primary/40 bg-white shadow-[0_0_15px_rgba(242,106,33,0.1)]"
                    : "border-transparent hover:border-gray-200"
                }`}
              >
                <Search className={`w-4 h-4 text-text-muted shrink-0 transition-colors duration-300 ${searchFocused ? "text-primary" : ""}`} />
                <input
                  type="text"
                  placeholder="Search products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full bg-transparent ml-3 text-xs text-text-main placeholder:text-text-muted outline-none font-medium"
                />
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onOpenAdmin}
                className="hidden lg:flex w-10 h-10 rounded-full items-center justify-center text-text-muted hover:text-primary hover:bg-bg-light transition-all duration-300 border border-transparent hover:border-gray-200/50"
                title="Admin Panel"
              >
                <UserCheck className="w-[18px] h-[18px]" />
              </button>

              <button
                className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-bg-light transition-all duration-300 border border-transparent hover:border-gray-200/50"
                title="Account"
              >
                <User className="w-[18px] h-[18px]" />
              </button>

              <button
                onClick={onOpenWishlist}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-bg-light transition-all duration-300 border border-transparent hover:border-gray-200/50"
                title="Wishlist"
              >
                <Heart className="w-[18px] h-[18px]" />
                {isClient && wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center border-2 border-white"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </button>

              <button
                onClick={onOpenCart}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-bg-light transition-all duration-300 border border-transparent hover:border-gray-200/50"
                title="Cart"
              >
                <ShoppingBag className="w-[18px] h-[18px]" />
                {isClient && cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center border-2 border-white text-glow-orange animate-pulse"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(true)}
                className="xl:hidden w-10 h-10 rounded-full flex items-center justify-center text-text-main hover:bg-bg-light transition-all duration-300"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
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
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-bg-light transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="relative flex items-center bg-bg-light rounded-full px-4 py-2.5 mb-8 border border-transparent focus-within:border-primary/20">
                  <Search className="w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent ml-3 text-xs outline-none"
                  />
                </div>

                <nav className="flex flex-col gap-1.5">
                  {MAIN_NAV.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-text-main hover:text-primary hover:bg-bg-light rounded-xl transition-colors"
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
