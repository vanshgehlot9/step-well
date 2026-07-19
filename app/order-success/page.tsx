"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-surface-blue flex flex-col items-center justify-center p-6 pt-32 pb-24 text-center">
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 mx-auto"
      >
        <CheckCircle2 className="w-12 h-12" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-xl mx-auto"
      >
        <h1 className="font-serif text-4xl md:text-5xl text-primary-blue font-bold mb-4">Order Confirmed!</h1>
        <p className="text-lg text-primary-blue-light/70 mb-8">
          Thank you for supporting heritage conservation. Your order has been placed successfully and the artisans have been notified.
        </p>

        <div className="bg-white rounded-2xl p-6 border border-surface-blue-dark shadow-sm mb-8 text-left">
          <div className="flex items-center gap-3 font-bold text-primary-blue border-b border-surface-blue-dark pb-4 mb-4">
            <Package className="w-5 h-5 text-accent-blue" />
            Order Details
          </div>
          <div className="space-y-2 text-sm text-primary-blue-light/80">
            <div className="flex justify-between">
              <span>Order Number:</span>
              <span className="font-medium text-primary-blue">#SRF-{Math.floor(Math.random() * 100000)}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium text-accent-blue">Processing</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery:</span>
              <span className="font-medium text-primary-blue">5-7 Business Days</span>
            </div>
          </div>
        </div>

        <Link 
          href="/foundation-store"
          className="inline-flex bg-primary-blue text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-primary-blue/90 hover:-translate-y-1 transition-all items-center gap-2"
        >
          Continue Shopping <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  );
}
