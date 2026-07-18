import { isFirebaseConfigured, db, auth, googleProvider } from "./firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  getDoc,
  getDocs,
  orderBy,
  increment,
  serverTimestamp
} from "firebase/firestore";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

// Supplement data structures
export interface Product {
  id: string;
  name: string;
  category: "Protein" | "Pre-Workout" | "Creatine" | "Accessories" | "Vitamins";
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  images?: string[]; // Array of 2D images uploaded by owner
  stock: number;
  sold: number;
  isRunning: boolean;
  isBestseller?: boolean; // Owner-controlled bestseller toggle for featured section
  weight?: string;
  servings?: string;
  flavor?: string;
  isVeg: boolean;
  bundleDeal?: {
    buyQty: number;
    freeQty: number;
    label: string;
  };
  lastRestocked?: string; // Timestamp of last stock addition
  updatedAt?: any;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  isFree?: boolean;
}

export interface Order {
  id: string;
  items: OrderItem[];
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerId?: string;
  customerEmail?: string;
  totalPrice: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  deliveryStatus?: string;
  trackingId?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface Customer {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  addresses: SavedAddress[];
  createdAt: any;
}

export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  isDefault: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stockLimit: number;
  bundleDeal?: {
    buyQty: number;
    freeQty: number;
    label: string;
  };
}

export interface Coupon {
  code: string;
  discount: number;
  type: "percent" | "flat";
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  author: string;
  rating: number;
  text: string;
  approved: boolean;
  createdAt: string;
}

// Configurable Security Limits
export const SECURITY_CONFIG = {
  authAttemptsLimit: 5,           // Max login attempts per window
  authWindowMs: 60000,            // 1 minute window for auth
  authBackoffFactor: 2000,        // Exponential backoff base (2s)
  
  checkoutLimit: 3,               // Max checkouts per window
  checkoutWindowMs: 600000,       // 10 minutes window
  
  adminWritesLimit: 15,           // Max inventory changes per window
  adminWritesWindowMs: 60000,     // 1 minute
  
  maxUploadSize: 2 * 1024 * 1024  // 2MB max image upload size
};

const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || ["vanshikapahal16@gmail.com"];

// CLIENT-SIDE RATE LIMITER
export class RateLimiter {
  static checkAuth(): { allowed: boolean; delay: number; remaining: number } {
    if (typeof window === "undefined") return { allowed: true, delay: 0, remaining: 5 };
    const now = Date.now();
    let attempts = JSON.parse(sessionStorage.getItem("auth_attempts") || "[]");
    attempts = attempts.filter((t: number) => now - t < SECURITY_CONFIG.authWindowMs);
    
    if (attempts.length >= SECURITY_CONFIG.authAttemptsLimit) {
      const excess = attempts.length - SECURITY_CONFIG.authAttemptsLimit + 1;
      const delay = Math.pow(2, excess) * SECURITY_CONFIG.authBackoffFactor;
      return { allowed: false, delay, remaining: 0 };
    }
    
    return { allowed: true, delay: 0, remaining: SECURITY_CONFIG.authAttemptsLimit - attempts.length };
  }

  static recordAuthAttempt() {
    if (typeof window === "undefined") return;
    const attempts = JSON.parse(sessionStorage.getItem("auth_attempts") || "[]");
    attempts.push(Date.now());
    sessionStorage.setItem("auth_attempts", JSON.stringify(attempts));
  }

  static checkCheckout(): { allowed: boolean; cooldownRemaining?: number } {
    if (typeof window === "undefined") return { allowed: true };
    const now = Date.now();
    let checkouts = JSON.parse(localStorage.getItem("checkout_timestamps") || "[]");
    checkouts = checkouts.filter((t: number) => now - t < SECURITY_CONFIG.checkoutWindowMs);
    
    if (checkouts.length >= SECURITY_CONFIG.checkoutLimit) {
      const oldest = checkouts[0];
      const cooldownRemaining = Math.ceil((SECURITY_CONFIG.checkoutWindowMs - (now - oldest)) / 1000);
      return { allowed: false, cooldownRemaining };
    }
    return { allowed: true };
  }

  static recordCheckout() {
    if (typeof window === "undefined") return;
    const checkouts = JSON.parse(localStorage.getItem("checkout_timestamps") || "[]");
    checkouts.push(Date.now());
    localStorage.setItem("checkout_timestamps", JSON.stringify(checkouts));
  }

