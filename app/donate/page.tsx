"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ref, push, set, serverTimestamp } from "firebase/database";
import { db } from "@/lib/firebase";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay-client";

declare global {
    interface Window {
        Razorpay: any;
    }
}

// Get Razorpay Key from environment variable
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

export default function DonatePage() {
    const { user } = useAuth();
    const [amount, setAmount] = useState<number | string>(500);
    const [frequency, setFrequency] = useState<"once" | "monthly">("once");
    const [customAmount, setCustomAmount] = useState(false);
    const [donorName, setDonorName] = useState("");
    const [message, setMessage] = useState("");
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const predefinedAmounts = [100, 500, 1000, 2500, 5000];

    const saveDonationToDatabase = async (paymentId: string) => {
        try {
            const newRef = push(ref(db, "donations"));
            await set(newRef, {
                amount: Number(amount),
                currency: "INR",
                donorName: donorName || user?.displayName || "Anonymous",
                donorEmail: user?.email || "",
                message: message || "",
                paymentId: paymentId,
                status: "completed",
                frequency: frequency,
                createdAt: serverTimestamp(),
            });
            console.log("✅ Donation saved to database");
        } catch (error) {
            console.error("Failed to save donation:", error);
        }
    };

    const handleDonate = async () => {
        if (!RAZORPAY_KEY_ID) {
            alert("Payment gateway is not configured. Please contact support.");
            return;
        }

        if (!amount || Number(amount) < 1) {
            alert("Please enter a valid amount.");
            return;
        }

        if (!donorName && !user) {
            alert("Please enter your name to proceed.");
            return;
        }

        setProcessing(true);

        try {
            // Load Razorpay script
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                alert("Failed to load payment gateway. Please try again.");
                setProcessing(false);
                return;
            }

            // Open Razorpay checkout directly
            const options = {
                key: RAZORPAY_KEY_ID,
                amount: Math.round(Number(amount) * 100), // Convert to paise
                currency: "INR",
                name: "Stepwells Renovater",
                description: `Donation of ₹${amount}`,
                prefill: {
                    name: donorName || user?.displayName || "",
                    email: user?.email || "",
                },
                theme: {
                    color: "#0EA5E9",
                },
                handler: async (response: any) => {
                    console.log("✅ Payment successful:", response);
                    // Save donation to database
                    await saveDonationToDatabase(response.razorpay_payment_id);
                    setSuccess(true);
                },
                modal: {
                    ondismiss: () => {
                        setProcessing(false);
                        console.log("Payment modal closed");
                    },
                },
            };

            await openRazorpayCheckout(options);
        } catch (error: any) {
            console.error("Donation error:", error);
            alert("Failed to process donation. Please try again.");
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-primary-blue text-white flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/stepwell_texture.png')] opacity-10 mix-blend-overlay fixed" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center px-6 max-w-lg relative z-10"
                >
                    <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                        <Heart size={48} strokeWidth={1.5} />
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">
                        Thank You, Guardian.
                    </h1>
                    <p className="text-white/60 text-lg mb-2">
                        Your donation of{" "}
                        <span className="text-accent-blue font-bold">₹{amount}</span> has
                        been received.
                    </p>
                    <p className="text-white/40 text-sm mb-8">
                        A receipt has been recorded. Your contribution makes history.
                    </p>
                    <Button
                        onClick={() => {
                            setSuccess(false);
                            setAmount(500);
                            setDonorName("");
                            setMessage("");
                        }}
                        variant="ghost"
                        className="text-white/50 hover:text-white hover:bg-white/5"
                    >
                        Make Another Donation
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary-blue text-white selection:bg-accent-blue selection:text-white relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('/stepwell_texture.png')] opacity-10 mix-blend-overlay fixed" />

            <div className="container mx-auto px-4 md:px-6 py-32 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
                    {/* Left Column: Narrative & Impact */}
                    <div className="flex-1 space-y-12 pt-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h5 className="text-accent-blue font-sans tracking-[0.2em] uppercase text-sm font-medium mb-4">
                                Support The Mission
                            </h5>
                            <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight mb-6">
                                Restore History.
                                <br />
                                <span className="font-medium">Build Future.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-xl font-light">
                                Your contribution is the mortar that holds these ancient stones
                                together. We don't just clean water; we revive the heart of
                                Rajasthan's communities.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="p-3 bg-accent-blue/10 rounded-full text-accent-blue">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif font-medium mb-2">
                                        100% Direct Impact
                                    </h3>
                                    <p className="text-white/60 leading-relaxed">
                                        We are volunteer-driven. Every rupee goes towards equipment,
                                        waste disposal trucks, and wages for local daily-wage
                                        laborers.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="p-3 bg-accent-blue/10 rounded-full text-accent-blue">
                                    <Heart size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif font-medium mb-2">
                                        Preserve Culture
                                    </h3>
                                    <p className="text-white/60 leading-relaxed">
                                        You aren't just donating money; you're adopting a piece of
                                        heritage that has survived for centuries but needs you now.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Donation Interface */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="w-full lg:w-[480px] bg-white rounded-3xl p-8 md:p-10 shadow-2xl shadow-primary-blue/20 text-primary-blue sticky top-32"
                    >
                        <div className="mb-8 text-center">
                            <h2 className="font-serif text-3xl font-bold mb-2">
                                Make a Contribution
                            </h2>
                            <p className="text-primary-blue-light/60 text-sm">
                                Select an amount for meaningful impact.
                            </p>
                        </div>

                        {/* Frequency Switcher */}
                        <div className="flex bg-surface-blue p-1.5 rounded-xl mb-8 relative">
                            <div
                                className={`absolute inset-y-1.5 rounded-lg bg-white shadow-sm transition-all duration-300 ease-out ${frequency === "once" ? "left-1.5 w-[calc(50%-6px)]" : "left-[50%] w-[calc(50%-6px)]"}`}
                            />
                            <button
                                onClick={() => setFrequency("once")}
                                className={`flex-1 relative z-10 py-3 text-sm font-semibold transition-colors duration-300 ${frequency === "once" ? "text-primary-blue" : "text-primary-blue/50 hover:text-primary-blue"}`}
                            >
                                Give Once
                            </button>
                            <button
                                onClick={() => setFrequency("monthly")}
                                className={`flex-1 relative z-10 py-3 text-sm font-semibold transition-colors duration-300 ${frequency === "monthly" ? "text-primary-blue" : "text-primary-blue/50 hover:text-primary-blue"}`}
                            >
                                Monthly
                            </button>
                        </div>

                        {/* Amount Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {predefinedAmounts.map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => {
                                        setAmount(amt);
                                        setCustomAmount(false);
                                    }}
                                    className={`py-4 rounded-xl border-2 font-medium transition-all duration-200 ${amount === amt && !customAmount
                                            ? "border-accent-blue bg-accent-blue/5 text-accent-blue scale-[1.02] shadow-inner"
                                            : "border-surface-blue-dark text-primary-blue-light/60 hover:border-accent-blue/30 hover:text-accent-blue hover:bg-white"
                                        }`}
                                >
                                    ₹{amt}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    setCustomAmount(true);
                                    setAmount("");
                                }}
                                className={`py-4 rounded-xl border-2 font-medium transition-all duration-200 ${customAmount
                                        ? "border-accent-blue bg-accent-blue/5 text-accent-blue scale-[1.02] shadow-inner"
                                        : "border-surface-blue-dark text-primary-blue-light/60 hover:border-accent-blue/30 hover:text-accent-blue hover:bg-white"
                                    }`}
                            >
                                Custom
                            </button>
                        </div>

                        {customAmount && (
                            <div className="mb-6 relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-blue-light/50 font-serif text-xl">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-surface-blue-dark focus:border-accent-blue focus:ring-0 outline-none text-lg font-medium text-primary-blue transition-colors bg-surface-blue focus:bg-white"
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Donor Info */}
                        <div className="space-y-3 mb-6">
                            <input
                                type="text"
                                placeholder="Your name (optional)"
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-surface-blue-dark focus:border-accent-blue outline-none text-sm text-primary-blue transition-colors bg-surface-blue focus:bg-white"
                            />
                            <input
                                type="text"
                                placeholder="Leave a message (optional)"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-surface-blue-dark focus:border-accent-blue outline-none text-sm text-primary-blue transition-colors bg-surface-blue focus:bg-white"
                            />
                        </div>

                        <Button
                            size="lg"
                            className="w-full py-7 text-lg bg-accent-blue hover:bg-blue-600 shadow-xl shadow-accent-blue/20 text-white rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                            onClick={handleDonate}
                            disabled={processing}
                        >
                            {processing ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </div>
                            ) : (
                                <>
                                    Donate {amount ? `₹${amount}` : ""}{" "}
                                    {frequency === "monthly" ? "Monthly" : ""}
                                </>
                            )}
                        </Button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-primary-blue-light/50">
                            <ShieldCheck size={14} />
                            <span>Secure payment via Razorpay</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
