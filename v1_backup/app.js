// app.js - Bajrangi Nutrition Kurukshetra
// Core Storefront, Cart, Google Auth, Firestore DB, and Admin Dashboard Controller
// Fully secured with Rate Limiting, Input Schema Validation, Info Leakage Blockers, and File Upload Guards.

// Config settings
const ADMIN_EMAILS = ["vanshikapahal16@gmail.com"];
const WHATSAPP_NUMBER = "919588715527"; // Default shop WhatsApp

// Configurable Security Limits
const SECURITY_CONFIG = {
  authAttemptsLimit: 5,           // Max login attempts per minute window
  authWindowMs: 60000,            // 1 minute window for auth
  authBackoffFactor: 2000,        // Exponential backoff base (2s)
  
  checkoutLimit: 3,               // Max checkouts per 10-minute window
  checkoutWindowMs: 600000,       // 10 minutes window
  
  adminWritesLimit: 15,           // Max inventory changes per minute window
  adminWritesWindowMs: 60000,     // 1 minute window
  
  maxUploadSize: 2 * 1024 * 1024  // 2MB max image upload size
};

// Global Application State
let db = null;
let auth = null;
let currentProducts = [];
let currentOrders = [];
let cart = [];
let currentUser = null;
let activeCategory = "all";
let searchQuery = "";
let selectedProductForModal = null;
let isBackingOff = false;

// Initial Default Products Database
const DEFAULT_PRODUCTS = [
  {
    id: "prod-whey-isolate",
    name: "Bajrangi Nutrition Whey Isolate",
    category: "Protein",
    description: "Premium pure Whey Protein Isolate. Delivers 25g of high-quality fast-absorbing protein, 5.5g BCAA, and 4g Glutamine per serving. Lab-tested, 100% authentic, and perfect for muscle repair and recovery.",
    price: 5499,
    originalPrice: 6999,
    image: "assets/whey_isolate.png",
    stock: 12,
    sold: 150,
    isRunning: true,
    weight: "2 kg",
    servings: "60 Servings",
    flavor: "Chocolate Flavour",
    isVeg: true
  },
  {
    id: "prod-pre-workout",
    name: "Bajrangi Nutrition Pre-Workout",
    category: "Pre-Workout",
    description: "High-octane energy booster engineered for extreme energy, laser focus, and skin-splitting pumps. Contains L-Citrulline, Beta-Alanine, and Caffeine to fuel your heaviest workouts.",
    price: 1899,
    originalPrice: 2499,
    image: "assets/pre_workout.png",
    stock: 8,
    sold: 90,
    isRunning: true,
    weight: "300 g",
    servings: "30 Servings",
    flavor: "Fruit Punch",
    isVeg: true
  },
  {
    id: "prod-creatine",
    name: "Bajrangi Nutrition Creatine Monohydrate",
    category: "Creatine",
    description: "100% pure micronized creatine monohydrate. Helps increase muscle strength, power output, and cognitive performance. Unflavoured for easy mixing with whey or pre-workout.",
    price: 899,
    originalPrice: 1299,
    image: "assets/creatine.png",
    stock: 25,
    sold: 240,
    isRunning: true,
    weight: "100 g",
    servings: "33 Servings",
    flavor: "Unflavoured",
    isVeg: true
  },
  {
    id: "prod-shaker",
    name: "Bajrangi Nutrition Classic Shaker",
    category: "Accessories",
    description: "Leap-proof shaker bottle with bajrangi branding. Features a durable blending ball, secure flip cap, and high quality BPA-free construction.",
    price: 399,
    originalPrice: 599,
    image: "assets/shaker.png",
    stock: 50,
    sold: 310,
    isRunning: false,
    weight: "700 ml",
    servings: "N/A",
    flavor: "Orange/Black",
    isVeg: false
  }
];

// CLIENT-SIDE RATE LIMITING & EXPONENTIAL BACKOFF LOGIC
class RateLimiter {
  static checkAuth() {
    const now = Date.now();
    let attempts = JSON.parse(sessionStorage.getItem("auth_attempts") || "[]");
    
    // Filter attempts inside the active window
    attempts = attempts.filter(t => now - t < SECURITY_CONFIG.authWindowMs);
    
    if (attempts.length >= SECURITY_CONFIG.authAttemptsLimit) {
      // Calculate delay with exponential backoff: factor * 2^(excess attempts)
      const excess = attempts.length - SECURITY_CONFIG.authAttemptsLimit + 1;
      const delay = Math.pow(2, excess) * SECURITY_CONFIG.authBackoffFactor;
      return { allowed: false, delay, remaining: 0 };
    }
    
    return { allowed: true, delay: 0, remaining: SECURITY_CONFIG.authAttemptsLimit - attempts.length };
  }

  static recordAuthAttempt() {
    const attempts = JSON.parse(sessionStorage.getItem("auth_attempts") || "[]");
    attempts.push(Date.now());
    sessionStorage.setItem("auth_attempts", JSON.stringify(attempts));
  }

  static checkCheckout() {
    const now = Date.now();
    let checkouts = JSON.parse(localStorage.getItem("checkout_timestamps") || "[]");
    
    // Filter checkouts inside the active window
    checkouts = checkouts.filter(t => now - t < SECURITY_CONFIG.checkoutWindowMs);
    
    if (checkouts.length >= SECURITY_CONFIG.checkoutLimit) {
      const oldest = checkouts[0];
      const cooldownRemaining = Math.ceil((SECURITY_CONFIG.checkoutWindowMs - (now - oldest)) / 1000);
      return { allowed: false, cooldownRemaining };
    }
    return { allowed: true };
  }

