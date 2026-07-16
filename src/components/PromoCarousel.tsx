"use client";

import { useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { Product } from "../lib/services";

interface PromoCarouselProps {
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onOpenModal: (product: Product) => void;
}

export default function PromoCarousel({
  products,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onOpenModal
}: PromoCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.75;
    scrollRef.current.scrollTo({
      left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: "smooth"
    });
  };

  const bestSellers = products.filter(p => p.isBestseller);

  const handleCardClick = (productId: string) => {
    const catalogSection = document.getElementById("catalog-section");
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: "smooth" });
      // Store the product ID to highlight it in catalog
      sessionStorage.setItem("selectedProductId", productId);
    }
  };

  const cardVariants = {
    initial: { y: 0, scale: 1 },
    hover: {
      y: -12,
      scale: 1.02,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <section className="py-16 bg-white overflow-hidden" id="trending-section">
      <div className="max-w-7xl mx-auto px-6 relative">
        
        {/* Section Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Trending Now</span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-3 text-text-main">Weekly Featured Bestsellers</h2>
            <p className="text-text-muted text-xs mt-1">High-demand supplements flying off our shelves in Kurukshetra.</p>
          </div>
          
          {/* Scroll Navigation Arrows */}
          <div className="flex gap-2.5">
            <button 
              onClick={() => scroll("left")} 
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:border-primary flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll("right")} 
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:border-primary flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Track Wrapper */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-4 scroll-smooth"
          style={{ scrollPadding: "24px" }}
        >
          {bestSellers.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            const outOfStock = product.stock <= 0;

            // Extract key ingredients or mock benefits based on category
            let keyBenefits = "Instant Recovery & Energy";
            if (product.category === "Protein") keyBenefits = "25g Pure Protein • 5.5g BCAA";
            else if (product.category === "Creatine") keyBenefits = "100% Micronized • Strength Boost";
            else if (product.category === "Pre-Workout") keyBenefits = "Extreme Focus • Beta-Alanine";
            else if (product.category === "Vitamins") keyBenefits = "Liver Shield • Advanced Detox";

            return (
              <motion.div
                key={product.id}
                variants={cardVariants}
                initial="initial"
                whileHover="hover"
                className="w-[280px] sm:w-[310px] flex-shrink-0 snap-start bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between cursor-pointer"
                onClick={() => handleCardClick(product.id)}
              >
                {/* Sale Tag */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-primary text-white rounded-md">Bestseller</span>
                  {product.bundleDeal && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-green-500 text-white rounded-md">Offer</span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(product.id);
                  }}
                  className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full border flex items-center justify-center transition-all shadow-sm ${
                    isWishlisted
                      ? "bg-red-500 border-red-500 text-white"
                      : "bg-white border-gray-250 text-text-muted hover:text-red-500 hover:border-red-200"
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-4.5 h-4.5 ${isWishlisted ? "fill-white" : ""}`} />
                </button>

                {/* Product Image Frame */}
                <div className="bg-bg-light rounded-2xl h-44 flex items-center justify-center p-6 mb-4 relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.isVeg && (
                    <div className="absolute bottom-3 left-3 w-4 h-4 border border-green-500 p-0.5 flex items-center justify-center bg-white rounded-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    </div>
                  )}
                </div>

                {/* Product Metadata info */}
                <div className="flex-grow flex flex-col justify-between">
                  <div className="mb-4">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{product.category}</span>
                    <h3 className="text-sm font-bold text-text-main line-clamp-1 pr-6 leading-tight mt-1 mb-2">{product.name}</h3>
                    
                    {/* Ratings */}
                    <div className="flex items-center gap-1 text-amber-500 mb-2.5 text-[10px]">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <Star className="w-3 h-3 fill-amber-500" />
                      <Star className="w-3 h-3 fill-amber-500" />
                      <Star className="w-3 h-3 fill-amber-500" />
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span className="text-text-muted text-[9px] font-semibold ml-1">4.8 (120 reviews)</span>
                    </div>

                    {/* Price Block */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base font-black text-text-main">₹{product.price.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-text-muted line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                      <span className="text-[10px] font-bold text-green-600 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                        {discount}% OFF
                      </span>
                    </div>

                    {/* Key benefits list */}
                    <div className="text-[10px] text-text-muted bg-bg-light/60 border border-gray-100 rounded-xl px-3 py-2 flex items-center gap-1.5 font-medium">
                      <span>💡</span>
                      <span className="truncate">{keyBenefits}</span>
                    </div>
                  </div>

                  {/* Actions & stock levels */}
                  <div>
                    <div className="mb-3 text-[10px] font-bold flex justify-between items-center">
                      <span>Stock Status:</span>
                      {outOfStock ? (
                        <span className="text-danger">Sold Out</span>
                      ) : product.stock <= 4 ? (
                        <span className="text-amber-600">Only {product.stock} Left</span>
                      ) : (
                        <span className="text-green-600">Available</span>
                      )}
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenModal(product);
                        }}
                        className="col-span-1 border border-gray-200 hover:border-primary rounded-xl flex items-center justify-center text-text-muted hover:text-primary transition-all p-2.5 bg-white"
                        title="Specs Quick View"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product, 1);
                        }}
                        disabled={outOfStock}
                        className={`col-span-4 text-xs font-bold uppercase tracking-wider rounded-xl py-2.5 transition-all flex items-center justify-center gap-1.5 ${
                          outOfStock
                            ? "bg-gray-100 border border-gray-200 text-text-muted cursor-not-allowed"
                            : "bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow-md"
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
