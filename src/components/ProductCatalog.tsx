"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Eye, Star, X, Info, ShieldCheck, Heart, Leaf } from "lucide-react";
import { dataService, Product, Review } from "../lib/services";

interface ProductCatalogProps {
  onAddToCart: (product: Product, quantity?: number) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

type ModalTab = "details" | "nutrition" | "usage" | "faqs" | "reviews";

export default function ProductCatalog({
  onAddToCart,
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
  
  // Modal internal States
  const [modalQty, setModalQty] = useState(1);
  const [activeDetailTab, setActiveDetailTab] = useState<ModalTab>("details");
  const [selectedImage, setSelectedImage] = useState("");
  
  // Review Form States
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  // Subscribe to Firestore / LocalStorage database changes
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

  // Modal handlers
  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setModalQty(1);
    setActiveDetailTab("details");
    setSelectedImage(product.image); // default to main
    setReviewAuthor("");
    setReviewText("");
    setReviewRating(5);
    setReviewMessage("");
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const handleModalAdd = () => {
    if (!selectedProduct) return;
    onAddToCart(selectedProduct, modalQty);
    closeModal();
  };

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
      setReviewMessage("🎉 Review submitted! It will appear once approved by the owner.");
    } catch (err: any) {
      setReviewMessage("Failed to submit review.");
    }
  };

  // Get approved reviews for selected product
  const productReviews = selectedProduct 
    ? reviews.filter(r => r.productId === selectedProduct.id && r.approved)
    : [];