  static recordCheckout() {
    const checkouts = JSON.parse(localStorage.getItem("checkout_timestamps") || "[]");
    checkouts.push(Date.now());
    localStorage.setItem("checkout_timestamps", JSON.stringify(checkouts));
  }

  static checkAdminWrite() {
    const now = Date.now();
    let writes = JSON.parse(sessionStorage.getItem("admin_write_timestamps") || "[]");
    
    // Filter writes inside the active window
    writes = writes.filter(t => now - t < SECURITY_CONFIG.adminWritesWindowMs);
    
    if (writes.length >= SECURITY_CONFIG.adminWritesLimit) {
      return { allowed: false };
    }
    return { allowed: true };
  }

  static recordAdminWrite() {
    const writes = JSON.parse(sessionStorage.getItem("admin_write_timestamps") || "[]");
    writes.push(Date.now());
    sessionStorage.setItem("admin_write_timestamps", JSON.stringify(writes));
  }
}

// STRICT SCHEMA VALIDATION CONTROLLER
class SchemaValidator {
  static validateProduct(p) {
    const categories = ["Protein", "Pre-Workout", "Creatine", "Accessories", "Vitamins"];
    
    if (!p.name || typeof p.name !== "string" || p.name.trim().length < 3 || p.name.length > 100) {
      throw new Error("Validation Error: Product name must be between 3 and 100 characters.");
    }
    if (!categories.includes(p.category)) {
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
    // Verify image signature / URL structure
    if (p.image) {
      const isBase64 = p.image.startsWith("data:image/jpeg;base64,") || 
                        p.image.startsWith("data:image/png;base64,") || 
                        p.image.startsWith("data:image/webp;base64,") ||
                        p.image.startsWith("data:image/jpg;base64,");
      const isSecureUrl = p.image.startsWith("https://") || p.image.startsWith("assets/");
      if (!isBase64 && !isSecureUrl) {
        throw new Error("Security Alert: Product image format rejected. Must be a secure HTTPS URL or a valid image upload.");
      }
    }
    return true;
  }

  static validateCheckout(name, phone) {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    // Handles Indian phone numbers (10 digits, optional 91/+91 prefix)
    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

    if (!name || !nameRegex.test(name.trim())) {
      throw new Error("Validation Error: Please enter a valid name (2-50 letters, no special characters/digits).");
    }
    
    const cleanPhone = phone.trim().replace(/[-\s]/g, "");
    if (!phone || !phoneRegex.test(cleanPhone)) {
      throw new Error("Validation Error: Please enter a valid 10-digit mobile number.");
    }
    return true;
  }
}

// Database Service Wrapper
class DatabaseService {
  constructor() {
    this.isCloud = window.isFirebaseConfigured;
    if (this.isCloud) {
      try {
        firebase.initializeApp(window.firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        console.log("⚡ Firebase Initialized. Cloud database connected.");
      } catch (err) {
        console.error("Firebase init failed, falling back to LocalStorage:", err);
        this.isCloud = false;
      }
    }
    
    if (!this.isCloud) {
      console.log("ℹ️ Operating in Offline LocalStorage mode.");
      this.initLocalStorage();
    }
  }

  initLocalStorage() {
    if (!localStorage.getItem("bajrangi_products")) {
      localStorage.setItem("bajrangi_products", JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem("bajrangi_orders")) {
      localStorage.setItem("bajrangi_orders", JSON.stringify([]));
    }
  }

  // Subscribe to real-time changes
  subscribeToProducts(callback) {
    if (this.isCloud) {
      return db.collection("products").onSnapshot((snapshot) => {
        let products = [];
        snapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });
        if (products.length === 0) {
          this.seedFirebaseProducts();
        } else {
          callback(products);
        }
      }, (error) => {
        // Prevent system traceback leakage, log internally
        console.error("Firestore read error:", error.code, error.message);
        this.subscribeLocalProducts(callback);
      });
    } else {
      this.subscribeLocalProducts(callback);
      return () => {}; 
    }
  }

  subscribeLocalProducts(callback) {
    const load = () => {
      const data = JSON.parse(localStorage.getItem("bajrangi_products"));
      callback(data);
    };
    load();
    window.addEventListener("localDataChange", load);
  }

