"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Volume2, VolumeX, Instagram, ArrowUpRight, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

// ============================================================
// 🎬 REEL DATA — Add your reels here
//
// HOW TO ADD A REEL:
// 1. Download your Instagram reel as MP4
// 2. Place it in /public/reels/ (e.g. /public/reels/my-reel.mp4)
// 3. Add a thumbnail image in /public/reels/ (e.g. /public/reels/my-reel-thumb.jpg)
// 4. Add an entry to the array below
// ============================================================
interface ReelItem {
    id: number;
    /** Path to the MP4 video file in /public */
    videoSrc: string;
    /** Path to the thumbnail/poster image in /public */
    thumbnail: string;
    title: string;
    caption: string;
    category: string;
    /** Optional: link to the original Instagram reel */
    instagramUrl?: string;
}

const reels: ReelItem[] = [
    {
        id: 1,
        videoSrc: "/reels/1st.mp4",
        thumbnail: "/toorji.jpg",
        title: "The Daily Clean",
        caption: "Volunteers pulling plastic waste from a 300-year-old baori. Bamboo sticks, bare hands, and pure determination.",
        category: "Field Work",
    },
    {
        id: 2,
        videoSrc: "/reels/2nd.mp4",
        thumbnail: "/story.jpeg",
        title: "Meet Caron Rawnsley",
        caption: "The man who crossed oceans to save Jodhpur's forgotten stepwells. This is not a job — it's a calling.",
        category: "Founder",
        instagramUrl: "https://www.instagram.com/reel/DBQ_BLpt4Th/",
    },
    {
        id: 3,
        videoSrc: "/reels/3rd.mp4",
        thumbnail: "/mahamandirhero.jpeg",
        title: "Before: The Neglect",
        caption: "Centuries of heritage, buried under plastic. This is what we found. This is why we clean.",
        category: "Before & After",
    },
    {
        id: 4,
        videoSrc: "/reels/4th.mp4",
        thumbnail: "/mahamandir.jpeg",
        title: "After: The Revival",
        caption: "Same stepwell. Same stones. Different story. Water flows again where garbage once choked life.",
        category: "Before & After",
    },
];

