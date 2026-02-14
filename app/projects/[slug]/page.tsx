"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// ============================================================
// 📝 PROJECT DATA — Add/edit project details here
// Each project has a slug (URL), info, and a gallery of images/videos.
// To add more media, simply add entries to the `gallery` array.
// ============================================================
interface GalleryItem {
    type: "image" | "video";
    src: string;
    caption: string;
}

interface ProjectData {
    slug: string;
    title: string;
    location: string;
    year: string;
    heroImage: string;
    description: string;
    longDescription: string;
    stats: { label: string; value: string }[];
    gallery: GalleryItem[];
}

const projects: ProjectData[] = [
    {
        slug: "toorji-ka-jhalra",
        title: "Toorji Ka Jhalra",
        location: "Jodhpur, Rajasthan",
        year: "2020 – Present",
        heroImage: "/toorji.jpg",
        description: "Once buried under trash, now Jodhpur's most vibrant urban space. A testament to what's possible.",
        longDescription:
            "Toorji Ka Jhalra, built in the 1740s by the Queen Consort of Maharaja Abhay Singh, is one of Jodhpur's most iconic stepwells. For decades, it lay forgotten — choked with plastic, debris, and sewage. Our team began the monumental task of cleaning and restoring this architectural marvel, removing tons of waste and revealing the stunning carved stone steps beneath. Today, it stands as a beacon of what community-led restoration can achieve, attracting visitors from around the world and serving as a living monument to Rajasthani water heritage.",
        stats: [
            { label: "Depth", value: "15m" },
            { label: "Steps Restored", value: "200+" },
            { label: "Volunteers", value: "500+" },
        ],
        gallery: [
            { type: "image", src: "/toorji.jpg", caption: "Toorji Ka Jhalra after restoration — the carved steps revealed" },
            // ADD MORE IMAGES/VIDEOS HERE:
            // { type: "image", src: "/toorji-before.jpg", caption: "Before: Buried under decades of waste" },
            // { type: "video", src: "/videos/toorji-cleanup.mp4", caption: "Time-lapse of the cleanup process" },
        ],
    },
    {
        slug: "mahamandir-bawri",
        title: "Mahamandir Bawri",
        location: "Jodhpur, Rajasthan",
        year: "2021 – Present",
        heroImage: "/mahamandirhero.jpeg",
        description: "A hidden gem restored to its former glory. The water is now clean enough for aquatic life.",
        longDescription:
            "Mahamandir Bawri, nestled near the famous Mahamandir temple, was once a thriving water source and community gathering place. Over the years, it became a dumping ground, its waters toxic and its steps crumbling. Through relentless volunteer effort, we cleared the debris, repaired the stonework, and revived the ecosystem. Today, fish swim in its waters again — a powerful symbol of renewal. The bawri now serves as an educational site where visitors can learn about traditional Rajasthani water harvesting systems.",
        stats: [
            { label: "Waste Cleared", value: "30 Tons" },
            { label: "Volunteers", value: "300+" },
            { label: "Duration", value: "18 Months" },
        ],
        gallery: [
            { type: "image", src: "/mahamandirhero.jpeg", caption: "Mahamandir Bawri — the grand entrance restored" },
            { type: "image", src: "/mahamandir.jpeg", caption: "Detailed stonework and water level after restoration" },
            // ADD MORE IMAGES/VIDEOS HERE:
            // { type: "video", src: "/videos/mahamandir-timelapse.mp4", caption: "Restoration time-lapse over 18 months" },
        ],
    },
    {
        slug: "trivedi-sukhdev-ji-ka-jhalra",
        title: "Trivedi Sukhdev Ji Ka Jhalra",
        location: "Jodhpur, Rajasthan",
        year: "2023 – Present",
        heroImage: "/sukhdev.PNG",
        description: "A historic stepwell reclaimed from neglect, its intricate stonework and sacred waters revived for the community.",
        longDescription:
            "Trivedi Sukhdev Ji Ka Jhalra is a testament to the craftsmanship of Rajasthani artisans. Its intricate carvings and deep stepped corridors were hidden under layers of waste and overgrowth. Our restoration effort focused on carefully clearing debris while preserving the delicate stonework. The stepwell's sacred waters have been revived, and it now stands as a quiet sanctuary amidst the bustle of modern Jodhpur — a place where history speaks through stone and water.",
        stats: [
            { label: "Heritage Age", value: "200+ Years" },
            { label: "Volunteers", value: "150+" },
            { label: "Status", value: "Ongoing" },
        ],
        gallery: [
            { type: "image", src: "/sukhdev.PNG", caption: "Trivedi Sukhdev Ji Ka Jhalra — the stepwell reclaimed" },
            // ADD MORE IMAGES/VIDEOS HERE:
            // { type: "image", src: "/sukhdev-detail.jpg", caption: "Stonework details up close" },
            // { type: "video", src: "/videos/sukhdev-volunteers.mp4", caption: "Volunteers in action at the site" },
        ],
    },
];