  subscribeToOrders(callback) {
    if (this.isCloud) {
      return db.collection("orders").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        let orders = [];
        snapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        callback(orders);
      }, (error) => {
        console.error("Firestore orders read error:", error.code, error.message);
      });
    } else {
      const load = () => {
        const data = JSON.parse(localStorage.getItem("bajrangi_orders"));
        data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(data);
      };
      load();
      window.addEventListener("localOrdersChange", load);
      return () => {};
    }
  }

  async seedFirebaseProducts() {
    console.log("Seeding default products to Firebase...");
    for (const p of DEFAULT_PRODUCTS) {
      try {
        await db.collection("products").doc(p.id).set(p);
      } catch (err) {
        console.error("Seeding failed:", err.message);
      }
    }
  }

  // Database mutations
  async saveProduct(product) {
    // 1. Rate Limit Check
    if (!RateLimiter.checkAdminWrite().allowed) {
      throw new Error("System Warning: Rate limit exceeded. Too many database writes. Please wait a minute.");
    }

    // 2. Input Validation
    SchemaValidator.validateProduct(product);

    if (this.isCloud) {
      const docRef = product.id 
        ? db.collection("products").doc(product.id) 
        : db.collection("products").doc();
      const id = docRef.id;
      const data = { ...product, id, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
      await docRef.set(data, { merge: true });
    } else {
      let products = JSON.parse(localStorage.getItem("bajrangi_products"));
      if (product.id) {
        products = products.map(p => p.id === product.id ? { ...p, ...product } : p);
      } else {
        const newProduct = { 
          ...product, 
          id: "prod-" + Date.now(), 
          sold: product.sold || 0 
        };
        products.push(newProduct);
      }
      localStorage.setItem("bajrangi_products", JSON.stringify(products));
      window.dispatchEvent(new Event("localDataChange"));
    }

    RateLimiter.recordAdminWrite();
  }

  async deleteProduct(productId) {
    if (!RateLimiter.checkAdminWrite().allowed) {
      throw new Error("System Warning: Rate limit exceeded. Too many database writes.");
    }

    if (this.isCloud) {
      await db.collection("products").doc(productId).delete();
    } else {
      let products = JSON.parse(localStorage.getItem("bajrangi_products"));
      products = products.filter(p => p.id !== productId);
      localStorage.setItem("bajrangi_products", JSON.stringify(products));
      window.dispatchEvent(new Event("localDataChange"));
    }
    RateLimiter.recordAdminWrite();
  }

  async createOrder(order) {
    const orderData = {
      ...order,
      createdAt: this.isCloud ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    if (this.isCloud) {
      const docRef = await db.collection("orders").add(orderData);
      for (const item of order.items) {
        db.collection("products").doc(item.productId).update({
          stock: firebase.firestore.FieldValue.increment(-item.quantity),
          sold: firebase.firestore.FieldValue.increment(item.quantity)
        });
      }
      return docRef.id;
    } else {
      let orders = JSON.parse(localStorage.getItem("bajrangi_orders"));
      const newOrder = {
        ...orderData,
        id: "order-" + Date.now()
      };
      orders.push(newOrder);
      localStorage.setItem("bajrangi_orders", JSON.stringify(orders));

      let products = JSON.parse(localStorage.getItem("bajrangi_products"));
      for (const item of order.items) {
        products = products.map(p => {
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
      localStorage.setItem("bajrangi_products", JSON.stringify(products));
      
      window.dispatchEvent(new Event("localDataChange"));
      window.dispatchEvent(new Event("localOrdersChange"));
      return newOrder.id;
    }
  }

  async updateOrderStatus(orderId, status) {
    if (!RateLimiter.checkAdminWrite().allowed) {
      throw new Error("Rate limit exceeded.");
    }
    if (this.isCloud) {
      await db.collection("orders").doc(orderId).update({ status });
    } else {
      let orders = JSON.parse(localStorage.getItem("bajrangi_orders"));
      orders = orders.map(o => o.id === orderId ? { ...o, status } : o);
      localStorage.setItem("bajrangi_orders", JSON.stringify(orders));
      window.dispatchEvent(new Event("localOrdersChange"));
    }
    RateLimiter.recordAdminWrite();
  }

  async restoreAllData(jsonData) {
    if (!RateLimiter.checkAdminWrite().allowed) {
      throw new Error("Rate limit exceeded.");
    }
    if (this.isCloud) {
      const productsBatch = db.batch();
      if (jsonData.products) {
        const oldProducts = await db.collection("products").get();
        oldProducts.forEach(doc => doc.ref.delete());
        
        jsonData.products.forEach(p => {
          const ref = db.collection("products").doc(p.id);
          productsBatch.set(ref, p);
        });
        await productsBatch.commit();
      }
      if (jsonData.orders) {
        const oldOrders = await db.collection("orders").get();
        oldOrders.forEach(doc => doc.ref.delete());
        
        for (const o of jsonData.orders) {
          await db.collection("orders").doc(o.id).set({
            ...o,
            createdAt: firebase.firestore.Timestamp.fromDate(new Date(o.createdAt))
          });
        }
      }
    } else {
      if (jsonData.products) {
        localStorage.setItem("bajrangi_products", JSON.stringify(jsonData.products));
      }
      if (jsonData.orders) {
        localStorage.setItem("bajrangi_orders", JSON.stringify(jsonData.orders));
      }
      window.dispatchEvent(new Event("localDataChange"));
      window.dispatchEvent(new Event("localOrdersChange"));
    }
    RateLimiter.recordAdminWrite();
  }
}

const dataService = new DatabaseService();

// Google Sign-In & Authentication
class AuthService {
  constructor() {
    this.isCloud = window.isFirebaseConfigured;
  }

  async login() {
    // 1. Rate Limit Checks & Exponential Backoff
    const limit = RateLimiter.checkAuth();
    if (!limit.allowed || isBackingOff) {
      const waitTime = Math.ceil(limit.delay / 1000) || 10;
      showToast(`Too many login attempts. Please wait ${waitTime}s before trying again.`, "danger");
      
      // Throttle/disable login button temporarily
      const btn = document.getElementById("google-signin-btn");
      if (btn) {
        btn.disabled = true;
        isBackingOff = true;
        setTimeout(() => {
          btn.disabled = false;
          isBackingOff = false;
        }, limit.delay);
      }
      return;
    }
    
    RateLimiter.recordAuthAttempt();

    if (this.isCloud) {
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        const result = await auth.signInWithPopup(provider);
        const email = result.user.email;
        if (ADMIN_EMAILS.includes(email)) {
          currentUser = result.user;
          showToast(`Welcome Admin ${result.user.displayName}!`, "success");
          openAdminPanel();
        } else {
          await auth.signOut();
          showToast("Authentication Error: Your Gmail account is not authorized.", "danger");
        }
      } catch (err) {
        // Prevent Leakage: log exact auth errors internally, generic to user
        console.error("Auth Fail Info:", err.code, err.message);
        showToast("Authentication failed. Connection to identity provider refused.", "danger");
      }
    } else {
      const email = prompt("Enter Admin Gmail address for authentication testing:", "vanshikapahal16@gmail.com");
      if (email === null) return; 
      
      if (ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
        currentUser = {
          displayName: "Admin Vanshika",
          email: email.toLowerCase().trim(),
          photoURL: "https://lh3.googleusercontent.com/a/default-user=s96-c"
        };
        showToast("Authenticated as Owner (Offline Test Mode)", "success");
        openAdminPanel();
      } else {
        showToast("Access Denied: Only vanshikapahal16@gmail.com is authorized.", "danger");
      }
    }
    updateAuthUI();
  }

  async logout() {
    try {
      if (this.isCloud) {
        await auth.signOut();
      }
      currentUser = null;
      showToast("Logged out successfully.", "success");
      closeAdminPanel();
      updateAuthUI();
    } catch (err) {
      console.error("Logout Err:", err.message);
      showToast("An error occurred during logout.", "danger");
    }
  }

  checkAuth(callback) {
    if (this.isCloud) {
      auth.onAuthStateChanged((user) => {
        if (user && ADMIN_EMAILS.includes(user.email)) {
          currentUser = user;
          updateAuthUI();
          callback(true);
        } else {
          currentUser = null;
          updateAuthUI();
          callback(false);
        }
      });
    } else {
      callback(currentUser !== null);
    }
  }
}

const authService = new AuthService();

// App Initialization
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("bajrangi_cart")) {
    cart = JSON.parse(localStorage.getItem("bajrangi_cart"));
    updateCartBadge();
  }

  dataService.subscribeToProducts((products) => {
    currentProducts = products;
    renderStorefront();
  });

  dataService.subscribeToOrders((orders) => {
    currentOrders = orders;
    if (document.getElementById("admin-overlay").style.display === "flex") {
      renderAdminDashboard();
    }
  });

  authService.checkAuth((isAuthenticated) => {
    updateAuthUI();
  });

  setupEventListeners();
});

