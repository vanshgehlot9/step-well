"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Volunteer Now", href: "/get-involved" },
    { name: "Shop", href: "/shop" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <header
            className={cn(
                "fixed top-4 md:top-6 left-0 right-0 z-50 transition-all duration-300 mx-auto w-[95%] md:max-w-5xl rounded-full border border-white/10 shadow-2xl backdrop-blur-md",
                scrolled
                    ? "bg-primary-blue/90 py-3"
                    : "bg-primary-blue/60 py-3 md:py-4"
            )}
        >
            <div className="px-6 flex items-center justify-between w-full h-full">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 z-50">
                    <div className="relative w-10 h-10 overflow-hidden rounded-full border border-white/20 shadow-sm">
                        <img
                            src="/logo.jpeg"
                            alt="Stepwells Renovater Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="font-serif text-2xl font-bold text-white transition-colors hidden sm:block">
                        Stepwells<span className="text-accent-blue">Renovater</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-accent-blue",
                                pathname === link.href ? "text-white font-bold" : "text-white/80"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link href="/donate">
                        <Button variant="primary" size="sm" className="bg-accent-blue hover:bg-accent-blue-light text-white border-none shadow-lg shadow-accent-blue/20 rounded-full px-6">
                            Donate Now
                        </Button>
                    </Link>
                    <Link href="/upload-invoice" className="relative p-2 transition-colors hover:text-accent-blue text-white" title="Upload Invoice">
                        <Upload size={20} />
                    </Link>
                    <Link href="/cart" className="relative p-2 transition-colors hover:text-accent-blue text-white">
                        <ShoppingBag size={20} />
                    </Link>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden z-50 text-white"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Mobile Navigation Overlay */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="absolute top-full left-0 right-0 mt-4 bg-primary-blue/95 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center justify-center gap-8 shadow-2xl border border-white/10 overflow-hidden"
                        >
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "text-2xl font-serif font-medium hover:text-accent-blue transition-colors",
                                        pathname === link.href ? "text-white font-bold" : "text-white/80"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link href="/donate" className="mt-4 w-full">
                                <Button variant="primary" size="lg" className="w-full bg-accent-blue hover:bg-accent-blue-light text-white rounded-full">
                                    Donate Now
                                </Button>
                            </Link>
                            <Link href="/upload-invoice" className="text-xl flex items-center gap-2 text-white hover:text-accent-blue transition-colors">
                                <Upload size={24} /> Upload Invoice
                            </Link>
                            <Link href="/cart" className="text-xl flex items-center gap-2 text-white hover:text-accent-blue transition-colors">
                                <ShoppingBag size={24} /> Cart
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
