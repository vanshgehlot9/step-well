"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Heart, MessageCircle, Send, Bookmark, Instagram, ArrowUpRight, Film, Camera, Users } from "lucide-react";

interface MediaItem {
    id: number;
    type: "reel" | "doc" | "community";
    category: string;
    title: string;
    caption: string;
    likes: string;
    views: string;
    thumbnail: string;
    year: string;
}

const allMedia: MediaItem[] = [
    // Reels
    { id: 1, type: "reel", category: "Field Work", title: "The Daily Clean", caption: "Volunteers pulling plastic waste from a 300-year-old baori. Bamboo sticks, bare hands, and pure determination.", likes: "1,247", views: "12.4K", year: "2024", thumbnail: "/media/reel-cleanup.png" },
    { id: 2, type: "reel", category: "Founder", title: "Meet Caron Rawnsley", caption: "The man who crossed oceans to save Jodhpur's forgotten stepwells. This is not a job — it's a calling.", likes: "3,892", views: "45.2K", year: "2024", thumbnail: "/media/reel-caron.png" },
    { id: 3, type: "reel", category: "Before & After", title: "Before: The Neglect", caption: "Centuries of heritage, buried under plastic. This is what we found. This is why we clean.", likes: "2,156", views: "28.7K", year: "2023", thumbnail: "/media/reel-before.png" },
    { id: 4, type: "reel", category: "Before & After", title: "After: The Revival", caption: "Same stepwell. Same stones. Different story. Water flows again where garbage once choked life.", likes: "5,431", views: "67.8K", year: "2024", thumbnail: "/media/reel-after.png" },

    // Documentaries
    { id: 5, type: "doc", category: "Short Film", title: "The First Clean", caption: "How it all started — one man, one stepwell, and a vision that sparked a movement across Rajasthan.", likes: "8,210", views: "120K", year: "2017", thumbnail: "/media/reel-cleanup.png" },
    { id: 6, type: "doc", category: "Interview", title: "Caron's Vision", caption: "An intimate conversation about heritage, duty, and what it means to restore something the world forgot.", likes: "4,567", views: "56.3K", year: "2023", thumbnail: "/media/reel-caron.png" },

    // Community
    { id: 7, type: "community", category: "Education", title: "Next Generation", caption: "These children will inherit clean stepwells, not garbage dumps. Education meets preservation.", likes: "4,102", views: "52.1K", year: "2024", thumbnail: "/media/reel-community.png" },
    { id: 8, type: "community", category: "Movement", title: "5000+ Strong", caption: "From 1 man to thousands. Every cleanup brings new faces, new energy, new hope for Rajasthan's water heritage.", likes: "6,789", views: "89.3K", year: "2024", thumbnail: "/media/reel-volunteers.png" },
    { id: 9, type: "community", category: "Recognition", title: "INTACH Acknowledgment", caption: "Official recognition from INTACH Jodhpur Chapter for voluntary cleaning of four historical water bodies without government support.", likes: "7,234", views: "95.6K", year: "2024", thumbnail: "/media/reel-after.png" },
];

const filters = [
    { label: "All", icon: Film, key: "all" },
    { label: "Reels", icon: Camera, key: "reel" },
    { label: "Documentaries", icon: Film, key: "doc" },
    { label: "Community", icon: Users, key: "community" },
];