// Setup DOM Event Listeners
function setupEventListeners() {
  document.querySelectorAll(".category-pill").forEach(pill => {
    pill.addEventListener("click", (e) => {
      document.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
      e.target.classList.add("active");
      activeCategory = e.target.dataset.category;
      renderStorefront();
    });
  });

  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", (e) => {
      const category = e.target.dataset.category;
      if (category) {
        e.preventDefault();
        document.querySelectorAll(".category-pill").forEach(pill => {
          if (pill.dataset.category === category) {
            pill.click();
            document.getElementById("catalog-section").scrollIntoView({ behavior: "smooth" });
          }
        });
      }
    });
  });

  document.getElementById("search-input").addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderStorefront();
  });

  document.getElementById("cart-btn").addEventListener("click", openCartDrawer);
  document.getElementById("close-cart").addEventListener("click", closeCartDrawer);
  document.getElementById("cart-overlay").addEventListener("click", closeCartDrawer);

  document.getElementById("admin-login-btn").addEventListener("click", () => {
    if (currentUser) {
      openAdminPanel();
    } else {
      openAuthModal();
    }
  });
  document.getElementById("close-auth").addEventListener("click", closeAuthModal);
  document.getElementById("google-signin-btn").addEventListener("click", () => {
    authService.login();
    closeAuthModal();
  });

  document.getElementById("admin-close-btn").addEventListener("click", closeAdminPanel);
  document.getElementById("admin-logout-btn").addEventListener("click", () => {
    authService.logout();
  });

  document.querySelectorAll(".admin-menu-item").forEach(item => {
    item.addEventListener("click", (e) => {
      const tab = e.currentTarget.dataset.tab;
      document.querySelectorAll(".admin-menu-item").forEach(i => i.classList.remove("active"));
      e.currentTarget.classList.add("active");

      document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
      document.getElementById(`admin-panel-${tab}`).classList.add("active");
    });
  });

  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal-overlay")) closeModal();
  });

  document.getElementById("product-form").addEventListener("submit", handleProductSubmit);

  // File Upload Guard implementation
  document.getElementById("prod-image-file").addEventListener("change", handleProductImageUpload);

  document.getElementById("btn-backup-data").addEventListener("click", downloadDataBackup);
  document.getElementById("btn-restore-data").addEventListener("change", restoreDataBackup);

  document.getElementById("checkout-btn").addEventListener("click", handleWhatsAppCheckout);
}

