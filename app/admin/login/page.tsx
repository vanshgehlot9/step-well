"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { ref, update, serverTimestamp } from "firebase/database";
import { db } from "@/lib/firebase";
import { setAdminManual } from "@/lib/admin-setup";
import { setAdminRoleServer } from "@/app/actions/admin";

export default function AdminLoginPage() {
    const { signIn, signInWithGoogle, user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showAdminSetup, setShowAdminSetup] = useState(false);
    const [adminSetupLoading, setAdminSetupLoading] = useState(false);

    // Redirect if already authenticated as admin
    useEffect(() => {
        if (!authLoading && user && isAdmin) {
            router.replace("/admin");
        }
        // Show admin setup option if logged in but not admin
        if (!authLoading && user && !isAdmin) {
            setShowAdminSetup(true);
        }
    }, [user, isAdmin, authLoading, router]);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
                    <p className="text-white/50 text-sm tracking-widest uppercase">Loading</p>
                </div>
            </div>
        );
    }

    // Show redirecting screen if authenticated as admin
    if (user && isAdmin) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
                    <p className="text-white/50 text-sm tracking-widest uppercase">Redirecting to Dashboard</p>
                </div>
            </div>
        );
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signIn(email, password);
        } catch (err: any) {
            console.error("Login error:", err);
            setError(
                err.code === "auth/invalid-credential"
                    ? "Invalid email or password."
                    : err.code === "auth/too-many-requests"
                        ? "Too many attempts. Please try again later."
                        : err.message || "Login failed. Please try again."
            );
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            console.error("Google login error:", err);
            setError("Google sign-in failed. Please try again.");
            setLoading(false);
        }
    };

    const handleBecomeAdmin = async () => {
        if (!user) {
            setError("You must be logged in to become an admin.");
            return;
        }

        setAdminSetupLoading(true);
        setError("");

        try {
            console.log("🔄 Setting admin role for user:", user.uid, user.email);
            
            // Try server-side first (more reliable)
            console.log("📡 Trying server-side method...");
            const result = await setAdminRoleServer(user.uid);
            
            if (result.success) {
                console.log("✅ Server-side update successful!");
                setError("");
                setShowAdminSetup(false);
            } else {
                console.log("⚠️ Server method failed, trying client-side...");
                
                // Fallback to client-side
                const userRef = ref(db, `users/${user.uid}`);
                await update(userRef, {
                    role: "admin",
                    updatedAt: serverTimestamp(),
                });
                console.log("✅ Client-side update successful!");
                setError("");
                setShowAdminSetup(false);
            }
            
            // Wait for role sync
            setTimeout(() => {
                console.log("⏳ Waiting for role sync...");
            }, 1000);
            
        } catch (err: any) {
            console.error("❌ Admin setup error:", err);
            console.error("Error code:", err.code);
            console.error("Error message:", err.message);
            
            if (err.code === "PERMISSION_DENIED") {
                setError("Permission denied. Your Firebase rules may not allow this. Try console method: setAdminManual()");
            } else {
                setError(err.message || "Failed to set admin role. Try console method: setAdminManual()");
            }
            setAdminSetupLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-accent-blue/20">
                        S
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">
                        Admin Panel
                    </h1>
                    <p className="text-white/40 text-sm mt-1">
                        Stepwells Renovater Foundation
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 focus:border-accent-blue focus:bg-white/[0.06] outline-none transition-all text-sm"
                                placeholder="admin@stepwells.org"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 focus:border-accent-blue focus:bg-white/[0.06] outline-none transition-all text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-black font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-accent-blue/20 hover:shadow-accent-blue/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-white/[0.08]" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">
                            or
                        </span>
                        <div className="flex-1 h-px bg-white/[0.08]" />
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                {/* Admin Setup Section - Shows if user is logged in but not admin */}
                {showAdminSetup && user && !isAdmin && (
                    <div className="mt-6 bg-accent-blue/10 border border-accent-blue/30 rounded-2xl p-6">
                        <div className="text-center mb-4">
                            <p className="text-white font-medium mb-2">
                                Welcome, {user.displayName || user.email}!
                            </p>
                            <p className="text-white/60 text-sm mb-4">
                                You're logged in, but need admin access. Click below to set yourself as admin.
                            </p>
                            {error && (
                                <p className="text-red-400 text-xs mb-3 break-words">
                                    {error}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleBecomeAdmin}
                            disabled={adminSetupLoading}
                            className="w-full py-3 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-black font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-accent-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {adminSetupLoading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    Make Me Admin <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                        
                        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-xs text-white/50 mb-2">If button doesn't work:</p>
                            <code className="text-[11px] text-white/70 block bg-black/30 p-2 rounded font-mono break-words">
                                setAdminManual()
                            </code>
                            <p className="text-xs text-white/40 mt-2">
                                Open DevTools (F12), go to Console tab, paste & press Enter
                            </p>
                        </div>
                    </div>
                )}

                <p className="text-center text-[10px] tracking-widest uppercase text-white/20 mt-8">
                    Protected Admin Access Only
                </p>
            </div>
        </div>
    );
}