// ============================================================
// Custom Video Player Card
// ============================================================
function ReelCard({ reel, onExpand, paused }: { reel: ReelItem; onExpand: () => void; paused?: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [hasVideo, setHasVideo] = useState(true);

    // Pause when modal opens (paused prop)
    useEffect(() => {
        if (paused && videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
        }
    }, [paused]);

    const togglePlay = async () => {
        if (!videoRef.current || paused) return;
        try {
            if (videoRef.current.paused) {
                await videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        } catch (err) {
            console.log("Video play error:", err);
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    return (
        <div className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-white/[0.08] hover:border-white/20 transition-all duration-500 shadow-2xl">
            {/* Video — no poster, shows actual first frame */}
            {hasVideo ? (
                <video
                    ref={videoRef}
                    src={reel.videoSrc}
                    className="absolute inset-0 w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onError={() => setHasVideo(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />
            ) : (
                <img
                    src={reel.thumbnail}
                    alt={reel.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}

            {/* Subtle gradient for controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Top-right controls */}
            <div className="absolute top-3 right-3 z-30 flex gap-2">
                {hasVideo && (
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                        className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-black/70 transition-all duration-300 opacity-0 group-hover:opacity-100"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onExpand(); }}
                    className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-black/70 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    aria-label="Expand"
                >
                    <Maximize2 size={14} />
                </button>
            </div>

            {/* Center play/pause button */}
            <button
                onClick={togglePlay}
                className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
            >
                <div className={`w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white transition-all duration-500 ${isPlaying ? "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100" : "opacity-100 scale-100"}`}>
                    {isPlaying ? (
                        <Pause size={24} fill="currentColor" />
                    ) : (
                        <Play size={24} fill="currentColor" className="ml-1" />
                    )}
                </div>
            </button>
        </div>
    );
}

// ============================================================
// Main Component
// ============================================================
export default function MediaArchive() {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const modalVideoRef = useRef<HTMLVideoElement>(null);
    const [modalPlaying, setModalPlaying] = useState(false);
    const [modalMuted, setModalMuted] = useState(true);
    const [modalHasVideo, setModalHasVideo] = useState(true);

    const selectedReel = reels.find(r => r.id === selectedId);

    // Auto-play modal video after a small delay for buffering
    useEffect(() => {
        if (!selectedId) {
            setModalPlaying(false);
            return;
        }
        setModalHasVideo(true);
        // Small delay to let the video element mount and buffer
        const timer = setTimeout(() => {
            if (modalVideoRef.current) {
                modalVideoRef.current.currentTime = 0;
                modalVideoRef.current.play().catch(() => { });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [selectedId]);

    const scroll = useCallback((direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 340;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    }, []);

    const toggleModalPlay = async () => {
        if (!modalVideoRef.current) return;
        try {
            if (modalVideoRef.current.paused) {
                await modalVideoRef.current.play();
            } else {
                modalVideoRef.current.pause();
            }
        } catch (err) {
            console.log("Modal play error:", err);
        }
    };

    const toggleModalMute = () => {
        if (!modalVideoRef.current) return;
        modalVideoRef.current.muted = !modalMuted;
        setModalMuted(!modalMuted);
    };

    return (
        <section className="py-32 bg-gradient-to-b from-primary-blue via-[#020617] to-black relative overflow-hidden" id="archive">
            {/* Texture */}


            <div className="container mx-auto px-4 md:px-6 relative z-10">

                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-6 space-y-6">
                    <span className="text-accent-blue/80 font-sans text-[10px] tracking-[0.3em] uppercase font-bold border border-accent-blue/20 px-3 py-1 rounded-sm inline-block">
                        From Our Reels
                    </span>
                    <h2 className="text-6xl md:text-9xl font-serif font-light text-white opacity-90 tracking-tighter select-none">
                        BUILD REEL
                    </h2>
                    <p className="font-serif italic text-white/50 text-xl tracking-wide max-w-2xl mx-auto">
                        Raw, unfiltered stories from the field. Every reel is a chapter of revival.
                    </p>
                </div>

                {/* Instagram Handle */}
                <div className="flex justify-center mb-16">
                    <a
                        href="https://www.instagram.com/stepwells_renovater"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-full px-5 py-2.5 hover:bg-white/10 transition-all duration-300"
                    >
                        <Instagram size={18} className="text-pink-400" />
                        <span className="text-white/60 text-sm font-medium">@stepwells_renovater</span>
                        <ArrowUpRight size={14} className="text-white/30 group-hover:text-accent-blue transition-colors" />
                    </a>
                </div>

                {/* Scroll Navigation Arrows (Desktop) */}
                <div className="hidden md:flex justify-end gap-2 mb-6 max-w-6xl mx-auto">
                    <button
                        onClick={() => scroll("left")}
                        className="p-2.5 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="p-2.5 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Reels Horizontal Scroll */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory max-w-6xl mx-auto"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {reels.map((reel, index) => (
                        <motion.div
                            key={reel.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className="relative flex-shrink-0 w-[280px] md:w-[310px] snap-center"
                        >
                            <ReelCard reel={reel} onExpand={() => setSelectedId(reel.id)} paused={selectedId !== null} />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Expanded Reel Modal */}
            <AnimatePresence>
                {selectedId && selectedReel && (
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
                            className="relative w-full max-w-md aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-4 right-4 z-50 text-white/60 hover:text-white transition-colors p-2 bg-black/60 rounded-full backdrop-blur-md border border-white/10"
                            >
                                <X size={20} />
                            </button>

                            {/* Video or Thumbnail */}
                            {modalHasVideo ? (
                                <video
                                    ref={modalVideoRef}
                                    src={selectedReel.videoSrc}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    loop
                                    muted={modalMuted}
                                    playsInline
                                    preload="auto"
                                    onError={() => setModalHasVideo(false)}
                                    onPlay={() => setModalPlaying(true)}
                                    onPause={() => setModalPlaying(false)}
                                />
                            ) : (
                                <img
                                    src={selectedReel.thumbnail}
                                    alt={selectedReel.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}

                            {/* Dark gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                            {/* Center Play/Pause */}
                            <button
                                onClick={toggleModalPlay}
                                className="absolute inset-0 z-10 flex items-center justify-center"
                            >
                                <div className={`w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-500 ${modalPlaying ? "opacity-0 hover:opacity-100 scale-90 hover:scale-100" : "opacity-100 scale-100"}`}>
                                    {modalPlaying ? (
                                        <Pause size={30} fill="currentColor" />
                                    ) : (
                                        <Play size={30} fill="currentColor" className="ml-1" />
                                    )}
                                </div>
                            </button>

                            {/* Modal Controls (top-right) */}
                            <div className="absolute top-4 left-4 z-40 flex gap-2">
                                <button
                                    onClick={toggleModalMute}
                                    className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-black/70 transition-all duration-300"
                                >
                                    {modalMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                </button>
                            </div>

                            {/* Bottom Info */}
                            <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-0.5">
                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                            <span className="text-[6px] font-bold text-white">SR</span>
                                        </div>
                                    </div>
                                    <span className="text-white text-xs font-bold">stepwells_renovater</span>
                                    <span className="text-[9px] text-white/50 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-md">{selectedReel.category}</span>
                                </div>
                                <p className="text-white/70 text-sm leading-relaxed line-clamp-2">{selectedReel.caption}</p>
                                {selectedReel.instagramUrl && (
                                    <a
                                        href={selectedReel.instagramUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-accent-blue/80 text-[10px] uppercase tracking-widest font-bold mt-3 pointer-events-auto hover:text-accent-blue transition-colors"
                                    >
                                        <Instagram size={12} /> View on Instagram <ArrowUpRight size={10} />
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