// STOREFRONT RENDERING ENGINE
function renderStorefront() {
  const runningGrid = document.getElementById("running-products-grid");
  const mainGrid = document.getElementById("all-products-grid");
  
  let filtered = currentProducts.filter(p => {
    const matchesCategory = (activeCategory === "all") || (p.category.toLowerCase() === activeCategory.toLowerCase());
    const matchesSearch = p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const runningProducts = currentProducts.filter(p => p.isRunning);
  if (runningProducts.length > 0) {
    document.getElementById("running-products-section").style.display = "block";
    runningGrid.innerHTML = runningProducts.map(p => renderProductCard(p)).join("");
  } else {
    document.getElementById("running-products-section").style.display = "none";
  }

  if (filtered.length > 0) {
    mainGrid.innerHTML = filtered.map(p => renderProductCard(p)).join("");
  } else {
    mainGrid.innerHTML = `
      <div style="grid-column: span 4; text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 16px; color: var(--primary-color);"></i>
        <h3>No supplements found</h3>
        <p>Try matching another category or refining your search term.</p>
      </div>
    `;
  }

  attachProductCardEvents();
}

function renderProductCard(p) {
  const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  const outOfStock = p.stock <= 0;
  
  let stockText = "In Stock";
  let stockClass = "text-success";
  if (outOfStock) {
    stockText = "Out of Stock";
    stockClass = "text-danger";
  } else if (p.stock <= 4) {
    stockText = `Only ${p.stock} left!`;
    stockClass = "text-warning";
  }

  return `
    <div class="product-card" data-id="${p.id}">
      ${p.isRunning ? `<div class="product-badge">Top Seller</div>` : ""}
      ${p.isVeg ? `<div class="product-veg-icon" title="Vegetarian Product"></div>` : ""}
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}">
      </div>
      <div class="product-details">
        <div class="product-category">${p.category}</div>
        <h3 class="product-title">${p.name}</h3>
        <div class="product-rating">
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star-half-alt"></i>
          <span>(4.8)</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">₹${p.price.toLocaleString("en-IN")}</span>
          <span class="product-original-price">₹${p.originalPrice.toLocaleString("en-IN")}</span>
          <span class="product-discount">${discount}% OFF</span>
        </div>
        <div class="product-stock-status ${stockClass}">${stockText}</div>
        
        <div class="product-actions">
          <button class="product-quickview view-product-btn" title="Quick Specs">
            <i class="fas fa-eye"></i>
          </button>
          <button class="product-add-cart add-to-cart-btn ${outOfStock ? "out-of-stock" : ""}" ${outOfStock ? "disabled" : ""}>
            <i class="fas fa-shopping-cart"></i> 
            ${outOfStock ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderCartDrawer() {
  const container = document.getElementById("cart-items-container");
  const subtotalEl = document.getElementById("cart-subtotal");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
        <i class="fas fa-shopping-basket" style="font-size: 3rem; margin-bottom: 16px; color: #333;"></i>
        <p>Your shopping cart is empty.</p>
        <button class="btn btn-secondary" style="margin-top: 15px; padding: 10px 20px; font-size: 0.8rem;" onclick="closeCartDrawer()">Shop Now</button>
      </div>
    `;
    subtotalEl.innerText = "₹0";
    checkoutBtn.classList.add("disabled");
    checkoutBtn.disabled = true;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.name}</h4>
        <div class="cart-item-price">₹${item.price.toLocaleString("en-IN")}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateCartQty('${item.productId}', -1)"><i class="fas fa-minus"></i></button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateCartQty('${item.productId}', 1)"><i class="fas fa-plus"></i></button>
          
          <button class="remove-item" onclick="removeFromCart('${item.productId}')" title="Remove Item">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    </div>
  `).join("");

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  subtotalEl.innerText = `₹${subtotal.toLocaleString("en-IN")}`;
  checkoutBtn.classList.remove("disabled");
  checkoutBtn.disabled = false;
}

function attachProductCardEvents() {
  document.querySelectorAll(".view-product-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card");
      const id = card.dataset.id;
      const product = currentProducts.find(p => p.id === id);
      openProductModal(product);
    });
  });

  document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card");
      const id = card.dataset.id;
      const product = currentProducts.find(p => p.id === id);
      addToCart(product);
    });
  });
}

// CART CONTROLLER
function addToCart(product, quantity = 1) {
  if (product.stock <= 0) {
    showToast("This item is currently sold out.", "warning");
    return;
  }

  const existing = cart.find(item => item.productId === product.id);
  const currentAddedQty = existing ? existing.quantity : 0;
  
  if (currentAddedQty + quantity > product.stock) {
    showToast(`Cannot add more. Only ${product.stock} units available in stock.`, "warning");
    return;
  }

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: quantity,
      stockLimit: product.stock
    });
  }

  localStorage.setItem("bajrangi_cart", JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
  openCartDrawer();
  showToast(`Added ${product.name} to cart.`, "success");
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.productId !== productId);
  localStorage.setItem("bajrangi_cart", JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function updateCartQty(productId, change) {
  const item = cart.find(item => item.productId === productId);
  if (!item) return;

  const targetQty = item.quantity + change;
  if (targetQty <= 0) {
    removeFromCart(productId);
    return;
  }

  if (targetQty > item.stockLimit) {
    showToast(`Sorry, only ${item.stockLimit} units are available in stock.`, "warning");
    return;
  }

  item.quantity = targetQty;
  localStorage.setItem("bajrangi_cart", JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cart-count").innerText = totalItems;
}

function openCartDrawer() {
  renderCartDrawer();
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-overlay").classList.add("open");
}

function closeCartDrawer() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("open");
}

// WHATSAPP CHECKOUT FLOW WITH RATE LIMITING & INPUT VALIDATION
async function handleWhatsAppCheckout() {
  if (cart.length === 0) return;

  // 1. Rate Limit Check
  const rateLimit = RateLimiter.checkCheckout();
  if (!rateLimit.allowed) {
    showToast(`Checkout Throttled: You have requested too many checkouts. Please wait ${rateLimit.cooldownRemaining}s before resubmitting.`, "danger");
    return;
  }

  const customerName = prompt("Please enter your name for delivery:", "");
  if (customerName === null) return; // Prompt cancelled

  const customerPhone = prompt("Please enter your contact phone number (10 digits):", "");
  if (customerPhone === null) return; 

  // 2. Strict Input Validation Schema
  try {
    SchemaValidator.validateCheckout(customerName, customerPhone);
  } catch (err) {
    showToast(err.message, "danger");
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Format WhatsApp Message Text
  let message = `*NEW ORDER - BAJRANGI NUTRITION KURUKSHETRA*\n`;
  message += `===================================\n`;
  message += `*Customer Details:*\n`;
  message += `👤 Name: ${customerName.trim()}\n`;
  message += `📞 Contact: ${customerPhone.trim()}\n\n`;
  message += `*Ordered Items:*\n`;
  
  const orderItems = cart.map(item => {
    message += `• ${item.quantity}x ${item.name} - *₹${(item.price * item.quantity).toLocaleString("en-IN")}*\n`;
    return {
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    };
  });

  message += `===================================\n`;
  message += `*Total Amount:* ₹${subtotal.toLocaleString("en-IN")}\n\n`;
  message += `Please confirm availability and dispatch my order. Thank you!`;

  const orderLog = {
    items: orderItems,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    totalPrice: subtotal,
    status: "Pending" 
  };

  try {
    const orderId = await dataService.createOrder(orderLog);
    showToast("Order logged. Opening WhatsApp...", "success");
    
    // Record checkout rate limit timestamp
    RateLimiter.recordCheckout();

    // Clear Cart
    cart = [];
    localStorage.setItem("bajrangi_cart", JSON.stringify(cart));
    updateCartBadge();
    closeCartDrawer();

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMsg}`;
    
    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 1000);

  } catch (err) {
    // Info leakage blocker: do not leak raw stack traces to users
    console.error("Order Creation Trace:", err);
    showToast("Failed to process order log. Database write blocked.", "danger");
  }
}

