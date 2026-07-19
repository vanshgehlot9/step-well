"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Heart, ShoppingBag, Search } from "lucide-react";

const navLinks = [
    { name: "Initiative", href: "/get-involved" },
    { name: "Donate Now", href: "/donate" },
    { name: "Shop", href: "/shop" },
    { name: "Our Team", href: "/team" },
    { name: "Our Partner", href: "/partner" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (pathname?.startsWith("/admin") || pathname?.startsWith("/store-owner")) {
        return null;
    }

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 h-[80px] md:h-[90px] transition-all duration-500 bg-[#0D3B66]",
            scrolled ? "shadow-2xl shadow-black/20" : "border-b border-white/10"
        )}>
            <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 md:px-8 lg:px-12">
                {/* Logo - Aligned Left */}
                <Link href="/" className="flex items-center gap-3 z-50 shrink-0 group">
                    <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-full border border-white/20 shadow-sm transition-transform duration-500 group-hover:scale-105">
                        <img
                            src="/logo.jpeg"
                            alt="Stepwells Renovater Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="hidden sm:flex flex-col justify-center">
                        <div className="font-serif text-[1.1rem] md:text-[1.2rem] font-medium text-[#F8F6F1] tracking-wide leading-tight">
                            Stepwells <span className="text-[#D7C2A3]">Renovater</span>
                        </div>
                        <div className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-[#F8F6F1]/60 mt-0.5">
                            Heritage Conservation
                        </div>
                    </div>
                </Link>

                {/* Desktop Navigation - Centered */}
                <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 lg:gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "relative text-[0.9rem] font-medium tracking-wide transition-all duration-300 whitespace-nowrap",
                                pathname === link.href ? "text-[#F8F6F1]" : "text-[#F8F6F1]/70 hover:text-[#F8F6F1]"
                            )}
                        >
                            {link.name}
                            {pathname === link.href && (
                                <motion.div
                                    layoutId="navbar-indicator"
                                    className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#D7C2A3] rounded-t-full"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions - Aligned Right */}
                <div className="hidden md:flex items-center gap-5 shrink-0">
                    {/* Search Icon */}
                    <button className="text-[#F8F6F1]/70 hover:text-[#F8F6F1] transition-colors duration-300">
                        <Search size={20} />
                    </button>
                    {/* Wishlist Icon */}
                    <Link href="/wishlist" className="text-[#F8F6F1]/70 hover:text-[#F8F6F1] transition-colors duration-300">
                        <Heart size={20} />
                    </Link>
                    {/* Cart Icon */}
                    <Link href="/cart" className="text-[#F8F6F1]/70 hover:text-[#F8F6F1] transition-colors duration-300">
                        <ShoppingBag size={20} />
                    </Link>

                    {/* Upload Invoice Button */}
                    <Link
                        href="/upload-invoice"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D7C2A3]/40 bg-white/10 px-5 py-2.5 text-sm font-medium text-[#F8F6F1] backdrop-blur-sm transition-all duration-300 hover:bg-[#D7C2A3] hover:text-[#0D3B66] hover:border-[#D7C2A3] ml-2"
                    >
                        <Upload size={16} />
                        Upload Invoice
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-4 z-50">
                    {/* Mobile Cart/Search short links */}
                    <button className="text-[#F8F6F1]/80 hover:text-[#F8F6F1] transition-colors">
                        <Search size={20} />
                    </button>
                    <button
                        className="flex flex-col justify-center items-center w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={cn("block w-5 h-px bg-[#F8F6F1] transition-all duration-300", isOpen ? "rotate-45 translate-y-1" : "-translate-y-1")} />
                        <span className={cn("block w-5 h-px bg-[#F8F6F1] transition-all duration-300", isOpen ? "opacity-0" : "opacity-100")} />
                        <span className={cn("block w-5 h-px bg-[#F8F6F1] transition-all duration-300", isOpen ? "-rotate-45 -translate-y-1" : "translate-y-1")} />
                    </button>
                </div>

                {/* Mobile Navigation Overlay */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="absolute top-full left-0 right-0 border-b border-white/10 bg-[#0D3B66] p-6 shadow-2xl md:hidden"
                        >
                            <div className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={cn(
                                            "text-lg font-serif font-medium transition-all",
                                            pathname === link.href ? "text-[#F8F6F1]" : "text-[#F8F6F1]/70 hover:text-[#F8F6F1]"
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <Link
                                    href="/wishlist"
                                    className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-[#F8F6F1] transition-all hover:bg-white/10"
                                >
                                    <Heart size={16} /> Wishlist
                                </Link>
                                <Link
                                    href="/cart"
                                    className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-[#F8F6F1] transition-all hover:bg-white/10"
                                >
                                    <ShoppingBag size={16} /> Cart
                                </Link>
                            </div>
                            <div className="mt-4 flex flex-col gap-4">
                                <Link
                                    href="/upload-invoice"
                                    className="flex items-center justify-center gap-2 rounded-full border border-[#D7C2A3] bg-[#D7C2A3] px-6 py-3 text-center text-sm font-semibold text-[#0D3B66] shadow-lg transition-all hover:bg-[#B88445] hover:border-[#B88445]"
                                >
                                    <Upload size={18} /> Upload Invoice
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
