"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Users, Upload, ChevronDown } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative w-full h-[100svh] min-h-[100svh] overflow-hidden bg-black mb-0">
            {/* Desktop Video */}
            <video
                src="/hero_video.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/mahamandirhero.jpeg"
                className="absolute inset-0 w-full h-[100svh] min-h-[100svh] object-cover z-0 scale-110 hidden md:block"
                aria-label="Cinematic restoration footage"
            />

            {/* Mobile Video */}
            <video
                src="/heromobile.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/mahamandirhero.jpeg"
                className="absolute inset-0 w-full h-[100svh] min-h-[100svh] object-cover z-0 md:hidden"
                aria-label="Cinematic restoration footage"
            />

            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

            {/* Content Layer */}
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-end md:justify-center text-center px-5 md:px-4 pb-8 md:pb-0">

                {/* Title Block */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="space-y-3 md:space-y-6 mb-8 md:mb-0"
                >
                    <h1 className="font-serif text-[2.75rem] leading-[1] sm:text-5xl md:text-7xl lg:text-9xl font-light tracking-tight text-white drop-shadow-2xl">
                        REVIVING <br className="hidden md:block" />
                        <span className="font-medium">RAJASTHAN</span>
                    </h1>

                    <p className="font-sans text-xs md:text-lg tracking-[0.2em] text-white/80 uppercase font-medium max-w-xl mx-auto">
                        Preserving Heritage • Restoring Water
                    </p>
                </motion.div>

                {/* Desktop Action Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="absolute bottom-20 hidden md:flex flex-col md:flex-row gap-6 items-center"
                >
                    <Link href="/donate">
                        <button className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-none">
                            <span className="relative z-10 text-white font-serif text-xl tracking-wider transition-colors duration-300 group-hover:text-black">
                                DONATE
                            </span>
                            <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ease-out" />
                            <div className="absolute inset-0 border border-white/40" />
                        </button>
                    </Link>

                    <Link href="/get-involved">
                        <button className="text-white/80 hover:text-white font-sans text-sm tracking-widest uppercase transition-colors px-6 py-4 border-b border-transparent hover:border-white/60">
                            Join the Movement
                        </button>
                    </Link>
                </motion.div>

                {/* Mobile Action Buttons — Glassmorphism with Icons */}
                <div className="w-full flex flex-col gap-3 items-center md:hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                        className="w-full max-w-xs"
                    >
                        <Link href="/donate" className="block">
                            <button className="w-full relative overflow-hidden bg-gradient-to-r from-accent-blue to-sky-400 text-white font-bold text-base tracking-wide rounded-2xl py-4 px-6 flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(14,165,233,0.4)] active:scale-[0.97] transition-transform duration-150">
                                <Heart size={20} className="fill-white" />
                                Donate Now
                                <div className="absolute inset-0 bg-white/10 opacity-0 active:opacity-100 transition-opacity" />
                            </button>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.6, ease: "easeOut" }}
                        className="w-full max-w-xs"
                    >
                        <Link href="/get-involved" className="block">
                            <button className="w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold text-base tracking-wide rounded-2xl py-4 px-6 flex items-center justify-center gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.2)] active:scale-[0.97] active:bg-white/20 transition-all duration-150">
                                <Users size={20} />
                                Volunteer
                            </button>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                        className="w-full max-w-xs"
                    >
                        <Link href="/upload-invoice" className="block">
                            <button className="w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold text-base tracking-wide rounded-2xl py-4 px-6 flex items-center justify-center gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.2)] active:scale-[0.97] active:bg-white/20 transition-all duration-150">
                                <Upload size={20} />
                                Upload Now
                            </button>
                        </Link>
                    </motion.div>
                </div>

                {/* Scroll Hint — Mobile */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="mt-5 md:hidden flex flex-col items-center gap-1"
                >
                    <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                        <ChevronDown size={16} className="text-white/40" />
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll Indicator — Desktop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:block"
            >
                <div className="w-[1px] h-12 bg-white/50" />
            </motion.div>
        </section>
    );
}