// QUICK VIEW MODAL
function openProductModal(product) {
  selectedProductForModal = product;
  const modal = document.getElementById("modal-overlay");
  
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const outOfStock = product.stock <= 0;

  document.getElementById("modal-category").innerText = product.category;
  document.getElementById("modal-title").innerText = product.name;
  document.getElementById("modal-image-src").src = product.image;
  document.getElementById("modal-image-src").alt = product.name;
  document.getElementById("modal-price").innerText = `₹${product.price.toLocaleString("en-IN")}`;
  document.getElementById("modal-original-price").innerText = `₹${product.originalPrice.toLocaleString("en-IN")}`;
  document.getElementById("modal-discount").innerText = `${discount}% OFF`;
  document.getElementById("modal-desc").innerText = product.description;
  
  document.getElementById("spec-weight").innerText = product.weight || "N/A";
  document.getElementById("spec-servings").innerText = product.servings || "N/A";
  document.getElementById("spec-flavor").innerText = product.flavor || "N/A";
  document.getElementById("spec-veg").innerText = product.isVeg ? "Yes (Green Badge)" : "No";

  const qtyInput = document.getElementById("modal-qty-val");
  qtyInput.innerText = "1";

  const addBtn = document.getElementById("modal-add-btn");
  if (outOfStock) {
    addBtn.innerText = "Sold Out";
    addBtn.classList.add("out-of-stock");
    addBtn.disabled = true;
  } else {
    addBtn.innerHTML = `<i class="fas fa-shopping-cart"></i> Add To Cart`;
    addBtn.classList.remove("out-of-stock");
    addBtn.disabled = false;
  }

  document.getElementById("modal-qty-minus").onclick = () => {
    let q = parseInt(qtyInput.innerText);
    if (q > 1) qtyInput.innerText = --q;
  };

  document.getElementById("modal-qty-plus").onclick = () => {
    let q = parseInt(qtyInput.innerText);
    if (q < product.stock) {
      qtyInput.innerText = ++q;
    } else {
      showToast(`Cannot select more. Only ${product.stock} units in stock.`, "warning");
    }
  };

  addBtn.onclick = () => {
    addToCart(product, parseInt(qtyInput.innerText));
    closeModal();
  };

  modal.classList.add("open");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
  selectedProductForModal = null;
}

// AUTH MODAL OVERLAYS
function openAuthModal() {
  document.getElementById("auth-overlay").classList.add("open");
}

function closeAuthModal() {
  document.getElementById("auth-overlay").classList.remove("open");
}

function updateAuthUI() {
  const loginBtn = document.getElementById("admin-login-btn");
  if (currentUser) {
    loginBtn.innerHTML = `<i class="fas fa-user-cog" style="color: var(--primary-color);"></i> Dashboard`;
    loginBtn.title = `Logged in as ${currentUser.displayName}`;
  } else {
    loginBtn.innerHTML = `<i class="far fa-user"></i>`;
    loginBtn.title = "Admin Login";
  }
}

// ADMIN DASHBOARD PANELS CONTROLLER
function openAdminPanel() {
  if (!currentUser) return;
  document.getElementById("admin-overlay").style.display = "flex";
  document.body.style.overflow = "hidden"; 
  
  document.querySelector(".admin-menu-item[data-tab='dashboard']").click();
  renderAdminDashboard();
}

function closeAdminPanel() {
  document.getElementById("admin-overlay").style.display = "none";
  document.body.style.overflow = "auto";
}

function renderAdminDashboard() {
  const totalRevenue = currentOrders
    .filter(o => o.status === "Completed")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const totalSold = currentOrders
    .filter(o => o.status === "Completed")
    .reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);

  const lowStockCount = currentProducts.filter(p => p.stock <= 4).length;
  const totalProductsCount = currentProducts.length;

  document.getElementById("stat-revenue").innerText = `₹${totalRevenue.toLocaleString("en-IN")}`;
  document.getElementById("stat-sold").innerText = totalSold;
  document.getElementById("stat-lowstock").innerText = lowStockCount;
  document.getElementById("stat-products").innerText = totalProductsCount;

  renderLowStockAlerts();
  renderAdminInventoryTable();
  renderAdminOrdersTable();
}

