"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  Layers, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Database, 
  Check, 
  X, 
  Upload, 
  Download,
  Lock,
  Tag,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { Product, Order, Coupon, Review, authService, dataService } from "../lib/services";

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: "primary" | "success" | "warning" | "danger") => void;
}

type TabType = "dashboard" | "inventory" | "form" | "orders" | "coupons" | "reviews" | "backup";

export default function AdminPortal({ isOpen, onClose, showToast }: AdminPortalProps) {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  
  // Data lists
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [marqueeText, setMarqueeText] = useState("");

  // Product Form State
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<Product["category"]>("Protein");
  const [formPrice, setFormPrice] = useState(0);
  const [formOriginalPrice, setFormOriginalPrice] = useState(0);
  const [formWeight, setFormWeight] = useState("");
  const [formServings, setFormServings] = useState("");
  const [formFlavor, setFormFlavor] = useState("");
  const [formStock, setFormStock] = useState(10);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formRunning, setFormRunning] = useState(true);
  const [formVeg, setFormVeg] = useState(true);
  
  // Multi-Image Gallery State (Array of Base64 or URLs)
  const [formImages, setFormImages] = useState<string[]>([]);
  const [inputImageUrl, setInputImageUrl] = useState("");

  // Bundle Offer states
  const [formHasBundle, setFormHasBundle] = useState(false);
  const [formBuyQty, setFormBuyQty] = useState(2);
  const [formFreeQty, setFormFreeQty] = useState(1);
  const [formBundleLabel, setFormBundleLabel] = useState("Buy 2 Get 1 Free");

  // Coupon Form State
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponType, setCouponType] = useState<"percent" | "flat">("percent");

  // Subscribe to Auth state changes
  useEffect(() => {
    const unsubscribe = authService.checkAuthState((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Database changes when Admin is logged in
  useEffect(() => {
    if (!user) return;
    const unsubProducts = dataService.subscribeProducts((data) => setProducts(data));
    const unsubOrders = dataService.subscribeOrders((data) => setOrders(data));
    const unsubCoupons = dataService.subscribeCoupons((data) => setCoupons(data));
    const unsubReviews = dataService.subscribeReviews((data) => setReviews(data));
    const unsubMarquee = dataService.subscribeMarquee((data) => setMarqueeText(data));
    
    return () => {
      unsubProducts();
      unsubOrders();
      unsubCoupons();
      unsubReviews();
      unsubMarquee();
    };
  }, [user]);

  if (!isOpen) return null;

  // Login handler
  const handleLogin = () => {
    authService.login(
      (authUser) => {
        setUser(authUser);
        showToast(`Welcome back, ${authUser.displayName || "Owner"}!`, "success");
      },
      (errorMsg) => {
        showToast(errorMsg, "danger");
      }
    );
  };

  // Logout handler
  const handleLogout = () => {
    authService.logout(
      () => {
        setUser(null);
        showToast("Logged out successfully.", "success");
      },
      (errMsg) => {
        showToast(errMsg, "danger");
      }
    );
  };

  // Force seed default products
  const handleForceSeed = async () => {
    if (confirm("Seed default catalogue to database? This will verify cloud connections.")) {
      try {
        await dataService.seedFirebaseProducts();
        showToast("Default supplements and coupons seeded successfully!", "success");
      } catch (err: any) {
        showToast(`Seeding failed: ${err.message}`, "danger");
      }
    }
  };

  // Stock additions
  const handleAddStock = async (p: Product, amt: number) => {
    const updated = { ...p, stock: p.stock + amt };
    try {
      await dataService.saveProduct(updated);
      showToast(`Added ${amt} units of stock to ${p.name}.`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update stock.", "danger");
    }
  };

  // Status updates
  const handleUpdateStatus = async (orderId: string, status: "Completed" | "Cancelled") => {
    try {
      await dataService.updateOrderStatus(orderId, status);
      showToast(`Order marked as ${status}!`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update status.", "danger");
    }
  };

  // Form Image Uploader (Adds to gallery array)
  const handleFormImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("File size is too large. Max allowed size is 2MB.", "danger");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result.startsWith("data:image/")) {
        showToast("Invalid file type signature.", "danger");
        return;
      }
      setFormImages(prev => [...prev, result]);
      if (!formImageUrl) setFormImageUrl(result); // set primary
      showToast("Image added to gallery.", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = () => {
    if (!inputImageUrl.trim()) return;
    setFormImages(prev => [...prev, inputImageUrl.trim()]);
    if (!formImageUrl) setFormImageUrl(inputImageUrl.trim());
    setInputImageUrl("");
    showToast("URL added to gallery.", "success");
  };

  const handleRemoveGalleryImage = (idx: number) => {
    const updated = formImages.filter((_, i) => i !== idx);
    setFormImages(updated);
    if (formImageUrl === formImages[idx]) {
      setFormImageUrl(updated[0] || "");
    }
  };

  // Product Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<Product> = {
      name: formName,
      category: formCategory,
      price: Number(formPrice),
      originalPrice: Number(formOriginalPrice),
      weight: formWeight,
      servings: formServings,
      flavor: formFlavor,
      stock: Number(formStock),
      description: formDesc,
      isRunning: formRunning,
      isVeg: formVeg,
      image: formImageUrl || "/assets/whey_isolate.png",
      images: formImages.length > 0 ? formImages : [formImageUrl || "/assets/whey_isolate.png"]
    };

    if (formHasBundle) {
      payload.bundleDeal = {
        buyQty: formBuyQty,
        freeQty: formFreeQty,
        label: formBundleLabel
      };
    } else {
      payload.bundleDeal = undefined; // clear
    }

    if (editProductId) {
      payload.id = editProductId;
    }

    try {
      await dataService.saveProduct(payload);
      showToast(editProductId ? "Product updated!" : "Product added to catalog!", "success");
      
      resetForm();
      setActiveTab("inventory");
    } catch (err: any) {
      showToast(err.message || "Failed to save product.", "danger");
    }
  };

  const resetForm = () => {
    setEditProductId(null);
    setFormName("");
    setFormCategory("Protein");
    setFormPrice(0);
    setFormOriginalPrice(0);
    setFormWeight("");
    setFormServings("");
    setFormFlavor("");
    setFormStock(10);
    setFormImageUrl("");
    setFormDesc("");
    setFormRunning(true);
    setFormVeg(true);
    setFormImages([]);
    setFormHasBundle(false);
    setFormBuyQty(2);
    setFormFreeQty(1);
    setFormBundleLabel("Buy 2 Get 1 Free");
  };

  const handleEditClick = (p: Product) => {
    setEditProductId(p.id);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice);
    setFormWeight(p.weight || "");
    setFormServings(p.servings || "");
    setFormFlavor(p.flavor || "");
    setFormStock(p.stock);
    setFormImageUrl(p.image);
    setFormDesc(p.description);
    setFormRunning(p.isRunning);
    setFormVeg(p.isVeg);
    setFormImages(p.images || [p.image]);
    
    if (p.bundleDeal) {
      setFormHasBundle(true);
      setFormBuyQty(p.bundleDeal.buyQty);
      setFormFreeQty(p.bundleDeal.freeQty);
      setFormBundleLabel(p.bundleDeal.label);
    } else {
      setFormHasBundle(false);
    }
    setActiveTab("form");
  };

  const handleDeleteProduct = async (pId: string) => {
    if (confirm("Permanently delete this product?")) {
      try {
        await dataService.deleteProduct(pId);
        showToast("Product deleted successfully.", "success");
      } catch (err: any) {
        showToast(err.message || "Deletion failed.", "danger");
      }
    }
  };

  // Coupon submits
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const payload: Coupon = {
      code: couponCode.toUpperCase().trim(),
      discount: Number(couponDiscount),
      type: couponType
    };

    try {
      await dataService.saveCoupon(payload);
      showToast(`Coupon "${payload.code}" saved!`, "success");
      setCouponCode("");
      setCouponDiscount(0);
    } catch (err: any) {
      showToast(err.message || "Failed to save coupon.", "danger");
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      await dataService.deleteCoupon(code);
      showToast("Coupon deleted.", "primary");
    } catch (err: any) {
      showToast(err.message, "danger");
    }
  };

  // Review approvals
  const handleApproveReview = async (rId: string) => {
    try {
      await dataService.updateReviewApproval(rId, true);
      showToast("Review approved & published!", "success");
    } catch (err: any) {
      showToast(err.message, "danger");
    }
  };

  const handleDeleteReview = async (rId: string) => {
    try {
      await dataService.deleteReview(rId);
      showToast("Review deleted.", "primary");
    } catch (err: any) {
      showToast(err.message, "danger");
    }
  };

  // Marquee Save
  const handleSaveMarquee = async () => {
    try {
      await dataService.saveMarquee(marqueeText);
      showToast("Header promo text updated!", "success");
    } catch (err: any) {
      showToast(err.message, "danger");
    }
  };

  // Backups
  const handleBackup = () => {
    const data = {
      products,
      orders,
      coupons,
      backupDate: new Date().toISOString(),
      creator: "Bajrangi Nutrition System Backup"
    };

    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `bajrangi_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Backup download triggered.", "success");
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.products) throw new Error("Invalid structure.");
        
        if (confirm("Restore backup? This will overwrite your current inventory database.")) {
          await dataService.restoreAllData(data);
          showToast("Database restored!", "success");
        }
      } catch (err) {
        showToast("Invalid JSON backup structure.", "danger");
      }
    };
    reader.readAsText(file);
  };

  // Analytics metrics
  const totalRevenue = orders.filter(o => o.status === "Completed").reduce((sum, o) => sum + o.totalPrice, 0);
  const totalSold = orders.filter(o => o.status === "Completed").reduce((sum, o) => sum + o.items.reduce((acc, i) => acc + i.quantity, 0), 0);
  const lowStock = products.filter(p => p.stock <= 4);

  return (
    <div className="fixed inset-0 z-50 bg-bg-light flex flex-col h-screen overflow-hidden">
      
      {/* Header */}
      <header className="h-[80px] bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="" className="h-10 w-10 object-contain" />
          <h2 className="text-lg font-black tracking-tight">Owner Admin Portal</h2>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 bg-bg-light px-4 py-2 rounded-xl border border-gray-100">
              <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
              <span className="text-xs font-bold text-text-main">{user.displayName || "Admin"}</span>
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-wider bg-gray-150 hover:bg-gray-200 px-4 py-2.5 rounded-xl border border-gray-200 transition-all"
          >
            Close Dashboard
          </button>
          
          {user && (
            <button 
              onClick={handleLogout}
              className="text-xs font-bold uppercase tracking-wider text-danger bg-danger/10 border border-danger/20 px-4 py-2.5 rounded-xl hover:bg-danger/20 transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Login Screen */}
      {!user ? (
        <div className="flex-grow flex items-center justify-center p-8 bg-gradient-to-tr from-orange-50/10 via-bg-light to-amber-50/20">
          <div className="w-full max-w-sm bg-white border border-gray-150 rounded-3xl p-8 shadow-xl text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-2">Restricted Access</h3>
            <p className="text-text-muted text-xs leading-relaxed mb-8">
              Gmail login authentication required. Gated strictly to vanshikapahal16@gmail.com.
            </p>
            
            <button 
              onClick={handleLogin}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-text-main font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all text-xs uppercase tracking-wider"
            >
              <i className="fab fa-google text-red-500 text-base"></i> Sign in with Google
            </button>
          </div>
        </div>
      ) : (
        /* Authenticated Dashboard */
        <div className="flex-grow flex overflow-hidden">
          
          {/* Sidebar Tabs */}
          <aside className="w-64 bg-white border-r border-gray-100 p-6 flex-shrink-0">
            <ul className="space-y-1">
              {[
                { tab: "dashboard" as const, label: "Analytics & Banners", icon: <TrendingUp className="w-4 h-4" /> },
                { tab: "inventory" as const, label: "Product Catalog", icon: <Layers className="w-4 h-4" /> },
                { tab: "form" as const, label: "Add Supplement", icon: <Plus className="w-4 h-4" />, onClick: resetForm },
                { tab: "orders" as const, label: "WhatsApp Checkouts", icon: <ShoppingBag className="w-4 h-4" /> },
                { tab: "coupons" as const, label: "Discount Coupons", icon: <Tag className="w-4 h-4" /> },
                { tab: "reviews" as const, label: "Review Moderation", icon: <MessageSquare className="w-4 h-4" /> },
                { tab: "backup" as const, label: "System Backup", icon: <Database className="w-4 h-4" /> }
              ].map((item: { tab: TabType; label: string; icon: React.ReactNode; onClick?: () => void }) => (
                <li 
                  key={item.tab}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    setActiveTab(item.tab);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer border transition-all ${
                    activeTab === item.tab 
                      ? "bg-primary border-primary text-white" 
                      : "bg-transparent border-transparent text-text-muted hover:bg-bg-light hover:text-primary"
                  }`}
                >
                  {item.icon} {item.label}
                </li>
              ))}
            </ul>
          </aside>

          {/* Active Screen */}
          <main className="flex-grow overflow-y-auto p-8 bg-bg-light">
            
            {/* TAB 1: ANALYTICS & BANNER EDITOR */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                {/* Metric Summaries */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 flex justify-between items-center shadow-sm">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block mb-1">Total Sales Revenue</span>
                      <h2 className="text-xl font-black text-text-main">₹{totalRevenue.toLocaleString("en-IN")}</h2>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 flex justify-between items-center shadow-sm">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block mb-1">Units Sold</span>
                      <h2 className="text-xl font-black text-text-main">{totalSold} units</h2>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><ShoppingBag className="w-5 h-5" /></div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 flex justify-between items-center shadow-sm">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block mb-1">Low Stock Warning</span>
                      <h2 className={`text-xl font-black ${lowStock.length > 0 ? "text-danger" : "text-text-main"}`}>{lowStock.length} items</h2>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lowStock.length > 0 ? "bg-danger/10 text-danger" : "bg-gray-100 text-text-muted"}`}><AlertTriangle className="w-5 h-5" /></div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 flex justify-between items-center shadow-sm">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block mb-1">Total Products</span>
                      <h2 className="text-xl font-black text-text-main">{products.length} items</h2>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center"><Layers className="w-5 h-5" /></div>
                  </div>
                </div>

                {/* Marquee Banner text Editor */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-main mb-3">Marquee Promotion Banner Editor</h3>
                  <p className="text-text-muted text-xs mb-4 leading-relaxed">Modify the scrolling text displayed at the very top of the storefront page in real-time.</p>
                  
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={marqueeText}
                      onChange={(e) => setMarqueeText(e.target.value)}
                      className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-text-main outline-none focus:border-primary flex-grow font-semibold"
                    />
                    <button 
                      onClick={handleSaveMarquee}
                      className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-extrabold tracking-wider px-5 py-2.5 rounded-xl shadow-sm"
                    >
                      Save Text
                    </button>
                  </div>
                </div>

                {/* Setup Seeding Helper */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-text-main mb-1">Database Seeding Helper</h3>
                    <p className="text-text-muted text-xs leading-relaxed">Populate Firestore database with default supplements (Whey Isolate, Creatine, Pre-Workout, Liver-50) and active mock coupons.</p>
                  </div>
                  <button 
                    onClick={handleForceSeed}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" /> Seed Default Database
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: CATALOG MANAGER */}
            {activeTab === "inventory" && (
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-main">Supplement Catalogue</h3>
                  <button 
                    onClick={() => {
                      resetForm();
                      setActiveTab("form");
                    }}
                    className="text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl shadow-sm"
                  >
                    Add Supplement
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-bg-light border-b border-gray-150 font-bold uppercase tracking-wider text-text-muted">
                        <th className="p-4 pl-6">Product Details</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Bundle Deal Offer</th>
                        <th className="p-4 text-right pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-bg-light/40 transition-all">
                          <td className="p-4 pl-6 font-bold text-text-main">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-bg-light rounded-lg border border-gray-150 flex items-center justify-center p-1">
                                <img src={p.image} alt="" className="max-h-full max-w-full object-contain" />
                              </div>
                              <div>
                                <span className="block leading-tight">{p.name}</span>
                                <span className="text-[9px] text-text-muted mt-0.5 font-normal">{p.category} | {p.weight}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-black">₹{p.price.toLocaleString("en-IN")}</td>
                          <td className="p-4 font-semibold text-text-muted">{p.stock} units</td>
                          <td className="p-4 font-medium text-green-700">{p.bundleDeal ? p.bundleDeal.label : "None"}</td>
                          <td className="p-4 text-right pr-6 space-x-1.5">
                            <button onClick={() => handleEditClick(p)} className="p-2 border border-gray-200 hover:border-primary rounded-lg bg-white text-text-muted hover:text-primary transition-all"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleAddStock(p, 5)} className="p-2 border border-gray-200 hover:border-primary rounded-lg bg-white text-text-muted hover:text-primary transition-all" title="Add 5 Stock"><Plus className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 border border-gray-200 hover:border-danger rounded-lg bg-white text-text-muted hover:text-danger transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: ADD/EDIT SUPPLEMENT FORM */}
            {activeTab === "form" && (
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-text-main mb-8">
                  {editProductId ? "Modify Supplement Inventory" : "Create Supplement Entry"}
                </h3>
                
                <form onSubmit={handleProductSubmit} className="space-y-6 max-w-2xl text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-muted uppercase tracking-wider">Supplement Name *</label>
                      <input type="text" required placeholder="e.g. Bajrangi Liver-50" value={formName} onChange={(e) => setFormName(e.target.value)} className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all text-xs" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-muted uppercase tracking-wider">Category *</label>
                      <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as any)} className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all text-xs">
                        <option value="Protein">Protein (Whey)</option>
                        <option value="Pre-Workout">Pre-Workout</option>
                        <option value="Creatine">Creatine</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Vitamins">Vitamins (Liver, Multivitamins)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-muted uppercase tracking-wider">Sale Price (INR) *</label>
                      <input type="number" required placeholder="e.g. 999" value={formPrice || ""} onChange={(e) => setFormPrice(Number(e.target.value))} className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all text-xs" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-muted uppercase tracking-wider">Original Price / MRP (INR) *</label>
                      <input type="number" required placeholder="e.g. 1499" value={formOriginalPrice || ""} onChange={(e) => setFormOriginalPrice(Number(e.target.value))} className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all text-xs" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-muted uppercase tracking-wider">Weight / Size</label>
                      <input type="text" placeholder="e.g. 60 Tablets, 2 kg" value={formWeight} onChange={(e) => setFormWeight(e.target.value)} className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all text-xs" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-muted uppercase tracking-wider">Total Servings</label>
                      <input type="text" placeholder="e.g. 60 Servings" value={formServings} onChange={(e) => setFormServings(e.target.value)} className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all text-xs" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-muted uppercase tracking-wider">Flavor</label>
                      <input type="text" placeholder="e.g. Unflavoured" value={formFlavor} onChange={(e) => setFormFlavor(e.target.value)} className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all text-xs" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-muted uppercase tracking-wider">Stock Available *</label>
                      <input type="number" required placeholder="e.g. 40" value={formStock || ""} onChange={(e) => setFormStock(Number(e.target.value))} className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all text-xs" />
                    </div>
                  </div>

                  {/* Dynamic Bundle Deals selector */}
                  <div className="bg-bg-light/60 border border-gray-200 rounded-2xl p-5 space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold uppercase tracking-wider text-text-muted">
                      <input type="checkbox" checked={formHasBundle} onChange={(e) => setFormHasBundle(e.target.checked)} className="w-4 h-4 accent-primary" />
                      Configure Buy X Get Y Free Bundle Deal
                    </label>
                    
                    {formHasBundle && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-text-muted">Customer Buys Qty *</label>
                          <input type="number" required value={formBuyQty} onChange={(e) => setFormBuyQty(Number(e.target.value))} className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-text-muted">Gets FREE Qty *</label>
                          <input type="number" required value={formFreeQty} onChange={(e) => setFormFreeQty(Number(e.target.value))} className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-text-muted">Bundle Deal Label *</label>
                          <input type="text" required value={formBundleLabel} onChange={(e) => setFormBundleLabel(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Multi-Image 2D uploader */}
                  <div className="bg-bg-light/60 border border-gray-200 rounded-2xl p-5 space-y-4">
                    <label className="font-bold text-text-muted uppercase tracking-wider block">Supplement 2D Image Gallery</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Paste Image URL" 
                        value={inputImageUrl}
                        onChange={(e) => setInputImageUrl(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs flex-grow outline-none"
                      />
                      <button type="button" onClick={handleAddImageUrl} className="bg-text-main text-white px-4 py-2 rounded-xl font-bold">Add URL</button>
                    </div>

                    <div className="border-2 border-dashed border-gray-200 hover:border-primary rounded-xl p-4 text-center cursor-pointer transition-all bg-white flex flex-col items-center gap-1" onClick={() => document.getElementById("gallery-image-file")?.click()}>
                      <Upload className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-text-muted">Select image file to append to gallery</span>
                      <input type="file" id="gallery-image-file" className="hidden" accept="image/*" onChange={handleFormImageUpload} />
                    </div>

                    {/* Preview list */}
                    <div className="flex flex-wrap gap-2.5">
                      {formImages.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl border border-gray-200 p-1 bg-white flex items-center justify-center group">
                          <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                          <button 
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-sm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-text-muted uppercase tracking-wider">Product Description *</label>
                    <textarea required rows={4} placeholder="Product formulas, benefits..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="bg-bg-light border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all text-xs"></textarea>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold uppercase tracking-wider text-text-muted">
                      <input type="checkbox" checked={formRunning} onChange={(e) => setFormRunning(e.target.checked)} className="w-4 h-4 accent-primary" />
                      Top Featured Running Product
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold uppercase tracking-wider text-text-muted">
                      <input type="checkbox" checked={formVeg} onChange={(e) => setFormVeg(e.target.checked)} className="w-4 h-4 accent-primary" />
                      100% Vegetarian Product
                    </label>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-150">
                    <button type="button" onClick={() => setActiveTab("inventory")} className="border border-gray-200 hover:border-gray-300 px-6 py-3 rounded-xl uppercase font-bold tracking-wider text-text-muted bg-white transition-all">Cancel</button>
                    <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl uppercase font-bold tracking-wider shadow-md hover:shadow-lg transition-all">Save Supplement</button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: WHATSAPP CHECKOUT LOGS */}
            {activeTab === "orders" && (
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-main">WhatsApp Checkout logs</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-bg-light border-b border-gray-150 font-bold uppercase tracking-wider text-text-muted">
                        <th className="p-4 pl-6">Order ID</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Items</th>
                        <th className="p-4">Total Price</th>
                        <th className="p-4">Time</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.length === 0 ? (
                        <tr><td colSpan={7} className="text-center p-8 text-text-muted">No checkout order logs.</td></tr>
                      ) : (
                        orders.map(o => (
                          <tr key={o.id} className="hover:bg-bg-light/40 transition-all">
                            <td className="p-4 pl-6 font-mono text-primary">{o.id.substring(0, 8)}</td>
                            <td className="p-4">
                              <span className="font-bold text-text-main block">{o.customerName}</span>
                              <span className="text-[10px] text-text-muted">{o.customerPhone}</span>
                            </td>
                            <td className="p-4 leading-relaxed font-medium">
                              {o.items.map((i, idx) => (
                                <div key={idx}>{i.quantity}x {i.name} {i.isFree && <span className="text-[8px] bg-green-500 text-white px-1 rounded-sm uppercase">Free</span>}</div>
                              ))}
                            </td>
                            <td className="p-4 font-black">₹{o.totalPrice.toLocaleString("en-IN")}</td>
                            <td className="p-4 text-text-muted">{new Date(o.createdAt).toLocaleString("en-IN", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] border ${
                                o.status === "Completed" 
                                  ? "bg-green-500/10 border-green-500/20 text-green-600" 
                                  : o.status === "Cancelled" 
                                  ? "bg-danger/10 border-danger/20 text-danger" 
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              {o.status === "Pending" ? (
                                <div className="inline-flex gap-1">
                                  <button onClick={() => handleUpdateStatus(o.id, "Completed")} className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg font-bold"><Check className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleUpdateStatus(o.id, "Cancelled")} className="bg-white border border-gray-250 text-danger p-1.5 rounded-lg hover:border-danger"><X className="w-3.5 h-3.5" /></button>
                                </div>
                              ) : (
                                <span className="text-text-muted text-[10px]">Locked</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: DISCOUNT COUPONS MANAGER */}
            {activeTab === "coupons" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                {/* Add Coupon Form */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-main mb-6">Create Discount Coupon</h3>
                  <form onSubmit={handleCouponSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-muted uppercase">Coupon Code *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. BAJRANGI20"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="bg-bg-light border border-gray-250 rounded-xl px-4 py-2.5 text-xs text-text-main outline-none focus:border-primary uppercase font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-muted uppercase">Discount Value *</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="e.g. 10 or 500"
                        value={couponDiscount || ""}
                        onChange={(e) => setCouponDiscount(Number(e.target.value))}
                        className="bg-bg-light border border-gray-250 rounded-xl px-4 py-2.5 text-xs text-text-main outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-muted uppercase">Discount Type *</label>
                      <select 
                        value={couponType}
                        onChange={(e) => setCouponType(e.target.value as any)}
                        className="bg-bg-light border border-gray-250 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                      >
                        <option value="percent">Percentage Discount (%)</option>
                        <option value="flat">Flat Price Cut (₹)</option>
                      </select>
                    </div>
                    
                    <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl uppercase font-bold tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5">
                      <Plus className="w-4 h-4" /> Create Coupon
                    </button>
                  </form>
                </div>

                {/* Active Coupons List */}
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="text-xs font-black uppercase tracking-wider text-text-main">Active Coupons list</h3>
                  </div>
                  
                  <div className="overflow-y-auto max-h-[360px]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-bg-light border-b border-gray-150 font-bold uppercase tracking-wider text-text-muted">
                          <th className="p-3 pl-5">Code</th>
                          <th className="p-3">Discount</th>
                          <th className="p-3 text-right pr-5">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {coupons.map(c => (
                          <tr key={c.code} className="hover:bg-bg-light/40 transition-all font-bold">
                            <td className="p-3 pl-5"><span className="text-primary font-mono bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">{c.code}</span></td>
                            <td className="p-3 text-text-main">{c.type === "percent" ? `${c.discount}% OFF` : `₹${c.discount} Flat OFF`}</td>
                            <td className="p-3 text-right pr-5">
                              <button onClick={() => handleDeleteCoupon(c.code)} className="p-1.5 border border-gray-200 hover:border-danger text-text-muted hover:text-danger rounded-lg bg-white transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: REVIEW MODERATION */}
            {activeTab === "reviews" && (
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-main">Customer Review Moderation</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-bg-light border-b border-gray-150 font-bold uppercase tracking-wider text-text-muted">
                        <th className="p-4 pl-6">Product</th>
                        <th className="p-4">Author</th>
                        <th className="p-4">Rating</th>
                        <th className="p-4">Review Text</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right pr-6">Action controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reviews.length === 0 ? (
                        <tr><td colSpan={6} className="text-center p-8 text-text-muted">No customer reviews submitted.</td></tr>
                      ) : (
                        reviews.map(r => (
                          <tr key={r.id} className="hover:bg-bg-light/40 transition-all">
                            <td className="p-4 pl-6 font-bold text-text-main">{r.productName}</td>
                            <td className="p-4 font-semibold text-text-muted">{r.author}</td>
                            <td className="p-4 text-amber-500 font-bold">{"⭐".repeat(r.rating)}</td>
                            <td className="p-4 text-text-muted max-w-xs truncate" title={r.text}>{r.text}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] border ${
                                r.approved 
                                  ? "bg-green-500/10 border-green-500/20 text-green-600" 
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                              }`}>
                                {r.approved ? "Approved" : "Pending Approval"}
                              </span>
                            </td>
                            <td className="p-4 text-right pr-6 space-x-1.5 whitespace-nowrap">
                              {!r.approved && (
                                <button onClick={() => handleApproveReview(r.id)} className="p-1.5 border border-green-200 hover:border-green-500 text-green-600 rounded-lg bg-white transition-all" title="Approve Review"><Check className="w-3.5 h-3.5" /></button>
                              )}
                              <button onClick={() => handleDeleteReview(r.id)} className="p-1.5 border border-gray-200 hover:border-danger text-text-muted hover:text-danger rounded-lg bg-white transition-all" title="Delete Review"><Trash2 className="w-3.5 h-3.5" /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 7: BACKUP MANAGER */}
            {activeTab === "backup" && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-main mb-3">Download Inventory Backup</h3>
                  <p className="text-text-muted text-xs leading-relaxed mb-6 max-w-xl">
                    Export a portable JSON file containing your complete supplements catalog, orders, and coupon lists.
                  </p>
                  <button onClick={handleBackup} className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-extrabold tracking-wider px-6 py-3.5 rounded-xl shadow-md flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download Backup (JSON)
                  </button>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-main mb-3">Restore Database Backup</h3>
                  <p className="text-text-muted text-xs leading-relaxed mb-6 max-w-xl">
                    Overwrite the active database using a previously exported system backup file.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <button onClick={() => document.getElementById("restore-data-file")?.click()} className="bg-white border border-gray-200 hover:border-gray-300 text-text-muted hover:text-text-main text-xs uppercase font-extrabold tracking-wider px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-sm transition-all">
                      <Upload className="w-4 h-4" /> Upload JSON File
                    </button>
                    <input type="file" id="restore-data-file" className="hidden" accept=".json" onChange={handleRestore} />
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      )}
    </div>
  );
}
