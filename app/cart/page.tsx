"use client";

import { useCart } from "@/context/cart-context";
import { useState, useEffect } from "react";
import { getStores } from "@/lib/firebase-services";
import { Store } from "@/lib/types";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function CartPage() {
  const { items, updateQuantity, removeItem, cartTotal } = useCart();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStoresData() {
      try {
        const storesData = await getStores();
        setStores(storesData);
      } catch (err) {
        console.error("Failed to load stores for cart:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStoresData();
  }, []);

  const shippingEstimate = items.length > 0 ? 150 : 0;
  const grandTotal = cartTotal + shippingEstimate;

  if (loading) {
    return <div className="min-h-[70vh] bg-surface-blue flex items-center justify-center">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-surface-blue flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-primary-blue-light/30 shadow-sm mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-4xl text-primary-blue font-bold mb-4">Your cart is empty</h1>
        <p className="text-primary-blue-light/70 mb-8 max-w-md">
          Discover unique heritage crafts and support conservation efforts by shopping our marketplace.
        </p>
        <Link 
          href="/foundation-store"
          className="bg-primary-blue text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-primary-blue/90 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          Explore Marketplace <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-blue pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="font-serif text-4xl md:text-5xl text-primary-blue font-bold mb-12">
          Your Cart
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Cart Items */}
          <div className="flex-grow space-y-6">
            {items.map((item, index) => {
              const store = stores.find(s => s.id === item.product.storeId);
              
              return (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-[24px] p-6 flex flex-col md:flex-row gap-6 border border-surface-blue-dark shadow-sm relative group"
                >
                  <Link href={`/store/${store?.slug}/product/${item.product.slug}`} className="w-full md:w-32 aspect-square rounded-xl overflow-hidden shrink-0 border border-surface-blue-dark">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-accent-blue mb-1">
                        Sold by {store?.name}
                      </div>
                      <Link href={`/store/${store?.slug}/product/${item.product.slug}`}>
                        <h3 className="font-serif text-xl text-primary-blue font-bold mb-1 hover:text-accent-blue transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <div className="text-primary-blue font-medium text-lg">
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 md:mt-0">
                      <div className="flex items-center bg-surface-blue rounded-full p-1 border border-surface-blue-dark">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-primary-blue hover:bg-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center font-bold text-sm text-primary-blue">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, Math.min(item.product.inventory, item.quantity + 1))}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-primary-blue hover:bg-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-500/70 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors flex items-center gap-1.5 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white rounded-[32px] p-8 border border-surface-blue-dark shadow-[0_10px_40px_rgba(13,59,102,0.05)] sticky top-32">
              <h2 className="font-serif text-2xl text-primary-blue font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-primary-blue-light/80">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-medium text-primary-blue">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-primary-blue-light/80">
                  <span>Estimated Shipping</span>
                  <span className="font-medium text-primary-blue">₹{shippingEstimate.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-4 border-t border-surface-blue-dark flex justify-between text-xl font-bold text-primary-blue">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link 
                href="/checkout"
                className="w-full bg-primary-blue text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-blue/20 hover:bg-primary-blue/90 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 mb-4"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </Link>

              <div className="text-center text-xs text-primary-blue-light/60 font-medium">
                100% of marketplace fees support Stepwell Renovation Foundation initiatives.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
