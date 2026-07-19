"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { Store } from "@/lib/types";

// ── Per-store gradient + initials for image fallback ──────────────────────────
const STORE_COLOURS: Record<string, string> = {
  "mitss-store":            "from-amber-400 to-orange-500",
  "rathi-saree":            "from-rose-400 to-pink-600",
  "blue-pottery-jaipur":    "from-sky-400 to-indigo-600",
  "foundation-merchandise": "from-emerald-400 to-teal-600",
};

const STORE_INITIALS: Record<string, string> = {
  "mitss-store":            "MS",
  "rathi-saree":            "RS",
  "blue-pottery-jaipur":    "BP",
  "foundation-merchandise": "FM",
};

const STATUS_STYLE: Record<Store["status"], { label: string; cls: string }> = {
  ACTIVE:   { label: "Active",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PENDING:  { label: "Pending",  cls: "bg-amber-50   text-amber-700   border-amber-200"   },
  INACTIVE: { label: "Inactive", cls: "bg-red-50     text-red-600     border-red-200"     },
};

// ── Sub-components ────────────────────────────────────────────────────────────
function BannerImage({ store }: { store: Store }) {
  const [failed, setFailed] = useState(false);
  const gradient = STORE_COLOURS[store.slug] ?? "from-slate-400 to-slate-600";

  if (failed) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-white/50 text-3xl font-bold tracking-wider select-none">
          {STORE_INITIALS[store.slug] ?? store.name.slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }
  return (
    <img
      src={store.banner}
      alt={store.name}
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function LogoImage({ store }: { store: Store }) {
  const [failed, setFailed] = useState(false);
  const gradient = STORE_COLOURS[store.slug] ?? "from-slate-400 to-slate-600";
  const initials = STORE_INITIALS[store.slug] ?? store.name.slice(0, 2).toUpperCase();

  if (failed) {
    return (
      <div className={`w-full h-full rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-white text-[10px] font-bold">{initials}</span>
      </div>
    );
  }
  return (
    <img
      src={store.logo}
      alt={store.name}
      className="w-full h-full object-cover rounded-lg"
      onError={() => setFailed(true)}
    />
  );
}

// ── Main StoreCard ────────────────────────────────────────────────────────────
interface StoreCardProps {
  store: Store;
  index?: number;
  /** "grid" = full dedicated marketplace page card; "home" = slightly compact home-page teaser */
  variant?: "grid" | "home";
}

export function StoreCard({ store, index = 0, variant = "grid" }: StoreCardProps) {
  const status = STATUS_STYLE[store.status] ?? STATUS_STYLE.ACTIVE;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Link
        href={`/store/${store.slug}`}
        className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
      >
        {/* ── Banner ─────────────────────────────────────────────────────── */}
        <div className="h-32 relative shrink-0">
          <div className="absolute inset-0 overflow-hidden bg-gray-100">
            <div className="w-full h-full transition-transform duration-700 group-hover:scale-105">
              <BannerImage store={store} />
            </div>
            {/* Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
          </div>

          {/* Rating */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-gray-800 leading-none">{store.rating}</span>
          </div>

          {/* Status */}
          <div className={`absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${status.cls}`}>
            {status.label}
          </div>

          {/* Logo chip */}
          <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-xl bg-white p-1 shadow-md border border-gray-100 z-10">
            <LogoImage store={store} />
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="pt-8 px-4 pb-4 flex flex-col flex-grow">
          <h3 className="font-serif text-[15px] font-semibold text-[#0f172a] leading-snug mb-0.5 group-hover:text-[#2563eb] transition-colors line-clamp-1">
            {store.name}
          </h3>

          <div className="flex items-center gap-1 text-gray-400 text-[11px] font-medium mb-2">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{store.location}</span>
          </div>

          <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 flex-grow mb-3">
            {store.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#2563eb]">
              {variant === "home" ? "Visit Store" : "Browse Store"}
            </span>
            <div className="w-7 h-7 rounded-full bg-[#f0f4f8] flex items-center justify-center text-gray-600 group-hover:bg-[#0f172a] group-hover:text-white transition-all duration-300">
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
