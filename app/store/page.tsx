"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { addStore } from "@/lib/firebase-services";
import { Loader2 } from "lucide-react";

export default function StorePartnerOnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [onboardingData, setOnboardingData] = useState<any>(null);
  
  // Login specific state
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const { signUp, signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    // If already logged in as a store owner, go straight to dashboard
    if (user && (user.role === "store_owner" || user.role === "admin")) {
      router.push("/store-owner");
      return;
    }

    const dataStr = sessionStorage.getItem("vendorOnboardingData");
    if (dataStr) {
      try {
        const data = JSON.parse(dataStr);
        setOnboardingData(data);
        if (data.email) setEmail(data.email);
        setIsLoginMode(false);
      } catch (err) {
        console.error("Failed to parse onboarding data");
        setIsLoginMode(true);
      }
    } else {
      // If no data, show login form instead of redirecting
      setIsLoginMode(true);
    }
  }, [router, user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!onboardingData) {
      setError("Session expired. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Sign up the user with role "store_owner"
      await signUp(email, password, onboardingData.fullName, "store_owner");

      const { auth } = await import("@/lib/firebase");
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Failed to create user account.");
      }

      // 3. Create the pending store
      await addStore({
        name: onboardingData.brandName,
        slug: onboardingData.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        location: "Online",
        status: "PENDING",
        description: onboardingData.description,
        logo: "/placeholder-logo.jpg",
        banner: "/placeholder-banner.jpg",
        ownerId: user.uid,
        rating: 0,
      });

      setSubmitted(true);
      sessionStorage.removeItem("vendorOnboardingData"); // Clear data so it doesn't show again
      
      // Redirect to vendor dashboard after a delay
      setTimeout(() => {
        router.push("/store-owner");
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Failed to submit application.");
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(loginEmail, loginPassword);
      // Wait for auth state to update, the useEffect will handle the redirect
    } catch (err: any) {
      setError("Invalid email or password.");
      setIsSubmitting(false);
    }
  };

  if (authLoading || (!onboardingData && !isLoginMode)) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] pt-32 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_20px_60px_rgba(13,59,102,0.08)] border border-surface-blue-dark/50">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-accent-blue/10 text-accent-blue rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="font-serif text-3xl text-primary-blue font-bold mb-4">Account Created!</h2>
                <p className="text-primary-blue-light/80 text-lg max-w-md mx-auto mb-6">
                  Thank you for applying to be a Store Partner. Your account has been created, and our curatorial team will review your application soon.
                </p>
                <p className="text-primary-blue font-medium animate-pulse">Redirecting to your dashboard...</p>
              </div>
            ) : (
              isLoginMode ? (
                <form onSubmit={handleLogin} className="space-y-8">
                  <div>
                    <h3 className="font-serif text-3xl text-primary-blue mb-2 border-b border-surface-blue-dark pb-3 flex items-center gap-4">
                      Vendor Login
                    </h3>
                    <p className="text-primary-blue-light/70 text-base mb-8 mt-4">
                      Welcome back! Log in to access your vendor dashboard.
                    </p>

                    {error && (
                      <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium mb-6">
                        {error}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="loginEmail" className="text-sm font-medium text-primary-blue ml-1">Email Address</label>
                        <input 
                          id="loginEmail" 
                          type="email" 
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="loginPassword" className="text-sm font-medium text-primary-blue ml-1">Password</label>
                        <input 
                          id="loginPassword" 
                          type="password" 
                          required 
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-[#0f172a] hover:bg-[#2563eb] text-white font-medium py-7 rounded-xl text-lg transition-colors duration-300 shadow-xl shadow-blue-900/20"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <h3 className="font-serif text-3xl text-primary-blue mb-2 border-b border-surface-blue-dark pb-3 flex items-center gap-4">
                      Account Setup
                    </h3>
                    <p className="text-primary-blue-light/70 text-base mb-8 mt-4">
                      Almost there! Create a password to secure your account and access your Vendor Dashboard.
                    </p>

                    {error && (
                      <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium mb-6">
                        {error}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="email_ro" className="text-sm font-medium text-primary-blue ml-1">Email Address</label>
                        <input 
                          id="email_ro" 
                          type="email" 
                          disabled
                          value={email}
                          className="w-full bg-surface-blue/50 border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 text-primary-blue-light/60 cursor-not-allowed"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-primary-blue ml-1">Password *</label>
                        <input 
                          id="password" 
                          type="password" 
                          required 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a strong password"
                          className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-primary-blue ml-1">Confirm Password *</label>
                        <input 
                          id="confirmPassword" 
                          type="password" 
                          required 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-[#0f172a] hover:bg-[#2563eb] text-white font-medium py-7 rounded-xl text-lg transition-colors duration-300 shadow-xl shadow-blue-900/20"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      {isSubmitting ? "Creating Account..." : "Complete Registration"}
                    </Button>
                  </div>
                </form>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
