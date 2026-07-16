"use client";

export default function HeroSection() {
  const scrollToProducts = () => {
    document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full bg-[#F9F6F1] overflow-hidden">
      <div className="relative w-full max-w-[1920px] mx-auto">
        <img
          src="/assets/hero-backdrop.png"
          alt="Bajrangi Nutrition — Fuel Your Strength. Premium supplements for performance and recovery."
          className="w-full h-auto block select-none pointer-events-none"
          draggable={false}
        />

        <div className="flex justify-center px-6 pb-10 -mt-2 sm:-mt-4">
          <button
            onClick={scrollToProducts}
            className="btn-explore group inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-sm uppercase tracking-[0.18em] transition-all duration-300"
          >
            Explore Products
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