  static checkAdminWrite(): { allowed: boolean } {
    if (typeof window === "undefined") return { allowed: true };
    const now = Date.now();
    let writes = JSON.parse(sessionStorage.getItem("admin_write_timestamps") || "[]");
    writes = writes.filter((t: number) => now - t < SECURITY_CONFIG.adminWritesWindowMs);
    
    if (writes.length >= SECURITY_CONFIG.adminWritesLimit) {
      return { allowed: false };
    }
    return { allowed: true };
  }

  static recordAdminWrite() {
    if (typeof window === "undefined") return;
    const writes = JSON.parse(sessionStorage.getItem("admin_write_timestamps") || "[]");
    writes.push(Date.now());
    sessionStorage.setItem("admin_write_timestamps", JSON.stringify(writes));
  }
}

// STRICT SCHEMA VALIDATION
export class SchemaValidator {
  static validateProduct(p: Partial<Product>) {
    const categories = ["Protein", "Pre-Workout", "Creatine", "Accessories", "Vitamins"];
    
    if (!p.name || typeof p.name !== "string" || p.name.trim().length < 3 || p.name.length > 100) {
      throw new Error("Validation Error: Product name must be between 3 and 100 characters.");
    }
    if (!p.category || !categories.includes(p.category)) {
      throw new Error("Validation Error: Invalid product category selection.");
    }
    if (typeof p.price !== "number" || isNaN(p.price) || p.price < 0 || p.price > 100000) {
      throw new Error("Validation Error: Price must be a positive number under ₹100,000.");
    }
    if (typeof p.originalPrice !== "number" || isNaN(p.originalPrice) || p.originalPrice < p.price) {
      throw new Error("Validation Error: Original Price (MRP) must be greater than or equal to the sale price.");
    }
    if (typeof p.stock !== "number" || isNaN(p.stock) || p.stock < 0 || p.stock > 1000) {
      throw new Error("Validation Error: Stock quantity must be a valid number between 0 and 1,000.");
    }
    if (p.description && (p.description.trim().length < 10 || p.description.length > 1000)) {
      throw new Error("Validation Error: Description must be between 10 and 1,000 characters.");
    }
    
    // Check multiple image gallery strings
    if (p.images) {
      for (const img of p.images) {
        const isBase64 = img.startsWith("data:image/") && img.includes(";base64,");
        const isSecureUrl = img.startsWith("https://") || img.startsWith("assets/") || img.startsWith("/");
        if (!isBase64 && !isSecureUrl) {
          throw new Error("Security Alert: One of the gallery images has an invalid format.");
        }
      }
    }
    return true;
  }

  static validateCheckout(name: string, phone: string) {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

    if (!name || !nameRegex.test(name.trim())) {
      throw new Error("Validation Error: Please enter a valid name (2-50 letters, no numbers/symbols).");
    }
    
    const cleanPhone = phone.trim().replace(/[-\s]/g, "");
    if (!phone || !phoneRegex.test(cleanPhone)) {
      throw new Error("Validation Error: Please enter a valid 10-digit mobile number.");
    }
    return true;
  }
}

// Initial default catalog seeding fallback - Empty for manual entry
export const DEFAULT_PRODUCTS: Product[] = [];

export const DEFAULT_COUPONS: Coupon[] = [];

export const DEFAULT_REVIEWS: Review[] = [];

// DUAL-STATE DATABASE CONTROLLER SERVICE
class DataService {
  isCloud = isFirebaseConfigured;

  constructor() {
    if (!this.isCloud && typeof window !== "undefined") {
      this.initLocalStorage();
    }
  }