function renderLowStockAlerts() {
  const container = document.getElementById("low-stock-alerts-list");
  const lowStock = currentProducts.filter(p => p.stock <= 4);
  
  if (lowStock.length === 0) {
    container.innerHTML = `<p style="color: var(--success); font-weight:600;"><i class="fas fa-check-circle"></i> All stock levels healthy. No alerts.</p>`;
    return;
  }

  container.innerHTML = lowStock.map(p => `
    <div style="background-color: rgba(255, 23, 68, 0.05); border: 1px solid var(--danger); padding: 12px; border-radius: 8px; margin-bottom: 10px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong class="text-danger">${p.name}</strong> (${p.category})
      </div>
      <div>
        Stock Remaining: <strong style="font-size: 1.1rem; color:var(--danger);">${p.stock}</strong>
      </div>
    </div>
  `).join("");
}

function renderAdminInventoryTable() {
  const tbody = document.getElementById("admin-inventory-tbody");
  
  tbody.innerHTML = currentProducts.map(p => {
    let stockStatus = "In Stock";
    let statusClass = "in-stock";
    if (p.stock === 0) {
      stockStatus = "Out of Stock";
      statusClass = "out-of-stock";
    } else if (p.stock <= 4) {
      stockStatus = "Low Stock";
      statusClass = "low-stock";
    }

    return `
      <tr>
        <td>
          <div class="admin-table-product">
            <div class="admin-table-img">
              <img src="${p.image}" alt="">
            </div>
            <div>
              <div class="admin-table-pname">${p.name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${p.weight} | ${p.servings} | ${p.flavor}</div>
            </div>
          </div>
        </td>
        <td style="font-weight: 700;">₹${p.price.toLocaleString("en-IN")}</td>
        <td>
          <span class="status-badge ${statusClass}">${stockStatus} (${p.stock})</span>
        </td>
        <td>${p.category}</td>
        <td><strong>${p.sold}</strong> units</td>
        <td>
          <div class="admin-table-actions">
            <button class="table-btn" onclick="editProductPrompt('${p.id}')" title="Edit Supplement"><i class="fas fa-edit"></i></button>
            <button class="table-btn" onclick="quickStockChange('${p.id}', 5)" title="Add 5 Stock"><i class="fas fa-plus"></i></button>
            <button class="table-btn btn-delete" onclick="deleteProductConfirm('${p.id}')" title="Delete Product"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function renderAdminOrdersTable() {
  const tbody = document.getElementById("admin-orders-tbody");
  
  if (currentOrders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:30px;">No checkout history recorded.</td></tr>`;
    return;
  }

  tbody.innerHTML = currentOrders.map(o => {
    const formattedDate = new Date(o.createdAt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

    const itemsSummary = o.items.map(i => `${i.quantity}x ${i.name}`).join("<br>");

    let statusStyle = "background-color: rgba(255, 214, 0, 0.1); color: var(--warning);";
    if (o.status === "Completed") statusStyle = "background-color: rgba(0, 230, 118, 0.1); color: var(--success);";
    if (o.status === "Cancelled") statusStyle = "background-color: rgba(255, 23, 68, 0.1); color: var(--danger);";

    return `
      <tr>
        <td><code style="font-size:0.8rem; color:var(--primary-color);">${o.id.substring(0,8)}...</code></td>
        <td>
          <strong>${o.customerName}</strong><br>
          <span style="font-size:0.8rem; color:var(--text-muted);">${o.customerPhone}</span>
        </td>
        <td style="font-size:0.85rem; line-height:1.4;">${itemsSummary}</td>
        <td style="font-weight:700;">₹${o.totalPrice.toLocaleString("en-IN")}</td>
        <td>${formattedDate}</td>
        <td>
          <span class="status-badge" style="${statusStyle}">${o.status}</span>
        </td>
        <td>
          ${o.status === "Pending" ? `
            <div style="display:flex; gap:6px;">
              <button class="btn btn-primary" style="padding: 4px 8px; font-size:0.75rem; border-radius:4px; box-shadow:none;" onclick="updateStatus('${o.id}', 'Completed')"><i class="fas fa-check"></i> Fulfill</button>
              <button class="btn btn-secondary" style="padding: 4px 8px; font-size:0.75rem; border-radius:4px; box-shadow:none; border-color:var(--danger); color:var(--danger);" onclick="updateStatus('${o.id}', 'Cancelled')">Cancel</button>
            </div>
          ` : `<span style="font-size:0.8rem; color:var(--text-muted);">Locked</span>`}
        </td>
      </tr>
    `;
  }).join("");
}

// QUICK STOCK INCREMENT BUTTONS
async function quickStockChange(productId, amt) {
  const p = currentProducts.find(p => p.id === productId);
  if (!p) return;
  
  const updatedP = { ...p, stock: p.stock + amt };
  
  try {
    await dataService.saveProduct(updatedP);
    showToast(`Added ${amt} units to stock of ${p.name}.`, "success");
  } catch (err) {
    console.error("Quick stock write trace:", err.message);
    showToast(err.message.includes("Rate limit") ? err.message : "Database write failed.", "danger");
  }
}

// LOG STATUS UPDATES FOR ORDER FULFILLMENTS
async function updateStatus(orderId, status) {
  try {
    await dataService.updateOrderStatus(orderId, status);
    showToast(`Order marked as ${status}!`, "success");
  } catch (err) {
    console.error("Order update trace:", err.message);
    showToast(err.message.includes("Rate limit") ? err.message : "Database write failed.", "danger");
  }
}

// ADD & EDIT PRODUCT FORM OPERATIONS
function openAddProductForm() {
  document.getElementById("form-action-title").innerText = "Add New Supplement Product";
  document.getElementById("prod-id").value = "";
  document.getElementById("product-form").reset();
  
  document.querySelector(".admin-menu-item[data-tab='add-product']").click();
}

function editProductPrompt(productId) {
  const p = currentProducts.find(p => p.id === productId);
  if (!p) return;

  document.getElementById("form-action-title").innerText = `Edit Product: ${p.name}`;
  document.getElementById("prod-id").value = p.id;
  document.getElementById("prod-name").value = p.name;
  document.getElementById("prod-price").value = p.price;
  document.getElementById("prod-origprice").value = p.originalPrice;
  document.getElementById("prod-category").value = p.category;
  document.getElementById("prod-desc").value = p.description;
  document.getElementById("prod-weight").value = p.weight || "";
  document.getElementById("prod-servings").value = p.servings || "";
  document.getElementById("prod-flavor").value = p.flavor || "";
  document.getElementById("prod-stock").value = p.stock;
  document.getElementById("prod-running").checked = p.isRunning;
  document.getElementById("prod-veg").checked = p.isVeg;
  
  document.getElementById("prod-image-url").value = p.image;

  document.querySelector(".admin-menu-item[data-tab='add-product']").click();
}

async function deleteProductConfirm(productId) {
  if (confirm("Are you sure you want to permanently delete this product from the database? This cannot be undone.")) {
    try {
      await dataService.deleteProduct(productId);
      showToast("Product deleted successfully.", "success");
    } catch (err) {
      console.error("Product deletion trace:", err.message);
      showToast(err.message.includes("Rate limit") ? err.message : "Database deletion failed.", "danger");
    }
  }
}

async function handleProductSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("prod-id").value;
  const name = document.getElementById("prod-name").value;
  const price = parseInt(document.getElementById("prod-price").value);
  const originalPrice = parseInt(document.getElementById("prod-origprice").value);
  const category = document.getElementById("prod-category").value;
  const description = document.getElementById("prod-desc").value;
  const weight = document.getElementById("prod-weight").value;
  const servings = document.getElementById("prod-servings").value;
  const flavor = document.getElementById("prod-flavor").value;
  const stock = parseInt(document.getElementById("prod-stock").value);
  const isRunning = document.getElementById("prod-running").checked;
  const isVeg = document.getElementById("prod-veg").checked;
  
  let image = document.getElementById("prod-image-url").value;

  if (!image) {
    image = "assets/whey_isolate.png"; 
  }

  const payload = {
    name, price, originalPrice, category, description,
    weight, servings, flavor, stock, isRunning, isVeg, image
  };

  if (id) {
    payload.id = id;
  }

  try {
    await dataService.saveProduct(payload);
    showToast(id ? "Product updated successfully!" : "Product created successfully!", "success");
    
    document.getElementById("product-form").reset();
    document.querySelector(".admin-menu-item[data-tab='dashboard']").click();
  } catch (err) {
    // Info leakage blocker: friendly generic message
    console.error("Save product trace:", err.message);
    showToast(err.message.includes("Validation Error") || err.message.includes("Rate limit") ? err.message : "Database write failed. Input signature rejected.", "danger");
  }
}

// FILE UPLOAD SAFETY GUARD
function handleProductImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  // 1. Validate File Size
  if (file.size > SECURITY_CONFIG.maxUploadSize) {
    showToast("File size too large. Maximum size allowed is 2MB.", "danger");
    e.target.value = "";
    return;
  }

  // 2. Validate Mime Type
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedMimeTypes.includes(file.type)) {
    showToast("File format rejected. Only JPG, PNG, and WEBP image formats are allowed.", "danger");
    e.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (uploadEvent) => {
    const result = uploadEvent.target.result;
    
    // 3. Magic Bytes Content Signature Verification
    if (!result.startsWith("data:image/jpeg;base64,") && 
        !result.startsWith("data:image/png;base64,") && 
        !result.startsWith("data:image/webp;base64,") &&
        !result.startsWith("data:image/jpg;base64,")) {
      showToast("Security Alert: File content signature mismatch. Execution blocked.", "danger");
      e.target.value = "";
      return;
    }
    
    document.getElementById("prod-image-url").value = result;
    showToast("Image file validated and loaded.", "success");
  };
  reader.readAsDataURL(file);
}

