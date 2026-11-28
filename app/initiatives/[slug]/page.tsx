"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { InitiativeFull, InitiativeImage } from "@/lib/initiatives-types";
import {
  getInitiativeBySlugAdmin,
  getPublishedInitiativeBySlug,
  getPublishedInitiativesFull,
} from "@/lib/initiatives-services";
import { resolveInitiativeVideo } from "@/lib/video-embed";
import { InstagramReelEmbed } from "@/components/instagram-reel-embed";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  Instagram,
  Layers,
  Loader2,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function renderStoryBlocks(text: string) {
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={idx} className="font-serif text-2xl font-bold text-[#0D3B66] mt-8 mb-3">
          {trimmed.replace(/^##\s+/, "")}
        </h2>
      );
    }

    if (trimmed.split("\n").every((line) => line.trim().startsWith("- "))) {
      return (
        <ul key={idx} className="list-disc pl-6 space-y-2 text-[#1E293B] text-base md:text-lg leading-relaxed mb-6">
          {trimmed.split("\n").map((line, li) => (
            <li key={li}>{line.trim().replace(/^-\s+/, "")}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={idx} className="text-[#1E293B] text-base md:text-lg leading-[1.85] mb-6 last:mb-0">
        {trimmed}
      </p>
    );
  });
}

export default function InitiativeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { isAdmin, loading: authLoading } = useAuth();

  const [initiative, setInitiative] = useState<InitiativeFull | null>(null);
  const [related, setRelated] = useState<InitiativeFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const previewRequested =
          typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).get("preview") === "1" &&
          isAdmin;

        const data = previewRequested
          ? await getInitiativeBySlugAdmin(slug)
          : await getPublishedInitiativeBySlug(slug);

        if (!active) return;
        setInitiative(data);
        setIsPreviewMode(Boolean(previewRequested && data?.publication_status === "draft"));

        if (data) {
          const allPub = await getPublishedInitiativesFull();
          if (active) {
            setRelated(allPub.filter((i) => i.id !== data.id).slice(0, 3));
          }
        }
      } catch (err) {
        console.warn("Failed loading initiative detail:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [slug, isAdmin, authLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-[120px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D3B66]" />
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="min-h-screen bg-[#0D3B66] flex items-center justify-center text-white px-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif font-bold">Initiative Not Found</h1>
          <p className="text-white/60 text-sm">
            The initiative you are looking for is unavailable or not yet published.
          </p>
          <Link
            href="/initiatives"
            className="inline-flex items-center gap-2 text-[#D7C2A3] hover:text-white text-sm font-semibold"
          >
            <ArrowLeft size={14} /> Back to Our Initiatives
          </Link>
        </div>
      </div>
    );
  }

  const mainPhoto =
    initiative.images.find((i) => i.is_primary)?.image_url ||
    initiative.cover_image ||
    initiative.images[0]?.image_url ||
    "";

  const galleryImages: InitiativeImage[] = initiative.images;
  const videos = initiative.videos;
  const team = initiative.team;
  const links = initiative.links;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[80px] md:pt-[90px]">
      {isPreviewMode && (
        <div className="bg-amber-500 text-[#0D3B66] text-xs font-bold uppercase tracking-wider text-center py-2 px-4">
          Admin Draft Preview — Not Yet Published Publicly
        </div>
      )}

      {/* 1. INITIATIVE HERO + 2. TITLE & INTRODUCTION */}
      <section className="bg-[#0D3B66] text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-5 md:px-10">
          <Link
            href="/initiatives"
            className="inline-flex items-center gap-2 text-white/75 hover:text-white text-xs font-bold uppercase tracking-wider mb-6"
          >
            <ArrowLeft size={14} /> All Initiatives
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#0EA5E9]/20 text-[#38BDF8] border border-[#0EA5E9]/35">
                  {initiative.category}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/10 text-white/85">
                  {initiative.status}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-[1.08]">
                {initiative.title}
              </h1>

              {initiative.subtitle && (
                <p className="font-serif italic text-lg sm:text-xl text-[#D7C2A3]">
                  {initiative.subtitle}
                </p>
              )}

              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                {initiative.short_description}
              </p>

              {/* 8. LOCATION, CATEGORY, STATUS */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/15">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#38BDF8] font-bold flex items-center gap-1">
                    <MapPin size={11} /> Location
                  </p>
                  <p className="text-xs sm:text-sm font-semibold mt-1">{initiative.location}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#38BDF8] font-bold flex items-center gap-1">
                    <Layers size={11} /> Category
                  </p>
                  <p className="text-xs sm:text-sm font-semibold mt-1">{initiative.category}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#38BDF8] font-bold flex items-center gap-1">
                    <Activity size={11} /> Status
                  </p>
                  <p className="text-xs sm:text-sm font-semibold mt-1">{initiative.status}</p>
                </div>
              </div>
            </div>

            {/* 3. MAIN PROJECT PHOTOGRAPH */}
            {mainPhoto && (
              <div className="relative aspect-[16/11] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black/20">
                <img
                  src={mainPhoto}
                  alt={initiative.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. FULL INITIATIVE STORY */}
      <section className="py-14 md:py-20 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-5 md:px-10">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-blue">
              Initiative Story
            </span>
            <div className="h-px bg-surface-blue-dark flex-1" />
          </div>

          <article>{renderStoryBlocks(initiative.full_description || initiative.short_description)}</article>

          {/* 9. INSTAGRAM & EXTERNAL LINKS (Hidden if empty) */}
          {links.length > 0 && (
            <div className="mt-10 pt-6 border-t border-surface-blue-dark flex flex-wrap items-center gap-3">
              {links.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target={l.url.startsWith("/") ? undefined : "_blank"}
                  rel={l.url.startsWith("/") ? undefined : "noopener noreferrer"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-surface-blue-dark text-[#0D3B66] hover:bg-[#0D3B66] hover:text-white text-xs font-bold transition-colors shadow-sm"
                >
                  {l.platform === "instagram" ? <Instagram size={14} /> : <ExternalLink size={14} />}
                  {l.label || l.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. PROJECT GALLERY (Hidden if empty) */}
      {galleryImages.length > 0 && (
        <section className="py-14 md:py-18 bg-white border-t border-surface-blue-dark">
          <div className="max-w-6xl mx-auto px-5 md:px-10">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-blue">
                Project Gallery
              </span>
              <div className="h-px bg-surface-blue-dark flex-1" />
              <span className="text-xs text-[#4A6080] font-medium">
                {galleryImages.length} {galleryImages.length === 1 ? "photo" : "photos"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {galleryImages.map((img, idx) => (
                <div
                  key={img.id || idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="group rounded-2xl overflow-hidden border border-surface-blue-dark bg-surface-blue/40 cursor-pointer shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={img.image_url}
                      alt={img.alt_text || initiative.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {img.caption && (
                    <p className="px-4 py-3 text-xs text-[#4A6080] font-medium">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. VIDEO SECTION (Hidden if empty) */}
      {videos.length > 0 && (
        <section className="py-14 md:py-18 bg-surface-blue/50 border-t border-surface-blue-dark">
          <div className="max-w-5xl mx-auto px-5 md:px-10 space-y-8">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-blue">
                Field Videos &amp; Reels
              </span>
              <div className="h-px bg-surface-blue-dark flex-1" />
              <span className="text-xs text-[#4A6080] font-medium">
                {videos.length} {videos.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div
              className={
                videos.length > 1
                  ? "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
                  : "space-y-8"
              }
            >
              {videos.map((vid) => {
                const resolved = resolveInitiativeVideo(vid.video_url);
                return (
                  <div
                    key={vid.id}
                    className="bg-white rounded-3xl border border-surface-blue-dark overflow-hidden shadow-sm"
                  >
                    {resolved.kind === "instagram" ? (
                      <div className="w-full bg-[#f8fafc] py-6 px-4 border-b border-surface-blue-dark">
                        <InstagramReelEmbed
                          embedUrl={resolved.embedUrl}
                          externalUrl={resolved.externalUrl}
                          title={vid.title || "Instagram Reel"}
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-black">
                        {resolved.kind === "youtube" ? (
                          <iframe
                            src={resolved.embedUrl}
                            className="w-full h-full"
                            allowFullScreen
                            title={vid.title || initiative.title}
                          />
                        ) : (
                          <video src={vid.video_url} controls className="w-full h-full object-contain" />
                        )}
                      </div>
                    )}
                    {(vid.title || vid.description) && (
                      <div className="p-5">
                        {vid.title && (
                          <h3 className="font-serif text-lg font-bold text-[#0D3B66]">{vid.title}</h3>
                        )}
                        {vid.description && (
                          <p className="text-sm text-[#4A6080] mt-1">{vid.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 6. TEAM SECTION (Hidden if empty) */}
      {team.length > 0 && (
        <section className="py-14 md:py-18 bg-white border-t border-surface-blue-dark">
          <div className="max-w-6xl mx-auto px-5 md:px-10">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-blue">
                Team Behind This Initiative
              </span>
              <div className="h-px bg-surface-blue-dark flex-1" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-surface-blue-dark bg-surface-blue/40 overflow-hidden p-5 space-y-3"
                >
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="w-full aspect-[4/3] rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#0D3B66] text-white flex items-center justify-center font-serif font-bold text-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#0D3B66]">{member.name}</h3>
                    {member.role && (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-accent-blue mt-0.5">
                        {member.role}
                      </p>
                    )}
                  </div>
                  {member.description && (
                    <p className="text-xs text-[#4A6080] leading-relaxed">{member.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. RELATED INITIATIVES */}
      {related.length > 0 && (
        <section className="py-14 md:py-18 bg-[#F0F4F8] border-t border-surface-blue-dark">
          <div className="max-w-6xl mx-auto px-5 md:px-10">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0D3B66]">
                More Initiatives
              </h2>
              <Link
                href="/initiatives"
                className="text-xs font-bold uppercase tracking-wider text-[#0D3B66] hover:text-accent-blue inline-flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => {
                const thumb =
                  rel.cover_image ||
                  rel.images.find((i) => i.is_primary)?.image_url ||
                  rel.images[0]?.image_url;
                return (
                  <Link
                    key={rel.id}
                    href={`/initiatives/${rel.slug}`}
                    className="group bg-white rounded-2xl border border-surface-blue-dark overflow-hidden shadow-sm hover:shadow-md hover:border-accent-blue/40 transition-all"
                  >
                    {thumb && (
                      <div className="aspect-[16/10] overflow-hidden bg-surface-blue">
                        <img
                          src={thumb}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-accent-blue mb-1">
                        {rel.category}
                      </p>
                      <h3 className="font-serif text-lg font-bold text-[#0D3B66] group-hover:text-accent-blue transition-colors">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-[#4A6080] mt-2 line-clamp-2">
                        {rel.short_description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 11. GET INVOLVED / CONTACT CTA */}
      <section className="py-16 md:py-20 bg-[#0D3B66] text-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#D7C2A3] mb-3 block">
            Join the Movement
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Support This Initiative
          </h2>
          <p className="text-white/65 text-sm md:text-base mb-8">
            Participate as a volunteer on the ground, contribute toward conservation supplies, or reach out to collaborate.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 bg-[#D7C2A3] text-[#0D3B66] font-bold text-xs sm:text-sm px-7 py-3.5 rounded-full hover:bg-white transition-colors"
            >
              <Users size={15} /> Become a Volunteer
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 border border-white/25 text-white font-semibold text-xs sm:text-sm px-7 py-3.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <Heart size={15} /> Donate Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/25 text-white font-semibold text-xs sm:text-sm px-7 py-3.5 rounded-full hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && galleryImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-[200] bg-black/92 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div onClick={(e) => e.stopPropagation()} className="relative max-w-5xl w-full">
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="absolute -top-10 right-0 text-white/75 hover:text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1"
              >
                Close <X size={16} />
              </button>
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-black">
                <img
                  src={galleryImages[lightboxIndex].image_url}
                  alt={galleryImages[lightboxIndex].alt_text || initiative.title}
                  className="w-full h-full object-contain"
                />
              </div>
              {galleryImages[lightboxIndex].caption && (
                <p className="text-white/80 text-sm text-center mt-4 font-serif">
                  {galleryImages[lightboxIndex].caption}
                </p>
              )}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (p) => (p !== null ? (p - 1 + galleryImages.length) % galleryImages.length : 0)
                      )
                    }
                    className="absolute top-1/2 left-2 md:-left-14 -translate-y-1/2 p-3 rounded-full bg-black/50 border border-white/20 text-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((p) => (p !== null ? (p + 1) % galleryImages.length : 0))
                    }
                    className="absolute top-1/2 right-2 md:-right-14 -translate-y-1/2 p-3 rounded-full bg-black/50 border border-white/20 text-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
