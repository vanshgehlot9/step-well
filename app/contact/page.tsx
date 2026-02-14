"use client";

import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Instagram, Send } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="bg-surface-blue min-h-screen selection:bg-accent-blue selection:text-white relative overflow-hidden">

            <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-12 md:pb-24 relative z-10">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-10 md:mb-20 space-y-4 md:space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-primary-blue font-sans text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold shadow-sm border border-surface-blue-dark inline-block mb-3 md:mb-6">
                            Reach Out
                        </span>
                        <h1 className="font-serif text-4xl md:text-8xl font-light text-primary-blue leading-none mb-3 md:mb-6">
                            Get in <span className="italic font-medium">Touch.</span>
                        </h1>
                        <p className="text-sm md:text-xl text-primary-blue-light/60 leading-relaxed">
                            Have questions? Want to collaborate? Drop us a line.
                        </p>
                    </motion.div>
                </div>

                {/* Mobile Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="md:hidden mb-6"
                >
                    <div className="grid grid-cols-3 gap-2">
                        <a href="tel:+919571179677" className="flex flex-col items-center gap-2 bg-primary-blue rounded-2xl py-4 px-2 active:scale-95 transition-transform">
                            <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center">
                                <Phone size={18} className="text-accent-blue" />
                            </div>
                            <span className="text-white text-[11px] font-bold uppercase tracking-wider">Call</span>
                        </a>
                        <a href="mailto:support@stepwellsrenovaterfoundation.org" className="flex flex-col items-center gap-2 bg-primary-blue rounded-2xl py-4 px-2 active:scale-95 transition-transform">
                            <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center">
                                <Mail size={18} className="text-accent-blue" />
                            </div>
                            <span className="text-white text-[11px] font-bold uppercase tracking-wider">Email</span>
                        </a>
                        <a href="https://maps.google.com/?q=Toorji+Ka+Jhalra+Jodhpur" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 bg-primary-blue rounded-2xl py-4 px-2 active:scale-95 transition-transform">
                            <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center">
                                <MapPin size={18} className="text-accent-blue" />
                            </div>
                            <span className="text-white text-[11px] font-bold uppercase tracking-wider">Map</span>
                        </a>
                    </div>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-5 md:gap-8 max-w-5xl mx-auto">

                    {/* Mobile Form First, Desktop Contact Info First */}
                    {/* Contact Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                        className="order-2 md:order-1"
                    >
                        <div className="bg-primary-blue text-white p-6 md:p-12 rounded-2xl shadow-2xl space-y-6 md:space-y-8 h-full">
                            <h3 className="font-serif text-xl md:text-2xl font-medium text-accent-blue">Contact Information</h3>

                            <div className="space-y-4 md:space-y-6">
                                <a href="https://maps.google.com/?q=Toorji+Ka+Jhalra+Jodhpur" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 md:gap-4 p-3 md:p-0 rounded-xl md:rounded-none bg-white/[0.04] md:bg-transparent active:bg-white/[0.08] md:active:bg-transparent transition-colors group">
                                    <div className="p-2.5 md:p-3 bg-white/10 rounded-xl text-accent-blue shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-0.5 md:mb-1 text-white text-sm md:text-base">Location</h4>
                                        <p className="text-surface-blue/70 text-sm md:text-base leading-relaxed">Stepwells Renovater HQ,<br />Near Toorji Ka Jhalra,<br />Jodhpur, Rajasthan 342001</p>
                                    </div>
                                </a>

                                <a href="tel:+919571179677" className="flex items-center gap-3 md:gap-4 p-3 md:p-0 rounded-xl md:rounded-none bg-white/[0.04] md:bg-transparent active:bg-white/[0.08] md:active:bg-transparent transition-colors group">
                                    <div className="p-2.5 md:p-3 bg-white/10 rounded-xl text-accent-blue shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-0.5 md:mb-1 text-white text-sm md:text-base">Phone</h4>
                                        <p className="text-surface-blue/70 text-sm md:text-base">+91 95711 79677</p>
                                    </div>
                                </a>

                                <a href="mailto:support@stepwellsrenovaterfoundation.org" className="flex items-center gap-3 md:gap-4 p-3 md:p-0 rounded-xl md:rounded-none bg-white/[0.04] md:bg-transparent active:bg-white/[0.08] md:active:bg-transparent transition-colors group">
                                    <div className="p-2.5 md:p-3 bg-white/10 rounded-xl text-accent-blue shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-0.5 md:mb-1 text-white text-sm md:text-base">Email</h4>
                                        <p className="text-surface-blue/70 text-sm md:text-base break-all">support@stepwellsrenovater<wbr />foundation.org</p>
                                    </div>
                                </a>
                            </div>

                            <div className="pt-4 md:pt-6 border-t border-white/10">
                                <h4 className="font-bold mb-3 md:mb-4 text-accent-blue text-xs md:text-sm uppercase tracking-widest">Follow Us</h4>
                                <a href="https://instagram.com/stepwells_renovater" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 md:from-transparent md:to-transparent border border-white/10 md:border-transparent rounded-xl px-4 py-2.5 md:px-0 md:py-0 text-surface-blue/70 hover:text-white active:scale-95 md:active:scale-100 transition-all text-sm">
                                    <Instagram size={18} /> @stepwells_renovater
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="order-1 md:order-2"
                    >
                        <div className="bg-white p-5 md:p-12 rounded-2xl shadow-xl border border-surface-blue-dark">
                            {submitted ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 py-12 md:py-16">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                                        className="w-16 h-16 md:w-20 md:h-20 bg-accent-blue/10 text-accent-blue rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4"
                                    >
                                        <Send size={28} />
                                    </motion.div>
                                    <h3 className="text-xl md:text-2xl font-serif font-medium text-primary-blue">Message Sent!</h3>
                                    <p className="text-sm md:text-base text-primary-blue-light/60">We&apos;ll get back to you within 24 hours.</p>
                                    <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-3 md:mt-4 border-primary-blue/20 text-primary-blue hover:bg-primary-blue hover:text-white active:scale-95">Send Another</Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                                    <h3 className="text-sm md:text-xl font-sans font-bold tracking-widest uppercase text-primary-blue mb-1 md:mb-2">Send a Message</h3>

                                    <div className="space-y-2 md:space-y-3">
                                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary-blue-light/50">Name</label>
                                        <input required className="w-full pb-3 text-base md:text-lg border-b border-surface-blue-dark focus:border-accent-blue outline-none bg-transparent transition-colors placeholder:text-primary-blue-light/20 text-primary-blue" placeholder="Your Name" />
                                    </div>
                                    <div className="space-y-2 md:space-y-3">
                                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary-blue-light/50">Email</label>
                                        <input required type="email" className="w-full pb-3 text-base md:text-lg border-b border-surface-blue-dark focus:border-accent-blue outline-none bg-transparent transition-colors placeholder:text-primary-blue-light/20 text-primary-blue" placeholder="you@company.com" />
                                    </div>
                                    <div className="space-y-2 md:space-y-3">
                                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary-blue-light/50">Subject</label>
                                        <input required className="w-full pb-3 text-base md:text-lg border-b border-surface-blue-dark focus:border-accent-blue outline-none bg-transparent transition-colors placeholder:text-primary-blue-light/20 text-primary-blue" placeholder="Collaboration / Inquiry" />
                                    </div>
                                    <div className="space-y-2 md:space-y-3">
                                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary-blue-light/50">Message</label>
                                        <textarea required className="w-full p-3.5 md:p-4 rounded-xl border border-surface-blue-dark focus:border-accent-blue outline-none bg-surface-blue/50 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-primary-blue resize-none" placeholder="How can we help?" />
                                    </div>
                                    <button type="submit" className="w-full py-5 md:py-7 text-base md:text-lg bg-gradient-to-r from-primary-blue to-primary-blue-light hover:from-primary-blue-light hover:to-primary-blue text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary-blue/20 active:scale-[0.98] flex items-center justify-center gap-2.5">
                                        <Send size={18} />
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Map Embed */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-8 md:mt-16 rounded-2xl overflow-hidden shadow-xl h-56 md:h-96 grayscale hover:grayscale-0 active:grayscale-0 transition-all duration-500 border border-surface-blue-dark"
                >
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3577.8785981352!2d73.0245!3d26.2995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39418c4303d27635%3A0x6c64117852932973!2sToorji%20Ka%20Jhalra%20Bavdi!5e0!3m2!1sen!2sin!4v1628170000000!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        title="Google Maps Location"
                    ></iframe>
                </motion.div>
            </div>
        </div>
    );
}