// ============================================================
// Gallery Lightbox Component
// ============================================================
function GalleryLightbox({
    items,
    currentIndex,
    onClose,
    onNext,
    onPrev,
}: {
    items: GalleryItem[];
    currentIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}) {
    const item = items[currentIndex];
    return (
        <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="relative max-w-5xl w-full max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white/60 hover:text-white text-sm uppercase tracking-widest font-bold transition-colors"
                >
                    Close ✕
                </button>

                {/* Media */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10">
                    {item.type === "video" ? (
                        <video
                            src={item.src}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <img
                            src={item.src}
                            alt={item.caption}
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>

                {/* Caption */}
                <p className="text-white/60 text-sm text-center mt-4 font-serif italic">{item.caption}</p>
                <p className="text-white/30 text-xs text-center mt-1">
                    {currentIndex + 1} of {items.length}
                </p>

                {/* Nav arrows */}
                {items.length > 1 && (
                    <>
                        <button
                            onClick={onPrev}
                            className="absolute top-1/2 -left-4 md:-left-14 -translate-y-1/2 p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={onNext}
                            className="absolute top-1/2 -right-4 md:-right-14 -translate-y-1/2 p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ============================================================
// Project Detail Page
// ============================================================
export default function ProjectDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const project = projects.find((p) => p.slug === slug);

    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    if (!project) {
        return (
            <div className="min-h-screen bg-primary-blue flex items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-serif font-bold">Project Not Found</h1>
                    <p className="text-white/60">The restoration project you're looking for doesn't exist.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-accent-blue hover:text-white transition-colors text-sm uppercase tracking-widest font-bold mt-4"
                    >
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
                <img
                    src={project.heroImage}
                    alt={project.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-blue via-primary-blue/40 to-transparent" />

                {/* Back Button */}
                <Link
                    href="/"
                    className="absolute top-8 left-6 md:left-12 z-20 inline-flex items-center gap-2 text-white/70 hover:text-white text-sm uppercase tracking-widest font-bold transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
                >
                    <ArrowLeft size={16} /> Back
                </Link>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
                    <div className="container mx-auto">
                        <div className="flex items-center gap-3 mb-4 text-white/60 text-sm">
                            <span className="flex items-center gap-1.5">
                                <MapPin size={14} /> {project.location}
                            </span>
                            <span className="text-white/20">|</span>
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} /> {project.year}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-serif font-bold text-white tracking-tight">
                            {project.title}
                        </h1>
                        <p className="text-white/80 text-lg md:text-xl mt-4 max-w-2xl font-serif italic">
                            {project.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-primary-blue py-8 border-t border-white/10">
                <div className="container mx-auto px-6">
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                        {project.stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <p className="text-3xl md:text-4xl font-serif font-bold text-accent-blue">{stat.value}</p>
                                <p className="text-white/50 text-xs uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 md:py-20 bg-surface-blue">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-blue mb-8">
                            The Story
                        </h2>
                        <p className="text-primary-blue-light/80 text-lg leading-relaxed whitespace-pre-line">
                            {project.longDescription}
                        </p>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-blue">
                                Gallery
                            </h2>
                            <span className="text-primary-blue-light/40 text-sm">
                                {project.gallery.length} {project.gallery.length === 1 ? "item" : "items"}
                            </span>
                        </div>

                        {/* Gallery Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {project.gallery.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => setLightboxIndex(index)}
                                    className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer bg-surface-blue border border-surface-blue-dark hover:shadow-xl transition-all duration-500"
                                >
                                    {item.type === "video" ? (
                                        <video
                                            src={item.src}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            muted
                                        />
                                    ) : (
                                        <img
                                            src={item.src}
                                            alt={item.caption}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-primary-blue/0 group-hover:bg-primary-blue/40 flex items-center justify-center transition-all duration-300">
                                        <span className="text-white opacity-0 group-hover:opacity-100 text-xs uppercase tracking-widest font-bold transition-opacity duration-300">
                                            {item.type === "video" ? "▶ Play Video" : "View"}
                                        </span>
                                    </div>

                                    {/* Video Badge */}
                                    {item.type === "video" && (
                                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md border border-white/10">
                                            Video
                                        </div>
                                    )}

                                    {/* Caption */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <p className="text-white/90 text-xs line-clamp-1">{item.caption}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {project.gallery.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-primary-blue-light/40 text-lg font-serif italic">
                                    Gallery coming soon — more images and videos are being documented.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-primary-blue text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                        Want to help restore our heritage?
                    </h2>
                    <p className="text-white/60 mb-8 max-w-lg mx-auto">
                        Join our volunteer network and be part of the next cleanup drive.
                    </p>
                    <Link
                        href="/get-involved"
                        className="inline-flex items-center gap-2 bg-accent-blue text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-accent-blue/90 transition-all duration-300"
                    >
                        <Users size={16} /> Get Involved
                    </Link>
                </div>
            </section>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <GalleryLightbox
                    items={project.gallery}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onPrev={() =>
                        setLightboxIndex((prev) =>
                            prev !== null ? (prev - 1 + project.gallery.length) % project.gallery.length : 0
                        )
                    }
                    onNext={() =>
                        setLightboxIndex((prev) =>
                            prev !== null ? (prev + 1) % project.gallery.length : 0
                        )
                    }
                />
            )}
        </div>
    );
}
