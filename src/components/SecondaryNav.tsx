"use client";

interface SecondaryNavProps {
  activeCategory?: string;
  onCategoryClick?: (category: string) => void;
}

const CATEGORIES = [
  { label: "Best Sellers", slug: "all" },
  { label: "Whey Protein", slug: "Protein" },
  { label: "Mass Gainers", slug: "Mass Gainer" },
  { label: "Creatine", slug: "Creatine" },
  { label: "Pre Workout", slug: "Pre-Workout" },
  { label: "Accessories", slug: "Accessories" },
];

export default function SecondaryNav({
  activeCategory = "all",
  onCategoryClick,
}: SecondaryNavProps) {
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10">
        <ul className="flex items-center justify-center gap-6 sm:gap-10 lg:gap-14 py-4 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <li key={cat.slug} className="shrink-0">
                <a
                  href="#catalog-section"
                  onClick={() => onCategoryClick?.(cat.slug)}
                  className={`nav-link text-[12px] sm:text-[13px] font-medium tracking-wide whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  {cat.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
