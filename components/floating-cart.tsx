"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function FloatingCart() {
  const { cartCount } = useCart();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/store-owner")) return null;

  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Link
            href="/cart"
            className="flex items-center justify-center w-16 h-16 rounded-full bg-accent-blue text-white shadow-[0_10px_40px_rgba(184,132,69,0.3)] hover:bg-accent-blue/90 hover:-translate-y-1 transition-all duration-300 relative group"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-6 h-6" />
            <motion.div
              key={cartCount}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-primary-blue text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
            >
              {cartCount}
            </motion.div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
