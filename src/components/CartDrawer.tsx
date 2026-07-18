"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, CheckCircle, Smartphone, Tag, Heart, ShoppingCart, LogIn } from "lucide-react";
import { CartItem, Product, SchemaValidator, dataService, RateLimiter, Coupon, customerAuthService } from "../lib/services";
import OrderConfirmation from "./OrderConfirmation";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  showToast: (msg: string, type?: "primary" | "success" | "warning" | "danger") => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  defaultMode?: "cart" | "wishlist";
}

type DrawerMode = "cart" | "wishlist";

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  showToast,
  wishlist,
  onToggleWishlist,
  products,
  onAddToCart,
  defaultMode = "cart"
}: CartDrawerProps) {
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(defaultMode);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [confirmedOrderAmount, setConfirmedOrderAmount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Coupon States
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDrawerMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  useEffect(() => {
    // Check customer auth state
    const unsubscribe = customerAuthService.checkAuthState((user) => {
      setIsAuthenticated(!!user);
      setCurrentUser(user);
      if (user) {
        setCustomerName(user.displayName || "");
        setCustomerPhone(user.phoneNumber || "");
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const WHATSAPP_NUMBER = "919588715527"; // Shop target number

  // Fetch active coupons
  useEffect(() => {
    const unsub = dataService.subscribeCoupons((data) => {
      setCoupons(data);
    });
    return () => unsub();
  }, []);

  // 1. Calculate base subtotal (items before discount)
  const baseSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 2. Identify Buy X Get Y Free Bundle Offers
  const bundleFreeItems: { productId: string; name: string; quantity: number; image: string }[] = [];
  
  cart.forEach(item => {
    if (item.bundleDeal) {
      const { buyQty, freeQty } = item.bundleDeal;
      if (item.quantity >= buyQty) {
        const freeCount = Math.floor(item.quantity / buyQty) * freeQty;
        if (freeCount > 0) {
          bundleFreeItems.push({
            productId: item.productId,
            name: `FREE ${item.name}`,
            quantity: freeCount,
            image: item.image
          });
        }
      }
    }
  });

  // 3. Calculate coupon discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percent") {
      couponDiscount = Math.round(baseSubtotal * (appliedCoupon.discount / 100));
    } else {
      couponDiscount = Math.min(baseSubtotal, appliedCoupon.discount);
    }
  }

  const finalSubtotal = Math.max(0, baseSubtotal - couponDiscount);

  // Coupon Application handler
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const match = coupons.find(c => c.code.toUpperCase() === couponInput.trim().toUpperCase());
    if (match) {
      setAppliedCoupon(match);
      showToast(`Coupon "${match.code}" applied successfully!`, "success");
      setCouponInput("");
    } else {
      showToast("Invalid coupon code.", "danger");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showToast("Coupon removed.", "primary");
  };

  // Handle Google Sign-In for checkout
  const handleCustomerLogin = async () => {
    await customerAuthService.login(
      (user) => {
        setIsAuthenticated(true);
        setCurrentUser(user);
        showToast("Successfully signed in!", "success");
      },
      (error) => {
        showToast(error, "danger");
      }
    );
  };

  // Checkout order submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      showToast("Please sign in to continue with checkout", "warning");
      await handleCustomerLogin();
      return;
    }

    // 1. Rate Limit check
    const rateLimit = RateLimiter.checkCheckout();
    if (!rateLimit.allowed) {
      showToast(`Checkout Throttled: Please wait ${rateLimit.cooldownRemaining}s before resubmitting.`, "danger");
      return;
    }

    // 2. Strict Input Schema Validation
    try {
      SchemaValidator.validateCheckout(customerName, customerPhone);
    } catch (err: any) {
      showToast(err.message, "danger");
      return;
    }

    // Compile WhatsApp redirect message
    const orderDateTime = new Date().toLocaleString('en-IN', { 
      dateStyle: 'medium', 
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    });
    
    let message = `*NEW ORDER - BAJRANGI NUTRITION KURUKSHETRA*\n`;
    message += `===================================\n`;
    message += `*Customer Details:*\n`;
    message += `👤 Name: ${customerName.trim()}\n`;
    message += `📞 Contact: ${customerPhone.trim()}\n`;
    message += `📧 Email: ${currentUser?.email || 'N/A'}\n`;
    message += `🕐 Order Placed: ${orderDateTime}\n\n`;
    message += `*Ordered Items:*\n`;
    
    // Add primary items
    const orderItems: any[] = cart.map(item => {
      message += `• ${item.quantity}x ${item.name} - *₹${(item.price * item.quantity).toLocaleString("en-IN")}*\n`;
      return {
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      };
    });

    // Add free bundle items
    bundleFreeItems.forEach(freeItem => {
      message += `• ${freeItem.quantity}x ${freeItem.name} - *₹0 (FREE Offer Applied)*\n`;
      orderItems.push({
        productId: freeItem.productId,
        name: freeItem.name,
        price: 0,
        quantity: freeItem.quantity,
        isFree: true
      });
    });

    message += `===================================\n`;
    message += `Subtotal: ₹${baseSubtotal.toLocaleString("en-IN")}\n`;
    if (appliedCoupon) {
      message += `🎟️ Discount Coupon [${appliedCoupon.code}]: -₹${couponDiscount.toLocaleString("en-IN")}\n`;
    }
    message += `*Total Amount Payable:* ₹${finalSubtotal.toLocaleString("en-IN")}\n\n`;
    message += `*Delivery Location:*\n`;
    message += `📍 ${customerAddress}\n\n`;
    message += `Please confirm availability and dispatch my order. Thank you!`;

    const orderLog = {
      items: orderItems,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      customerId: currentUser?.uid,
      customerEmail: currentUser?.email,
      totalPrice: finalSubtotal,
      status: "Pending" as const
    };

    try {
      setIsCheckingOut(true);
      await dataService.createOrder(orderLog);

      // Record rate limit check
      RateLimiter.recordCheckout();

      // Store order amount before clearing cart
      setConfirmedOrderAmount(finalSubtotal);
      
      // Show full-screen order confirmation
      setShowOrderConfirmation(true);
      setOrderConfirmed(true);
      setIsCheckingOut(false);

      // Clear cart after successful order
      onClearCart();

    } catch (err: any) {
      console.error("Order Creation Trace:", err.message);
      showToast("Failed to process order. Cloud database write blocked.", "danger");
      setIsCheckingOut(false);
    }
  };

  // Get wishlist products
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            {/* Frosted Glass Cart Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-[100] w-full sm:w-[420px] h-screen glass-panel shadow-2xl flex flex-col justify-between"
            >
            {/* Header / Tabs */}
            <div className="p-6 border-b border-gray-100 bg-white/50 flex-shrink-0">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-text-main">Storefront Checkout</h3>
                  <p className="text-[9px] text-text-muted mt-0.5 font-bold uppercase tracking-wider">Bajrangi Nutrition Kurukshetra</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full border border-gray-150 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-white transition-all shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode switch tabs */}
              <div className="flex gap-2 p-1 bg-bg-light border border-gray-200 rounded-xl">
                <button
                  onClick={() => setDrawerMode("cart")}
                  className={`w-1/2 text-center py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    drawerMode === "cart" 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-text-muted hover:text-primary"
                  }`}
                >
                  Cart ({cart.length})
                </button>
                <button
                  onClick={() => setDrawerMode("wishlist")}
                  className={`w-1/2 text-center py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    drawerMode === "wishlist" 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-text-muted hover:text-primary"
                  }`}
                >
                  Wishlist ({wishlist.length})
                </button>
              </div>
            </div>

            {/* Content Tab Panel */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              
              {/* CART DRAWER TAB */}
              {drawerMode === "cart" && (
                <>
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-text-muted">
                      <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mb-4 text-primary">
                        <ShoppingCart className="w-7 h-7 opacity-35" />
                      </div>
                      <h4 className="font-bold text-text-main text-sm">Your shopping cart is empty</h4>
                      <p className="text-xs max-w-xs mt-1">Explore our product tags or bestseller sliders to add supplements.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Active items */}
                      {cart.map((item) => (
                        <div 
                          key={item.productId}
                          className="flex gap-4 p-4 bg-white border border-gray-150 rounded-2xl shadow-sm relative group"
                        >
                          <div className="w-14 h-14 bg-bg-light rounded-xl flex items-center justify-center p-1.5 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain filter drop-shadow-sm" />
                          </div>
                          
                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-text-main line-clamp-1 pr-4 leading-tight">{item.name}</h4>
                              <span className="text-xs font-extrabold text-text-main block mt-1">₹{item.price.toLocaleString("en-IN")}</span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              {/* Quantity picker */}
                              <div className="flex items-center justify-between border border-gray-150 rounded-lg px-2 py-0.5 w-20 bg-bg-light">
                                <button 
                                  onClick={() => onUpdateQty(item.productId, -1)}
                                  className="text-text-muted hover:text-primary font-bold text-xs"
                                >-</button>
                                <span className="text-[11px] font-bold text-text-main">{item.quantity}</span>
                                <button 
                                  onClick={() => onUpdateQty(item.productId, 1)}
                                  className="text-text-muted hover:text-primary font-bold text-xs"
                                >+</button>
                              </div>

                              <button 
                                onClick={() => onRemoveItem(item.productId)}
                                className="text-text-muted hover:text-danger p-1"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Display Free Bundle Rewards */}
                      {bundleFreeItems.map((freeItem) => (
                        <div 
                          key={`free-${freeItem.productId}`}
                          className="flex gap-4 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl relative"
                        >
                          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-1.5 flex-shrink-0 border border-green-500/10">
                            <img src={freeItem.image} alt={freeItem.name} className="max-h-full max-w-full object-contain filter drop-shadow-sm" />
                          </div>
                          
                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-bold text-green-700 leading-tight">{freeItem.name}</h4>
                                <span className="text-[8px] font-black uppercase bg-green-500 text-white px-1.5 py-0.5 rounded-sm">Free</span>
                              </div>
                              <p className="text-[9px] text-green-600 mt-1 font-bold">🎉 Bundle Promo Applied: 1 Free with 2 items</p>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-text-main mt-1">
                              <span>Quantity: {freeItem.quantity}</span>
                              <span className="line-through text-text-muted">₹0</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* WISHLIST DRAWER TAB */}
              {drawerMode === "wishlist" && (
                <>
                  {wishlistProducts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-text-muted">
                      <div className="w-14 h-14 rounded-full bg-red-500/5 flex items-center justify-center mb-4 text-red-500">
                        <Heart className="w-7 h-7 opacity-35" />
                      </div>
                      <h4 className="font-bold text-text-main text-sm">Your wishlist is empty</h4>
                      <p className="text-xs max-w-xs mt-1">Tap the heart icon on any supplement catalog card to save it here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wishlistProducts.map((p) => (
                        <div 
                          key={p.id}
                          className="flex gap-4 p-4 bg-white border border-gray-150 rounded-2xl shadow-sm relative"
                        >
                          <div className="w-14 h-14 bg-bg-light rounded-xl flex items-center justify-center p-1.5 flex-shrink-0">
                            <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                          </div>

                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-text-main line-clamp-1 pr-6 leading-tight">{p.name}</h4>
                              <span className="text-xs font-extrabold text-text-main block mt-1">₹{p.price.toLocaleString("en-IN")}</span>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <button
                                onClick={() => {
                                  onAddToCart(p, 1);
                                  onToggleWishlist(p.id); // remove from wishlist after adding
                                }}
                                className="bg-primary hover:bg-primary-hover text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                              </button>

                              <button 
                                onClick={() => onToggleWishlist(p.id)}
                                className="text-text-muted hover:text-danger p-1"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

            </div>

            {/* Cart Footer */}
            {drawerMode === "cart" && (cart.length > 0 || showCheckoutForm || orderConfirmed) && (
              <div className="p-6 border-t border-gray-100 bg-white/50 flex-shrink-0">
                {/* Coupon entry form - Hide during checkout form */}
                {!showCheckoutForm && !orderConfirmed && (
                  !appliedCoupon ? (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-5">
                      <input
                        type="text"
                        placeholder="Enter Promo Code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-text-main outline-none focus:border-primary flex-grow uppercase font-semibold"
                      />
                      <button type="submit" className="bg-text-main hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm">
                        <Tag className="w-3.5 h-3.5" /> Apply
                      </button>
                    </form>
                  ) : (
                    <div className="flex justify-between items-center bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl text-xs mb-5 font-bold text-green-700">
                      <span className="flex items-center gap-1.5">🎟️ Coupon applied: {appliedCoupon.code}</span>
                      <button type="button" onClick={handleRemoveCoupon} className="text-danger hover:underline">Remove</button>
                    </div>
                  )
                )}

                {/* Billing Summary - Hide during checkout form */}
                {!showCheckoutForm && !orderConfirmed && (
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs text-text-muted font-medium">
                      <span>Subtotal</span>
                      <span>₹{baseSubtotal.toLocaleString("en-IN")}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-xs text-green-600 font-bold">
                        <span>Discount (Coupon)</span>
                        <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-text-muted font-medium">
                      <span>Local Delivery Fee</span>
                      <span className="text-green-600 font-bold uppercase tracking-wider">Free</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-text-main pt-2.5 border-t border-dashed border-gray-200">
                      <span>Total Amount</span>
                      <span>₹{finalSubtotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )}

                {/* Checkout Form Toggle */}
                {!showCheckoutForm ? (
                  isAuthenticated ? (
                    <button
                      onClick={() => setShowCheckoutForm(true)}
                      className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" /> Proceed to Checkout
                    </button>
                  ) : (
                    <button
                      onClick={handleCustomerLogin}
                      className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" /> Sign In to Checkout
                    </button>
                  )
                ) : orderConfirmed ? (
                  <div className="text-center space-y-4 pt-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-extrabold text-green-700">🎉 Order Placed Successfully!</h4>
                      <p className="text-sm font-bold text-text-main">Check your confirmation screen</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-text-main outline-none focus:border-primary transition-all"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">WhatsApp Mobile No *</label>
                      <div className="relative flex items-center">
                        <Smartphone className="absolute left-3 w-4 h-4 text-text-muted" />
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-text-main outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Delivery Address *</label>
                      <textarea
                        required
                        placeholder="Enter your full address manually"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-text-main outline-none focus:border-primary transition-all resize-none"
                        rows={3}
                      />
                      {customerAddress && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          📍 View address on Google Maps
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCheckoutForm(false)}
                        className="w-1/3 border border-gray-200 hover:border-gray-300 text-text-muted text-xs uppercase font-extrabold tracking-wider py-3.5 rounded-xl transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isCheckingOut}
                        className="w-2/3 bg-green-500 hover:bg-green-600 text-white text-xs uppercase font-extrabold tracking-wider py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isCheckingOut ? "Processing..." : "Confirm Order"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Full-screen Order Confirmation */}
    <OrderConfirmation
      isOpen={showOrderConfirmation}
      onClose={() => {
        setShowOrderConfirmation(false);
        setShowCheckoutForm(false);
        setOrderConfirmed(false);
        onClose();
      }}
      customerName={customerName}
      customerPhone={customerPhone}
      customerAddress={customerAddress}
      totalAmount={confirmedOrderAmount}
    />
    </>
  );
}
