"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Phone, 
  Instagram, 
  Facebook,
  Youtube,
  MessageSquare,
  UserCheck,
  Heart,
  Calendar,
  Percent
} from "lucide-react";
import confetti from "canvas-confetti";

// Sub-components
import BentoBenefits from "../components/BentoBenefits";
import PromoCarousel from "../components/PromoCarousel";
import ProductCatalog from "../components/ProductCatalog";
import CartDrawer from "../components/CartDrawer";
import AdminPortal from "../components/AdminPortal";
import { CartItem, Product, dataService } from "../lib/services";

const WHATSAPP_NUMBER = "919588715527";

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
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [marqueeText, setMarqueeText] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Mark client mount
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

    // Subscribe to marquee text
    const unsubMarquee = dataService.subscribeMarquee((data) => {
      setMarqueeText(data);
    });

    return () => {
      unsubProducts();
      unsubMarquee();
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

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Flash Sale Countdown Mock (Resets daily)
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 30, seconds: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden selection:bg-primary/25 selection:text-primary">
      <div className="aurora-bg"></div>

      {/* 1. Announcement Marquee Bar */}
      <div className="bg-gradient-to-r from-neutral-900 via-primary to-neutral-900 text-white text-[11px] font-bold tracking-widest uppercase py-2.5 overflow-hidden relative z-40 border-b border-white/5">
        <div className="animate-[scroll-promo_28s_linear_infinite] whitespace-nowrap inline-block pl-[35%]">
          {marqueeText || "🚚 FREE SAME-DAY DOORSTEP DELIVERY IN KURUKSHETRA • 🛡️ 100% GENUINE PRODUCTS GUARANTEED"}
        </div>
      </div>

      {/* 2. Apple Glassmorphic Header */}
      <header className="sticky top-0 h-[80px] bg-white/70 backdrop-blur-md border-b border-gray-150 flex items-center z-40 transition-all">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          {/* Logo link */}
          <a href="#" className="flex items-center gap-2">
            <div className="relative w-11 h-11 rounded-full bg-white border border-primary/5 p-1">
              <img src="/assets/logo.png" alt="Bajrangi Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-text-main leading-tight">BAJRANGI</span>
              <span className="text-[9px] font-black uppercase text-primary tracking-widest leading-none">NUTRITIONS</span>
            </div>
          </a>

          {/* Quick links scroll bar shortcut */}
          <nav className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-wider text-text-muted">
            <a href="#" className="hover:text-primary transition-all">Home</a>
            <a href="#trending-section" className="hover:text-primary transition-all">Bestsellers</a>
            <a href="#benefits-section" className="hover:text-primary transition-all">Purity Proof</a>
            <a href="#catalog-section" className="hover:text-primary transition-all">Catalog</a>
            <a href="#contact-section" className="hover:text-primary transition-all">Outlet Map</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Owner portal trigger */}
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="w-10 h-10 rounded-full bg-white/80 border border-gray-150 flex items-center justify-center text-text-muted hover:text-primary hover:bg-white shadow-sm hover:shadow-md transition-all"
              title="Admin Panel"
            >
              <UserCheck className="w-4.5 h-4.5" />
            </button>

            {/* Wishlist button */}
            <button 
              onClick={() => {
                setCartDefaultMode("wishlist");
                setIsCartOpen(true);
              }}
              className="relative w-10 h-10 rounded-full bg-white/80 border border-gray-150 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-white shadow-sm hover:shadow-md transition-all"
              title="View Wishlist"
            >
              <Heart className="w-4.5 h-4.5" />
              {isClient && wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart button */}
            <button 
              onClick={() => {
                setCartDefaultMode("cart");
                setIsCartOpen(true);
              }}
              className="relative w-10 h-10 rounded-full bg-white/80 border border-gray-150 flex items-center justify-center text-text-muted hover:text-primary hover:bg-white shadow-sm hover:shadow-md transition-all"
              title="View Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {isClient && totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center animate-bounce shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Section — Full-bleed Video Background */}
      <section className="relative min-h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden">
        {/* Background video: plays once, holds on its last frame (no loop) */}
        <video
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover -z-10"
        >
          <source src="/assets/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay so the tagline stays readable over any frame */}
        <div className="absolute inset-0 bg-black/45 -z-10"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-4xl sm:text-6xl md:text-7xl text-white drop-shadow-lg">
            100% Genuine Product,<br />
            <span className="text-primary">But With Confidence</span>
          </h1>
        </div>
      </section>

      {/* 4. Flash Deal Banner Section */}
      <section className="bg-bg-light border-y border-gray-150 py-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center animate-pulse"><Percent className="w-6 h-6" /></div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight">Kurukshetra Special Bundle deals</h4>
              <p className="text-text-muted text-[11px] font-medium">Auto Buy 2 Get 1 FREE applied on selected liver and health capsules!</p>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Deals Expire In:</span>
            <div className="flex gap-1.5 font-mono text-xs font-black text-white">
              <span className="bg-text-main px-2.5 py-1.5 rounded-lg">{timeLeft.hours.toString().padStart(2, "0")}h</span>
              <span className="text-text-main font-bold py-1">:</span>
              <span className="bg-text-main px-2.5 py-1.5 rounded-lg">{timeLeft.minutes.toString().padStart(2, "0")}m</span>
              <span className="text-text-main font-bold py-1">:</span>
              <span className="bg-primary px-2.5 py-1.5 rounded-lg">{timeLeft.seconds.toString().padStart(2, "0")}s</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Promotional Product Carousel (MyProtein inspired) */}
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

      {/* 6. Bento Grid Benefits */}
      <BentoBenefits />

      {/* 7. Catalog Section */}
      <ProductCatalog 
        onAddToCart={handleAddToCart}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* 8. Physical Outlet Map & Hours */}
      <section className="py-20 bg-bg-light border-t border-gray-150" id="contact-section">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-widest">Store Location</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 mb-4 text-text-main">Visit Bajrangi Outlet</h2>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed mb-10 max-w-md">
              Located right near **Kurukshetra University (KUK)**. Taste test products, check FSSAI codes, and talk with our physical trainers.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-150 flex items-center justify-center text-primary shadow-sm"><MapPin className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">Store Address</h4>
                  <p className="text-text-muted text-xs mt-0.5">Bajrangi Nutrition, Pipili Road, Opp. Near New Bus Stand, Kurukshetra, Haryana - 136119</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-150 flex items-center justify-center text-primary shadow-sm"><Phone className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">WhatsApp Direct Phone</h4>
                  <p className="text-text-muted text-xs mt-0.5">+91 95887-15527 | +91 99960-67101</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-150 flex items-center justify-center text-primary shadow-sm"><Clock className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">Working Hours</h4>
                  <p className="text-text-muted text-xs mt-0.5">Monday - Sunday: 10:00 AM - 9:00 PM (KUK University Delivery 24/7)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Frame */}
          <div className="h-[380px] rounded-3xl overflow-hidden shadow-lg border border-gray-150 relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13791.642533036495!2d76.81268393529237!3d29.967664875323573!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390e3f4251df83df%3A0x6e902cf697b0032b!2sKurukshetra%20University!5e0!3m2!1sen!2sin!4v1721020000000!5m2!1sen!2sin" 
              className="w-full h-full border-none filter grayscale contrast-110 saturate-50"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-white border-t border-gray-150 py-16">
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
            <a href="https://instagram.com" target="_blank" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary hover:bg-white shadow-sm transition-all"><Instagram className="w-4 h-4" /></a>
            <a href="https://facebook.com" target="_blank" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary hover:bg-white shadow-sm transition-all"><Facebook className="w-4 h-4" /></a>
            <a href="https://youtube.com" target="_blank" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary hover:bg-white shadow-sm transition-all"><Youtube className="w-4 h-4" /></a>
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

      {/* Floating Web-Consult assistant badge (bottom left) */}
      <a 
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        className="fixed bottom-6 left-6 z-30 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        title="WhatsApp Chat"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Chat on WhatsApp</span>
      </a>

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
