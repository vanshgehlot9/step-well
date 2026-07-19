"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Users, ChevronLeft, ChevronRight, Heart, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProjectBySlug } from "@/lib/firebase-services";
import { Project } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────────────────────
interface GalleryItem {
  type: "image" | "video";
  src: string;
  caption: string;
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  items, index, onClose, onPrev, onNext,
}: {
  items: GalleryItem[]; index: number;
  onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  const item = items[index];
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute -top-10 right-0 text-white/50 hover:text-white text-xs uppercase tracking-widest font-bold transition-colors">
            Close ✕
          </button>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
            {item.type === "video"
              ? <video src={item.src} controls autoPlay className="w-full h-full object-contain" />
              : <img src={item.src} alt={item.caption} className="w-full h-full object-contain" />
            }
          </div>
          <p className="text-white/50 text-sm text-center mt-4 font-serif italic">{item.caption}</p>
          <p className="text-white/25 text-xs text-center mt-1">{index + 1} / {items.length}</p>
          {items.length > 1 && <>
            <button onClick={onPrev} className="absolute top-1/2 -left-5 md:-left-16 -translate-y-1/2 p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all">
              <ChevronLeft size={22} />
            </button>
            <button onClick={onNext} className="absolute top-1/2 -right-5 md:-right-16 -translate-y-1/2 p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all">
              <ChevronRight size={22} />
            </button>
          </>}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadProject() {
      if (slug) {
        const data = await getProjectBySlug(slug);
        setProject(data);
        setLoading(false);
      }
    }
    loadProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D3B66] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0D3B66] flex items-center justify-center text-white">
        <div className="text-center space-y-4 px-6">
          <h1 className="text-4xl font-serif font-bold">Project Not Found</h1>
          <p className="text-white/50">The restoration project you're looking for doesn't exist.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-[#D7C2A3] hover:text-white transition-colors text-sm font-semibold mt-4">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative h-[88vh] overflow-hidden bg-[#0D3B66]">
        {project.images && project.images.length > 0 && (
          <img src={project.images[0]} alt={project.name} className="absolute inset-0 w-full h-full object-cover" />
        )}
        {/* layered gradients for contrast + depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B66] via-[#0D3B66]/80 to-[#0D3B66]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D3B66]/60 to-transparent" />

        {/* Back button */}
        <Link
          href="/"
          className="absolute top-[96px] left-6 md:left-12 z-20 inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors bg-black/25 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15"
        >
          <ArrowLeft size={14} /> All Projects
        </Link>

        {/* Hero text — bottom-anchored */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-10 md:pb-14 z-10">
          <div className="max-w-4xl">
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-5 text-white/60 text-sm">
              <span className="flex items-center gap-1.5"><MapPin size={13} /> {project.location}</span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1.5"><Calendar size={13} /> {project.status}</span>
              <span className="ml-auto shrink-0 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#D7C2A3]/20 text-[#D7C2A3] border border-[#D7C2A3]/30">
                Restoration
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.05] tracking-tight mb-4">
              {project.name}
            </h1>
            <p className="text-white/75 text-base md:text-xl max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────── */}
      <section className="bg-[#0D3B66]">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 divide-x divide-white/10">
            <div className="text-center px-4">
              <p className="text-3xl md:text-4xl font-serif font-bold text-[#D7C2A3] leading-none">{project.progress}%</p>
              <p className="text-white/45 text-[11px] font-bold uppercase tracking-widest mt-2">Progress</p>
            </div>
            <div className="text-center px-4">
              <p className="text-3xl md:text-4xl font-serif font-bold text-[#D7C2A3] leading-none capitalize">{project.status}</p>
              <p className="text-white/45 text-[11px] font-bold uppercase tracking-widest mt-2">Status</p>
            </div>
        </div>
      </section>

      {/* ── STORY ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-6 md:px-12">

          {/* Section label */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B88445]">The Story</span>
            <div className="h-px bg-[#D7C2A3] flex-1" />
          </div>

          {/* Main story text — comfortable reading width */}
          <div className="prose prose-lg max-w-none">
            {project.description.split("\n\n").map((para, i) => (
              <p key={i} className="text-[#1E293B] text-lg leading-[1.85] mb-6 last:mb-0">
                {para}
              </p>
            ))}
          </div>

          {/* Removed Hardcoded Pull Quote */}
        </div>
      </section>

      {/* ── GALLERY ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6 md:px-12">

          <div className="flex items-center gap-3 mb-10">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B88445]">Gallery</span>
            <div className="h-px bg-[#D7C2A3] flex-1" />
            <span className="text-xs text-slate-400 font-medium shrink-0">
              {project.images?.length || 0} {(project.images?.length || 0) === 1 ? "item" : "items"}
            </span>
          </div>

          {!project.images || project.images.length === 0 ? (
            <div className="text-center py-20 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-serif italic">Gallery coming soon — documentation in progress.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${
              project.images.length === 1 ? "grid-cols-1" :
              project.images.length === 2 ? "grid-cols-1 md:grid-cols-2" :
              "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}>
              {project.images.map((img, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setLightboxIndex(index)}
                  className={`group relative overflow-hidden rounded-2xl cursor-pointer bg-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 ${
                    project.images.length === 1 ? "aspect-[16/9] max-w-3xl mx-auto w-full" : "aspect-[4/3]"
                  }`}
                >
                  <img src={img} alt="Gallery image" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-[11px] font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">View ↗</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA SECTION ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#0D3B66]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D7C2A3] mb-4 block">Join the Mission</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
            Help us restore the next stepwell
          </h2>
          <p className="text-white/55 text-base leading-relaxed mb-8 max-w-lg mx-auto">
            Every rupee and every volunteer hour directly contributes to bringing Rajasthan's water heritage back to life.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 bg-[#D7C2A3] text-[#0D3B66] font-bold text-sm px-8 py-4 rounded-full hover:bg-white transition-colors duration-200"
            >
              <Users size={15} /> Become a Volunteer
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold text-sm px-8 py-4 rounded-full hover:bg-white/10 transition-colors duration-200"
            >
              <Heart size={15} /> Donate Now
            </Link>
          </div>
        </div>
      </section>

      {lightboxIndex !== null && project.images && (
        <Lightbox
          items={project.images.map(img => ({ type: "image", src: img, caption: "" }))}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((p) => p !== null && project.images ? (p - 1 + project.images.length) % project.images.length : 0)}
          onNext={() => setLightboxIndex((p) => p !== null && project.images ? (p + 1) % project.images.length : 0)}
        />
      )}
    </div>
  );
}
