"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { addStore } from "@/lib/firebase-services";
import { Loader2 } from "lucide-react";

export default function StorePartnerPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signUp } = useAuth();
  const router = useRouter();

  // Form State
  const [brandName, setBrandName] = useState("");
  const [website, setWebsite] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const onboardingData = {
        brandName,
        website,
        fullName,
        role,
        email,
        phone,
        category,
        description,
      };

      // Save to session storage
      sessionStorage.setItem("vendorOnboardingData", JSON.stringify(onboardingData));

      // Redirect to onboarding page
      router.push("/store");
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] pt-32 pb-24 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent-blue font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-4 block">
              Marketplace Collaboration
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-primary-blue mb-6">
              Become a Store Partner
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-primary-blue/10" />
              <div className="w-2 h-2 rotate-45 bg-accent-blue/80" />
              <div className="h-px w-12 bg-primary-blue/10" />
            </div>
            <p className="mt-8 text-primary-blue-light/80 text-lg leading-relaxed max-w-2xl mx-auto">
              Feature your authentic, heritage-inspired, or artisanal products on the Foundation Store. We empower local artisans and sustainable brands while supporting our conservation efforts.
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 md:p-14 shadow-[0_20px_60px_rgba(13,59,102,0.08)] border border-surface-blue-dark/50">
            {submitted ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-accent-blue/10 text-accent-blue rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="font-serif text-3xl text-primary-blue font-bold mb-4">Application Submitted!</h2>
                  <p className="text-primary-blue-light/80 text-lg max-w-md mx-auto mb-6">
                    Thank you for applying to be a Store Partner. Your account has been created, and our curatorial team will review your application soon.
                  </p>
                  <p className="text-primary-blue font-medium animate-pulse">Redirecting to your dashboard...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Brand Details */}
                <div>
                  <h3 className="font-serif text-2xl text-primary-blue mb-6 border-b border-surface-blue-dark pb-3">Brand Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="brand_name" className="text-sm font-medium text-primary-blue ml-1">Brand/Store Name *</label>
                      <input 
                        id="brand_name" 
                        type="text" 
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        required 
                        placeholder="Enter brand name"
                        className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="website" className="text-sm font-medium text-primary-blue ml-1">Website or Instagram Link</label>
                      <input 
                        id="website" 
                        type="text" 
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="Enter website URL"
                        className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Person */}
                <div>
                  <h3 className="font-serif text-2xl text-primary-blue mb-6 border-b border-surface-blue-dark pb-3">Contact Person</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-primary-blue ml-1">Full Name *</label>
                      <input 
                        id="name" 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required 
                        placeholder="Enter full name"
                        className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="role" className="text-sm font-medium text-primary-blue ml-1">Role/Title</label>
                      <input 
                        id="role" 
                        type="text" 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Enter your role"
                        className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-primary-blue ml-1">Email Address *</label>
                      <input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        placeholder="Enter email address"
                        className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-primary-blue ml-1">Phone Number *</label>
                      <input 
                        id="phone" 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="Enter phone number"
                        className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div>
                  <h3 className="font-serif text-2xl text-primary-blue mb-6 border-b border-surface-blue-dark pb-3">Product Information</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium text-primary-blue ml-1">Primary Product Category *</label>
                      <select 
                        id="category" 
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all text-primary-blue"
                      >
                        <option value="" disabled>Select category</option>
                        <option value="apparel">Apparel & Textiles</option>
                        <option value="home_decor">Home Decor & Handicrafts</option>
                        <option value="art">Art & Prints</option>
                        <option value="jewelry">Jewelry & Accessories</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium text-primary-blue ml-1">Describe your products and how they align with our heritage focus *</label>
                      <textarea 
                        id="description" 
                        required 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="Tell us the story behind your products..."
                        className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-[#0f172a] hover:bg-[#2563eb] text-white font-medium py-7 rounded-xl text-lg transition-colors duration-300 shadow-xl shadow-blue-900/20"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {isSubmitting ? "Proceeding..." : "Continue to Account Setup"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