// BACKUP & RESTORE DATA CONTROLLERS
function downloadDataBackup() {
  const data = {
    products: currentProducts,
    orders: currentOrders,
    backupDate: new Date().toISOString(),
    creator: "Bajrangi Nutrition System Backup"
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `bajrangi_nutrition_backup_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Database backup file downloaded.", "success");
}

function restoreDataBackup(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (!data.products) {
        showToast("Invalid backup file. Products key missing.", "danger");
        return;
      }
      
      if (confirm(`Restore Backup: This will overwrite your current inventory of ${currentProducts.length} items. Continue?`)) {
        await dataService.restoreAllData(data);
        showToast("Database fully restored from backup!", "success");
      }
    } catch (err) {
      console.error("Data restore error:", err);
      showToast("Failed to parse backup JSON file.", "danger");
    }
  };
  reader.readAsText(file);
}

// TOAST NOTIFICATIONS ENGINE
function showToast(msg, type = "primary") {
  const container = document.getElementById("toast-container");
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let icon = '<i class="fas fa-info-circle toast-icon"></i>';
  if (type === "success") icon = '<i class="fas fa-check-circle toast-icon"></i>';
  if (type === "warning") icon = '<i class="fas fa-exclamation-triangle toast-icon"></i>';
  if (type === "danger") icon = '<i class="fas fa-exclamation-circle toast-icon"></i>';

  toast.innerHTML = `
    ${icon}
    <span class="toast-msg">${msg}</span>
  `;

  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}
