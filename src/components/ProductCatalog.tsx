"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ShoppingCart, 
  Eye, 
  Star, 
  X, 
  Info, 
  ShieldCheck, 
  Heart, 
  ChevronLeft, 
  Check, 
  Truck, 
  Award, 
  UserCheck, 
  Clock, 
  Plus, 
  Minus,
  MessageSquare,
  Sparkles,
  Zap,
  Flame,
  ThumbsUp,
  FileText,
  Share2,
  Package
} from "lucide-react";
import { dataService, Product, Review } from "../lib/services";

interface ProductCatalogProps {
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

const WHATSAPP_NUMBER = "919588715527";

export default function ProductCatalog({
  onAddToCart,
  onBuyNow,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  wishlist,
  onToggleWishlist
}: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Showcase internal States
  const [selectedImage, setSelectedImage] = useState("");
  const [showcaseQty, setShowcaseQty] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("");

  // Review Form States
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  // Subscribe to changes
  useEffect(() => {
    const unsubscribeProd = dataService.subscribeProducts((data) => {
      setProducts(data);
    });
    const unsubscribeRev = dataService.subscribeReviews((data) => {
      setReviews(data);
    });
    return () => {
      unsubscribeProd();
      unsubscribeRev();
    };
  }, []);

  // Filter products based on search and category
  const filtered = products.filter(p => {
    const matchesCat = activeCategory === "all" || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Open Showcase
  const handleOpenShowcase = (product: Product) => {
    setSelectedProduct(product);
    setSelectedImage(product.image);
    setShowcaseQty(1);
    setSelectedFlavor(product.flavor || "Default Flavor");
    setSelectedWeight(product.weight || "Default Weight");
    setReviewAuthor("");
    setReviewText("");
    setReviewRating(5);
    setReviewMessage("");
    
    // Scroll smoothly to catalog top
    const section = document.getElementById("catalog-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Close Showcase
  const handleCloseShowcase = () => {
    setSelectedProduct(null);
  };

  // Add review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    if (reviewAuthor.trim().length < 2 || reviewText.trim().length < 5) {
      setReviewMessage("Please enter a valid name and review text.");
      return;
    }

    const payload = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      author: reviewAuthor.trim(),
      rating: reviewRating,
      text: reviewText.trim()
    };

    try {
      await dataService.saveReview(payload);
      setReviewAuthor("");
      setReviewText("");
      setReviewRating(5);
      setReviewMessage("🎉 Review submitted! It will appear once approved.");
    } catch (err: any) {
      setReviewMessage("Failed to submit review.");
    }
  };

  // Get approved reviews for selected product
  const productReviews = selectedProduct 
    ? reviews.filter(r => r.productId === selectedProduct.id && r.approved)
    : [];

  const averageRating = productReviews.length > 0 
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1) 
    : "5.0";

  return (
    <section className="py-24 bg-[#F9F6F1] relative border-t border-gray-100" id="catalog-section">
      <div className="max-w-[1400px] mx-auto px-6">
        
        <AnimatePresence mode="wait">
          {!selectedProduct ? (
            // -------------------- CATALOG GRID VIEW --------------------
            <motion.div
              key="catalog-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-gray-200/80">
                <div>
                  <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full inline-block mb-3">
                    Premium Catalog
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-text-main uppercase">
                    Explore Supplement Stack
                  </h2>
                  <p className="text-text-muted text-xs sm:text-sm mt-2 max-w-md font-medium leading-relaxed">
                    Direct shipping from authorized importers. Scratch & verify FSSAI authenticity codes on delivery.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {/* Search Input */}
                  <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 w-full sm:w-64 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 shadow-sm transition-all">
                    <Search className="w-4.5 h-4.5 text-text-muted mr-2.5" />
                    <input 
                      type="text" 
                      placeholder="Search supplements..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs w-full outline-none text-text-main font-semibold"
                    />
                  </div>
                  
                  {/* Category Pill Filters */}
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
                    {["all", "Protein", "Pre-Workout", "Creatine", "Accessories", "Vitamins"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          handleCloseShowcase();
                        }}
                        className={`text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl border flex-shrink-0 transition-all duration-300 ${
                          activeCategory === cat 
                            ? "bg-primary border-primary text-white shadow-md shadow-primary/10" 
                            : "bg-white border-gray-200 hover:border-primary text-text-muted hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        {cat === "all" ? "All" : cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Card Grid (5 columns on desktop) */}
              {filtered.length > 0 ? (
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
                >
                  {filtered.map((p, idx) => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      wishlist={wishlist}
                      onToggleWishlist={onToggleWishlist}
                      onOpenShowcase={handleOpenShowcase}
                      onAddToCart={onAddToCart}
                      onBuyNow={onBuyNow}
                      index={idx}
                    />
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                  <Info className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h4 className="text-lg font-bold text-text-main">No supplements found</h4>
                  <p className="text-text-muted text-xs sm:text-sm max-w-xs mx-auto mt-2 font-medium">
                    Try refining your search terms or selecting a different category.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            // -------------------- IMMERSIVE PRODUCT SHOWCASE VIEW --------------------
            <motion.div
              key="showcase-detail"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xl relative overflow-hidden"
            >
              {/* Back to Catalog bar */}
              <button 
                onClick={handleCloseShowcase}
                className="group flex items-center gap-2 mb-10 text-xs font-black uppercase tracking-wider text-text-muted hover:text-primary transition-all"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to all supplements
              </button>

              {/* Main Product Showcase Block */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pb-16 border-b border-gray-200">
                
                {/* Left Column: Visual Showcase & Gallery */}
                <div className="lg:col-span-6 flex flex-col items-center">
                  
                  {/* Ground Reflection & Spotlight Visual Box */}
                  <div className="relative w-full aspect-square max-w-[420px] rounded-2xl bg-bg-light border border-gray-150 flex items-center justify-center p-8 overflow-hidden select-none">
                    
                    {/* spotlight backdrop glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full spotlight-glow z-0 pointer-events-none" />

                    {selectedProduct.isVeg && (
                      <div className="absolute top-4 left-4 w-6 h-6 border border-green-500 p-1 flex items-center justify-center bg-white shadow-sm rounded-md z-10" title="100% Vegetarian">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      </div>
                    )}
                    
                    {/* Main Image with Zoom on Hover & floating style */}
                    <div className="relative w-full h-full flex items-center justify-center z-10 product-reflection animate-float">
                      <img 
                        src={selectedImage} 
                        alt={selectedProduct.name} 
                        className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Multple Gallery Images Thumbnails */}
                  <div className="flex gap-3 justify-center mt-8 overflow-x-auto max-w-full pb-2">
                    {(selectedProduct.images && selectedProduct.images.length > 0
                      ? selectedProduct.images 
                      : [selectedProduct.image]
                    ).map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`w-14 h-14 rounded-xl bg-white border cursor-pointer p-1.5 flex items-center justify-center hover:border-primary transition-all flex-shrink-0 ${
                          selectedImage === img ? "border-primary ring-2 ring-primary/10 shadow-sm" : "border-gray-200"
                        }`}
                      >
                        <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Column: Key Details & Purchasing */}
                <div className="lg:col-span-6 flex flex-col justify-between">
                  <div>
                    {/* Category */}
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-md inline-block mb-4">
                      {selectedProduct.category}
                    </span>

                    {/* Product Name */}
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight leading-tight uppercase font-sans">
                      {selectedProduct.name}
                    </h3>
                    
                    {/* Ratings */}
                    <div className="flex items-center gap-2 text-amber-500 mt-3 mb-6 text-xs font-bold">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <span className="text-text-main">{averageRating}</span>
                      <span className="text-text-muted font-normal">({productReviews.length} verified reviews)</span>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-text-muted text-xs sm:text-[13px] leading-relaxed max-w-xl mb-6">
                      {selectedProduct.description}
                    </p>

                    {/* Importer Authentication Seal */}
                    <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/15 p-4 rounded-2xl mb-8 max-w-xl">
                      <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <div>
                        <h5 className="text-xs font-bold text-green-800 uppercase tracking-wider">100% Importer Authenticated Seal</h5>
                        <p className="text-[11px] text-green-700 mt-0.5">Comes with official holographic importer verification code and scratch card.</p>
                      </div>
                    </div>

                    {/* Weight & Size Selector */}
                    {selectedProduct.weight && (
                      <div className="mb-6">
                        <label className="text-[11px] uppercase font-bold tracking-wider text-text-muted block mb-2.5">Available Weights</label>
                        <div className="flex gap-2.5">
                          {[selectedProduct.weight].map((w, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedWeight(w)}
                              className={`text-xs font-extrabold px-4.5 py-2.5 rounded-xl border transition-all ${
                                selectedWeight === w 
                                  ? "bg-text-main border-text-main text-white"
                                  : "bg-white border-gray-200 text-text-main"
                              }`}
                            >
                              {w}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Flavor Selector */}
                    <div className="mb-8">
                      <label className="text-[11px] uppercase font-bold tracking-wider text-text-muted block mb-2.5">Flavor Variant</label>
                      <div className="flex gap-2.5">
                        {[selectedProduct.flavor || "Chocolate"].map((f, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedFlavor(f)}
                            className={`text-xs font-extrabold px-4.5 py-2.5 rounded-xl border transition-all ${
                              selectedFlavor === f 
                                ? "bg-text-main border-text-main text-white"
                                : "bg-white border-gray-200 text-text-main"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Block */}
                    <div className="border-t border-gray-150 pt-6 mb-8 max-w-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl font-black text-text-main">
                          ₹{selectedProduct.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-sm text-text-muted line-through">
                          ₹{selectedProduct.originalPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-bold text-green-600 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                          {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="space-y-4 max-w-xl">
                    <div className="flex flex-wrap gap-3">
                      {selectedProduct.stock > 0 ? (
                        <>
                          {/* Quantity picker */}
                          <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 w-32 bg-bg-light">
                            <button 
                              onClick={() => setShowcaseQty(q => Math.max(1, q - 1))}
                              className="text-text-muted hover:text-primary font-bold text-lg py-2 w-full transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5 mx-auto" />
                            </button>
                            <span className="text-xs font-black text-text-main">{showcaseQty}</span>
                            <button 
                              onClick={() => setShowcaseQty(q => Math.min(selectedProduct.stock, q + 1))}
                              className="text-text-muted hover:text-primary font-bold text-lg py-2 w-full transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </div>

                          {/* Add to Cart button */}
                          <button
                            onClick={() => onAddToCart(selectedProduct, showcaseQty)}
                            className="flex-grow bg-primary hover:bg-primary-hover text-white text-xs uppercase font-extrabold tracking-widest py-4.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 duration-300"
                          >
                            <ShoppingCart className="w-4 h-4" /> Add To Cart
                          </button>
                          <button
                            onClick={() => onBuyNow(selectedProduct, showcaseQty)}
                            className="flex-grow btn-buy-now text-white text-xs uppercase font-extrabold tracking-widest py-4.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 duration-300"
                          >
                            Buy Now
                          </button>
                        </>
                      ) : (
                        <button 
                          disabled
                          className="w-full bg-gray-100 border border-gray-200 text-text-muted text-xs uppercase font-extrabold py-4.5 rounded-xl cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      )}
                    </div>

                    {/* Delivery estimate */}
                    <div className="flex items-center gap-2 text-[11px] text-text-muted font-bold pt-2">
                      <Truck className="w-4.5 h-4.5 text-primary" />
                      <span>Delivery estimate: <strong>Instant 1 Hour Delivery</strong> (Hostels near KUK) / <strong>1-3 Days</strong> (Rest of India)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Split Layout: Benefits & Ingredients (Apple-style layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-16 border-b border-gray-200">
                {/* Left column: BENEFITS */}
                <div>
                  <h4 className="text-lg font-extrabold uppercase tracking-tight text-text-main mb-8 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> Key Performance Benefits
                  </h4>
                  <div className="space-y-6">
                    {getCategoryBenefits(selectedProduct.category).map((benefit, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="flex items-start gap-3.5"
                      >
                        <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Check className="w-4.5 h-4.5 font-bold" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-text-main uppercase tracking-wider">{benefit.name}</h5>
                          <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{benefit.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right column: INGREDIENTS */}
                <div>
                  <h4 className="text-lg font-extrabold uppercase tracking-tight text-text-main mb-8 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" /> Premium Active Ingredients
                  </h4>
                  <div className="space-y-4 divide-y divide-gray-150">
                    {getCategoryIngredients(selectedProduct.category).map((ingredient, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.08 }}
                        className="flex items-center justify-between pt-4 first:pt-0"
                      >
                        <div>
                          <h5 className="text-xs font-extrabold text-text-main">{ingredient.name}</h5>
                          <p className="text-[10px] text-text-muted mt-0.5">{ingredient.description}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase text-neutral-400 bg-neutral-100 border border-neutral-200/50 px-2 py-0.5 rounded">
                          Active
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nutritional Info Table & Guidelines */}
              <div className="py-16 border-b border-gray-200">
                <h4 className="text-lg font-extrabold uppercase tracking-tight text-text-main mb-8 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neutral-600" /> Nutritional Facts & Directions
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* Nutritional Table */}
                  <div className="lg:col-span-2 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-bg-light p-3 flex justify-between text-xs font-extrabold uppercase tracking-wider text-text-main border-b border-gray-200">
                      <span>Nutrient Category</span>
                      <span>Value Per Serving</span>
                    </div>
                    <div className="divide-y divide-gray-150 text-xs text-text-muted">
                      {getNutritionalRows(selectedProduct.category).map((row, idx) => (
                        <div key={idx} className="p-3 flex justify-between hover:bg-neutral-50 transition-colors">
                          <span className="font-semibold">{row.label}</span>
                          <span className="font-black text-text-main">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Usage guidelines */}
                  <div className="bg-bg-light border border-gray-200 rounded-2xl p-6">
                    <h5 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4">Usage Guidelines</h5>
                    <div className="space-y-4 text-xs text-text-muted leading-relaxed">
                      <p><strong>Recommended serving:</strong> Mix 1 scoop ({selectedProduct.category === "Protein" ? "33g" : selectedProduct.category === "Pre-Workout" ? "10g" : "3g"}) with 200-250ml of cold water or skimmed milk.</p>
                      <p><strong>Suggested Timing:</strong> {getCategoryUsage(selectedProduct.category)}</p>
                      <p><strong>Suitable For:</strong> Fit athletes, bodybuilding trainees, and adults targeting dietary protein completion.</p>
                      
                      {/* Certifications list */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                        <span className="text-[10px] font-black uppercase text-green-700 bg-green-100 border border-green-200 px-2 py-1 rounded">FSSAI Approved</span>
                        <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 border border-amber-200 px-2 py-1 rounded">GMP Certified</span>
                        <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100 border border-blue-200 px-2 py-1 rounded">ISO 9001</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Showcase Reviews section */}
              <div className="pt-16 pb-24">
                <h4 className="text-lg font-extrabold uppercase tracking-tight text-text-main mb-8 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Customer Reviews ({productReviews.length})
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* Reviews List */}
                  <div className="lg:col-span-2 space-y-4 max-h-[350px] overflow-y-auto pr-4">
                    {productReviews.length === 0 ? (
                      <p className="text-text-muted text-xs italic">No authenticated reviews yet for this product. Be the first to share your performance feedback!</p>
                    ) : (
                      productReviews.map((r) => (
                        <div key={r.id} className="bg-bg-light border border-gray-150 rounded-2xl p-5 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-xs font-bold text-text-main">{r.author}</h5>
                              <p className="text-[10px] text-text-muted mt-0.5">Verified Purchaser</p>
                            </div>
                            <div className="flex gap-0.5 text-amber-500">
                              {"⭐".repeat(r.rating)}
                            </div>
                          </div>
                          <p className="text-xs text-text-muted mt-3 italic leading-relaxed">
                            "{r.text}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Review Form */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h5 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4">Write a Review</h5>
                    <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Your Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Rahul Verma" 
                          value={reviewAuthor}
                          onChange={(e) => setReviewAuthor(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-bg-light border border-gray-200 text-xs text-text-main outline-none focus:border-primary font-semibold" 
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Rating</label>
                        <select 
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-bg-light border border-gray-200 text-xs text-text-main outline-none focus:border-primary font-bold"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 - Perfect)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                          <option value={3}>⭐⭐⭐ (3 - Average)</option>
                          <option value={2}>⭐⭐ (2 - Poor)</option>
                          <option value={1}>⭐ (1 - Terrible)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Review Details</label>
                        <textarea 
                          required
                          rows={3} 
                          placeholder="Mixability, performance boost, taste..." 
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-bg-light border border-gray-200 text-xs text-text-main outline-none focus:border-primary leading-relaxed font-semibold"
                        ></textarea>
                      </div>

                      <button type="submit" className="w-full bg-text-main hover:bg-neutral-800 text-white text-xs uppercase font-extrabold tracking-widest py-3 rounded-xl shadow-sm transition-all duration-300">
                        Submit Review
                      </button>
                      {reviewMessage && <p className="text-[10px] font-bold text-primary text-center mt-2.5">{reviewMessage}</p>}
                    </form>
                  </div>

                </div>
              </div>

              {/* Bottom Sticky Checkout CTA Bar */}
              <div className="fixed bottom-0 left-0 right-0 bg-white/90 border-t border-gray-150 backdrop-blur-md py-4 px-6 z-40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg bg-bg-light border border-gray-200 flex items-center justify-center p-1.5">
                    <img src={selectedProduct.image} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-text-main uppercase tracking-tight leading-tight line-clamp-1">{selectedProduct.name}</h4>
                    <span className="text-xs font-black text-primary">₹{selectedProduct.price.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  {/* WhatsApp order */}
                  <a 
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello!%20I%20want%20to%20order%20${encodeURIComponent(selectedProduct.name)}%20(${selectedFlavor}%20/%20${selectedWeight})%20for%20₹${selectedProduct.price}`}
                    target="_blank"
                    className="flex-grow sm:flex-grow-0 px-5 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" /> Order via WhatsApp
                  </a>

                  {selectedProduct.stock > 0 && (
                    <button 
                      onClick={() => onAddToCart(selectedProduct, showcaseQty)}
                      className="flex-grow sm:flex-grow-0 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-[10px] uppercase font-extrabold tracking-widest shadow-sm hover:shadow-md transition-all"
                    >
                      Add To Cart
                    </button>
                  )}
                  
                  {/* Trust Badges */}
                  <div className="hidden lg:flex items-center gap-4 text-[9px] font-extrabold uppercase tracking-widest text-text-muted border-l border-gray-200 pl-4">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> 100% Genuine</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> Instant KUK Delivery</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}

// -------------------- INTERNAL CHILD COMPONENT: PRODUCT CARD --------------------
function ProductCard({ 
  product, 
  wishlist,
  onToggleWishlist,
  onOpenShowcase,
  onAddToCart,
  onBuyNow,
  index
}: { 
  product: Product; 
  wishlist: string[];
  onToggleWishlist: (pId: string) => void;
  onOpenShowcase: (p: Product) => void;
  onAddToCart: (p: Product, qty: number) => void;
  onBuyNow: (p: Product, qty: number) => void;
  index: number;
}) {
  const [qty, setQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const saved = product.originalPrice - product.price;
  const outOfStock = product.stock <= 0;
  const isWishlisted = wishlist.includes(product.id);
  const ingredients = getCategoryIngredients(product.category).slice(0, 2);
  const benefits = getCategoryBenefits(product.category).slice(0, 2);

  let stockText = "In Stock";
  let stockClass = "text-green-700 bg-green-50 border-green-200";
  if (outOfStock) {
    stockText = "Out of Stock";
    stockClass = "text-red-600 bg-red-50 border-red-200";
  } else if (product.stock <= 4) {
    stockText = `Only ${product.stock} left`;
    stockClass = "text-amber-700 bg-amber-50 border-amber-200";
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Check out ${product.name} at Bajrangi Nutrition — ₹${product.price}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url: window.location.href });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="premium-glass-card rounded-3xl p-5 lg:p-6 flex flex-col relative overflow-hidden group shine-sweep"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
        {product.isRunning && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-primary text-white rounded-full">Best Seller</span>
        )}
        {product.bundleDeal && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-cta-green text-white rounded-full">New Offer</span>
        )}
        {!product.isRunning && !product.bundleDeal && product.sold > 50 && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-luxury-black text-gold rounded-full">Popular</span>
        )}
      </div>

      {/* Wishlist + Share */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
            isWishlisted ? "bg-red-500 border-red-500 text-white" : "bg-white/80 border-gray-200 text-text-muted hover:text-red-500"
          }`}
          title="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`} />
        </button>
        <button
          onClick={handleShare}
          className="w-9 h-9 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center text-text-muted hover:text-primary transition-all"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Product Image */}
      <button
        type="button"
        onClick={() => onOpenShowcase(product)}
        className="bg-white/60 rounded-2xl h-52 lg:h-56 flex items-center justify-center p-6 mb-5 relative overflow-hidden"
      >
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md"
        />
      </button>

      {/* Brand + Category */}
      <div className="flex items-center gap-2 mb-3">
        <img src="/assets/logo.png" alt="" className="w-6 h-6 object-contain rounded-full" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{product.category}</span>
        <span className="text-[10px] text-text-muted">• Authorized Brand</span>
      </div>

      {/* Name */}
      <h4 className="text-base font-extrabold text-text-main leading-snug tracking-tight line-clamp-2 mb-2 group-hover:text-cta-green transition-colors">
        {product.name}
      </h4>

      {/* Description */}
      <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2 mb-3">
        {product.description}
      </p>

      {/* Benefits */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {benefits.map((b) => (
          <span key={b.name} className="text-[9px] font-semibold text-text-muted bg-white/70 border border-gray-100 px-2 py-0.5 rounded-full">
            {b.name}
          </span>
        ))}
      </div>

      {/* Ingredients */}
      <div className="text-[10px] text-text-muted mb-3 space-y-0.5">
        <span className="font-bold text-text-main uppercase tracking-wider text-[9px]">Key Ingredients</span>
        {ingredients.map((ing) => (
          <p key={ing.name} className="line-clamp-1">• {ing.name}</p>
        ))}
      </div>

      {/* Flavor & Weight */}
      <div className="flex flex-wrap gap-3 text-[10px] mb-3">
        {product.flavor && (
          <span className="text-text-muted"><strong className="text-text-main">Flavor:</strong> {product.flavor}</span>
        )}
        {product.weight && (
          <span className="text-text-muted"><strong className="text-text-main">Net Wt:</strong> {product.weight}</span>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1.5 mb-4">
        <div className="flex gap-0.5 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
          ))}
        </div>
        <span className="text-[11px] font-bold text-text-main">4.9</span>
        <span className="text-[10px] text-text-muted">(Verified Reviews)</span>
      </div>

      {/* Pricing */}
      <div className="bg-white/50 rounded-xl p-3 mb-4 border border-gray-100">
        <div className="flex items-baseline flex-wrap gap-2">
          <span className="text-xl font-black text-text-main">₹{product.price.toLocaleString("en-IN")}</span>
          <span className="text-xs text-text-muted line-through">MRP ₹{product.originalPrice.toLocaleString("en-IN")}</span>
          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{discount}% OFF</span>
        </div>
        <p className="text-[10px] text-green-700 font-semibold mt-1">You save ₹{saved.toLocaleString("en-IN")}</p>
      </div>

      {/* Stock */}
      <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border mb-3 w-fit ${stockClass}`}>
        {stockText}
      </span>

      {/* Delivery */}
      <div className="flex items-center gap-1.5 text-[10px] text-text-muted mb-3">
        <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>Est. delivery: <strong className="text-text-main">1hr (KUK)</strong> / 1–3 days</span>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="flex items-center gap-1 text-[9px] font-bold text-text-muted uppercase">
          <ShieldCheck className="w-3 h-3 text-cta-green" /> 100% Genuine
        </span>
        <span className="flex items-center gap-1 text-[9px] font-bold text-text-muted uppercase">
          <Package className="w-3 h-3 text-cta-green" /> Secure Packaging
        </span>
      </div>

      {/* Quantity */}
      {!outOfStock && (
        <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 mb-4 bg-white/60">
          <span className="text-[10px] font-bold uppercase text-text-muted">Qty</span>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)); }}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm font-bold w-6 text-center">{qty}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setQty((q) => Math.min(product.stock, q + 1)); }}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (outOfStock) return;
            onAddToCart(product, qty);
            setAddedFeedback(true);
            setTimeout(() => setAddedFeedback(false), 2000);
          }}
          disabled={outOfStock}
          className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
            outOfStock
              ? "bg-gray-100 text-text-muted cursor-not-allowed"
              : addedFeedback
              ? "bg-green-600 text-white"
              : "bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow-md"
          }`}
        >
          {addedFeedback ? <><Check className="w-3.5 h-3.5" /> Added</> : <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!outOfStock) onBuyNow(product, qty);
          }}
          disabled={outOfStock}
          className={`btn-buy-now py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white ${
            outOfStock ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Buy Now
        </button>
      </div>
    </motion.div>
  );
}

// -------------------- HELPER DYNAMIC DATA GENERATORS --------------------

function getCategoryBenefits(category: string) {
  const defaultBenefits = [
    { name: "Builds Lean Muscle", description: "Delivers rapid amino acid release to rebuild and repair muscle fibers instantly." },
    { name: "Faster Recovery", description: "Supports structural cell hydration, significantly minimizing soreness post-training." },
    { name: "Increases Strength", description: "Aids muscular stamina, allowing you to sustain heavier sets and intensity." },
    { name: "Sustained Energy", description: "Fuels clean cellular activity without crash, maintaining active training output." },
    { name: "Easy Digestion", description: "Formulated for ultra-clean assimilation, eliminating bloating and stomach heavy feelings." }
  ];

  if (category === "Protein") return defaultBenefits;
  if (category === "Pre-Workout") {
    return [
      { name: "Extreme Power Output", description: "Triggers immediate nervous system stimulation for massive training intensity." },
      { name: "Skin-Splitting Pumps", description: "Enhances nitric oxide synthesis, maximizing direct blood flow to working muscles." },
      { name: "Laser-like Mental Focus", description: "Maintains optimal mind-muscle connection during high-stress working sets." },
      { name: "Delayed Muscle Fatigue", description: "Buffer lactic acid buildup, allowing you to break through plateaus and extra reps." },
      { name: "Optimal Endurance", description: "Sustains athletic performance during intense cardio and weight lifting sessions." }
    ];
  }
  if (category === "Creatine") {
    return [
      { name: "ATP Recovery Volumizer", description: "Accelerates adenosine triphosphate regeneration to restore maximum cellular energy." },
      { name: "Increases Power Output", description: "Clinically proven to maximize workload during short-burst, explosive activities." },
      { name: "Intracellular Hydration", description: "Draws water inside muscle cells, boosting direct fullness and protein synthesis." },
      { name: "Accelerated Muscle Growth", description: "Promotes myostatin regulation and insulin-like growth factor for true dry mass." },
      { name: "Enhanced Recovery Rate", description: "Refuels phosphocreatine stores immediately, boosting overall set recovery." }
    ];
  }
  if (category === "Vitamins") {
    return [
      { name: "Liver Cleansing Shield", description: "Milk Thistle extracts assist in detoxifying external compounds and cycle residuals." },
      { name: "Antioxidant Protection", description: "Fights free radical oxidation from intense physiological stress." },
      { name: "Optimal Nutrient Absorption", description: "Cleansed internal path aids direct absorption of dietary macros and micro-capsules." },
      { name: "Supports Cellular Repair", description: "N-Acetyl Cysteine fuels glutathione synthesis for systemic cellular health." },
      { name: "Daily Metabolic Support", description: "Active B-complex profiles catalyze clean energy conversion from ingested fats and carbs." }
    ];
  }
  return [
    { name: "Heavy Duty Build", description: "Durable BPA-free composite structure constructed to survive drop tests and heavy gym use." },
    { name: "100% Leak-Proof Guard", description: "Tight seal cap technology guarantees no spillage or shaker leaks in your gym bag." },
    { name: "Smooth Mixing Mesh", description: "Custom whisk grids dissolve stubborn powder clumps in seconds for clean shakes." },
    { name: "Food Grade Safe", description: "100% FDA approved non-toxic materials, completely neutral to odor and residual taste." },
    { name: "Ergonomic Hold", description: "Designed to slot comfortably into standard treadmill cups and car holding rings." }
  ];
}

function getCategoryIngredients(category: string) {
  const proteinIngredients = [
    { name: "Whey Protein Isolate", description: "Ultra-pure cross-flow micro-filtered whey isolate for maximum protein concentration." },
    { name: "Whey Protein Concentrate", description: "Clean concentrate profile containing essential immunoglobulin fractions." },
    { name: "Branched Chain Aminos (BCAAs)", description: "L-Leucine, L-Isoleucine, L-Valine mapped in a 2:1:1 ratio." },
    { name: "Essential Amino Acids (EAAs)", description: "Complete spectrum of body-essential amino blocks." },
    { name: "Digestive DigeZyme Blend", description: "Protease, amylase, lipase, and cellulase enzymes for easy digestion." }
  ];

  if (category === "Protein") return proteinIngredients;
  if (category === "Pre-Workout") {
    return [
      { name: "L-Citrulline Malate", description: "Premium nitric oxide precursor facilitating vascular expansion and pumps." },
      { name: "Beta-Alanine", description: "Enhances carnosine concentration, delaying intramuscular acid accumulation." },
      { name: "Caffeine Anhydrous", description: "High potency central nervous system stimulant for alertness and drive." },
      { name: "L-Tyrosine", description: "Crucial cognitive builder, supporting dopamine and adrenaline synthesis." },
      { name: "Taurine & Electrolytes", description: "Regulates optimal cellular hydration and active cardiac contractions." }
    ];
  }
  if (category === "Creatine") {
    return [
      { name: "100% Micronized Creatine Monohydrate", description: "Pure creatine monohydrate processed down to 200 mesh particle size." },
      { name: "Ultra-Pure Saturation Formula", description: "Free of artificial flavorings, fillers, colors, or processing residuals." }
    ];
  }
  if (category === "Vitamins") {
    return [
      { name: "Milk Thistle (Silymarin Extract)", description: "Standardized extract containing active silymarin molecules to shield liver." },
      { name: "Dandelion Root & Artichoke Extract", description: "Natural diuretics aiding internal waste flushing and bile production." },
      { name: "N-Acetyl Cysteine (NAC)", description: "Powerful direct precursor to glutathione, the liver's master antioxidant." },
      { name: "Coenzyme Q10 & Alpha Lipoic Acid", description: "Mitochondrial protectors aiding systemic cellular energy conversion." },
      { name: "Active B-Complex & Zinc", description: "Micro nutrients ensuring metabolic efficiency and cell repair." }
    ];
  }
  return [
    { name: "High-Density Polyethylene (HDPE)", description: "Durable BPA-free composite plastic material." },
    { name: "Food Grade PP Plastic", description: "SGS certified non-toxic plastic ensuring structural safety." },
    { name: "Food Grade Silicone Gasket", description: "Odorless leak-stopping seal embedded under flip caps." }
  ];
}

function getNutritionalRows(category: string) {
  if (category === "Protein") {
    return [
      { label: "Energy", value: "120 kcal" },
      { label: "Protein", value: "25 g (75.7%)" },
      { label: "Carbohydrates", value: "3 g" },
      { label: "Sugars (Added)", value: "0 g" },
      { label: "Fats (Saturated)", value: "1.5 g (0.5g)" },
      { label: "BCAAs", value: "5.5 g" },
      { label: "Glutamic Acid", value: "4 g" },
      { label: "DigeZyme Blend", value: "150 mg" }
    ];
  }
  if (category === "Pre-Workout") {
    return [
      { label: "L-Citrulline Malate", value: "4000 mg" },
      { label: "Beta-Alanine", value: "3200 mg" },
      { label: "Caffeine Anhydrous", value: "200 mg" },
      { label: "L-Tyrosine", value: "500 mg" },
      { label: "Taurine", value: "1000 mg" },
      { label: "Energy / Sugars", value: "0 kcal / 0 g" }
    ];
  }
  if (category === "Creatine") {
    return [
      { label: "Micronized Creatine Monohydrate", value: "3000 mg (100% purity)" },
      { label: "Active Creatine Yield", value: "2640 mg" },
      { label: "Fillers, Fats, Sugars", value: "0 g" },
      { label: "Heavy Metal Residue", value: "0% / ND" }
    ];
  }
  if (category === "Vitamins") {
    return [
      { label: "Milk Thistle Extract (Silymarin)", value: "500 mg" },
      { label: "Dandelion Root Extract", value: "200 mg" },
      { label: "N-Acetyl Cysteine (NAC)", value: "150 mg" },
      { label: "Alpha Lipoic Acid", value: "100 mg" },
      { label: "Vitamin B1, B2, B6, B12", value: "100% RDA" },
      { label: "Zinc", value: "12 mg" }
    ];
  }
  return [
    { label: "Capacity Volume", value: "700 ml" },
    { label: "BPA Content", value: "0% (BPA Free)" },
    { label: "Material Composition", value: "Food-Grade PP / HDPE" },
    { label: "Whisk Material", value: "316 Surgical Stainless Steel" }
  ];
}

function getCategoryUsage(category: string) {
  if (category === "Protein") return "Drink 1 scoop within 45 minutes post-workout for muscle protein synthesis. Can also be taken in the morning to hit macro targets.";
  if (category === "Pre-Workout") return "Drink 1 scoop dissolved in cold water 20-30 minutes before heavy lifting. Test tolerance with half scoop first. Do not consume within 5 hours of sleep.";
  if (category === "Creatine") return "Take 1 scoop (3g) daily at any time (pre or post workout) with water or whey shake. Drink 3-4 liters of water daily for optimal creatine saturation.";
  if (category === "Vitamins") return "Take 1-2 tablets daily with meals in the morning. Drink plenty of water.";
  return "Add water/milk, dump supplement powder, insert mesh whisk grid, screw lid tight, and shake vigorously for 10-15 seconds.";
}