  initLocalStorage() {
    // Force clear sample data and start fresh
    localStorage.setItem("bajrangi_products", JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem("bajrangi_orders", JSON.stringify([]));
    localStorage.setItem("bajrangi_coupons", JSON.stringify(DEFAULT_COUPONS));
    localStorage.setItem("bajrangi_reviews", JSON.stringify(DEFAULT_REVIEWS));
    if (!localStorage.getItem("bajrangi_marquee")) {
      localStorage.setItem("bajrangi_marquee", "🚚 FREE SAME-DAY DOORSTEP DELIVERY IN KURUKSHETRA • 🛡️ 100% GENUINE PRODUCTS GUARANTEED");
    }
  }

  subscribeProducts(callback: (products: Product[]) => void) {
    if (this.isCloud && db) {
      return onSnapshot(collection(db, "products"), (snapshot) => {
        const products: Product[] = [];
        snapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() } as Product);
        });
        if (products.length === 0) {
          // If the collection is empty, return default products
          // Seeding will only be done manually by logged in admin to prevent permission crash
          callback(DEFAULT_PRODUCTS);
        } else {
          callback(products);
        }
      }, (error) => {
        console.error("Firestore read error:", error.code, error.message);
        this.subscribeLocalProducts(callback);
      });
    } else {
      this.subscribeLocalProducts(callback);
      return () => {};
    }
  }

  async getProducts(): Promise<Product[]> {
    if (this.isCloud && db) {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const products: Product[] = [];
        snapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() } as Product);
        });
        return products.length === 0 ? DEFAULT_PRODUCTS : products;
      } catch (error) {
        console.error("Firestore getProducts error:", error);
        return this.getLocalProductsOnce();
      }
    } else {
      return this.getLocalProductsOnce();
    }
  }

  private getLocalProductsOnce(): Product[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("bajrangi_products") || "[]");
  }

  private subscribeLocalProducts(callback: (products: Product[]) => void) {
    if (typeof window === "undefined") return;
    const load = () => {
      const data = JSON.parse(localStorage.getItem("bajrangi_products") || "[]");
      callback(data);
    };
    load();
    window.addEventListener("localDataChange", load);
  }

  subscribeOrders(callback: (orders: Order[]) => void) {
    if (this.isCloud && db) {
      // Check if user is authenticated
      const user = auth?.currentUser;
      
      let q;
      if (user) {
        // Check if user is admin
        if (user.email === 'vanshikapahal16@gmail.com') {
          // Admin can read all orders
          q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        } else {
          // Customer can only read their own orders
          q = query(
            collection(db, "orders"),
            where("customerId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
        }
      } else {
        // Not authenticated - use localStorage fallback
        if (typeof window === "undefined") return () => {};
        const load = () => {
          const data = JSON.parse(localStorage.getItem("bajrangi_orders") || "[]");
          data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(data);
        };
        load();
        window.addEventListener("localOrdersChange", load);
        return () => {};
      }
      
      return onSnapshot(q, (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        callback(orders);
      }, (error) => {
        console.error("Firestore orders read error:", error.code, error.message);
        // Fallback to localStorage on error
        if (typeof window !== "undefined") {
          const data = JSON.parse(localStorage.getItem("bajrangi_orders") || "[]");
          data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(data);
        }
      });
    } else {
      if (typeof window === "undefined") return () => {};
      const load = () => {
        const data = JSON.parse(localStorage.getItem("bajrangi_orders") || "[]");
        data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(data);
      };
      load();
      window.addEventListener("localOrdersChange", load);
      return () => {};
    }
  }

  subscribeCoupons(callback: (coupons: Coupon[]) => void) {
    if (this.isCloud && db) {
      return onSnapshot(collection(db, "coupons"), (snapshot) => {
        const coupons: Coupon[] = [];
        snapshot.forEach((doc) => {
          coupons.push(doc.data() as Coupon);
        });
        if (coupons.length === 0) {
          callback(DEFAULT_COUPONS);
        } else {
          callback(coupons);
        }
      }, () => {
        this.subscribeLocalCoupons(callback);
      });
    } else {
      this.subscribeLocalCoupons(callback);
      return () => {};
    }
  }

  private subscribeLocalCoupons(callback: (coupons: Coupon[]) => void) {
    if (typeof window === "undefined") return;
    const load = () => {
      const data = JSON.parse(localStorage.getItem("bajrangi_coupons") || "[]");
      callback(data);
    };
    load();
    window.addEventListener("localCouponsChange", load);
  }

  subscribeReviews(callback: (reviews: Review[]) => void) {
    if (this.isCloud && db) {
      // Check if user is authenticated
      const user = auth?.currentUser;
      
      let q;
      if (user && user.email === 'vanshikapahal16@gmail.com') {
        // Admin can read all reviews
        q = query(collection(db, "reviews"));
      } else {
        // Public can only read approved reviews
        q = query(collection(db, "reviews"), where("approved", "==", true));
      }
      
      return onSnapshot(q, (snapshot) => {
        const reviews: Review[] = [];
        snapshot.forEach((doc) => {
          reviews.push({ id: doc.id, ...doc.data() } as Review);
        });
        callback(reviews);
      }, (error) => {
        console.error("Firestore reviews read error:", error.code, error.message);
        // Fallback to localStorage on error
        this.subscribeLocalReviews(callback);
      });
    } else {
      this.subscribeLocalReviews(callback);
      return () => {};
    }
  }

  private subscribeLocalReviews(callback: (reviews: Review[]) => void) {
    if (typeof window === "undefined") return;
    const load = () => {
      const data = JSON.parse(localStorage.getItem("bajrangi_reviews") || "[]");
      callback(data);
    };
    load();
    window.addEventListener("localReviewsChange", load);
  }

  subscribeMarquee(callback: (text: string) => void) {
    if (this.isCloud && db) {
      return onSnapshot(doc(db, "marquee", "header-text"), (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data()?.text || "");
        } else {
          callback("🚚 FREE SAME-DAY DOORSTEP DELIVERY IN KURUKSHETRA • 🛡️ 100% GENUINE PRODUCTS GUARANTEED");
        }
      }, (error) => {
        console.error("Firestore marquee read error:", error.code, error.message);
        // Fallback to localStorage on error
        this.subscribeLocalMarquee(callback);
      });
    } else {
      this.subscribeLocalMarquee(callback);
      return () => {};
    }
  }

  private subscribeLocalMarquee(callback: (text: string) => void) {
    if (typeof window === "undefined") return;
    const load = () => {
      const text = localStorage.getItem("bajrangi_marquee") || "";
      callback(text);
    };
    load();
    window.addEventListener("localMarqueeChange", load);
  }

  async saveMarquee(text: string) {
    if (!RateLimiter.checkAdminWrite().allowed) throw new Error("Rate limit exceeded.");
    if (this.isCloud && db) {
      await setDoc(doc(db, "marquee", "header-text"), { text });
    } else {
      localStorage.setItem("bajrangi_marquee", text);
      window.dispatchEvent(new Event("localMarqueeChange"));
    }
    RateLimiter.recordAdminWrite();
  }

  async seedFirebaseProducts() {
    if (!this.isCloud || !db) return;
    console.log("Seeding default products to Firebase...");
    for (const p of DEFAULT_PRODUCTS) {
      try {
        await setDoc(doc(db, "products", p.id), p);
      } catch (err: any) {
        console.error("Seeding failed:", err.message);
      }
    }
    for (const c of DEFAULT_COUPONS) {
      try {
        await setDoc(doc(db, "coupons", c.code), c);
      } catch (err: any) {
        console.error("Seeding coupon failed:", err.message);
      }
    }
    for (const r of DEFAULT_REVIEWS) {
      try {
        await setDoc(doc(db, "reviews", r.id), r);
      } catch (err: any) {
        console.error("Seeding review failed:", err.message);
      }
    }
  }

  async saveProduct(product: Partial<Product>) {
    if (!RateLimiter.checkAdminWrite().allowed) {
      throw new Error("System Warning: Rate limit exceeded. Too many database writes. Please wait a minute.");
    }
    SchemaValidator.validateProduct(product);

    if (this.isCloud && db) {
      const docRef = product.id 
        ? doc(db, "products", product.id) 
        : doc(collection(db, "products"));
      const id = docRef.id;
      const data = { 
        ...product, 
        id, 
        images: product.images || [product.image || ""],
        updatedAt: serverTimestamp() 
      };
      await setDoc(docRef, data, { merge: true });
    } else {
      let products = JSON.parse(localStorage.getItem("bajrangi_products") || "[]");
      if (product.id) {
        products = products.map((p: Product) => p.id === product.id ? { ...p, ...product, images: product.images || [product.image || p.image] } : p);
      } else {
        const newProduct = { 
          ...product, 
          id: "prod-" + Date.now(), 
          images: product.images || [product.image || ""],
          sold: product.sold || 0 
        } as Product;
        products.push(newProduct);
      }
      localStorage.setItem("bajrangi_products", JSON.stringify(products));
      window.dispatchEvent(new Event("localDataChange"));
    }
    RateLimiter.recordAdminWrite();
  }

  async deleteProduct(productId: string) {
    if (!RateLimiter.checkAdminWrite().allowed) {
      throw new Error("Rate limit exceeded.");
    }

    if (this.isCloud && db) {
      await deleteDoc(doc(db, "products", productId));
    } else {
      let products = JSON.parse(localStorage.getItem("bajrangi_products") || "[]");
      products = products.filter((p: Product) => p.id !== productId);
      localStorage.setItem("bajrangi_products", JSON.stringify(products));
      window.dispatchEvent(new Event("localDataChange"));
    }
    RateLimiter.recordAdminWrite();
  }

  async saveCoupon(coupon: Coupon) {
    if (!RateLimiter.checkAdminWrite().allowed) throw new Error("Rate limit exceeded.");
    if (this.isCloud && db) {
      await setDoc(doc(db, "coupons", coupon.code.toUpperCase()), coupon);
    } else {
      let coupons = JSON.parse(localStorage.getItem("bajrangi_coupons") || "[]");
      coupons = coupons.filter((c: Coupon) => c.code !== coupon.code);
      coupons.push(coupon);
      localStorage.setItem("bajrangi_coupons", JSON.stringify(coupons));
      window.dispatchEvent(new Event("localCouponsChange"));
    }
    RateLimiter.recordAdminWrite();
  }

  async deleteCoupon(code: string) {
    if (!RateLimiter.checkAdminWrite().allowed) throw new Error("Rate limit exceeded.");
    if (this.isCloud && db) {
      await deleteDoc(doc(db, "coupons", code));
    } else {
      let coupons = JSON.parse(localStorage.getItem("bajrangi_coupons") || "[]");
      coupons = coupons.filter((c: Coupon) => c.code !== code);
      localStorage.setItem("bajrangi_coupons", JSON.stringify(coupons));
      window.dispatchEvent(new Event("localCouponsChange"));
    }
    RateLimiter.recordAdminWrite();
  }

  async saveReview(review: Omit<Review, "id" | "createdAt" | "approved">) {
    const reviewData = {
      ...review,
      id: "rev-" + Date.now(),
      approved: false, // Moderated by default
      createdAt: new Date().toISOString()
    };

    if (this.isCloud && db) {
      await setDoc(doc(db, "reviews", reviewData.id), reviewData);
    } else {
      let reviews = JSON.parse(localStorage.getItem("bajrangi_reviews") || "[]");
      reviews.push(reviewData);
      localStorage.setItem("bajrangi_reviews", JSON.stringify(reviews));
      window.dispatchEvent(new Event("localReviewsChange"));
    }
  }

  async updateReviewApproval(reviewId: string, approved: boolean) {
    if (!RateLimiter.checkAdminWrite().allowed) throw new Error("Rate limit exceeded.");
    if (this.isCloud && db) {
      await updateDoc(doc(db, "reviews", reviewId), { approved });
    } else {
      let reviews = JSON.parse(localStorage.getItem("bajrangi_reviews") || "[]");
      reviews = reviews.map((r: Review) => r.id === reviewId ? { ...r, approved } : r);
      localStorage.setItem("bajrangi_reviews", JSON.stringify(reviews));
      window.dispatchEvent(new Event("localReviewsChange"));
    }
    RateLimiter.recordAdminWrite();
  }

  async deleteReview(reviewId: string) {
    if (!RateLimiter.checkAdminWrite().allowed) throw new Error("Rate limit exceeded.");
    if (this.isCloud && db) {
      await deleteDoc(doc(db, "reviews", reviewId));
    } else {
      let reviews = JSON.parse(localStorage.getItem("bajrangi_reviews") || "[]");
      reviews = reviews.filter((r: Review) => r.id !== reviewId);
      localStorage.setItem("bajrangi_reviews", JSON.stringify(reviews));
      window.dispatchEvent(new Event("localReviewsChange"));
    }
    RateLimiter.recordAdminWrite();
  }

  async createOrder(order: Omit<Order, "id" | "createdAt">) {
    const orderData = {
      ...order,
      createdAt: this.isCloud ? serverTimestamp() : new Date().toISOString()
    };

    if (this.isCloud && db) {
      try {
        // 1. Log the order in orders collection
        const docRef = await addDoc(collection(db, "orders"), orderData);

        // 2. Decrement stock/increment sold for items in firestore
        for (const item of order.items) {
          if (!item.isFree) {
            await updateDoc(doc(db, "products", item.productId), {
              stock: increment(-item.quantity),
              sold: increment(item.quantity)
            });
          }
        }
        return docRef.id;
      } catch (firebaseError: any) {
        console.warn("Firebase write failed, falling back to localStorage:", firebaseError.message);
        // Fall back to localStorage if Firebase write fails
        return this.createOrderLocalStorage(orderData);
      }
    } else {
      return this.createOrderLocalStorage(orderData);
    }
  }

  private async createOrderLocalStorage(orderData: any) {
    let orders = JSON.parse(localStorage.getItem("bajrangi_orders") || "[]");
    const newOrder = {
      ...orderData,
      id: "order-" + Date.now(),
      createdAt: new Date().toISOString()
    } as Order;
    orders.push(newOrder);
    localStorage.setItem("bajrangi_orders", JSON.stringify(orders));

    // Decrement Local stock
    let products = JSON.parse(localStorage.getItem("bajrangi_products") || "[]");
    for (const item of orderData.items) {
      if (!item.isFree) {
        products = products.map((p: Product) => {
          if (p.id === item.productId) {
            return {
              ...p,
              stock: Math.max(0, p.stock - item.quantity),
              sold: p.sold + item.quantity
            };
          }
          return p;
        });
      }
    }
    localStorage.setItem("bajrangi_products", JSON.stringify(products));

    window.dispatchEvent(new Event("localDataChange"));
    window.dispatchEvent(new Event("localOrdersChange"));
    return newOrder.id;
  }

  async updateOrderStatus(orderId: string, status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled", deliveryStatus?: string, trackingId?: string) {
    if (!RateLimiter.checkAdminWrite().allowed) {
      throw new Error("Rate limit exceeded.");
    }
    const updateData: any = { status, updatedAt: this.isCloud ? serverTimestamp() : new Date().toISOString() };
    if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;
    if (trackingId) updateData.trackingId = trackingId;

    if (this.isCloud && db) {
      await updateDoc(doc(db, "orders", orderId), updateData);
    } else {
      let orders = JSON.parse(localStorage.getItem("bajrangi_orders") || "[]");
      orders = orders.map((o: Order) => o.id === orderId ? { ...o, ...updateData } : o);
      localStorage.setItem("bajrangi_orders", JSON.stringify(orders));
      window.dispatchEvent(new Event("localOrdersChange"));
    }
    RateLimiter.recordAdminWrite();
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    if (this.isCloud && db) {
      const q = query(collection(db, "orders"), where("customerId", "==", customerId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Order));
    } else {
      let orders = JSON.parse(localStorage.getItem("bajrangi_orders") || "[]");
      return orders.filter((o: Order) => o.customerId === customerId);
    }
  }

  async getCustomerData(customerId: string): Promise<Customer | null> {
    if (this.isCloud && db) {
      const customerRef = doc(db, "customers", customerId);
      const customerDoc = await getDoc(customerRef);
      if (customerDoc.exists()) {
        return { id: customerDoc.id, ...customerDoc.data() } as Customer;
      }
      return null;
    } else {
      let customers = JSON.parse(localStorage.getItem("bajrangi_customers") || "[]");
      return customers.find((c: Customer) => c.id === customerId) || null;
    }
  }

  async saveCustomerAddress(customerId: string, address: SavedAddress) {
    if (!RateLimiter.checkAdminWrite().allowed) {
      throw new Error("Rate limit exceeded.");
    }
    if (this.isCloud && db) {
      const customerRef = doc(db, "customers", customerId);
      const customerDoc = await getDoc(customerRef);
      if (customerDoc.exists()) {
        const existingAddresses = customerDoc.data().addresses || [];
        const updatedAddresses = address.isDefault
          ? existingAddresses.map((a: any) => ({ ...a, isDefault: false }))
          : existingAddresses;
        updatedAddresses.push(address);
        await updateDoc(customerRef, { addresses: updatedAddresses });
      }
    } else {
      let customers = JSON.parse(localStorage.getItem("bajrangi_customers") || "[]");
      const customerIndex = customers.findIndex((c: Customer) => c.id === customerId);
      if (customerIndex >= 0) {
        const existingAddresses = customers[customerIndex].addresses || [];
        const updatedAddresses = address.isDefault
          ? existingAddresses.map((a: any) => ({ ...a, isDefault: false }))
          : existingAddresses;
        updatedAddresses.push(address);
        customers[customerIndex].addresses = updatedAddresses;
        localStorage.setItem("bajrangi_customers", JSON.stringify(customers));
      }
    }
    RateLimiter.recordAdminWrite();
  }

  async deleteCustomerAddress(customerId: string, addressId: string) {
    if (!RateLimiter.checkAdminWrite().allowed) {
      throw new Error("Rate limit exceeded.");
    }
    if (this.isCloud && db) {
      const customerRef = doc(db, "customers", customerId);
      const customerDoc = await getDoc(customerRef);
      if (customerDoc.exists()) {
        const existingAddresses = customerDoc.data().addresses || [];
        const updatedAddresses = existingAddresses.filter((a: SavedAddress) => a.id !== addressId);
        await updateDoc(customerRef, { addresses: updatedAddresses });
      }
    } else {
      let customers = JSON.parse(localStorage.getItem("bajrangi_customers") || "[]");
      const customerIndex = customers.findIndex((c: Customer) => c.id === customerId);
      if (customerIndex >= 0) {
        const existingAddresses = customers[customerIndex].addresses || [];
        const updatedAddresses = existingAddresses.filter((a: SavedAddress) => a.id !== addressId);
        customers[customerIndex].addresses = updatedAddresses;
        localStorage.setItem("bajrangi_customers", JSON.stringify(customers));
      }
    }
    RateLimiter.recordAdminWrite();
  }

  async restoreAllData(jsonData: { products: Product[]; orders: Order[]; coupons?: Coupon[] }) {
    if (!RateLimiter.checkAdminWrite().allowed) {
      throw new Error("Rate limit exceeded.");
    }
    if (this.isCloud && db) {
      if (jsonData.products) {
        for (const p of jsonData.products) {
          await setDoc(doc(db, "products", p.id), p);
        }
      }
      if (jsonData.orders) {
        for (const o of jsonData.orders) {
          await setDoc(doc(db, "orders", o.id), {
            ...o,
            createdAt: serverTimestamp()
          });
        }
      }
      if (jsonData.coupons) {
        for (const c of jsonData.coupons) {
          await setDoc(doc(db, "coupons", c.code), c);
        }
      }
    } else {
      if (jsonData.products) {
        localStorage.setItem("bajrangi_products", JSON.stringify(jsonData.products));
      }
      if (jsonData.orders) {
        localStorage.setItem("bajrangi_orders", JSON.stringify(jsonData.orders));
      }
      if (jsonData.coupons) {
        localStorage.setItem("bajrangi_coupons", JSON.stringify(jsonData.coupons));
      }
      window.dispatchEvent(new Event("localDataChange"));
      window.dispatchEvent(new Event("localOrdersChange"));
      window.dispatchEvent(new Event("localCouponsChange"));
    }
    RateLimiter.recordAdminWrite();
  }
}

