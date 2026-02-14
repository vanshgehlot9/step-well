"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ArrowLeft, ShoppingBag, MapPin } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export default function CartPage() {
    const { items, removeItem, cartTotal, clearCart } = useCart();
    const { user, signInWithGoogle } = useAuth();
    const router = useRouter();
    const [processing, setProcessing] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [address, setAddress] = useState({
        name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
    });

    const handleCheckout = async () => {
        if (!user) {
            try {
                await signInWithGoogle();
            } catch {
                alert("Please sign in to checkout.");
                return;
            }
        }
        setShowAddressForm(true);
    };

    const handlePlaceOrder = async () => {
        if (!address.name || !address.address || !address.city || !address.pincode || !address.phone) {
            alert("Please fill all required fields.");
            return;
        }

        setProcessing(true);
        try {
            const createShopOrder = httpsCallable(functions, "createShopOrder");
            const result = await createShopOrder({
                items: items.map((item) => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    image: item.image,
                })),
                shippingAddress: address,
            });

            const orderData = result.data as {
                orderId: string;
                orderRef: string;
                totalAmount: number;
                paymentDetails: {
                    upiId: string;
                    bankDetails: {
                        accountName: string;
                        accountNumber: string;
                        ifscCode: string;
                        bankName: string;
                    };
                };
            };

            // Store order info for success page
            sessionStorage.setItem(
                "lastOrder",
                JSON.stringify({
                    orderRef: orderData.orderRef,
                    totalAmount: orderData.totalAmount,
                    paymentDetails: orderData.paymentDetails,
                })
            );

            clearCart();
            router.push("/checkout/success");
        } catch (error: any) {
            console.error("Order error:", error);
            alert(error.message || "Failed to place order. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (items.length === 0 && !processing) {
        return (
            <div className="bg-surface-blue min-h-screen pt-32 pb-16 flex flex-col items-center justify-center text-center px-4 relative">

                <ShoppingBag size={64} strokeWidth={1} className="text-primary-blue/20 mb-6" />
                <h1 className="font-serif text-3xl md:text-4xl text-primary-blue mb-4">
                    Your Cart is Empty
                </h1>
                <p className="text-lg text-primary-blue-light/60 mb-8">
                    Looks like you haven't added any items yet.
                </p>
                <Link href="/shop">
                    <Button
                        size="lg"
                        className="bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl"
                    >
                        Explore the Store
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-surface-blue min-h-screen pt-24 pb-16 relative">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
                <div className="flex items-center gap-2 mb-8">
                    <Link
                        href="/shop"
                        className="text-accent-blue hover:underline flex items-center text-sm"
                    >
                        <ArrowLeft size={16} className="mr-1" /> Continue Shopping
                    </Link>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-blue mb-8">
                    Your Cart
                </h1>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Cart Items */}
                    <div className="md:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm items-center border border-surface-blue-dark"
                            >
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-surface-blue-dark">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col">
                                    <div>
                                        <div className="flex justify-between text-base font-medium text-primary-blue">
                                            <h3 className="font-serif">{item.name}</h3>
                                            <p className="ml-4 font-bold">
                                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                        <p className="mt-1 text-sm text-primary-blue-light/60">
                                            ₹{item.price.toLocaleString("en-IN")} each
                                        </p>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm mt-2">
                                        <p className="text-primary-blue-light/60">
                                            Qty {item.quantity}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="font-medium text-red-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary + Address */}
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-blue-dark">
                            <h2 className="text-lg font-bold text-primary-blue mb-4 font-serif">
                                Order Summary
                            </h2>
                            <div className="space-y-2 mb-4 text-sm text-primary-blue/80">
                                <div className="flex justify-between">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-accent-blue font-medium">Free</span>
                                </div>
                            </div>
                            <div className="border-t border-surface-blue-dark pt-4 flex justify-between font-bold text-lg text-primary-blue mb-6">
                                <span>Total</span>
                                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                            </div>

                            {!showAddressForm ? (
                                <Button
                                    className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl py-6"
                                    size="lg"
                                    onClick={handleCheckout}
                                >
                                    Proceed to Checkout
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-primary-blue flex items-center gap-1.5 mb-2">
                                        <MapPin size={14} /> Shipping Address
                                    </h3>
                                    <input
                                        placeholder="Full Name *"
                                        value={address.name}
                                        onChange={(e) =>
                                            setAddress({ ...address, name: e.target.value })
                                        }
                                        className="w-full px-3 py-2.5 rounded-lg border border-surface-blue-dark text-primary-blue text-sm outline-none focus:border-accent-blue"
                                    />
                                    <input
                                        placeholder="Street Address *"
                                        value={address.address}
                                        onChange={(e) =>
                                            setAddress({ ...address, address: e.target.value })
                                        }
                                        className="w-full px-3 py-2.5 rounded-lg border border-surface-blue-dark text-primary-blue text-sm outline-none focus:border-accent-blue"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            placeholder="City *"
                                            value={address.city}
                                            onChange={(e) =>
                                                setAddress({ ...address, city: e.target.value })
                                            }
                                            className="w-full px-3 py-2.5 rounded-lg border border-surface-blue-dark text-primary-blue text-sm outline-none focus:border-accent-blue"
                                        />
                                        <input
                                            placeholder="State"
                                            value={address.state}
                                            onChange={(e) =>
                                                setAddress({ ...address, state: e.target.value })
                                            }
                                            className="w-full px-3 py-2.5 rounded-lg border border-surface-blue-dark text-primary-blue text-sm outline-none focus:border-accent-blue"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            placeholder="Pincode *"
                                            value={address.pincode}
                                            onChange={(e) =>
                                                setAddress({ ...address, pincode: e.target.value })
                                            }
                                            className="w-full px-3 py-2.5 rounded-lg border border-surface-blue-dark text-primary-blue text-sm outline-none focus:border-accent-blue"
                                        />
                                        <input
                                            placeholder="Phone *"
                                            value={address.phone}
                                            onChange={(e) =>
                                                setAddress({ ...address, phone: e.target.value })
                                            }
                                            className="w-full px-3 py-2.5 rounded-lg border border-surface-blue-dark text-primary-blue text-sm outline-none focus:border-accent-blue"
                                        />
                                    </div>
                                    <Button
                                        className="w-full bg-accent-blue hover:bg-blue-600 text-white rounded-xl py-6 mt-2"
                                        size="lg"
                                        onClick={handlePlaceOrder}
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Placing Order...
                                            </div>
                                        ) : (
                                            "Place Order"
                                        )}
                                    </Button>
                                </div>
                            )}

                            <p className="text-xs text-center text-primary-blue-light/50 mt-4">
                                Manual payment via UPI/Bank Transfer.
                                <br />
                                All proceeds go to Stepwell restoration.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
