"use client";

import { use, useState, useEffect } from "react";
import { getStoreBySlug, getProductBySlug, getCategories } from "@/lib/firebase-services";
import { Store, Product, Category } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Heart, Share2, Truck, ShieldCheck, ArrowRight, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/cart-context";

export default function ProductPage({ params }: { params: Promise<{ storeSlug: string, productSlug: string }> }) {
  const resolvedParams = use(params);
  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [storeData, productData, categoriesData] = await Promise.all([
          getStoreBySlug(resolvedParams.storeSlug),
          getProductBySlug(resolvedParams.productSlug),
          getCategories()
        ]);
        
        setStore(storeData);
        setProduct(productData);
        
        if (productData) {
          const cat = categoriesData.find(c => c.id === productData.categoryId);
          setCategory(cat || null);
        }
      } catch (err) {
        console.error("Failed to fetch product details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resolvedParams.storeSlug, resolvedParams.productSlug]);

  if (loading) return <div className="min-h-screen bg-surface-blue pt-32 pb-24 text-center">Loading product...</div>;

  if (!store || !product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-surface-blue pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm font-medium text-primary-blue-light/70 mb-10">
          <Link href="/foundation-store" className="hover:text-accent-blue transition-colors">Marketplace</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/store/${store.slug}`} className="hover:text-accent-blue transition-colors">{store.name}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary-blue">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Image Gallery */}
          <div className="lg:sticky lg:top-32 space-y-6 z-10">
            <div className="aspect-[4/5] md:aspect-square w-full rounded-[32px] overflow-hidden border border-surface-blue-dark shadow-sm bg-white relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={product.images[currentImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${currentImage === idx ? 'border-accent-blue' : 'border-transparent hover:border-surface-blue-dark'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="pt-2">
            <div className="mb-8 pb-8 border-b border-surface-blue-dark">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-blue mb-4">
                {category?.name}
              </div>
              <h1 className="font-serif text-4xl md:text-5xl text-primary-blue font-bold leading-tight mb-6">
                {product.name}
              </h1>
              <div className="text-3xl text-primary-blue font-medium mb-6">
                ₹{product.price.toLocaleString('en-IN')}
              </div>
              <p className="text-lg text-primary-blue-light/80 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div className="mb-10">
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center bg-white border border-surface-blue-dark rounded-full shadow-sm p-1">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-primary-blue hover:bg-surface-blue transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-primary-blue">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-primary-blue hover:bg-surface-blue transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm font-medium text-primary-blue-light/70">
                  {product.inventory > 0 ? (
                    <span className="text-green-600">{product.inventory} in stock</span>
                  ) : (
                    <span className="text-red-500">Out of stock</span>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => addItem(product, quantity)}
                  disabled={product.inventory === 0}
                  className="flex-grow bg-primary-blue text-white py-4 px-8 rounded-full font-bold shadow-lg shadow-primary-blue/20 hover:bg-primary-blue/90 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart <ArrowRight className="w-5 h-5" />
                </button>
                <button className="w-14 h-14 shrink-0 rounded-full bg-white border border-surface-blue-dark flex items-center justify-center text-primary-blue shadow-sm hover:text-accent-blue hover:border-accent-blue transition-all">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="w-14 h-14 shrink-0 rounded-full bg-white border border-surface-blue-dark flex items-center justify-center text-primary-blue shadow-sm hover:text-accent-blue hover:border-accent-blue transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-surface-blue-dark shadow-sm space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-blue flex items-center justify-center shrink-0 text-accent-blue">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-primary-blue mb-1">Authenticity Guaranteed</h4>
                  <p className="text-sm text-primary-blue-light/70 leading-relaxed">Directly sourced from the artisans of {store.name}. Every purchase preserves traditional crafts.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-blue flex items-center justify-center shrink-0 text-accent-blue">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-primary-blue mb-1">Secure & Tracked Shipping</h4>
                  <p className="text-sm text-primary-blue-light/70 leading-relaxed">Orders are carefully packed and dispatched within 3-5 business days directly from {store.location}.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