export const dataService = new DataService();

// Google Authentication Service Wrapper
class AuthService {
  isCloud = isFirebaseConfigured;

  async login(onSuccess: (user: any) => void, onError: (msg: string) => void) {
    const limit = RateLimiter.checkAuth();
    if (!limit.allowed) {
      const waitTime = Math.ceil(limit.delay / 1000) || 10;
      onError(`Too many login attempts. Please wait ${waitTime}s.`);
      return;
    }
    RateLimiter.recordAuthAttempt();

    if (this.isCloud && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const email = result.user?.email || "";
        if (ADMIN_EMAILS.includes(email)) {
          onSuccess(result.user);
        } else {
          await signOut(auth);
          onError("Access Denied: Your Google account is not authorized.");
        }
      } catch (err: any) {
        console.error("Auth Fail Info:", err.code, err.message);

        // Handle specific Firebase auth errors
        if (err.code === "auth/popup-blocked") {
          onError("Popup was blocked by browser. Please allow popups for this site or use offline mode.");
        } else if (err.code === "auth/cancelled-popup-request") {
          onError("Login was cancelled. Please try again.");
        } else if (err.code === "auth/popup-closed-by-user") {
          onError("Login popup was closed. Please try again.");
        } else {
          // For other errors, offer fallback to offline mode
          onError(`Authentication failed (${err.code}). Using offline mode instead.`);
          // Automatically fallback to offline mode
          setTimeout(() => this.loginOffline(onSuccess, onError), 1000);
        }
      }
    } else {
      // Offline mode mock login
      this.loginOffline(onSuccess, onError);
    }
  }

  private loginOffline(onSuccess: (user: any) => void, onError: (msg: string) => void) {
    const email = prompt("Enter Admin Gmail address for authentication testing:", process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')[0] || "vanshikapahal16@gmail.com");
    if (email === null) return;
    if (ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
      const mockUser = {
        displayName: "Admin Vanshika",
        email: email.toLowerCase().trim(),
        photoURL: "https://lh3.googleusercontent.com/a/default-user=s96-c"
      };
      onSuccess(mockUser);
    } else {
      onError(`Access Denied: Only ${ADMIN_EMAILS.join(', ')} is authorized.`);
    }
  }

  async logout(onSuccess: () => void, onError: (msg: string) => void) {
    try {
      if (this.isCloud && auth) {
        await signOut(auth);
      }
      onSuccess();
    } catch (err: any) {
      console.error("Logout error:", err.message);
      onError("An error occurred during logout.");
    }
  }

  checkAuthState(onStateChanged: (user: any) => void) {
    if (this.isCloud && auth) {
      return onAuthStateChanged(auth, (user) => {
        if (user && ADMIN_EMAILS.includes(user.email || "")) {
          onStateChanged(user);
        } else {
          onStateChanged(null);
        }
      });
    }
    return () => {};
  }
}

