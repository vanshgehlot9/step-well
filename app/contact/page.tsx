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
            {/* Background Texture */}


            <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-24 relative z-10">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-primary-blue font-sans text-xs tracking-[0.2em] uppercase font-bold shadow-sm border border-surface-blue-dark inline-block mb-6">
                            Reach Out
                        </span>
                        <h1 className="font-serif text-5xl md:text-8xl font-light text-primary-blue leading-none mb-6">
                            Get in <span className="italic font-medium">Touch.</span>
                        </h1>
                        <p className="text-xl text-primary-blue-light/60 leading-relaxed">
                            Have questions? Want to collaborate? Drop us a line.
                        </p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Contact Info Card */}
                    <div className="bg-primary-blue text-white p-10 md:p-12 rounded-2xl shadow-2xl space-y-8">
                        <h3 className="font-serif text-2xl font-medium text-accent-blue">Contact Information</h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-xl text-accent-blue shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1 text-white">Location</h4>
                                    <p className="text-surface-blue/70 leading-relaxed">Stepwells Renovater HQ,<br />Near Toorji Ka Jhalra,<br />Jodhpur, Rajasthan 342001</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-xl text-accent-blue shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1 text-white">Phone</h4>
                                    <p className="text-surface-blue/70">+91 95711 79677</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-xl text-accent-blue shrink-0">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1 text-white">Email</h4>
                                    <p className="text-surface-blue/70">support@stepwellsrenovaterfoundation.org</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <h4 className="font-bold mb-4 text-accent-blue text-sm uppercase tracking-widest">Follow Us</h4>
                            <a href="https://instagram.com/stepwells_renovater" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-surface-blue/70 hover:text-white transition-colors">
                                <Instagram size={20} /> @stepwells_renovater
                            </a>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white p-10 md:p-12 rounded-2xl shadow-xl border border-surface-blue-dark">
                        {submitted ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                                <div className="w-20 h-20 bg-accent-blue/10 text-accent-blue rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send size={32} />
                                </div>
                                <h3 className="text-2xl font-serif font-medium text-primary-blue">Message Sent!</h3>
                                <p className="text-primary-blue-light/60">We'll get back to you within 24 hours.</p>
                                <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-4 border-primary-blue/20 text-primary-blue hover:bg-primary-blue hover:text-white">Send Another</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="text-xl font-sans font-bold tracking-widest uppercase text-primary-blue mb-2">Send a Message</h3>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary-blue-light/50">Name</label>
                                    <input required className="w-full pb-3 text-lg border-b border-surface-blue-dark focus:border-accent-blue outline-none bg-transparent transition-colors placeholder:text-primary-blue-light/20 text-primary-blue" placeholder="Your Name" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary-blue-light/50">Email</label>
                                    <input required type="email" className="w-full pb-3 text-lg border-b border-surface-blue-dark focus:border-accent-blue outline-none bg-transparent transition-colors placeholder:text-primary-blue-light/20 text-primary-blue" placeholder="you@company.com" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary-blue-light/50">Subject</label>
                                    <input required className="w-full pb-3 text-lg border-b border-surface-blue-dark focus:border-accent-blue outline-none bg-transparent transition-colors placeholder:text-primary-blue-light/20 text-primary-blue" placeholder="Collaboration / Inquiry" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary-blue-light/50">Message</label>
                                    <textarea required className="w-full p-4 rounded-xl border border-surface-blue-dark focus:border-accent-blue outline-none bg-surface-blue/50 min-h-[120px] text-primary-blue resize-none" placeholder="How can we help?" />
                                </div>
                                <Button type="submit" className="w-full py-7 text-lg bg-primary-blue hover:bg-primary-blue-light text-white rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                                    Send Message
                                </Button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Map Embed */}
                <div className="mt-16 rounded-2xl overflow-hidden shadow-xl h-96 grayscale hover:grayscale-0 transition-all duration-500 border border-surface-blue-dark">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3577.8785981352!2d73.0245!3d26.2995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39418c4303d27635%3A0x6c64117852932973!2sToorji%20Ka%20Jhalra%20Bavdi!5e0!3m2!1sen!2sin!4v1628170000000!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        title="Google Maps Location"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
