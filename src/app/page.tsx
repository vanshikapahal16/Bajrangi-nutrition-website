"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
      {/* Dynamic cursor following glowing backdrop */}
      {isClient && (
        <div 
          className="cursor-glow hidden md:block" 
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }} 
        />
      )}

      {/* 8. Physical Outlet Map & Hours */}
      <section className="py-24 sm:py-32 bg-white border-t border-gray-150 relative" id="contact-section">
        {/* Background glow overlay */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-primary/4 blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full inline-block">Store Location</span>
            <h2 className="text-4xl sm:text-5xl font-black mt-4 mb-4 text-text-main uppercase font-sans tracking-tight">Visit Bajrangi Outlet</h2>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed mb-10 max-w-md font-medium">
              Located right near **Kurukshetra University (KUK)**. Taste test products, check FSSAI codes, and talk with our physical trainers.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shrink-0"><MapPin className="w-5 h-5" /></div>
                <div>
                  <p className="text-text-muted text-xs mt-1 font-medium">Divine City Centre, Opposite to New Bus Stand, Kurukshetra, Haryana - 136119</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shrink-0"><Phone className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">WhatsApp & Call</h4>
                  <p className="text-text-muted text-xs mt-1 font-medium">+91 95887-15527 | +91 99960-67101</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">Instagram</h4>
                  <p className="text-text-muted text-xs mt-1 font-medium">@bajrangi_nutrition_kurukshetra</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shrink-0"><Clock className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">Working Hours</h4>
                  <p className="text-text-muted text-xs mt-1 font-medium">Monday - Sunday: 10:00 AM - 9:00 PM (KUK University Delivery 24/7)</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Map Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="h-[380px] rounded-3xl overflow-hidden shadow-lg border border-gray-150 relative group cursor-pointer"
          >
            <a
              href="https://www.google.com/maps/search/?api=1&query=Divine+City+Centre,+Opposite+to+New+Bus+Stand,+Kurukshetra,+Haryana"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3470.123456789!2d76.8126839!3d29.9676649!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sDivine+City+Centre!2sKurukshetra!5e0!3m2!1sen!2sin"
                className="w-full h-full border-none filter grayscale contrast-110 saturate-50 group-hover:scale-105 group-hover:grayscale-0 group-hover:contrast-100 group-hover:saturate-100 transition-all duration-700"
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
          </motion.div>
        </div>
      </section>

      {/* 9. Redesigned Premium Dark Footer */}
      <footer className="bg-black text-white py-20 relative overflow-hidden border-t border-white/5">
        {/* Glow element in footer */}
        <div className="absolute top-0 left-[20%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 pb-16 border-b border-white/10 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                <img src="/assets/logo.png" alt="" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-sm uppercase tracking-wider text-white">Bajrangi Nutrition</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs font-medium">
              Dedicated to supplying premium, brand-authentic proteins, muscle gainers, and vitamins to Kurukshetra university students and local athletes.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Product Classes</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 font-medium">
              <a href="#catalog-section" onClick={() => setActiveCategory("Protein")} className="hover:text-primary transition-colors">Whey Isolate</a>
              <a href="#catalog-section" onClick={() => setActiveCategory("Pre-Workout")} className="hover:text-primary transition-colors">Pre-Workouts</a>
              <a href="#catalog-section" onClick={() => setActiveCategory("Creatine")} className="hover:text-primary transition-colors">Micronized Creatine</a>
              <a href="#catalog-section" onClick={() => setActiveCategory("Accessories")} className="hover:text-primary transition-colors">Shakers & Accessories</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Subscribe to stock updates</h4>
            <p className="text-gray-400 text-xs font-medium">Join our newsletter to receive notifications on brand restocks and Badam Ragda discount vouchers.</p>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); triggerToast("Subscribed successfully!", "success"); }}>
              <input 
                type="email" 
                required 
                placeholder="Email address" 
                className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary/50 flex-grow font-medium" 
              />
              <button className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all">Join</button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-10 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">&copy; 2026 Bajrangi Nutrition Kurukshetra. 100% Authentic Seals Verified.</p>
            <a href="https://www.instagram.com/bajrangi_nutrition_kurukshetra/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/35 bg-neutral-950 transition-all"><Instagram className="w-4 h-4" /></a>
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
