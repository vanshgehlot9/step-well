"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PartnerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary-blue/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-blue/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/3 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent-blue font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-4 block">
              Collaborate With Us
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-primary-blue mb-6">
              Become a Partner
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-accent-blue/30" />
              <div className="w-2 h-2 rotate-45 bg-accent-blue/50" />
              <div className="h-px w-12 bg-accent-blue/30" />
            </div>
            <p className="mt-8 text-primary-blue-light/80 text-lg leading-relaxed max-w-2xl mx-auto">
              Join hands with the Stepwell Renovation Foundation. Whether you're a corporate entity, an NGO, or a passionate community group, your partnership can accelerate our mission to revive and protect our ancient water heritage.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_10px_40px_rgba(13,59,102,0.06)] border border-surface-blue-dark/50">
            {submitted ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-serif text-3xl text-primary-blue font-bold mb-4">Application Received!</h2>
                <p className="text-primary-blue-light/80 text-lg max-w-md mx-auto">
                  Thank you for your interest in partnering with us. Our team will review your details and get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-primary-blue ml-1">Full Name *</label>
                    <input 
                      id="name" 
                      type="text" 
                      required 
                      placeholder="Enter full name"
                      className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="organization" className="text-sm font-medium text-primary-blue ml-1">Organization Name</label>
                    <input 
                      id="organization" 
                      type="text" 
                      placeholder="Enter Organization Name"
                      className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-primary-blue ml-1">Email Address *</label>
                    <input 
                      id="email" 
                      type="email" 
                      required 
                      placeholder="Enter email address"
                      className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-primary-blue ml-1">Phone Number</label>
                    <input 
                      id="phone" 
                      type="tel" 
                      placeholder="Enter phone number"
                      className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="partnership_type" className="text-sm font-medium text-primary-blue ml-1">Type of Partnership Interest *</label>
                  <select 
                    id="partnership_type" 
                    required
                    defaultValue=""
                    className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all text-primary-blue"
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="corporate_csr">Corporate CSR</option>
                    <option value="ngo_collaboration">NGO Collaboration</option>
                    <option value="community_group">Community Group</option>
                    <option value="educational">Educational Institution</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-primary-blue ml-1">How would you like to collaborate? *</label>
                  <textarea 
                    id="message" 
                    required 
                    rows={5}
                    placeholder="Tell us a bit about your goals and how we can work together..."
                    className="w-full bg-[#f8fafc] border border-surface-blue-dark/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all resize-none"
                  ></textarea>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white font-medium py-6 rounded-xl text-lg transition-all"
                  >
                    {isSubmitting ? "Submitting Application..." : "Submit Partnership Request"}
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
