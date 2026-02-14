"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Check, ArrowLeft, Banknote, Smartphone } from "lucide-react";
import Link from "next/link";

interface OrderInfo {
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
}

export default function CheckoutSuccessPage() {
    const [order, setOrder] = useState<OrderInfo | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const stored = sessionStorage.getItem("lastOrder");
        if (stored) {
            setOrder(JSON.parse(stored));
        } else {
            router.replace("/shop");
        }
    }, [router]);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (!order) return null;

    return (
        <div className="min-h-screen bg-primary-blue text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/stepwell_texture.png')] opacity-10 mix-blend-overlay fixed" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 pt-32 pb-24 relative z-10 max-w-2xl">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                        <CheckCircle2 size={40} className="text-emerald-400" />
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-light mb-3">
                        Order Placed!
                    </h1>
                    <p className="text-white/50 text-lg">
                        Order ref:{" "}
                        <span className="font-mono text-accent-blue font-bold">
                            {order.orderRef}
                        </span>
                    </p>
                </motion.div>

                {/* Payment Instructions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] p-8 space-y-8"
                >
                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-2">Complete Your Payment</h2>
                        <p className="text-white/40 text-sm">
                            Please transfer{" "}
                            <span className="text-accent-blue font-bold text-lg">
                                ₹{order.totalAmount.toLocaleString("en-IN")}
                            </span>{" "}
                            using one of the methods below.
                        </p>
                    </div>

                    {/* UPI Payment */}
                    {order.paymentDetails?.upiId && (
                        <div className="space-y-3">
                            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/60">
                                <Smartphone size={16} className="text-accent-blue" /> UPI
                                Payment
                            </h3>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04] border border-white/10">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">
                                        UPI ID
                                    </p>
                                    <p className="text-lg font-mono font-bold text-white/80">
                                        {order.paymentDetails.upiId}
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        copyToClipboard(order.paymentDetails.upiId, "upi")
                                    }
                                    className="p-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/40 hover:text-accent-blue transition-all"
                                >
                                    {copiedField === "upi" ? (
                                        <Check size={18} className="text-emerald-400" />
                                    ) : (
                                        <Copy size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bank Transfer */}
                    {order.paymentDetails?.bankDetails && (
                        <div className="space-y-3">
                            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/60">
                                <Banknote size={16} className="text-accent-blue" /> Bank
                                Transfer
                            </h3>
                            <div className="space-y-2">
                                {[
                                    {
                                        label: "Account Name",
                                        value: order.paymentDetails.bankDetails.accountName,
                                        key: "accname",
                                    },
                                    {
                                        label: "Account Number",
                                        value: order.paymentDetails.bankDetails.accountNumber,
                                        key: "accnum",
                                    },
                                    {
                                        label: "IFSC Code",
                                        value: order.paymentDetails.bankDetails.ifscCode,
                                        key: "ifsc",
                                    },
                                    {
                                        label: "Bank",
                                        value: order.paymentDetails.bankDetails.bankName,
                                        key: "bank",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                                    >
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-white/25 mb-0.5">
                                                {item.label}
                                            </p>
                                            <p className="text-sm font-mono text-white/70">
                                                {item.value}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(item.value, item.key)}
                                            className="p-2 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-accent-blue transition-all"
                                        >
                                            {copiedField === item.key ? (
                                                <Check size={14} className="text-emerald-400" />
                                            ) : (
                                                <Copy size={14} />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Amount Reminder */}
                    <div className="p-4 rounded-xl bg-accent-blue/5 border border-accent-blue/10 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-accent-blue/60 mb-1">
                            Total Amount to Transfer
                        </p>
                        <p className="text-3xl font-bold text-accent-blue">
                            ₹{order.totalAmount.toLocaleString("en-IN")}
                        </p>
                    </div>

                    <div className="text-center space-y-2 text-sm text-white/30">
                        <p>
                            After payment, your order will be confirmed within 24 hours.
                        </p>
                        <p>
                            Include your order ref{" "}
                            <span className="text-accent-blue font-mono font-bold">
                                {order.orderRef}
                            </span>{" "}
                            in the payment remarks.
                        </p>
                    </div>
                </motion.div>

                <div className="text-center mt-8">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Shop
                    </Link>
                </div>
            </div>
        </div>
    );
}
