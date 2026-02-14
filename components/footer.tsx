"use client";

import Link from "next/link";
import { Instagram, Mail, MapPin, Phone, ArrowUpRight, Droplets } from "lucide-react";
import { motion } from "framer-motion";

const navLinks = [
    { name: "About", href: "/about" },
    { name: "Media", href: "/media" },
    { name: "Get Involved", href: "/get-involved" },
    { name: "Shop", href: "/shop" },
    { name: "Donate", href: "/donate" },
    { name: "Contact", href: "/contact" },
];

import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <footer className="relative bg-primary-blue text-white overflow-hidden">
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 bg-stepwell-pattern opacity-[0.03]" />

            {/* Top CTA Banner */}
            <div className="relative z-10 border-b border-white/[0.06]">
                <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                        <div className="max-w-2xl space-y-4">
                            <span className="text-accent-blue text-xs font-bold tracking-[0.3em] uppercase">
                                Join the Movement
                            </span>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-light leading-[1.1] text-white">
                                Every hand that cleans a stone<br />
                                <span className="italic text-accent-blue/80">writes history.</span>
                            </h2>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/get-involved"
                                className="group inline-flex items-center gap-3 bg-white text-primary-blue font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-full hover:bg-accent-blue hover:text-white transition-all duration-300 shadow-2xl shadow-white/10"
                            >
                                Become a Guardian
                                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Link>
                            <Link
                                href="/donate"
                                className="group inline-flex items-center gap-3 border border-white/20 text-white font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300"
                            >
                                Donate
                                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="relative z-10">
                <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">

                        {/* Brand Column */}
                        <div className="md:col-span-4 space-y-8">
                            <Link href="/" className="inline-flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center group-hover:bg-accent-blue/20 transition-colors">
                                    <Droplets size={18} className="text-accent-blue" />
                                </div>
                                <span className="font-serif text-2xl font-bold text-white">
                                    Stepwells<span className="text-accent-blue">Renovater</span>
                                </span>
                            </Link>
                            <p className="text-white/40 leading-relaxed text-[15px] max-w-sm">
                                Reviving Rajasthan's ancient water heritage, one stepwell at a time. A people's movement to preserve history and fight water scarcity.
                            </p>

                            {/* Social Links */}
                            <div className="flex gap-3">
                                <a
                                    href="https://instagram.com/stepwells_renovater"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-accent-blue hover:border-accent-blue text-white/50 hover:text-white transition-all duration-300"
                                    aria-label="Instagram"
                                >
                                    <Instagram size={18} />
                                </a>
                                <a
                                    href="mailto:support@stepwellsrenovaterfoundation.org"
                                    className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-accent-blue hover:border-accent-blue text-white/50 hover:text-white transition-all duration-300"
                                    aria-label="Email"
                                >
                                    <Mail size={18} />
                                </a>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="md:col-span-3 md:col-start-6">
                            <h4 className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/30 mb-6">
                                Navigate
                            </h4>
                            <ul className="space-y-4">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-200 text-[15px]"
                                        >
                                            <span className="w-0 group-hover:w-4 h-px bg-accent-blue transition-all duration-300" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="md:col-span-4">
                            <h4 className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/30 mb-6">
                                Reach Us
                            </h4>
                            <div className="space-y-5">
                                <div className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:border-accent-blue/30 transition-colors">
                                        <MapPin size={16} className="text-accent-blue/70" />
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-[15px] leading-relaxed">
                                            Near Toorji Ka Jhalra,<br />
                                            Jodhpur, Rajasthan 342001
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:border-accent-blue/30 transition-colors">
                                        <Phone size={16} className="text-accent-blue/70" />
                                    </div>
                                    <a href="tel:+919571179677" className="text-white/70 hover:text-white transition-colors text-[15px]">
                                        +91 95711 79677
                                    </a>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:border-accent-blue/30 transition-colors">
                                        <Mail size={16} className="text-accent-blue/70" />
                                    </div>
                                    <a href="mailto:support@stepwellsrenovaterfoundation.org" className="text-white/70 hover:text-white transition-colors text-[15px] break-all">
                                        support@stepwellsrenovater<wbr />foundation.org
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="relative z-10 border-t border-white/[0.06]">
                <div className="container mx-auto px-6 md:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-white/25 text-xs tracking-wider">
                            &copy; {new Date().getFullYear()} Stepwells Renovater Foundation. All rights reserved.
                        </p>
                        <p className="text-white/25 text-xs tracking-wider flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-blue/40" />
                            Built for Rajasthan's heritage
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
