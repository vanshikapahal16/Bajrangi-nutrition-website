"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ShieldCheck, Send, X, ChevronLeft, ChevronRight } from "lucide-react";
import { dataService, Review, Product } from "../lib/services";

const FEATURED_TESTIMONIALS = [
  {
    author: "Aryan Sharma",
    role: "State Level Athlete • KUK",
    rating: 5,
    text: "Finding genuine supplements in Kurukshetra used to be a gamble. Bajrangi Nutrition completely changed that. Their verify-on-spot policy and lightning delivery to my hostel at KUK are unmatched!",
    initials: "AS",
  },
  {
    author: "Priya Malhotra",
    role: "Fitness Coach • Kurukshetra",
    rating: 5,
    text: "I recommend Bajrangi to all my clients. Authentic brands, fair pricing, and the team actually knows their supplements. Best store in the city hands down.",
    initials: "PM",
  },
  {
    author: "Rohan Verma",
    role: "Powerlifter • Haryana",
    rating: 5,
    text: "Top-notch customer support! I was confused about which isolate to buy, and their physical trainers guided me to the perfect stack. Real results, genuine seals.",
    initials: "RV",
  }
];

function TestimonialCard({ review, index }: { review: any; index: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 8, y: -y * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(${isHovered ? -6 : 0}px)`,
        transition: isHovered ? "none" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
      className="bg-white/60 backdrop-blur-md border border-gray-150/80 rounded-3xl p-6 md:p-8 flex flex-col relative min-h-[280px] shadow-sm hover:shadow-[0_20px_50px_rgba(242,106,33,0.08)] border-neon-glow transition-all duration-300 select-none group"
    >
      <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10 transition-transform duration-500 group-hover:scale-110" />

      {/* Star Rating with individual entrance delays */}
      <div className="flex gap-0.5 text-amber-500 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 fill-amber-500 text-amber-500 transition-all duration-500 ${
              i < review.rating ? "opacity-100" : "opacity-20"
            }`}
          />
        ))}
      </div>

      <p className="text-xs sm:text-sm text-text-muted leading-relaxed italic flex-grow mb-8 font-medium">
        &ldquo;{review.text}&rdquo;
      </p>

      <div className="flex items-center gap-3.5 pt-5 border-t border-gray-100 mt-auto">
        {/* Floating Avatar Container */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-white font-extrabold text-sm shadow-[0_4px_15px_rgba(242,106,33,0.3)] transition-transform duration-500 group-hover:rotate-6">
          {review.initials}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs sm:text-sm font-black text-text-main leading-tight uppercase font-sans">
              {review.author}
            </h4>
            <span title="Verified Athlete"><ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" /></span>
          </div>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
            {review.role}
          </p>
          {review.productName && (
            <span className="inline-block text-[9px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10 mt-1">
              {review.productName}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    productId: "",
    rating: 5,
    text: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto Slider states
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = dataService.subscribeReviews((data) => {
      setReviews(data.filter((r) => r.approved));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsubProducts = dataService.subscribeProducts((data) => {
      setProducts(data);
    });
    return unsubProducts;
  }, []);

  const allReviews = [
    ...FEATURED_TESTIMONIALS.map((t, i) => ({
      id: `featured-${i}`,
      productName: "Bajrangi Nutrition",
      author: t.author,
      rating: t.rating,
      text: t.text,
      role: t.role,
      initials: t.initials,
    })),
    ...reviews.map((r) => ({
      id: r.id,
      productName: r.productName,
      author: r.author,
      rating: r.rating,
      text: r.text,
      role: "Verified Purchaser",
      initials: r.author
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    })),
  ];

  const avgRating =
    allReviews.length > 0
      ? (
          allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        ).toFixed(1)
      : "5.0";

  // Auto slide effect
  useEffect(() => {
    if (allReviews.length <= 3) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % (allReviews.length - 2));
    }, 5000);
    return () => clearInterval(interval);
  }, [allReviews.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? allReviews.length - 3 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev >= allReviews.length - 3 ? 0 : prev + 1));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.productId || !reviewForm.text.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedProduct = products.find(p => p.id === reviewForm.productId);
      await dataService.saveReview({
        productId: reviewForm.productId,
        productName: selectedProduct?.name || "Unknown Product",
        author: reviewForm.name.trim(),
        rating: reviewForm.rating,
        text: reviewForm.text.trim()
      });
      alert("Review submitted! It will be visible after owner approval.");
      setReviewForm({ name: "", productId: "", rating: 5, text: "" });
      setIsReviewFormOpen(false);
    } catch (error: any) {
      alert(error.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="py-24 sm:py-32 bg-white overflow-hidden border-t border-gray-150 relative"
      id="reviews-section"
    >
      {/* Background Lighting Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-[-10%] right-[10%] w-[350px] h-[350px] rounded-full bg-primary/3 blur-[80px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full inline-block">
            Trusted by Athletes
          </span>
          <h2 className="font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl mt-4 tracking-tight text-text-main uppercase">
            Customer Reviews
          </h2>
          <p className="text-text-muted text-sm sm:text-base max-w-lg mx-auto mt-4 font-medium">
            Real feedback from Kurukshetra students, athletes, and fitness
            enthusiasts who shop with Bajrangi Nutrition.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="flex gap-0.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <span className="text-lg font-black text-text-main">{avgRating}</span>
            <span className="text-sm text-text-muted font-semibold">
              from {allReviews.length}+ reviews
            </span>
            <span className="flex items-center gap-1 text-[10px] font-black uppercase text-green-600 border border-green-200 bg-green-50 px-2.5 py-0.5 rounded-full ml-2">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified
            </span>
          </div>

          <button
            onClick={() => setIsReviewFormOpen(true)}
            className="mt-8 btn-futuristic-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-xs uppercase tracking-widest cursor-pointer shadow-md hover:shadow-lg"
          >
            <Send className="w-4 h-4" /> Share Your Story
          </button>
        </div>

        {/* Testimonials Slider Viewport */}
        <div className="relative mt-12 px-2">
          {allReviews.length > 0 && (
            <>
              {/* Carousel Track wrapper */}
              <div className="overflow-hidden py-4 -my-4">
                <motion.div
                  ref={sliderRef}
                  animate={{ x: `-${activeIndex * (100 / (allReviews.length > 2 ? 3 : 1))}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="flex gap-6 w-full"
                >
                  {allReviews.map((review) => (
                    <div 
                      key={review.id}
                      className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-shrink-0"
                    >
                      <TestimonialCard review={review} index={0} />
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Slider Arrows & Dots Controls */}
              {allReviews.length > 3 && (
                <div className="flex items-center justify-between mt-8">
                  {/* Dots Navigation */}
                  <div className="flex gap-2">
                    {[...Array(allReviews.length - 2)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          activeIndex === i ? "w-6 bg-primary" : "w-2 bg-gray-200"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 bg-white hover:bg-primary/5 transition-all duration-300"
                      title="Previous Review"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 bg-white hover:bg-primary/5 transition-all duration-300"
                      title="Next Review"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Review Submission Modal */}
        {isReviewFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border border-gray-100"
            >
              <button
                onClick={() => setIsReviewFormOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-light hover:bg-gray-200 flex items-center justify-center text-text-muted hover:text-text-main transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black text-text-main mb-6 uppercase tracking-tight font-sans">Share Your Experience</h3>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition-all font-medium text-text-main"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Product Purchased *</label>
                  <select
                    required
                    value={reviewForm.productId}
                    onChange={(e) => setReviewForm({ ...reviewForm, productId: e.target.value })}
                    className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition-all font-medium text-text-main"
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ₹{p.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Rating *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="text-2xl transition-all hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewForm.rating ? "fill-amber-500 text-amber-500" : "text-gray-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Your Review *</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                    placeholder="Share your experience with this product..."
                    className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition-all resize-none font-medium text-text-main"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewFormOpen(false)}
                    className="flex-1 border border-gray-200 hover:border-gray-300 text-text-muted font-bold uppercase tracking-wider text-xs px-4 py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 btn-futuristic-primary text-white font-bold uppercase tracking-wider text-xs px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Review</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
