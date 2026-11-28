"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Instagram,
  Layers,
  Loader2,
  MapPin,
  Play,
  Star,
  X,
} from "lucide-react";
import { InitiativeFull, InitiativeImage, InitiativeVideo } from "@/lib/initiatives-types";
import { getPublishedInitiativesFull } from "@/lib/initiatives-services";
import { resolveInitiativeVideo } from "@/lib/video-embed";
import { InstagramReelEmbed } from "@/components/instagram-reel-embed";

function StepwellSketchIllustration() {
  return (
    <svg
      viewBox="0 0 360 155"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[340px] h-auto text-[#0D3B66]/25"
      aria-hidden="true"
    >
      <path d="M180 14 L180 22" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M150 42 C152 27 166 20 180 20 C194 20 208 27 210 42 Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M144 42 H216" stroke="currentColor" strokeWidth="1.4" />
      <path d="M146 47 H214" stroke="currentColor" strokeWidth="1" />
      <path d="M153 47 V86 M169 47 V86 M191 47 V86 M207 47 V86" stroke="currentColor" strokeWidth="1.2" />
      <path d="M153 59 Q161 50 169 59" stroke="currentColor" strokeWidth="1" />
      <path d="M169 59 Q180 48 191 59" stroke="currentColor" strokeWidth="1.1" />
      <path d="M191 59 Q199 50 207 59" stroke="currentColor" strokeWidth="1" />
      <path d="M72 62 H144 M216 62 H288" stroke="currentColor" strokeWidth="1.1" />
      <path d="M84 62 V94 M106 62 V94 M128 62 V94" stroke="currentColor" strokeWidth="1" />
      <path d="M84 74 Q95 66 106 74 M106 74 Q117 66 128 74" stroke="currentColor" strokeWidth="0.9" />
      <path d="M232 62 V94 M254 62 V94 M276 62 V94" stroke="currentColor" strokeWidth="1" />
      <path d="M232 74 Q243 66 254 74 M254 74 Q265 66 276 74" stroke="currentColor" strokeWidth="0.9" />
      <path d="M82 62 C85 52 94 49 101 52 C107 55 110 62 110 62" stroke="currentColor" strokeWidth="0.9" />
      <path d="M250 62 C253 52 262 49 269 52 C275 55 278 62 278 62" stroke="currentColor" strokeWidth="0.9" />
      <path d="M128 92 H232" stroke="currentColor" strokeWidth="1.2" />
      <path d="M114 102 H246" stroke="currentColor" strokeWidth="1.1" />
      <path d="M98 112 H262" stroke="currentColor" strokeWidth="1.1" />
      <path d="M82 122 H278" stroke="currentColor" strokeWidth="1.1" />
      <path d="M60 132 H300" stroke="currentColor" strokeWidth="1" />
      <path d="M156 92 V132 M168 102 V132 M192 102 V132 M204 92 V132" stroke="currentColor" strokeWidth="0.9" />
      <path d="M26 112 C34 94 52 94 60 112" stroke="currentColor" strokeWidth="0.9" />
      <path d="M300 112 C308 94 326 94 334 112" stroke="currentColor" strokeWidth="0.9" />
      <path d="M16 132 H344" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 4" />
    </svg>
  );
}

interface InitiativesShowcaseProps {
  id?: string;
  variant?: "section" | "page";
  showCategoryFilter?: boolean;
  maxOtherInitial?: number;
}

export default function InitiativesShowcase({
  id = "initiatives",
  variant = "section",
  showCategoryFilter = false,
  maxOtherInitial = 4,
}: InitiativesShowcaseProps) {
  const prefersReducedMotion = useReducedMotion();
  const [initiatives, setInitiatives] = useState<InitiativeFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(maxOtherInitial);

  const [lightboxImages, setLightboxImages] = useState<InitiativeImage[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoPlaylist, setVideoPlaylist] = useState<InitiativeVideo[] | null>(null);
  const [videoIndex, setVideoIndex] = useState(0);

  useEffect(() => {
    getPublishedInitiativesFull()
      .then((list) => setInitiatives(list))
      .catch((err) => console.warn("Failed loading initiatives:", err))
      .finally(() => setLoading(false));
  }, []);

  const featuredList = useMemo(() => {
    const marked = initiatives.filter((i) => i.is_featured);
    if (marked.length > 0) return marked;
    return initiatives.length > 0 ? [initiatives[0]] : [];
  }, [initiatives]);

  const activeFeatured =
    featuredList.length > 0 ? featuredList[featuredIndex % featuredList.length] : null;

  const remainingInitiatives = useMemo(() => {
    if (!activeFeatured) return [];
    return initiatives.filter((i) => i.id !== activeFeatured.id);
  }, [initiatives, activeFeatured]);

  const categories = useMemo(
    () => Array.from(new Set(remainingInitiatives.map((i) => i.category).filter(Boolean))),
    [remainingInitiatives]
  );

  const filteredOther = useMemo(() => {
    if (selectedCategory === "all") return remainingInitiatives;
    return remainingInitiatives.filter((i) => i.category === selectedCategory);
  }, [remainingInitiatives, selectedCategory]);

  const visibleOther = filteredOther.slice(0, visibleCount);

  const openLightbox = (imgs: InitiativeImage[], index = 0) => {
    if (!imgs.length) return;
    setLightboxImages(imgs);
    setLightboxIndex(index);
  };

  const openVideoModal = (vids: InitiativeVideo[], index = 0) => {
    if (!vids.length) return;
    setVideoPlaylist(vids);
    setVideoIndex(index);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxImages(null);
        setVideoPlaylist(null);
      }
      if (lightboxImages && lightboxImages.length > 1) {
        if (e.key === "ArrowRight") {
          setLightboxIndex((p) => (p + 1) % lightboxImages.length);
        }
        if (e.key === "ArrowLeft") {
          setLightboxIndex((p) => (p - 1 + lightboxImages.length) % lightboxImages.length);
        }
      }
      if (videoPlaylist && videoPlaylist.length > 1) {
        if (e.key === "ArrowRight") {
          setVideoIndex((p) => (p + 1) % videoPlaylist.length);
        }
        if (e.key === "ArrowLeft") {
          setVideoIndex((p) => (p - 1 + videoPlaylist.length) % videoPlaylist.length);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxImages, videoPlaylist]);

  const featuredHeroImage =
    activeFeatured?.images.find((i) => i.is_primary)?.image_url ||
    activeFeatured?.cover_image ||
    activeFeatured?.images[0]?.image_url ||
    "";

  const featuredVideos = activeFeatured?.videos || [];
  const featuredVideo = featuredVideos[0] || null;
  const featuredInstagram = activeFeatured?.links.find(
    (l) => l.platform === "instagram" && l.url
  );
  const featuredThumbs = activeFeatured ? activeFeatured.images.slice(0, 4) : [];
  const extraPhotoCount = activeFeatured ? Math.max(activeFeatured.images.length - 3, 0) : 0;

  const isPage = variant === "page";
  const HeadingTag = isPage ? "h1" : "h2";

  return (
    <section
      id={id}
      className={`bg-gradient-to-b from-white via-[#F0F9FF]/70 to-[#F8FAFC] relative overflow-hidden scroll-mt-24 ${
        isPage ? "min-h-screen pt-[80px] md:pt-[90px]" : "py-14 md:py-20 border-y border-surface-blue-dark"
      }`}
    >
      <div className="bg-stepwell-pattern opacity-70 absolute inset-0 pointer-events-none" />

      <div
        className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 ${
          isPage ? "py-10 md:py-14" : ""
        }`}
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-9 md:mb-11">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-accent-blue mb-2">
              OUR INITIATIVES
            </p>
            <HeadingTag className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-[#0D3B66] leading-[1.12] tracking-tight">
              People, Heritage and Nature in Action
            </HeadingTag>
            <p className="mt-3 text-primary-blue-light/75 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
              A collective effort to restore stepwells, revive natural resources and empower
              communities across Rajasthan.
            </p>
          </motion.div>

          <div className="hidden lg:flex justify-end shrink-0">
            <StepwellSketchIllustration />
          </div>
        </div>

        {/* Loading / Empty / Content */}
        {loading ? (
          <div className="bg-white/90 rounded-3xl border border-surface-blue-dark p-16 text-center shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent-blue mb-3" />
            <p className="text-sm text-primary-blue-light/70">Loading initiatives...</p>
          </div>
        ) : initiatives.length === 0 ? (
          <div className="bg-white rounded-3xl border border-surface-blue-dark p-12 text-center max-w-2xl mx-auto shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-[#0D3B66] mb-2">
              No Published Initiatives Yet
            </h3>
            <p className="text-sm text-primary-blue-light/75">
              Publish your Firestore rules and seed or publish initiatives from{" "}
              <Link href="/admin/initiatives" className="font-bold text-accent-blue underline">
                Admin → Initiatives
              </Link>{" "}
              to display them here.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Initiative */}
            {activeFeatured && (
              <div className="mb-10 md:mb-12">
                <motion.div
                  key={activeFeatured.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="bg-white rounded-[24px] md:rounded-[28px] border border-surface-blue-dark shadow-[0_14px_45px_rgba(13,59,102,0.07)] p-5 sm:p-7 lg:p-9"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_1.28fr] gap-7 lg:gap-9 items-center">
                    {/* Left Text */}
                    <div className="space-y-5">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-surface-blue border border-surface-blue-dark text-accent-blue text-[10px] font-bold uppercase tracking-[0.18em]">
                        <Star size={11} className="fill-current" />
                        FEATURED INITIATIVE
                      </span>

                      <div>
                        <h3 className="font-serif text-2xl sm:text-3xl lg:text-[2.2rem] font-bold text-[#0D3B66] leading-[1.15]">
                          {activeFeatured.title}
                        </h3>
                        {activeFeatured.subtitle && (
                          <p className="font-serif italic text-base sm:text-lg text-primary-blue-light/75 mt-1.5">
                            {activeFeatured.subtitle}
                          </p>
                        )}
                      </div>

                      <p className="text-primary-blue-light/80 text-sm sm:text-[15px] leading-relaxed">
                        {activeFeatured.short_description}
                      </p>

                      {/* Metadata */}
                      <div className="grid grid-cols-3 gap-3 py-4 border-y border-surface-blue-dark">
                        <div className="flex items-start gap-2 min-w-0">
                          <MapPin size={16} className="text-accent-blue shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-primary-blue-light/60">Location</p>
                            <p className="text-xs sm:text-sm font-bold text-[#0D3B66] truncate">
                              {activeFeatured.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 min-w-0">
                          <Layers size={16} className="text-accent-blue shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-primary-blue-light/60">Category</p>
                            <p className="text-xs sm:text-sm font-bold text-[#0D3B66] truncate">
                              {activeFeatured.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 min-w-0">
                          <Activity size={16} className="text-accent-blue shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-primary-blue-light/60">Status</p>
                            <p className="text-xs sm:text-sm font-bold text-[#0D3B66] truncate">
                              {activeFeatured.status}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Link
                          href={`/initiatives/${activeFeatured.slug}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0D3B66] hover:bg-accent-blue text-white text-xs sm:text-sm font-semibold px-6 py-3 transition-all shadow-sm"
                        >
                          Read Full Story <ArrowRight size={15} />
                        </Link>

                        {featuredVideos.length > 0 && (
                          <button
                            type="button"
                            onClick={() => openVideoModal(featuredVideos, 0)}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-surface-blue-dark bg-surface-blue/50 hover:border-accent-blue hover:bg-white text-[#0D3B66] text-xs sm:text-sm font-semibold px-5 py-3 transition-all"
                          >
                            <Play size={14} className="fill-current text-accent-blue" />
                            {featuredVideos.length > 1
                              ? `Watch Videos (${featuredVideos.length})`
                              : "Watch Video"}
                          </button>
                        )}

                        {featuredInstagram && (
                          <a
                            href={featuredInstagram.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            title={featuredInstagram.label || "Instagram"}
                            className="w-11 h-11 rounded-full border border-surface-blue-dark bg-surface-blue/50 hover:border-accent-blue hover:bg-white text-[#0D3B66] hover:text-accent-blue flex items-center justify-center transition-colors"
                          >
                            <Instagram size={18} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right: Main Image + Thumbnails */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_110px] md:grid-cols-[1fr_124px] gap-3">
                      <div
                        onClick={() => {
                          if (featuredVideos.length > 0) {
                            openVideoModal(featuredVideos, 0);
                          } else if (activeFeatured.images.length > 0) {
                            openLightbox(activeFeatured.images, 0);
                          }
                        }}
                        className="relative aspect-[16/11] sm:aspect-auto sm:h-[340px] md:h-[360px] rounded-2xl overflow-hidden bg-surface-blue border border-surface-blue-dark cursor-pointer group"
                      >
                        {featuredHeroImage ? (
                          <img
                            src={featuredHeroImage}
                            alt={activeFeatured.title}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary-blue-light/50 text-xs">
                            No photograph available
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B66]/35 via-transparent to-transparent pointer-events-none" />

                        {featuredVideos.length > 0 && (
                          <button
                            type="button"
                            aria-label="Play Initiative Video"
                            onClick={(e) => {
                              e.stopPropagation();
                              openVideoModal(featuredVideos, 0);
                            }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <span className="w-14 h-14 rounded-full bg-[#0D3B66]/70 backdrop-blur-sm border-2 border-white/80 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                              <Play size={22} className="fill-white ml-0.5" />
                            </span>
                          </button>
                        )}

                        {(featuredVideo?.duration_label ||
                          featuredVideos.length > 1 ||
                          (featuredVideo &&
                            resolveInitiativeVideo(featuredVideo.video_url).kind !== "direct")) && (
                          <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[#0D3B66]/85 text-white text-[11px] font-mono font-semibold backdrop-blur-sm inline-flex items-center gap-1.5">
                            {featuredVideo &&
                            resolveInitiativeVideo(featuredVideo.video_url).kind === "instagram" ? (
                              <>
                                <Instagram size={11} />
                                {featuredVideos.length > 1
                                  ? `${featuredVideos.length} Reels / Videos`
                                  : "Insta Reel"}
                              </>
                            ) : featuredVideos.length > 1 ? (
                              `${featuredVideos.length} Videos`
                            ) : (
                              featuredVideo?.duration_label || "YouTube Video"
                            )}
                          </span>
                        )}
                      </div>

                      {featuredThumbs.length > 0 && (
                        <div className="grid grid-cols-4 sm:grid-cols-1 gap-2.5 sm:h-[340px] md:h-[360px]">
                          {featuredThumbs.slice(0, 3).map((img, idx) => (
                            <button
                              key={img.id || idx}
                              type="button"
                              onClick={() => openLightbox(activeFeatured.images, idx)}
                              className="relative rounded-xl overflow-hidden bg-surface-blue aspect-square sm:aspect-auto sm:flex-1 border border-surface-blue-dark hover:border-accent-blue transition-colors group"
                            >
                              <img
                                src={img.image_url}
                                alt={img.alt_text || activeFeatured.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </button>
                          ))}

                          {activeFeatured.images.length > 3 && (
                            <button
                              type="button"
                              onClick={() => openLightbox(activeFeatured.images, 3)}
                              className="relative rounded-xl overflow-hidden bg-[#0D3B66] aspect-square sm:aspect-auto sm:flex-1 border border-surface-blue-dark group"
                            >
                              <img
                                src={activeFeatured.images[3].image_url}
                                alt="More initiative photos"
                                className="w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-[#0D3B66]/55 flex flex-col items-center justify-center text-white p-1">
                                <span className="text-sm sm:text-base font-bold leading-none">
                                  +{extraPhotoCount}
                                </span>
                                <span className="text-[10px] font-medium mt-0.5 leading-tight text-center">
                                  More Photos
                                </span>
                              </div>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {featuredList.length > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-5">
                    {featuredList.map((f, idx) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFeaturedIndex(idx)}
                        aria-label={`View featured initiative ${f.title}`}
                        className={`h-2 rounded-full transition-all ${
                          idx === featuredIndex % featuredList.length
                            ? "w-6 bg-[#0D3B66]"
                            : "w-2 bg-[#0D3B66]/25 hover:bg-accent-blue/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other Initiatives Grid */}
            {remainingInitiatives.length > 0 && (
              <div className="space-y-6">
                {showCategoryFilter && categories.length > 1 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("all");
                        setVisibleCount(maxOtherInitial);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                        selectedCategory === "all"
                          ? "bg-[#0D3B66] text-white border-[#0D3B66]"
                          : "bg-white text-primary-blue-light/80 border-surface-blue-dark hover:border-accent-blue"
                      }`}
                    >
                      All Initiatives
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setVisibleCount(maxOtherInitial);
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                          selectedCategory === cat
                            ? "bg-[#0D3B66] text-white border-[#0D3B66]"
                            : "bg-white text-primary-blue-light/80 border-surface-blue-dark hover:border-accent-blue"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {visibleOther.map((item, i) => {
                    const cardImg =
                      item.cover_image ||
                      item.images.find((im) => im.is_primary)?.image_url ||
                      item.images[0]?.image_url;

                    return (
                      <motion.div
                        key={item.id}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-30px" }}
                        transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.25) }}
                      >
                        <Link
                          href={`/initiatives/${item.slug}`}
                          className="group flex flex-col h-full bg-white rounded-2xl border border-surface-blue-dark overflow-hidden shadow-[0_6px_24px_rgba(13,59,102,0.05)] hover:shadow-[0_14px_34px_rgba(13,59,102,0.1)] hover:border-accent-blue/40 hover:-translate-y-1 transition-all duration-300"
                        >
                          <div className="aspect-[16/10] bg-surface-blue overflow-hidden relative">
                            {cardImg ? (
                              <img
                                src={cardImg}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-primary-blue-light/50">
                                Stepwells Renovater
                              </div>
                            )}
                          </div>

                          <div className="p-5 flex-1 flex flex-col">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h3 className="font-serif text-lg font-bold text-[#0D3B66] leading-snug group-hover:text-accent-blue transition-colors">
                                {item.title}
                              </h3>
                              <span className="w-8 h-8 rounded-full border border-surface-blue-dark bg-surface-blue/60 text-accent-blue group-hover:bg-[#0D3B66] group-hover:border-[#0D3B66] group-hover:text-white flex items-center justify-center shrink-0 transition-all">
                                <ArrowRight size={14} />
                              </span>
                            </div>

                            <p className="text-[11px] font-bold uppercase tracking-wider text-accent-blue mb-2">
                              {item.category}
                            </p>

                            <p className="text-xs sm:text-[13px] text-primary-blue-light/75 leading-relaxed line-clamp-3 mt-auto">
                              {item.short_description}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex justify-center pt-2 gap-3">
                  {!isPage && (
                    <Link
                      href="/initiatives"
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-[#0D3B66] text-[#0D3B66] hover:bg-[#0D3B66] hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Explore All Initiatives <ArrowRight size={14} />
                    </Link>
                  )}

                  {isPage && filteredOther.length > visibleCount && (
                    <button
                      type="button"
                      onClick={() => setVisibleCount((c) => c + 8)}
                      className="px-7 py-3 rounded-full border border-[#0D3B66] text-[#0D3B66] hover:bg-[#0D3B66] hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Load More Initiatives
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImages && lightboxImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImages(null)}
            className="fixed inset-0 z-[200] bg-black/92 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div onClick={(e) => e.stopPropagation()} className="relative max-w-5xl w-full">
              <button
                type="button"
                onClick={() => setLightboxImages(null)}
                aria-label="Close gallery"
                className="absolute -top-11 right-0 text-white/75 hover:text-white inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
              >
                Close <X size={16} />
              </button>

              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black">
                <img
                  src={lightboxImages[lightboxIndex].image_url}
                  alt={lightboxImages[lightboxIndex].alt_text || "Initiative photo"}
                  className="w-full h-full object-contain"
                />
              </div>

              {lightboxImages[lightboxIndex].caption && (
                <p className="text-white/80 text-sm text-center mt-4 font-serif">
                  {lightboxImages[lightboxIndex].caption}
                </p>
              )}
              <p className="text-white/40 text-xs text-center mt-1">
                {lightboxIndex + 1} / {lightboxImages.length}
              </p>

              {lightboxImages.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() =>
                      setLightboxIndex(
                        (p) => (p - 1 + lightboxImages.length) % lightboxImages.length
                      )
                    }
                    className="absolute top-1/2 left-2 md:-left-14 -translate-y-1/2 p-3 rounded-full bg-black/50 border border-white/20 text-white hover:bg-black/80"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() =>
                      setLightboxIndex((p) => (p + 1) % lightboxImages.length)
                    }
                    className="absolute top-1/2 right-2 md:-right-14 -translate-y-1/2 p-3 rounded-full bg-black/50 border border-white/20 text-white hover:bg-black/80"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video & Reel Playlist Modal */}
      <AnimatePresence>
        {videoPlaylist && videoPlaylist[videoIndex] && (() => {
          const currentVideo = videoPlaylist[videoIndex];
          const resolved = resolveInitiativeVideo(currentVideo.video_url, true);
          const isInsta = resolved.kind === "instagram";
          const hasMultiple = videoPlaylist.length > 1;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVideoPlaylist(null)}
              className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: isInsta ? "400px" : "820px",
                  maxHeight: "88vh",
                }}
                className={`relative w-full flex flex-col ${
                  isInsta ? "bg-white border-surface-blue-dark" : "bg-[#070F1C] border-white/15"
                } rounded-2xl overflow-hidden border shadow-2xl`}
              >
                {/* Minimal Header */}
                <div
                  className={`px-4 py-3 flex items-center justify-between gap-2 border-b shrink-0 ${
                    isInsta
                      ? "border-surface-blue-dark text-[#0D3B66] bg-[#F8FAFC]"
                      : "border-white/10 text-white"
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    {isInsta ? (
                      <Instagram size={15} className="text-pink-600 shrink-0" />
                    ) : (
                      <Play size={14} className="text-accent-blue shrink-0 fill-current" />
                    )}
                    <p className="font-serif text-sm sm:text-base font-semibold truncate">
                      {currentVideo.title || (isInsta ? "Instagram Reel" : "Initiative Video")}
                    </p>
                    {hasMultiple && (
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                          isInsta
                            ? "bg-surface-blue text-[#0D3B66] border border-surface-blue-dark"
                            : "bg-white/10 text-white/80"
                        }`}
                      >
                        {videoIndex + 1}/{videoPlaylist.length}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {hasMultiple && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setVideoIndex(
                              (p) => (p - 1 + videoPlaylist.length) % videoPlaylist.length
                            )
                          }
                          aria-label="Previous video"
                          className={`p-1.5 rounded-lg border ${
                            isInsta
                              ? "border-surface-blue-dark hover:bg-surface-blue text-[#0D3B66]"
                              : "border-white/15 hover:bg-white/10 text-white"
                          }`}
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setVideoIndex((p) => (p + 1) % videoPlaylist.length)
                          }
                          aria-label="Next video"
                          className={`p-1.5 rounded-lg border ${
                            isInsta
                              ? "border-surface-blue-dark hover:bg-surface-blue text-[#0D3B66]"
                              : "border-white/15 hover:bg-white/10 text-white"
                          }`}
                        >
                          <ChevronRight size={15} />
                        </button>
                      </>
                    )}
                    {isInsta && (
                      <a
                        href={resolved.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open on Instagram"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-blue border border-surface-blue-dark text-[11px] font-semibold text-[#0D3B66] hover:border-accent-blue"
                      >
                        Open <ExternalLink size={11} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setVideoPlaylist(null)}
                      aria-label="Close video player"
                      className={`p-1.5 rounded-lg ${
                        isInsta ? "hover:bg-surface-blue-dark/60" : "hover:bg-white/10"
                      }`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Minimal Switcher Tabs */}
                {hasMultiple && (
                  <div
                    className={`px-4 py-2 flex items-center gap-1.5 overflow-x-auto border-b shrink-0 ${
                      isInsta
                        ? "bg-white border-surface-blue-dark"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    {videoPlaylist.map((vid, idx) => {
                      const vidKind = resolveInitiativeVideo(vid.video_url).kind;
                      const isActive = idx === videoIndex;
                      return (
                        <button
                          key={vid.id || idx}
                          type="button"
                          onClick={() => setVideoIndex(idx)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 transition-all border ${
                            isActive
                              ? "bg-[#0D3B66] text-white border-[#0D3B66]"
                              : isInsta
                              ? "bg-surface-blue/50 text-[#0D3B66] border-surface-blue-dark hover:border-accent-blue"
                              : "bg-white/10 text-white/80 border-white/15 hover:bg-white/20"
                          }`}
                        >
                          {vidKind === "instagram" ? (
                            <Instagram size={11} className={isActive ? "text-pink-300" : "text-pink-600"} />
                          ) : (
                            <Play size={10} className="fill-current" />
                          )}
                          <span>
                            {idx + 1}. {vid.title || (vidKind === "instagram" ? "Reel" : "Video")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {isInsta ? (
                  <div className="w-full overflow-y-auto bg-[#F8FAFC] p-3">
                    <InstagramReelEmbed
                      key={currentVideo.id || currentVideo.video_url}
                      embedUrl={resolved.embedUrl}
                      externalUrl={resolved.externalUrl}
                      title={currentVideo.title || "Instagram Reel"}
                      compact
                      showExternalLink={false}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-black">
                    {resolved.kind === "youtube" ? (
                      <iframe
                        key={currentVideo.id || currentVideo.video_url}
                        src={resolved.embedUrl}
                        className="w-full h-full"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        title={currentVideo.title || "Initiative video"}
                      />
                    ) : (
                      <video
                        key={currentVideo.id || currentVideo.video_url}
                        src={currentVideo.video_url}
                        controls
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}
