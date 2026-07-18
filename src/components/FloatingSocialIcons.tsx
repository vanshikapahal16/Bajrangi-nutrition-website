"use client";

import { motion } from "framer-motion";
import { Phone, MapPin, MessageCircle } from "lucide-react";

export default function FloatingSocialIcons() {
  const phoneNumber = "91996067101";
  const instagramHandle = "bajrangi_nutrition_kurukshetra";
  const address = "Divine City Centre, Opposite to New Bus Stand, Kurukshetra, Haryana - 136119";

  const socialLinks = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />,
      href: `https://wa.me/${phoneNumber}`,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600"
    },
    {
      name: "Call",
      icon: <Phone className="w-5 h-5" />,
      href: `tel:+91${phoneNumber}`,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      name: "Instagram",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      href: `https://www.instagram.com/${instagramHandle}/`,
      color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
      hoverColor: "hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
    },
    {
      name: "Location",
      icon: <MapPin className="w-5 h-5" />,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      color: "bg-red-500",
      hoverColor: "hover:bg-red-600"
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {socialLinks.map((social, index) => (
        <motion.a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${social.color} ${social.hoverColor} text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl`}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={social.name}
        >
          {social.icon}
        </motion.a>
      ))}
    </div>
  );
}
