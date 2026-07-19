"use client";

import { useState, useMemo, useEffect } from "react";
import { getStores } from "@/lib/firebase-services";
import { Store } from "@/lib/types";
import Link from "next/link";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { StoreCard } from "@/components/store-card";

export default function FoundationStoreLanding() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTag, setTag] = useState<string>("all");

  useEffect(() => {
    async function fetchStores() {
      try {
        const data = await getStores();
        setStores(data.filter(s => s.status === 'ACTIVE'));
      } catch (err) {
        console.error("Failed to fetch stores:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  const locationTags = useMemo(() => {
    const locs = Array.from(new Set(stores.map((s) => s.location)));
    return ["all", ...locs];
  }, [stores]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stores.filter((s) => {
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q);
      const matchTag = activeTag === "all" || s.location === activeTag;
      return matchQ && matchTag;
    });
  }, [query, activeTag, stores]);

  return (
    <div className="min-h-screen bg-[#f0f4f8] pt-[80px] md:pt-[90px]">

      {/* ── Sticky search + filter bar ──────────────────────────────────── */}
      <div className="sticky top-[80px] md:top-[90px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 pt-3 pb-1 flex flex-col sm:flex-row sm:items-center gap-2.5">

          {/* Page title */}
          <div className="shrink-0 leading-none">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#2563eb]">Foundation</p>
            <h1 className="font-serif text-lg font-semibold text-[#0f172a]">Marketplace</h1>
          </div>

          {/* Search field */}
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stores, crafts, locations…"
              className="w-full pl-8 pr-8 py-2 text-sm bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:border-[#2563eb] focus:bg-white transition-all placeholder:text-gray-400 text-gray-800"
            />
            {query && (
              <button
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Count */}
          <span className="shrink-0 text-xs text-gray-400 font-medium hidden sm:block tabular-nums">
            {filtered.length} store{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Location filter pills */}
        <div className="container mx-auto px-4 md:px-8 pb-2.5 pt-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <SlidersHorizontal className="w-3 h-3 text-gray-400 shrink-0" />
          {locationTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTag(tag)}
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all duration-200 ${
                activeTag === tag
                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800"
              }`}
            >
              {tag === "all" ? "All Regions" : tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hero info banner ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 md:px-8 pt-7 pb-5">
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1a2f4a] to-[#1e3a5f] rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
          <div className="flex-grow min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#60a5fa] mb-1">Every purchase matters</p>
            <p className="text-white/90 text-sm leading-snug">
              Supporting <span className="font-semibold text-white">heritage conservation</span> and community impact through curated artisans, sustainable brands, and heritage crafts.
            </p>
          </div>

        </div>
      </section>

      {/* ── Store grid ───────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 md:px-8 pb-16">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-gray-600 font-medium text-sm">No stores match your search.</p>
              <button
                onClick={() => { setQuery(""); setTag("all"); }}
                className="mt-4 text-sm text-[#2563eb] font-semibold hover:underline underline-offset-2"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((store, i) => (
                <StoreCard key={store.id} store={store} index={i} variant="grid" />
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>

    </div>
  );
}
