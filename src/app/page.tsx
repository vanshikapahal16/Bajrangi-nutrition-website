"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Phone,
  Instagram,
  Facebook,
  Youtube,
  MessageSquare,
  ShoppingBag
} from "lucide-react";
import confetti from "canvas-confetti";

// Sub-components
import StoreHeader from "../components/StoreHeader";
import HeroSection from "../components/HeroSection";
import DiscountAnnouncementBanner from "../components/DiscountAnnouncementBanner";
import PromoCarousel from "../components/PromoCarousel";
import CustomerReviews from "../components/CustomerReviews";
import WhyBajrangi from "../components/WhyBajrangi";
import ProductCatalog from "../components/ProductCatalog";
import CartDrawer from "../components/CartDrawer";
import AdminPortal from "../components/AdminPortal";
import FloatingSocialIcons from "../components/FloatingSocialIcons";
import MyAccount from "../components/MyAccount";
import { CartItem, Product, dataService } from "../lib/services";

const WHATSAPP_NUMBER = "91996067101";

interface ToastMessage {
  id: string;
  msg: string;
  type: "primary" | "success" | "warning" | "danger";
}

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartDefaultMode, setCartDefaultMode] = useState<"cart" | "wishlist">("cart");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMyAccountOpen, setIsMyAccountOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    // Load Cart from LocalStorage
    if (localStorage.getItem("bajrangi_cart")) {
      try {
        setCart(JSON.parse(localStorage.getItem("bajrangi_cart") || "[]"));
      } catch (e) {
        console.error("Cart loading failed:", e);
      }
    }
    // Load Wishlist from LocalStorage
    if (localStorage.getItem("bajrangi_wishlist")) {
      try {
        setWishlist(JSON.parse(localStorage.getItem("bajrangi_wishlist") || "[]"));
      } catch (e) {
        console.error("Wishlist loading failed:", e);
      }
    }

    // Subscribe to products
    const unsubProducts = dataService.subscribeProducts((data) => {
      setProducts(data);
    });

    return () => {
      unsubProducts();
    };
  }, []);

  // Sync Cart
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("bajrangi_cart", JSON.stringify(newCart));
  };

  // Toggle Wishlist handler
  const handleToggleWishlist = (productId: string) => {
    const isAdded = wishlist.includes(productId);
    let updated: string[];
    if (isAdded) {
      updated = wishlist.filter(id => id !== productId);
      triggerToast("Removed from wishlist.", "primary");
    } else {
      updated = [...wishlist, productId];
      triggerToast("Added to wishlist!", "success");
      
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.85, x: 0.85 },
        colors: ["#FF0000", "#FFFFFF"]
      });
    }
    setWishlist(updated);
    localStorage.setItem("bajrangi_wishlist", JSON.stringify(updated));
  };

  // Toast trigger
  const triggerToast = (msg: string, type: ToastMessage["type"] = "primary") => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, msg, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Add to Cart
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      triggerToast("This item is currently sold out.", "warning");
      return;
    }

    const existing = cart.find(item => item.productId === product.id);
    const currentAddedQty = existing ? existing.quantity : 0;
    
    if (currentAddedQty + quantity > product.stock) {
      triggerToast(`Cannot add more. Only ${product.stock} units available in stock.`, "warning");
      return;
    }

    let updatedCart: CartItem[];
    if (existing) {
      updatedCart = cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          productId: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: quantity,
          stockLimit: product.stock,
          bundleDeal: product.bundleDeal
        }
      ];
    }

    saveCart(updatedCart);
    triggerToast(`Added ${product.name} to cart.`, "success");
    
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.85, x: 0.85 },
      colors: ["#FF6B00", "#FFD600", "#FFFFFF"]
    });
  };

  const handleUpdateCartQty = (productId: string, change: number) => {
    const item = cart.find(i => i.productId === productId);
    if (!item) return;

    const targetQty = item.quantity + change;
    if (targetQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    if (targetQty > item.stockLimit) {
      triggerToast(`Only ${item.stockLimit} units available.`, "warning");
      return;
    }

    const updated = cart.map(i => i.productId === productId ? { ...i, quantity: targetQty } : i);
    saveCart(updated);
  };

  const handleRemoveCartItem = (productId: string) => {
    const updated = cart.filter(i => i.productId !== productId);
    saveCart(updated);
    triggerToast("Item removed from cart.", "primary");
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setCartDefaultMode("cart");
    setIsCartOpen(true);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white selection:bg-primary/25 selection:text-primary">
      {/* Premium Header Stack */}
      <StoreHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => {
          setCartDefaultMode("cart");
          setIsCartOpen(true);
        }}
        onOpenWishlist={() => {
          setCartDefaultMode("wishlist");
          setIsCartOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenMyAccount={() => setIsMyAccountOpen(true)}
        isClient={isClient}
      />
      <HeroSection />
      <DiscountAnnouncementBanner />

      {/* Promotional Product Carousel */}
      {isClient && products.length > 0 && (
        <PromoCarousel 
          products={products}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onOpenModal={(product) => {
            // Re-use catalog Spec Modal opener structure
            const catComp = document.getElementById("catalog-section");
            if (catComp) catComp.scrollIntoView({ behavior: "smooth" });
            
            // Wait brief transition and open catalog modal directly
            setTimeout(() => {
              const modalTrigger = document.querySelector(`button[title="View Specifications & Gallery"]`);
              if (modalTrigger) (modalTrigger as HTMLButtonElement).click();
            }, 600);
          }}
        />
      )}

      {/* Explore Products - Catalog Section */}
      <ProductCatalog 
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Why Bajrangi Nutrition Section */}
      <WhyBajrangi />

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* 8. Physical Outlet Map & Hours */}
      <section className="py-20 bg-bg-light border-t border-gray-100" id="contact-section">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-widest">Store Location</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 mb-4 text-text-main">Visit Bajrangi Outlet</h2>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed mb-10 max-w-md">
              Located right near **Kurukshetra University (KUK)**. Taste test products, check FSSAI codes, and talk with our physical trainers.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm"><MapPin className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">Store Address</h4>
                  <p className="text-text-muted text-xs mt-0.5">Divine City Centre, Opposite to New Bus Stand, Kurukshetra, Haryana - 136119</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm"><Phone className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">WhatsApp & Call</h4>
                  <p className="text-text-muted text-xs mt-0.5">+91 99960-67101</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">Instagram</h4>
                  <p className="text-text-muted text-xs mt-0.5">@bajrangi_nutrition_kurukshetra</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm"><Clock className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">Working Hours</h4>
                  <p className="text-text-muted text-xs mt-0.5">Monday - Sunday: 10:00 AM - 9:00 PM (KUK University Delivery 24/7)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Frame */}
          <div className="h-[380px] rounded-3xl overflow-hidden shadow-lg border border-gray-100 relative group cursor-pointer">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Divine+City+Centre,+Opposite+to+New+Bus+Stand,+Kurukshetra,+Haryana"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3470.123456789!2d76.8126839!3d29.9676649!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sDivine+City+Centre!2sKurukshetra!5e0!3m2!1sen!2sin"
                className="w-full h-full border-none filter grayscale contrast-110 saturate-50 group-hover:grayscale-0 group-hover:contrast-100 group-hover:saturate-100 transition-all duration-300"
                allowFullScreen
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-xs font-bold text-text-main flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Open in Google Maps
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-gray-100">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/assets/logo.png" alt="" className="w-8 h-8 object-contain" />
              <span className="font-extrabold text-sm uppercase tracking-wider text-text-main">Bajrangi Nutrition</span>
            </div>
            <p className="text-text-muted text-xs leading-relaxed max-w-xs">
              Dedicated to supplying premium, brand-authentic proteins, muscle gainers, and vitamins to Kurukshetra university students and local athletes.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">Product Classes</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
              <a href="#catalog-section" onClick={() => setActiveCategory("Protein")} className="hover:text-primary">Whey Isolate</a>
              <a href="#catalog-section" onClick={() => setActiveCategory("Pre-Workout")} className="hover:text-primary">Pre-Workouts</a>
              <a href="#catalog-section" onClick={() => setActiveCategory("Creatine")} className="hover:text-primary">Micronized Creatine</a>
              <a href="#catalog-section" onClick={() => setActiveCategory("Accessories")} className="hover:text-primary">Shakers & Accessories</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">Subscribe to stock updates</h4>
            <p className="text-text-muted text-xs">Join our newsletter to receive notifications on brand restocks and Badam Ragda discount vouchers.</p>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); triggerToast("Subscribed successfully!", "success"); }}>
              <input type="email" required placeholder="Email address" className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2 text-xs text-text-main outline-none focus:border-primary flex-grow" />
              <button className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm">Join</button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-text-muted text-[10px]">&copy; 2026 Bajrangi Nutrition Kurukshetra. 100% Authentic Seals Verified.</p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/bajrangi_nutrition_kurukshetra/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary hover:bg-white shadow-sm transition-all"><Instagram className="w-4 h-4" /></a>
          </div>
        </div>
      </footer>

      {/* Overlays / Modals */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        showToast={triggerToast}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
        products={products}
        onAddToCart={handleAddToCart}
        defaultMode={cartDefaultMode}
      />

      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        showToast={triggerToast}
      />

      <MyAccount
        isOpen={isMyAccountOpen}
        onClose={() => setIsMyAccountOpen(false)}
        showToast={triggerToast}
      />

      {/* Floating Social Media Icons */}
      <FloatingSocialIcons />

      {/* Floating Cart Button - Shows when cart has items */}
      {cart.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-primary hover:bg-primary-hover text-white rounded-full px-5 py-3 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
          title="Open Cart"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Cart</span>
          <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {cart.length}
          </span>
        </motion.button>
      )}

      {/* Custom Toast Alerts Renderer */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5">
        {toasts.map((t) => (
          <div 
            key={t.id}
            className={`flex items-center gap-2.5 px-5 py-4 rounded-xl shadow-lg border text-xs font-bold transition-all duration-300 animate-slide-in ${
              t.type === "success" 
                ? "bg-white border-green-500/30 text-green-700" 
                : t.type === "danger" 
                ? "bg-white border-red-500/30 text-red-700" 
                : t.type === "warning" 
                ? "bg-white border-amber-500/30 text-amber-700" 
                : "bg-white border-primary/30 text-primary"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              t.type === "success" ? "bg-green-500" : t.type === "danger" ? "bg-red-500" : t.type === "warning" ? "bg-amber-500" : "bg-primary"
            }`} />
            {t.msg}
          </div>
        ))}
      </div>

    </div>
  );
}
