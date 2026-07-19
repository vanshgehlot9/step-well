"use client";

import { use, useState, useEffect, useMemo } from "react";
import { getStoreBySlug, getProductsByStore, getCategories } from "@/lib/firebase-services";
import { Store, Product, Category } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, Package, ShoppingCart, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/cart-context";

// ── per-store colour fallbacks (matches store-card.tsx) ─────────────────────
const STORE_COLOURS: Record<string, string> = {
  "mitss-store":             "from-amber-400 to-orange-500",
  "rathi-saree":             "from-rose-400 to-pink-600",
  "blue-pottery-jaipur":     "from-sky-400 to-indigo-600",
  "foundation-merchandise":  "from-emerald-400 to-teal-600",
};

// ── image with gradient fallback ─────────────────────────────────────────────
function ImgWithFallback({
  src, alt, className, fallbackGradient, fallbackText,
}: {
  src: string; alt: string; className?: string;
  fallbackGradient: string; fallbackText?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center ${className ?? ""}`}>
        {fallbackText && (
          <span className="text-white/40 text-2xl font-bold tracking-wider select-none">{fallbackText}</span>
        )}
      </div>
    );
  }
  return (
    <img src={src} alt={alt} className={`w-full h-full object-cover ${className ?? ""}`} onError={() => setFailed(true)} />
  );
}

// ── main page ────────────────────────────────────────────────────────────────
export default function StorePage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const resolvedParams = use(params);
  const [store, setStore] = useState<Store | null>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCart();
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const storeData = await getStoreBySlug(resolvedParams.storeSlug);
        if (storeData && storeData.status === 'ACTIVE') {
          setStore(storeData);
          const [productsData, categoriesData] = await Promise.all([
            getProductsByStore(storeData.id),
            getCategories()
          ]);
          setStoreProducts(productsData);
          setAllCategories(categoriesData);
        }
      } catch (err) {
        console.error("Failed to load store:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resolvedParams.storeSlug]);

  // Only show categories that have products in THIS store
  const availableCategories = useMemo(() => {
    const ids = new Set(storeProducts.map((p) => p.categoryId));
    return allCategories.filter((c) => ids.has(c.id));
  }, [storeProducts, allCategories]);

  const visibleProducts = useMemo(() => {
    if (activeCategoryId === "all") return storeProducts;
    return storeProducts.filter((p) => p.categoryId === activeCategoryId);
  }, [storeProducts, activeCategoryId]);

  if (loading) return <div className="min-h-screen bg-[#f0f4f8] pt-32 text-center">Loading store...</div>;
  if (!store) return <div className="min-h-screen bg-[#f0f4f8] pt-32 text-center">Store not found</div>;

  const gradient = STORE_COLOURS[store.slug] ?? "from-slate-500 to-slate-700";

  function handleAddToCart(product: typeof storeProducts[0]) {
    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">

      {/* ── Compact Hero ─────────────────────────────────────────────────── */}
      <div className="relative h-52 md:h-64 w-full overflow-hidden">
        {/* Banner */}
        <ImgWithFallback
          src={store.banner}
          alt={store.name}
          className="transition-transform duration-700 hover:scale-105"
          fallbackGradient={gradient}
        />
        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

        {/* Breadcrumb */}
        <div className="absolute top-4 left-4 md:left-8 flex items-center gap-1.5 text-white/60 text-xs font-medium">
          <Link href="/foundation-store" className="hover:text-white transition-colors">Marketplace</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/90">{store.name}</span>
        </div>

        {/* Store identity row */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-5 flex items-end gap-4">
          {/* Logo */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white p-1 shadow-xl border-2 border-white shrink-0">
            <ImgWithFallback
              src={store.logo}
              alt={store.name}
              className="rounded-xl"
              fallbackGradient={gradient}
              fallbackText={store.name.slice(0, 2).toUpperCase()}
            />
          </div>

          {/* Info */}
          <div className="flex-grow min-w-0 pb-0.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-white leading-tight">
                {store.name}
              </h1>
              {/* Rating */}
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-white text-sm font-bold">{store.rating}</span>
              </div>
            </div>
            <p className="text-white/75 text-sm mt-1 line-clamp-1 hidden sm:block">{store.description}</p>
            <div className="flex items-center gap-4 mt-1.5 text-white/60 text-xs font-medium">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{store.location}</span>
              <span className="flex items-center gap-1"><Package className="w-3 h-3" />{storeProducts.length} Products</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-8 pt-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar filters ─────────────────────────────────────────── */}
          <aside className="w-full lg:w-52 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-[76px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Categories</p>
              <ul className="space-y-1">
                {/* All Products */}
                <li>
                  <button
                    onClick={() => setActiveCategoryId("all")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      activeCategoryId === "all"
                        ? "bg-[#0f172a] text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    All Products
                    <span className={`ml-1.5 text-[10px] font-bold ${activeCategoryId === "all" ? "text-white/60" : "text-gray-400"}`}>
                      {storeProducts.length}
                    </span>
                  </button>
                </li>
                {availableCategories.map((cat) => {
                  const count = storeProducts.filter((p) => p.categoryId === cat.id).length;
                  return (
                    <li key={cat.id}>
                      <button
                        onClick={() => setActiveCategoryId(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                          activeCategoryId === cat.id
                            ? "bg-[#0f172a] text-white"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        }`}
                      >
                        {cat.name}
                        <span className={`ml-1.5 text-[10px] font-bold ${activeCategoryId === cat.id ? "text-white/60" : "text-gray-400"}`}>
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* ── Product grid ────────────────────────────────────────────── */}
          <div className="flex-grow min-w-0">
            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl font-semibold text-[#0f172a]">
                {activeCategoryId === "all"
                  ? "All Products"
                  : availableCategories.find((c) => c.id === activeCategoryId)?.name ?? "Products"}
              </h2>
              <span className="text-xs text-gray-400 font-medium tabular-nums">
                {visibleProducts.length} result{visibleProducts.length !== 1 ? "s" : ""}
              </span>
            </div>

            <AnimatePresence mode="popLayout">
              {visibleProducts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-20 bg-white rounded-2xl border border-gray-100"
                >
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No products in this category.</p>
                  <button
                    onClick={() => setActiveCategoryId("all")}
                    className="mt-3 text-sm text-[#2563eb] font-semibold hover:underline underline-offset-2"
                  >
                    Show all products
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visibleProducts.map((product, index) => {
                    const categoryName = allCategories.find((c) => c.id === product.categoryId)?.name;
                    const isAdded = addedId === product.id;

                    return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                      >
                        {/* Product image */}
                        <Link href={`/store/${store.slug}/product/${product.slug}`} className="block relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
                          <ImgWithFallback
                            src={product.images[0]}
                            alt={product.name}
                            className="transition-transform duration-500 group-hover:scale-105"
                            fallbackGradient={gradient}
                            fallbackText={product.name.slice(0, 2).toUpperCase()}
                          />
                          {/* Featured badge */}
                          {product.featured && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#0f172a]/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-white">Featured</span>
                            </div>
                          )}
                          {/* Out of stock overlay */}
                          {product.inventory === 0 && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </Link>

                        {/* Card body */}
                        <div className="p-3 flex flex-col flex-grow">
                          {/* Category */}
                          {categoryName && (
                            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#2563eb] mb-1">{categoryName}</p>
                          )}

                          {/* Name */}
                          <Link href={`/store/${store.slug}/product/${product.slug}`}>
                            <h3 className="text-[13px] font-semibold text-[#0f172a] leading-snug group-hover:text-[#2563eb] transition-colors line-clamp-2 mb-2">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Price */}
                          <p className="text-base font-bold text-[#0f172a] mb-3 mt-auto">
                            ₹{product.price.toLocaleString("en-IN")}
                          </p>

                          {/* Add to Cart */}
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.inventory === 0}
                            className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 ${
                              isAdded
                                ? "bg-emerald-500 text-white"
                                : product.inventory === 0
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-[#f0f4f8] text-[#0f172a] hover:bg-[#0f172a] hover:text-white"
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            {isAdded ? "Added!" : product.inventory === 0 ? "Out of Stock" : "Add to Cart"}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
