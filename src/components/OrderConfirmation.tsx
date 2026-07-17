"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ShoppingBag, Phone, MapPin, Clock, X } from "lucide-react";

interface OrderConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
}

export default function OrderConfirmation({
  isOpen,
  onClose,
  customerName,
  customerPhone,
  customerAddress,
  totalAmount
}: OrderConfirmationProps) {
  const orderDateTime = new Date().toLocaleString('en-IN', { 
    dateStyle: 'medium', 
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
          />

          {/* Full-screen Confirmation */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Success Animation */}
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 300 }}
                  className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg"
                >
                  <CheckCircle className="w-16 h-16 text-white" />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <h2 className="text-3xl font-extrabold text-green-700">🎉 Congratulations!</h2>
                  <p className="text-xl font-bold text-gray-800">Order Placed Successfully</p>
                </motion.div>

                {/* Order Details */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 space-y-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Order Total</p>
                      <p className="text-2xl font-extrabold text-gray-900">₹{totalAmount.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="h-px bg-green-200"></div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Contact</p>
                        <p className="text-sm font-bold text-gray-800">{customerName}</p>
                        <p className="text-sm text-gray-700">{customerPhone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Delivery Location</p>
                        <p className="text-sm text-gray-700">{customerAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Order Time</p>
                        <p className="text-sm text-gray-700">{orderDateTime}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <p className="text-sm font-semibold text-gray-700">
                    📞 We will call you soon for delivery confirmation
                  </p>
                  <p className="text-xs text-gray-500">
                    Thank you for shopping with Bajrangi Nutrition Kurukshetra
                  </p>
                </motion.div>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm uppercase tracking-wider"
                >
                  Continue Shopping
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
