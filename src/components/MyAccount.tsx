"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, ShoppingBag, MapPin, Settings, LogOut, Phone, Mail, Clock, Package, Truck, CheckCircle, XCircle, Plus, Edit2, Trash2 } from "lucide-react";
import { customerAuthService, dataService, Order, Customer, SavedAddress } from "../lib/services";

type AccountTab = "profile" | "orders" | "addresses" | "settings";

interface MyAccountProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: "primary" | "success" | "warning" | "danger") => void;
}

export default function MyAccount({ isOpen, onClose, showToast }: MyAccountProps) {
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [newAddress, setNewAddress] = useState({
    label: "",
    fullName: "",
    phone: "",
    addressLine: "",
    isDefault: false
  });

  useEffect(() => {
    if (isOpen) {
      // Initialize auth state listener
      customerAuthService.initializeAuthState((user) => {
        setCurrentUser(user);
        if (user) {
          loadUserData();
        } else {
          setLoading(false);
        }
      });
      
      // Initial load
      loadUserData();
    }
    
    return () => {
      // Clean up auth listener when drawer closes
      customerAuthService.cleanupAuthState();
    };
  }, [isOpen]);

  const loadUserData = async () => {
    const user = customerAuthService.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      setLoading(true);
      
      try {
        // Load full customer profile from database
        const customer = await dataService.getCustomerData(user.uid);
        if (customer) {
          setCustomerData(customer);
        } else {
          // Fallback to auth data if no customer record exists
          setCustomerData({
            id: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split("@")[0],
            photoURL: user.photoURL,
            phone: user.phoneNumber,
            addresses: [],
            createdAt: new Date()
          });
        }

        // Load customer orders in background
        const unsubOrders = dataService.subscribeOrders((allOrders) => {
          const customerOrders = allOrders.filter(o => o.customerId === user.uid);
          setOrders(customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        });

        return () => {
          unsubOrders();
        };
      } catch (error) {
        console.error("Error loading customer data:", error);
        // Fallback to auth data on error
        setCustomerData({
          id: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split("@")[0],
          photoURL: user.photoURL,
          phone: user.phoneNumber,
          addresses: [],
          createdAt: new Date()
        });
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await customerAuthService.logout(
      () => {
        showToast("Logged out successfully", "success");
        onClose();
      },
      (error) => {
        showToast(error, "danger");
      }
    );
  };

  const handleSaveAddress = async () => {
    if (!currentUser) return;

    const address: SavedAddress = {
      id: editingAddress?.id || `addr-${Date.now()}`,
      label: newAddress.label,
      fullName: newAddress.fullName,
      phone: newAddress.phone,
      addressLine: newAddress.addressLine,
      isDefault: newAddress.isDefault
    };

    try {
      await dataService.saveCustomerAddress(currentUser.uid, address);
      showToast("Address saved successfully", "success");
      setShowAddressForm(false);
      setEditingAddress(null);
      setNewAddress({ label: "", fullName: "", phone: "", addressLine: "", isDefault: false });
      loadUserData();
    } catch (error: any) {
      showToast(error.message || "Failed to save address", "danger");
    }
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setNewAddress({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine: address.addressLine,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!currentUser) return;

    try {
      await dataService.deleteCustomerAddress(currentUser.uid, addressId);
      showToast("Address deleted successfully", "success");
      loadUserData();
    } catch (error: any) {
      showToast(error.message || "Failed to delete address", "danger");
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Processing":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "Shipped":
        return <Truck className="w-4 h-4 text-purple-500" />;
      case "Delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Processing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Shipped":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "Delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "Cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        key="drawer"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 left-0 z-[100] w-full sm:w-[480px] h-screen bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary to-primary-dark">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">{currentUser?.displayName || "Guest User"}</h3>
                <p className="text-xs text-white/80">{currentUser?.email || ""}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50">
          {[
            { id: "profile" as AccountTab, label: "Profile", icon: User },
            { id: "orders" as AccountTab, label: "Orders", icon: ShoppingBag },
            { id: "addresses" as AccountTab, label: "Addresses", icon: MapPin },
            { id: "settings" as AccountTab, label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text-main"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-text-muted">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-extrabold text-text-main uppercase tracking-wider">Personal Information</h4>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-[10px] text-text-muted uppercase">Email</p>
                        <p className="text-sm font-medium text-text-main">{currentUser?.email || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-[10px] text-text-muted uppercase">Phone</p>
                        <p className="text-sm font-medium text-text-main">{currentUser?.phoneNumber || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-extrabold text-text-main uppercase tracking-wider mb-3">Account Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-extrabold text-primary">{orders.length}</p>
                        <p className="text-[10px] text-text-muted uppercase">Total Orders</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-extrabold text-green-600">
                          {orders.filter(o => o.status === "Delivered").length}
                        </p>
                        <p className="text-[10px] text-text-muted uppercase">Completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-text-muted">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">No orders yet</p>
                      <p className="text-xs">Start shopping to see your orders here</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-text-muted uppercase">Order #{order.id.slice(-8)}</p>
                            <p className="text-[10px] text-text-muted">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-text-muted">{item.name} x{item.quantity}</span>
                              <span className="font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-[10px] text-text-muted">+{order.items.length - 2} more items</p>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="text-xs font-bold text-text-main">Total</span>
                          <span className="text-sm font-extrabold text-primary">₹{order.totalPrice.toLocaleString("en-IN")}</span>
                        </div>

                        {order.deliveryStatus && (
                          <div className="flex items-center gap-2 text-[10px] text-text-muted">
                            <Truck className="w-3 h-3" />
                            <span>{order.deliveryStatus}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setNewAddress({ label: "", fullName: "", phone: "", addressLine: "", isDefault: false });
                      setShowAddressForm(true);
                    }}
                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>

                  {showAddressForm && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-extrabold text-text-main uppercase">
                          {editingAddress ? "Edit Address" : "Add New Address"}
                        </h4>
                        <button
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                          }}
                          className="text-text-muted hover:text-text-main"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Address Label (e.g., Home, Office)"
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <textarea
                          placeholder="Full Address"
                          value={newAddress.addressLine}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                          rows={3}
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newAddress.isDefault}
                            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                            className="w-4 h-4 accent-primary"
                          />
                          <span className="text-xs text-text-muted">Set as default address</span>
                        </label>
                        <button
                          onClick={handleSaveAddress}
                          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 rounded-lg transition-all"
                        >
                          {editingAddress ? "Update Address" : "Save Address"}
                        </button>
                      </div>
                    </div>
                  )}

                  {customerData?.addresses && customerData.addresses.length > 0 ? (
                    customerData.addresses.map((address) => (
                      <div key={address.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-text-main uppercase">{address.label}</span>
                          <div className="flex items-center gap-2">
                            {address.isDefault && (
                              <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">Default</span>
                            )}
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-text-muted hover:text-primary"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-text-muted hover:text-danger"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-text-main">{address.fullName}</p>
                        <p className="text-sm text-text-muted">{address.phone}</p>
                        <p className="text-xs text-text-muted mt-1">{address.addressLine}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-text-muted">
                      <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">No saved addresses</p>
                      <p className="text-xs">Add addresses for faster checkout</p>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-extrabold text-text-main uppercase tracking-wider">Preferences</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-main">Email notifications</span>
                      <button className="w-10 h-6 bg-primary rounded-full relative">
                        <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-main">SMS notifications</span>
                      <button className="w-10 h-6 bg-gray-300 rounded-full relative">
                        <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
