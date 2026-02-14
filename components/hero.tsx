"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative w-full h-screen overflow-hidden bg-black mb-0">
            {/* Background Layer - Pure Video, No Containers */}
            <video
                src="/hero_video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 scale-110"
                aria-label="Cinematic restoration footage"
            />

            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

            {/* Content Layer - Floating Editorial Typography */}
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-light tracking-tight text-white drop-shadow-2xl">
                        REVIVING <br className="hidden md:block" />
                        <span className="font-medium">RAJASTHAN</span>
                    </h1>

                    <p className="font-sans text-sm md:text-lg tracking-[0.2em] text-white/90 uppercase font-medium max-w-xl mx-auto">
                        Preserving Heritage • Restoring Water
                    </p>
                </motion.div>

                {/* Minimal Carved Action Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="absolute bottom-20 flex flex-col md:flex-row gap-6 items-center"
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
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
            >
                <div className="w-[1px] h-12 bg-white/50" />
            </motion.div>
        </section>
    );
}
