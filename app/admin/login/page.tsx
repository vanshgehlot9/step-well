"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function AdminLoginPage() {
    const router = useRouter();
    const { signIn, signInWithGoogle, sendPasswordReset, user, isAdmin } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetSent, setResetSent] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setResetSent(null);
        setLoading(true);
        try {
            await signIn(email, password);
            router.push("/admin");
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code || "";
            if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
                setError("Invalid Admin ID or password. Please check your credentials and try again.");
            } else if (code === "auth/too-many-requests") {
                setError("Too many failed attempts. Please wait a moment or reset your password.");
            } else {
                setError(err instanceof Error ? err.message : "Sign-in failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError(null);
        setResetSent(null);
        setLoading(true);
        try {
            await signInWithGoogle();
            router.push("/admin");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Google sign-in failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setError(null);
        setResetSent(null);
        if (!email.trim()) {
            setError("Enter your Admin Email ID above first, then click Forgot Password.");
            return;
        }
        setLoading(true);
        try {
            await sendPasswordReset(email.trim());
            setResetSent(`Password reset link sent to ${email.trim()}. Check your inbox.`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Could not send password reset email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-accent-blue/20">
                        S
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">Admin Panel</h1>
                    <p className="text-white/40 text-sm mt-1">Sign in to manage stepwells &amp; website CMS</p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] p-8 shadow-2xl">
                    <div className="mb-6 rounded-xl border border-accent-blue/20 bg-accent-blue/10 p-4 text-sm text-accent-blue flex items-start gap-3">
                        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                        <span>Please use your authorized admin ID and password.</span>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-medium text-red-300">
                            {error}
                        </div>
                    )}

                    {resetSent && (
                        <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-300">
                            {resetSent}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Admin ID (Email Address)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 focus:border-accent-blue focus:bg-white/[0.06] outline-none transition-all text-sm"
                                placeholder="admin@stepwells.org"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Password</label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    disabled={loading}
                                    className="text-[11px] font-semibold text-accent-blue hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 focus:border-accent-blue focus:bg-white/[0.06] outline-none transition-all text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
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
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">or</span>
                        <div className="flex-1 h-px bg-white/[0.08]" />
                    </div>

                    <button
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue with Google
                    </button>

                    <p className="text-xs text-white/30 text-center mt-6">
                        Current session: {user ? `${user.displayName} · ${isAdmin ? "admin" : "viewer"}` : "not signed in"}
                    </p>
                </div>
            </div>
        </div>
    );
}
