"use client";

import { useCart } from "@/context/cart-context";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { addOrder } from "@/lib/firebase-services";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      router.push("/foundation-store");
    }
  }, [items, router, isProcessing]);

  const shippingEstimate = items.length > 0 ? 150 : 0;
  const grandTotal = cartTotal + shippingEstimate;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Create the order payload
      const orderData = {
        customerInfo: formData,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal: cartTotal,
        shippingEstimate,
        total: grandTotal,
        status: 'PENDING' as const,
        paymentStatus: 'COMPLETED' as const, // Simulating a completed payment 
      };

      await addOrder(orderData);
      
      // Clear cart and redirect
      clearCart();
      router.push("/order-success");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to process order. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (items.length === 0 && !isProcessing) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-blue pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-5xl">
        <h1 className="font-serif text-4xl text-primary-blue font-bold mb-10">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Checkout Form */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 border border-surface-blue-dark shadow-sm">
            <form onSubmit={handleCheckout} className="space-y-8">
              
              {/* Contact Info */}
              <div>
                <h2 className="text-xl font-bold text-primary-blue mb-4 font-serif">Contact Information</h2>
                <div className="space-y-4">
                  <input required name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Email Address *" className="w-full px-4 py-3 rounded-xl border border-surface-blue-dark bg-surface-blue/30 focus:bg-white focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all" />
                  <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="Phone Number *" className="w-full px-4 py-3 rounded-xl border border-surface-blue-dark bg-surface-blue/30 focus:bg-white focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all" />
                </div>
              </div>

              {/* Shipping Info */}
              <div>
                <h2 className="text-xl font-bold text-primary-blue mb-4 font-serif">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="First Name *" className="w-full px-4 py-3 rounded-xl border border-surface-blue-dark bg-surface-blue/30 focus:bg-white focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all" />
                    <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="Last Name *" className="w-full px-4 py-3 rounded-xl border border-surface-blue-dark bg-surface-blue/30 focus:bg-white focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all" />
                  </div>
                  <input required name="address" value={formData.address} onChange={handleInputChange} type="text" placeholder="Address Line 1 *" className="w-full px-4 py-3 rounded-xl border border-surface-blue-dark bg-surface-blue/30 focus:bg-white focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all" />
                  <input name="apartment" value={formData.apartment} onChange={handleInputChange} type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full px-4 py-3 rounded-xl border border-surface-blue-dark bg-surface-blue/30 focus:bg-white focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <input required name="city" value={formData.city} onChange={handleInputChange} type="text" placeholder="City *" className="w-full px-4 py-3 rounded-xl border border-surface-blue-dark bg-surface-blue/30 focus:bg-white focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all md:col-span-1" />
                    <input required name="state" value={formData.state} onChange={handleInputChange} type="text" placeholder="State *" className="w-full px-4 py-3 rounded-xl border border-surface-blue-dark bg-surface-blue/30 focus:bg-white focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all md:col-span-1" />
                    <input required name="pincode" value={formData.pincode} onChange={handleInputChange} type="text" placeholder="PIN Code *" className="w-full px-4 py-3 rounded-xl border border-surface-blue-dark bg-surface-blue/30 focus:bg-white focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none transition-all col-span-2 md:col-span-1" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-sm font-bold text-primary-blue mb-1">Payment Method</h3>
                <div className="bg-surface-blue p-4 rounded-xl border border-accent-blue/30 flex items-start gap-3">
                  <CreditCard className="w-6 h-6 text-accent-blue shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-primary-blue text-sm mb-1">Secure Card / UPI Payment</div>
                    <div className="text-xs text-primary-blue-light/70 leading-relaxed">
                      All transactions are secured and encrypted.
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-primary-blue text-white py-4 rounded-xl font-bold shadow-lg hover:bg-primary-blue/90 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait disabled:transform-none"
              >
                {isProcessing ? "Processing Secure Payment..." : `Pay ₹${grandTotal.toLocaleString('en-IN')}`}
              </button>
            </form>
          </div>

          {/* Order Summary Sticky Sidebar */}
          <div className="lg:pl-8">
            <div className="sticky top-32">
              <h2 className="text-2xl font-bold text-primary-blue mb-6 font-serif">In Your Bag</h2>
              
              <div className="space-y-4 mb-8">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-surface-blue-dark shrink-0 relative">
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                      <div className="absolute -top-2 -right-2 bg-primary-blue text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="font-serif text-primary-blue font-bold text-sm line-clamp-1">{item.product.name}</div>
                      <div className="text-primary-blue-light/70 text-xs">₹{item.product.price.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="font-bold text-primary-blue text-sm">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-surface-blue-dark pt-6 space-y-3 mb-6">
                <div className="flex justify-between text-sm text-primary-blue-light/80">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-primary-blue-light/80">
                  <span>Shipping</span>
                  <span>₹{shippingEstimate.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="border-t border-surface-blue-dark pt-6 flex justify-between font-bold text-xl text-primary-blue mb-6">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 flex items-start gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <strong>Conservation Contribution Included</strong><br />
                  A portion of this sale goes directly towards the restoration of stepwells in Rajasthan.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
