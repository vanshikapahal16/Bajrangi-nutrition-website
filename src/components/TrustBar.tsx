import { Truck, ShieldCheck, Users, Tag } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Truck, label: "Free Delivery" },
  { icon: ShieldCheck, label: "100% Genuine Products" },
  { icon: Users, label: "Trusted by Thousands" },
  { icon: Tag, label: "Exclusive Offers" },
];

export default function TrustBar() {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 py-3.5">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-center gap-2 text-[11px] sm:text-[12px] font-medium text-text-muted"
            >
              <item.icon className="w-4 h-4 text-primary shrink-0" strokeWidth={2.5} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