  return (
    <section className="py-16 bg-white" id="catalog-section">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Search and Category Pill Nav */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-6 border-b border-gray-150">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-text-main">Explore Supplement Stack</h2>
            <p className="text-text-muted text-xs mt-1">Direct shipping from brands. Scan code authentic verified.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex items-center bg-bg-light border border-gray-200 rounded-full px-4 py-2 w-full sm:w-64 focus-within:border-primary transition-all">
              <Search className="w-4 h-4 text-text-muted mr-2" />
              <input 
                type="text" 
                placeholder="Search supplements..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs w-full outline-none text-text-main"
              />
            </div>
            
            {/* Category scroll shortcut */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
              {["all", "Protein", "Pre-Workout", "Creatine", "Accessories", "Vitamins"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-full border transition-all ${
                    activeCategory === cat 
                      ? "bg-primary border-primary text-white" 
                      : "bg-white border-gray-200 hover:border-primary text-text-muted hover:text-primary"
                  }`}
                >
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div>
          {activeCategory !== "all" || searchQuery !== "" ? (
            <h3 className="text-2xl font-extrabold mb-8 uppercase tracking-tight">Filtered Catalog ({filtered.length})</h3>
          ) : (
            <h3 className="text-2xl font-extrabold mb-8 uppercase tracking-tight">All Supplements</h3>
          )}
          
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {filtered.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  wishlist={wishlist}
                  onToggleWishlist={onToggleWishlist}
                  onOpenModal={openModal} 
                  onAddToCart={onAddToCart} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-bg-light rounded-3xl border border-dashed border-gray-200">
              <Info className="w-12 h-12 mx-auto text-primary mb-4" />
              <h4 className="text-lg font-bold text-text-main">No supplements match your search</h4>
              <p className="text-text-muted text-xs max-w-xs mx-auto mt-2">Try checking the spelling or resetting the category tabs.</p>
            </div>
          )}
        </div>

      </div>

      {/* QUICK VIEW SPECIFICATIONS MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="glass-panel w-[90%] max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row max-h-[85vh] bg-white"
            >
              {/* Close Button */}
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 border border-gray-150 flex items-center justify-center text-text-muted hover:text-text-main shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Product Visual & 2D Image Gallery */}
              <div className="w-full md:w-[42%] bg-bg-light flex flex-col items-center justify-between p-6 relative">
                {selectedProduct.isVeg && (
                  <div className="absolute top-4 left-4 w-6 h-6 border border-green-500 p-1 flex items-center justify-center bg-white shadow-sm" title="100% Vegetarian">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  </div>
                )}
                
                {/* Main Image View */}
                <div className="relative w-full h-[220px] md:h-[280px] flex items-center justify-center mt-4">
                  <img 
                    src={selectedImage} 
                    alt={selectedProduct.name} 
                    className="max-h-full max-w-full object-contain filter drop-shadow-md transition-all duration-300"
                  />
                </div>

                {/* Owner Uploaded 2D Image Thumbnails list */}
                <div className="flex gap-2 justify-center w-full mt-6 overflow-x-auto py-1">
                  {(selectedProduct.images && selectedProduct.images.length > 0
                    ? selectedProduct.images 
                    : [selectedProduct.image]
                  ).map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-12 h-12 rounded-lg bg-white border cursor-pointer p-1 flex items-center justify-center hover:border-primary transition-all flex-shrink-0 ${
                        selectedImage === img ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
                      }`}
                    >
                      <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Specs & Informative Tabs Area */}
              <div className="w-full md:w-[58%] p-6 overflow-y-auto flex flex-col justify-between max-h-[85vh]">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md">{selectedProduct.category}</span>
                  <h3 className="text-xl font-bold tracking-tight mt-3 text-text-main leading-tight">{selectedProduct.name}</h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 text-amber-500 mt-2 mb-3 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span className="text-text-main">{productReviews.length > 0 ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1) : "5.0"}</span>
                    <span className="text-text-muted font-normal">({productReviews.length} authenticated reviews)</span>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-black text-text-main">₹{selectedProduct.price.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-text-muted line-through">₹{selectedProduct.originalPrice.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                      {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                    </span>
                  </div>

                  {/* Tab Navigation header */}
                  <div className="flex border-b border-gray-150 mb-5 overflow-x-auto hide-scrollbar gap-4 text-xs font-bold uppercase tracking-wider text-text-muted">
                    {(
                      [
                        { tab: "details", label: "Details" },
                        { tab: "nutrition", label: "Nutrition Facts" },
                        { tab: "usage", label: "Usage & Dosage" },
                        { tab: "faqs", label: "FAQs" },
                        { tab: "reviews", label: `Reviews (${productReviews.length})` }
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.tab}
                        onClick={() => setActiveDetailTab(t.tab)}
                        className={`pb-2 border-b-2 transition-all flex-shrink-0 ${
                          activeDetailTab === t.tab 
                            ? "border-primary text-primary font-black" 
                            : "border-transparent hover:text-primary"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content Display */}
                  <div className="min-h-[160px] text-xs text-text-muted leading-relaxed mb-6">
                    {activeDetailTab === "details" && (
                      <div className="space-y-3">
                        <p>{selectedProduct.description}</p>
                        {selectedProduct.bundleDeal && (
                          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl font-bold">
                            <span>🎁 Special Offer:</span>
                            <span>{selectedProduct.bundleDeal.label}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 bg-bg-light p-3.5 rounded-xl border border-gray-100 mt-4">
                          <div><strong>Flavor:</strong> {selectedProduct.flavor || "Unflavoured"}</div>
                          <div><strong>Weight:</strong> {selectedProduct.weight || "N/A"}</div>
                          <div><strong>Servings:</strong> {selectedProduct.servings || "N/A"}</div>
                          <div><strong>Stock Available:</strong> {selectedProduct.stock} units</div>
                        </div>
                      </div>
                    )}

                    {activeDetailTab === "nutrition" && (
                      <div className="space-y-3">
                        <h4 className="font-bold text-text-main mb-2">Supplement Facts (Per Serving)</h4>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="bg-bg-light p-2.5 font-bold flex justify-between border-b border-gray-200">
                            <span>Nutrient</span>
                            <span>Amount per Serving</span>
                          </div>
                          {selectedProduct.category === "Protein" ? (
                            <div className="divide-y divide-gray-150">
                              <div className="p-2 flex justify-between"><span>Energy</span><span>120 kcal</span></div>
                              <div className="p-2 flex justify-between font-bold text-text-main"><span>Protein</span><span>25 g</span></div>
                              <div className="p-2 flex justify-between"><span>Carbohydrates</span><span>3 g</span></div>
                              <div className="p-2 flex justify-between"><span>Fats</span><span>1.5 g</span></div>
                              <div className="p-2 flex justify-between"><span>BCAA</span><span>5.5 g</span></div>
                            </div>
                          ) : selectedProduct.category === "Creatine" ? (
                            <div className="divide-y divide-gray-150">
                              <div className="p-2 flex justify-between font-bold text-text-main"><span>Creatine Monohydrate</span><span>3 g</span></div>
                              <div className="p-2 flex justify-between"><span>Purity</span><span>100% micronized</span></div>
                            </div>
                          ) : selectedProduct.category === "Pre-Workout" ? (
                            <div className="divide-y divide-gray-150">
                              <div className="p-2 flex justify-between"><span>L-Citrulline Malate</span><span>4 g</span></div>
                              <div className="p-2 flex justify-between"><span>Beta-Alanine</span><span>3.2 g</span></div>
                              <div className="p-2 flex justify-between font-bold text-text-main"><span>Caffeine</span><span>200 mg</span></div>
                              <div className="p-2 flex justify-between"><span>Taurine</span><span>1 g</span></div>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-150">
                              <div className="p-2 flex justify-between"><span>Active Formula</span><span>Clinical Strength</span></div>
                              <div className="p-2 flex justify-between"><span>Fillers / Synthetics</span><span>0% None</span></div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeDetailTab === "usage" && (
                      <div className="space-y-3">
                        <h4 className="font-bold text-text-main">Recommended Guidelines</h4>
                        <p><strong>Directions:</strong> Mix with cold water or milk as preferred. Do not exceed the suggested dosage thresholds.</p>
                        <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl mt-3 text-text-main">
                          <strong>Suggested Serving Timing:</strong>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            {selectedProduct.category === "Protein" && <li>Drink within 45 minutes post-workout for muscle repair.</li>}
                            {selectedProduct.category === "Pre-Workout" && <li>Consume 20-30 minutes before training. Avoid taking late at night.</li>}
                            {selectedProduct.category === "Creatine" && <li>Take daily at any time. Consistency is key for muscle saturation.</li>}
                            {selectedProduct.category === "Vitamins" && <li>Take 1 capsule with meals in the morning.</li>}
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeDetailTab === "faqs" && (
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-bold text-text-main">Q: Is this product authentic?</h5>
                          <p>A: Yes! Bajrangi Nutrition sells only 100% genuine products with brand scratch codes for direct validation.</p>
                        </div>
                        <div className="border-t border-gray-100 pt-2 mt-2">
                          <h5 className="font-bold text-text-main">Q: What is the delivery timeframe in Kurukshetra?</h5>
                          <p>A: For students near KUK University, we deliver within 1 to 2 hours of checkout confirmation.</p>
                        </div>
                      </div>
                    )}

                    {activeDetailTab === "reviews" && (
                      <div className="space-y-4">
                        {/* Add Review Form */}
                        <form onSubmit={handleReviewSubmit} className="space-y-2.5 bg-bg-light p-3 rounded-xl border border-gray-200">
                          <h5 className="font-bold text-text-main">Leave a Review</h5>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              required
                              placeholder="Name" 
                              value={reviewAuthor}
                              onChange={(e) => setReviewAuthor(e.target.value)}
                              className="w-1/2 p-2 rounded-lg bg-white border border-gray-200 text-xs" 
                            />
                            <select 
                              value={reviewRating}
                              onChange={(e) => setReviewRating(Number(e.target.value))}
                              className="w-1/2 p-2 rounded-lg bg-white border border-gray-200 text-xs"
                            >
                              <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                              <option value={4}>⭐⭐⭐⭐ (4)</option>
                              <option value={3}>⭐⭐⭐ (3)</option>
                              <option value={2}>⭐⭐ (2)</option>
                              <option value={1}>⭐ (1)</option>
                            </select>
                          </div>
                          <textarea 
                            required
                            rows={2} 
                            placeholder="Share your thoughts about this supplement..." 
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="w-full p-2 rounded-lg bg-white border border-gray-200 text-xs"
                          ></textarea>
                          <button type="submit" className="bg-primary hover:bg-primary-hover text-white text-[10px] uppercase font-bold tracking-wider px-4 py-1.5 rounded-lg shadow-sm">Submit Review</button>
                          {reviewMessage && <p className="text-[10px] font-bold text-primary mt-1">{reviewMessage}</p>}
                        </form>

                        {/* Reviews list */}
                        <div className="space-y-2 max-h-[150px] overflow-y-auto">
                          {productReviews.length === 0 ? (
                            <p className="text-text-muted italic">No reviews yet. Be the first to share your experience!</p>
                          ) : (
                            productReviews.map(r => (
                              <div key={r.id} className="border-b border-gray-100 pb-2">
                                <div className="flex justify-between font-bold text-text-main text-[11px]">
                                  <span>{r.author}</span>
                                  <span className="text-amber-500">{"⭐".repeat(r.rating)}</span>
                                </div>
                                <p className="text-[10px] text-text-muted mt-0.5">{r.text}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Frequently Bought Together (Upsell banner) */}
                {selectedProduct.category === "Protein" && (
                  <div className="mb-4 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-bold text-amber-800">Frequently Bought Together:</span>
                      <p className="text-text-muted">Add Creatine Monohydrate to maximize muscle mass!</p>
                    </div>
                    <button 
                      onClick={() => {
                        const creatine = products.find(p => p.category === "Creatine");
                        if (creatine) {
                          onAddToCart(creatine, 1);
                        }
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg"
                    >
                      + Add Bundle
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  {selectedProduct.stock > 0 ? (
                    <>
                      {/* Quantity counter */}
                      <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 w-28 bg-bg-light">
                        <button 
                          onClick={() => setModalQty(q => Math.max(1, q - 1))}
                          className="text-text-muted hover:text-primary font-bold text-lg"
                        >-</button>
                        <span className="text-xs font-bold text-text-main">{modalQty}</span>
                        <button 
                          onClick={() => setModalQty(q => Math.min(selectedProduct.stock, q + 1))}
                          className="text-text-muted hover:text-primary font-bold text-lg"
                        >+</button>
                      </div>
                      
                      <button 
                        onClick={handleModalAdd}
                        className="flex-grow bg-primary hover:bg-primary-hover text-white text-xs uppercase font-extrabold tracking-wider py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </button>
                    </>
                  ) : (
                    <button 
                      disabled
                      className="w-full bg-gray-100 border border-gray-200 text-text-muted text-xs uppercase font-bold py-3.5 rounded-xl cursor-not-allowed"
                    >
                      Sold Out
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Internal child component: Product Card
function ProductCard({ 
  product, 
  wishlist,
  onToggleWishlist,
  onOpenModal, 
  onAddToCart 
}: { 
  product: Product; 
  wishlist: string[];
  onToggleWishlist: (pId: string) => void;
  onOpenModal: (p: Product) => void;
  onAddToCart: (p: Product, qty: number) => void;
}) {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const outOfStock = product.stock <= 0;
  const isWishlisted = wishlist.includes(product.id);

  let stockText = "In Stock";
  let stockClass = "text-green-600 bg-green-500/10 border-green-500/20";
  if (outOfStock) {
    stockText = "Out of Stock";
    stockClass = "text-danger bg-danger/10 border-danger/20";
  } else if (product.stock <= 4) {
    stockText = `Only ${product.stock} left`;
    stockClass = "text-amber-600 bg-amber-500/10 border-amber-500/20";
  }

  return (
    <motion.div 
      layout
      className="glass-card bg-white border border-gray-100 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        {product.isRunning && (
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-primary text-white rounded-md">Bestseller</span>
        )}
        {product.bundleDeal && (
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-green-500 text-white rounded-md">Offer</span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={() => onToggleWishlist(product.id)}
        className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
          isWishlisted 
            ? "bg-red-500 border-red-500 text-white" 
            : "bg-white border-gray-250 text-text-muted hover:text-red-500"
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-white" : ""}`} />
      </button>
      
      {/* Product Image Frame */}
      <div className="bg-bg-light rounded-2xl h-44 flex items-center justify-center p-6 relative group mb-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        />
        {/* Soft aura blur behind bottle */}
        <div className="absolute w-20 h-20 bg-primary/5 rounded-full filter blur-xl -z-1"></div>
      </div>

      {/* Info details */}
      <div className="flex flex-col flex-grow justify-between text-xs">
        <div>
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{product.category}</span>
          <h4 className="text-xs font-bold text-text-main leading-snug tracking-tight line-clamp-2 mt-1 mb-2 min-h-[38px]">{product.name}</h4>
          
          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-base font-extrabold text-text-main">₹{product.price.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-text-muted line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
            <span className="text-[9px] text-green-600 font-bold">{discount}% OFF</span>
          </div>
        </div>

        <div>
          {/* Stock state badge */}
          <div className="mb-4">
            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md border ${stockClass}`}>{stockText}</span>
          </div>

          {/* Action triggers */}
          <div className="grid grid-cols-5 gap-2">
            <button 
              onClick={() => onOpenModal(product)}
              className="col-span-1.5 border border-gray-200 hover:border-primary rounded-xl flex items-center justify-center text-text-muted hover:text-primary transition-all p-2.5 bg-white"
              title="View Specifications & Gallery"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onAddToCart(product, 1)}
              disabled={outOfStock}
              className={`col-span-3.5 text-xs font-bold uppercase tracking-wider rounded-xl py-2.5 transition-all flex items-center justify-center gap-1.5 ${
                outOfStock 
                  ? "bg-gray-100 border border-gray-200 text-text-muted cursor-not-allowed" 
                  : "bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow-md"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