export default function MediaPage() {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [filter, setFilter] = useState<"all" | "reel" | "doc" | "community">("all");

    const filteredMedia = filter === "all" ? allMedia : allMedia.filter(m => m.type === filter);
    const selectedItem = allMedia.find(m => m.id === selectedId);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-accent-blue selection:text-white relative overflow-hidden font-sans">
            {/* Texture */}

            <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#020617] to-black fixed pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 pt-32 pb-24 relative z-10">

                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-8 space-y-6">
                    <span className="text-accent-blue/80 font-sans text-xs tracking-[0.3em] uppercase font-bold border border-accent-blue/20 px-3 py-1 rounded-sm inline-block">
                        Build Reel • Digital Archive
                    </span>
                    <h1 className="text-6xl md:text-9xl font-serif font-light opacity-90 tracking-tighter select-none">
                        THE VAULT
                    </h1>
                    <p className="font-serif italic text-white/50 text-xl tracking-wide max-w-2xl mx-auto">
                        Raw, unfiltered footage from restoration sites. Every reel is a chapter of revival.
                    </p>
                </div>

                {/* Instagram Handle */}
                <div className="flex justify-center mb-12">
                    <a
                        href="https://www.instagram.com/stepwells_renovater"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-full px-5 py-2.5 hover:bg-white/10 transition-all duration-300"
                    >
                        <Instagram size={18} className="text-pink-400" />
                        <span className="text-white/60 text-sm font-medium">@stepwells_renovater</span>
                        <span className="text-white/30 text-xs">2,201 followers</span>
                        <ArrowUpRight size={14} className="text-white/30 group-hover:text-accent-blue transition-colors" />
                    </a>
                </div>

                {/* Filters */}
                <div className="flex justify-center gap-2 md:gap-6 mb-16 border-b border-white/10 pb-4">
                    {filters.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setFilter(item.key as typeof filter)}
                            className={`flex items-center gap-2 pb-4 px-3 text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${filter === item.key
                                ? "text-accent-blue border-b-2 border-accent-blue"
                                : "text-white/40 hover:text-white hover:border-b-2 hover:border-white/20"
                                }`}
                        >
                            <item.icon size={16} />
                            <span className="hidden md:inline">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-5xl mx-auto">
                    <AnimatePresence>
                        {filteredMedia.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                onClick={() => setSelectedId(item.id)}
                                className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer bg-white/5 border border-white/[0.06] hover:border-white/20 transition-all duration-500 shadow-2xl"
                            >
                                <Image
                                    src={item.thumbnail}
                                    alt={item.title}
                                    fill
                                    className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                                {/* Play Button */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-500">
                                        <Play size={22} fill="currentColor" className="ml-1" />
                                    </div>
                                </div>

                                {/* Category & Year Badges */}
                                <div className="absolute top-3 left-3">
                                    <span className="text-[9px] text-white/80 uppercase tracking-[0.15em] font-bold bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
                                        {item.category}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3 flex items-center gap-2">
                                    <span className="text-[9px] text-white/50 font-bold bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
                                        {item.year}
                                    </span>
                                    <span className="text-[9px] text-white/50 font-bold flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
                                        <Play size={8} fill="currentColor" /> {item.views}
                                    </span>
                                </div>

                                {/* Bottom Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-white font-serif text-lg md:text-xl leading-tight mb-1 group-hover:text-accent-blue transition-colors duration-300">
                                        {item.title}
                                    </h3>
                                    <p className="text-white/40 text-xs line-clamp-2 leading-relaxed hidden md:block">
                                        {item.caption}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-white/30 text-[10px]">
                                        <span className="flex items-center gap-1"><Heart size={10} /> {item.likes}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Instagram-Style Reel Modal */}
            <AnimatePresence>
                {selectedId && selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                        onClick={() => setSelectedId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-4 right-4 z-50 text-white/60 hover:text-white transition-colors p-2 bg-black/40 rounded-full backdrop-blur-md border border-white/10"
                            >
                                <X size={20} />
                            </button>

                            <Image src={selectedItem.thumbnail} alt={selectedItem.title} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                            {/* Right Side Social Actions */}
                            <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 text-white">
                                <button className="flex flex-col items-center gap-1">
                                    <Heart size={26} />
                                    <span className="text-[10px]">{selectedItem.likes}</span>
                                </button>
                                <button className="flex flex-col items-center gap-1">
                                    <MessageCircle size={26} />
                                    <span className="text-[10px]">48</span>
                                </button>
                                <button><Send size={26} /></button>
                                <button><Bookmark size={26} /></button>
                            </div>

                            {/* Bottom Caption */}
                            <div className="absolute bottom-0 left-0 right-16 p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-0.5">
                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                            <span className="text-[6px] font-bold text-white">SR</span>
                                        </div>
                                    </div>
                                    <span className="text-white text-xs font-bold">stepwells_renovater</span>
                                    <span className="text-accent-blue text-[10px] font-bold border border-accent-blue/30 px-2 py-0.5 rounded-md">Follow</span>
                                </div>
                                <p className="text-white/90 text-sm leading-relaxed">
                                    <span className="font-bold">stepwells_renovater</span>{" "}
                                    <span className="text-white/70">{selectedItem.caption}</span>
                                </p>
                                <p className="text-white/30 text-[10px] mt-2 uppercase tracking-wider">{selectedItem.views} views</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
