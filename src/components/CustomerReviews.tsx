"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ShieldCheck, Send, X } from "lucide-react";
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
];

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
      className="py-20 lg:py-28 bg-white border-t border-gray-100"
      id="reviews-section"
    >
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full inline-block">
            Trusted by Athletes
          </span>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl md:text-5xl mt-4 tracking-tight text-text-main uppercase">
            Customer Reviews
          </h2>
          <p className="text-text-muted text-sm max-w-lg mx-auto mt-3 font-medium">
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
            <span className="text-sm text-text-muted">
              from {allReviews.length}+ reviews
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-cta-green ml-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>

          <button
            onClick={() => setIsReviewFormOpen(true)}
            className="mt-6 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
          >
            <Send className="w-4 h-4" /> Write a Review
          </button>
        </div>

        {/* Review Submission Modal */}
        {isReviewFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setIsReviewFormOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-text-muted hover:text-text-main transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold text-text-main mb-6">Share Your Experience</h3>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Product Purchased *</label>
                  <select
                    required
                    value={reviewForm.productId}
                    onChange={(e) => setReviewForm({ ...reviewForm, productId: e.target.value })}
                    className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition-all"
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
                    className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition-all resize-none"
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
                    className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold uppercase tracking-wider text-xs px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Review</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allReviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
              className="premium-glass-card rounded-2xl p-6 flex flex-col relative"
            >
              <Quote className="absolute top-5 right-5 w-8 h-8 text-primary/10" />

              <div className="flex gap-0.5 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < review.rating
                        ? "fill-amber-500 text-amber-500"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-text-muted leading-relaxed italic flex-grow mb-6">
                &ldquo;{review.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                  {review.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-main">
                    {review.author}
                  </h4>
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wide mt-0.5">
                    {review.role}
                  </p>
                  {review.productName && (
                    <p className="text-[10px] text-primary font-medium mt-0.5">
                      {review.productName}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