export const authService = new AuthService();

// Customer Authentication Service (separate from admin)
class CustomerAuthService {
  isCloud = isFirebaseConfigured;
  currentUser: any = null;
  authUnsubscribe: any = null;

  // Initialize auth state listener
  initializeAuthState(onStateChanged?: (user: any) => void) {
    if (this.isCloud && auth) {
      this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        if (onStateChanged) {
          onStateChanged(user);
        }
      });
    }
  }

  // Clean up auth listener
  cleanupAuthState() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
      this.authUnsubscribe = null;
    }
  }

  async login(onSuccess: (user: any) => void, onError: (msg: string) => void) {
    if (this.isCloud && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        this.currentUser = result.user;

        // Save customer profile to database
        await this.saveCustomerProfile(result.user);

        onSuccess(result.user);
      } catch (err: any) {
        console.error("Customer Auth Fail:", err.code, err.message);

        if (err.code === "auth/popup-blocked") {
          onError("Popup was blocked by browser. Please allow popups for this site.");
        } else if (err.code === "auth/cancelled-popup-request") {
          onError("Login was cancelled. Please try again.");
        } else {
          onError(`Authentication failed: ${err.message}`);
        }
      }
    } else {
      // Offline mode for customers
      const email = prompt("Enter your email for guest checkout:", "");
      if (email === null) return;
      const mockUser = {
        displayName: "Guest User",
        email: email,
        photoURL: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        uid: "guest-" + Date.now()
      };
      this.currentUser = mockUser;
      onSuccess(mockUser);
    }
  }

  private async saveCustomerProfile(user: any) {
    if (!this.isCloud || !db) return;

    const customerRef = doc(db, "customers", user.uid);
    const customerData = {
      id: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split("@")[0],
      photoURL: user.photoURL,
      addresses: [],
      createdAt: serverTimestamp()
    };

    await setDoc(customerRef, customerData, { merge: true });
  }

  async logout(onSuccess: () => void, onError: (msg: string) => void) {
    try {
      if (this.isCloud && auth) {
        await signOut(auth);
      }
      this.currentUser = null;
      onSuccess();
    } catch (err: any) {
      console.error("Logout error:", err.message);
      onError("An error occurred during logout.");
    }
  }

  checkAuthState(onStateChanged: (user: any) => void) {
    if (this.isCloud && auth) {
      return onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        onStateChanged(user);
      });
    }
    return () => {};
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  getCurrentUser(): any {
    return this.currentUser;
  }
}

export const customerAuthService = new CustomerAuthService();
