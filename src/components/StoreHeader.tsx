"use client";

import { useState } from "react";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  UserCheck,
} from "lucide-react";

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

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-10">
          <div className="h-[92px] flex items-center gap-6 lg:gap-10">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 shrink-0 group">
              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 p-1.5 transition-shadow group-hover:shadow-md">
                <img
                  src="/assets/logo.png"
                  alt="Bajrangi Nutrition"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-extrabold text-[15px] tracking-tight text-text-main">
                  BAJRANGI
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mt-0.5">
                  Nutrition
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-8 flex-1 justify-center">
              {MAIN_NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="nav-link text-[13px] font-semibold uppercase tracking-wider text-text-main hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Search Bar */}
            <div
              className={`hidden md:flex items-center flex-1 max-w-md xl:max-w-lg transition-all duration-300 ${
                searchFocused ? "scale-[1.02]" : ""
              }`}
            >
              <div
                className={`relative w-full flex items-center bg-[#F8F8F8] rounded-full px-5 py-3 border transition-all duration-300 ${
                  searchFocused
                    ? "border-primary/40 shadow-[0_0_0_3px_rgba(242,106,33,0.12)]"
                    : "border-transparent hover:border-gray-200"
                }`}
              >
                <Search className="w-4 h-4 text-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full bg-transparent ml-3 text-sm text-text-main placeholder:text-text-muted outline-none"
                />
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={onOpenAdmin}
                className="hidden lg:flex w-10 h-10 rounded-full items-center justify-center text-text-muted hover:text-primary hover:bg-[#F8F8F8] transition-all"
                title="Admin Panel"
              >
                <UserCheck className="w-[18px] h-[18px]" />
              </button>

              <button
                className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-[#F8F8F8] transition-all"
                title="Account"
              >
                <User className="w-[18px] h-[18px]" />
              </button>

              <button
                onClick={onOpenWishlist}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-[#F8F8F8] transition-all"
                title="Wishlist"
              >
                <Heart className="w-[18px] h-[18px]" />
                {isClient && wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenCart}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-[#F8F8F8] transition-all"
                title="Cart"
              >
                <ShoppingBag className="w-[18px] h-[18px]" />
                {isClient && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(true)}
                className="xl:hidden w-10 h-10 rounded-full flex items-center justify-center text-text-main hover:bg-[#F8F8F8] transition-all"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[min(320px,85vw)] bg-white shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <span className="font-extrabold text-sm uppercase tracking-wider">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F8F8] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="relative flex items-center bg-[#F8F8F8] rounded-full px-4 py-3 mb-8">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent ml-3 text-sm outline-none"
              />
            </div>

            <nav className="flex flex-col gap-1">
              {MAIN_NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3.5 text-sm font-semibold uppercase tracking-wider text-text-main hover:text-primary hover:bg-[#F8F8F8] rounded-xl transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
