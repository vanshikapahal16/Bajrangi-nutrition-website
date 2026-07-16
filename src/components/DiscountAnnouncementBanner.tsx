"use client";

import { useEffect, useState } from "react";

const OFFERS = [
  "🎉 Flat Discounts",
  "🚚 Free Shipping",
  "🎁 Buy 2 Get 1",
  "⚡ Limited Time Offer",
  "✨ Extra 10% Off Above ₹5,000",
  "🛡️ 100% Genuine Products",
];

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  type: "confetti" | "sparkle";
  color: string;
}

export default function DiscountAnnouncementBanner() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ["#D4AF37", "#F5D061", "#FFFFFF", "#C9A227", "#E8C547"];
    const generated: Particle[] = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 5,
      size: 3 + Math.random() * 5,
      type: Math.random() > 0.4 ? "confetti" : "sparkle",
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(generated);
  }, []);

  const marqueeText = OFFERS.join("   •   ");

  return (
    <div
      className="relative w-full overflow-hidden border-y border-[#2a2a2a]"
      style={{ height: "2cm", minHeight: "56px" }}
    >
      {/* Animated luxury black/gold background */}
      <div className="absolute inset-0 discount-banner-bg" />
      <div className="absolute inset-0 discount-banner-shimmer pointer-events-none" />

      {/* Falling particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <span
            key={p.id}
            className={`absolute top-0 ${p.type === "sparkle" ? "discount-sparkle" : "discount-confetti"}`}
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: p.type === "confetti" ? `${p.size * 1.6}px` : `${p.size}px`,
              backgroundColor: p.type === "confetti" ? p.color : "transparent",
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              boxShadow: p.type === "sparkle" ? `0 0 6px ${p.color}` : "none",
            }}
          />
        ))}
      </div>

      {/* Marquee content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="discount-marquee-track whitespace-nowrap">
          <span className="discount-marquee-text">{marqueeText}</span>
          <span className="discount-marquee-text" aria-hidden="true">
            {marqueeText}
          </span>
        </div>
      </div>
    </div>
  );
}
