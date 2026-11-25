"use client";

import { useEffect, useCallback, useState } from "react";
import Hero from "@/components/hero";
import Link from "next/link";
import { Tweet } from "react-tweet";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getActiveStores } from "@/lib/firebase-services";
import { getPublishedProjects } from "@/lib/cms-services";
import { Project, Store } from "@/lib/types";
import { StoreCard } from "@/components/store-card";
import { usePublicCMS } from "@/lib/use-cms";
import {
  AboutFoundationCMS,
  FeaturedRestorationsCMS,
  HomepageCMS,
  ImpactStatisticsCMS,
  MarketplaceContentCMS,
  RecognitionMediaCMS,
  SponsorsCMS,
} from "@/lib/cms-types";
import {
  DEFAULT_ABOUT_CMS,
  DEFAULT_FEATURED_RESTORATIONS_CMS,
  DEFAULT_HOMEPAGE_CMS,
  DEFAULT_IMPACT_STATISTICS_CMS,
  DEFAULT_MARKETPLACE_CONTENT_CMS,
  DEFAULT_RECOGNITION_MEDIA_CMS,
  DEFAULT_SPONSORS_CMS,
  INITIAL_PROJECTS_SEED,
} from "@/lib/cms-defaults";

export default function Home() {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>(
    INITIAL_PROJECTS_SEED.map((p, idx) => ({ id: `initial-${idx + 1}`, ...p }))
  );

  const { data: homepageData } = usePublicCMS<HomepageCMS>("homepage");
  const { data: aboutData, unpublished: aboutUnpublished } = usePublicCMS<AboutFoundationCMS>("aboutFoundation");
  const { data: statsData, unpublished: statsUnpublished } = usePublicCMS<ImpactStatisticsCMS>("impactStatistics");
  const { data: featuredMeta, unpublished: featuredUnpublished } =
    usePublicCMS<FeaturedRestorationsCMS>("featuredRestorations");
  const { data: marketplaceData, unpublished: marketplaceUnpublished } =
    usePublicCMS<MarketplaceContentCMS>("marketplaceContent");
  const { data: recognitionData, unpublished: recognitionUnpublished } =
    usePublicCMS<RecognitionMediaCMS>("recognitionMedia");
  const { data: sponsorsData, unpublished: sponsorsUnpublished } =
    usePublicCMS<SponsorsCMS>("sponsors");

  const homeVis = homepageData?.visibility ?? DEFAULT_HOMEPAGE_CMS.visibility;
  const about = aboutData || DEFAULT_ABOUT_CMS;
  const stats = (statsData?.items || DEFAULT_IMPACT_STATISTICS_CMS.items)
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);
  const featCms = featuredMeta || DEFAULT_FEATURED_RESTORATIONS_CMS;
  const marketCms = marketplaceData || DEFAULT_MARKETPLACE_CONTENT_CMS;
  const recCms = recognitionData || DEFAULT_RECOGNITION_MEDIA_CMS;
  const recItems = (recCms.items || [])
    .filter((i) => i.visible)
    .sort((a, b) => a.order - b.order);
  const sponsorsCms = sponsorsData || DEFAULT_SPONSORS_CMS;
  const sponsorItems = (sponsorsCms.items || [])
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    async function fetchDynamicData() {
      try {
        const [storesData, projectsData] = await Promise.all([
          getActiveStores(),
          getPublishedProjects(true),
        ]);
        setStores(storesData);
        if (projectsData.length > 0) {
          setFeaturedProjects(projectsData);
        } else {
          // Check if any published projects exist even if not marked featured
          const allPub = await getPublishedProjects(false);
          if (allPub.length > 0) setFeaturedProjects(allPub);
        }
      } catch (err) {
        console.error("Failed to load dynamic home data:", err);
      }
    }
    fetchDynamicData();
  }, []);

  const safeLen = Math.max(featuredProjects.length, 1);
  const nextProject = useCallback(
    () => setCurrentProjectIndex((prev) => (prev + 1) % safeLen),
    [safeLen]
  );
  const prevProject = useCallback(
    () => setCurrentProjectIndex((prev) => (prev - 1 + safeLen) % safeLen),
    [safeLen]
  );

  useEffect(() => {
    if (featuredProjects.length <= 1) return;
    const intervalMs = Math.max(featCms.autoplaySeconds || 8, 3) * 1000;
    const timer = setInterval(() => {
      nextProject();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [nextProject, featuredProjects.length, featCms.autoplaySeconds]);

  const activeProject = featuredProjects[currentProjectIndex % safeLen];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 1. HERO — First impression & hook */}
      <Hero />

      {/* 2. MISSION — Who we are & our story */}
      {homeVis.showMission && !aboutUnpublished && aboutData && (
        <section id="mission" className="py-12 md:py-24 bg-surface-blue scroll-mt-32">
          <div className="container mx-auto px-4 md:px-6">
            {/* Mobile Layout */}
            <div className="md:hidden flex flex-col gap-6">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={about.supportingImage || "/story.jpeg"}
                  alt={about.supportingImageAlt || "Stepwell cleanup activity"}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/80 via-primary-blue/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h2 className="text-3xl font-serif font-bold text-white leading-tight">
                    {about.sectionHeading}{" "}
                    <span className="text-accent-blue-light">{about.highlightedHeading}</span>
                  </h2>
                </div>
              </div>
              <div className="space-y-4 px-1">
                <p className="text-base text-primary-blue-light/80 leading-relaxed">
                  {about.foundationDescription}
                </p>
                <p className="text-base text-primary-blue-light/80 leading-relaxed">
                  {about.storyAndHistory}
                </p>
                <p className="text-base text-primary-blue-light/80 leading-relaxed">
                  {about.founderInformation}
                </p>
                <Link href={about.readStoryButtonUrl || "/about"}>
                  <Button
                    variant="outline"
                    className="mt-2 w-full border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white rounded-full py-5"
                  >
                    {about.readStoryButtonLabel || "Read Our Story"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-blue">
                  {about.sectionHeading} <br />
                  <span className="text-accent-blue">{about.highlightedHeading}</span>
                </h2>
                <p className="text-lg text-primary-blue-light/80 leading-relaxed">
                  {about.foundationDescription}
                </p>
                <p className="text-lg text-primary-blue-light/80 leading-relaxed">
                  {about.storyAndHistory}
                </p>
                <p className="text-lg text-primary-blue-light/80 leading-relaxed">
                  {about.founderInformation}
                </p>
                <Link href={about.readStoryButtonUrl || "/about"}>
                  <Button
                    variant="outline"
                    className="mt-4 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white px-8 py-6 rounded-full font-serif text-lg"
                  >
                    {about.readStoryButtonLabel || "Read Our Story"}
                  </Button>
                </Link>
              </div>
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-300">
                <img
                  src={about.supportingImage || "/story.jpeg"}
                  alt={about.supportingImageAlt || "Stepwell cleanup activity"}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-primary-blue/10 mix-blend-multiply" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. IMPACT STATS — Build instant credibility with numbers */}
      {homeVis.showImpactStats &&
        !statsUnpublished &&
        statsData?.sectionVisible !== false &&
        stats.length > 0 && (
          <section className="bg-[#0D3B66] py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <span className="text-3xl mb-1">{stat.icon}</span>
                    <span className="font-serif text-4xl md:text-5xl font-bold text-white">
                      {stat.value}
                    </span>
                    <span className="text-white/60 text-sm md:text-base font-medium tracking-wide">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* 4. FEATURED PROJECTS — Proof of work */}
      {homeVis.showFeaturedRestorations &&
        !featuredUnpublished &&
        featCms.visible !== false &&
        activeProject && (
          <section id="projects" className="py-10 md:py-16 bg-white scroll-mt-32 overflow-hidden relative">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
              <div className="text-center mb-10">
                <span className="text-accent-blue font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 block">
                  {featCms.eyebrow}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-blue">
                  {featCms.heading}
                </h2>
              </div>

              <div className="w-full rounded-[20px] md:rounded-[28px] bg-white border border-surface-blue-dark overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-[0_20px_60px_rgba(13,59,102,0.08)] relative">
                {/* Left Side: Story Details */}
                <div className="relative z-10 border-b lg:border-b-0 lg:border-r border-surface-blue-dark h-[480px] lg:h-[540px]">
                  <AnimatePresence>
                    <motion.div
                      key={activeProject.id || currentProjectIndex}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="absolute inset-0 p-7 md:p-10 flex flex-col justify-center"
                    >
                      <span className="text-accent-blue font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 block">
                        {featCms.sublabel}
                      </span>

                      <h3 className="font-serif text-[clamp(1.5rem,3vw,2.6rem)] text-primary-blue font-bold leading-[1.1] mb-4 whitespace-pre-line">
                        {activeProject.name}
                      </h3>

                      <div className="space-y-2 text-primary-blue-light/80 text-[0.9rem] md:text-[1rem] leading-[1.65] mb-6 whitespace-pre-line line-clamp-5">
                        {activeProject.description}
                      </div>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-4 border-y border-surface-blue-dark py-4 mb-6">
                        <div>
                          <div className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-accent-blue mb-1 font-bold">
                            Location
                          </div>
                          <div className="text-primary-blue font-medium text-sm">
                            {activeProject.location}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-accent-blue mb-1 font-bold">
                            Category
                          </div>
                          <div className="text-primary-blue font-medium text-sm">
                            {activeProject.category || "Stepwell Restoration"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-accent-blue mb-1 font-bold">
                            Status
                          </div>
                          <div className="text-primary-blue font-medium text-sm capitalize">
                            {activeProject.statusLabel || activeProject.status}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Link
                          href={`/projects/${activeProject.slug}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-blue px-8 py-4 text-[1rem] font-medium text-white shadow-lg transition-all duration-300 hover:bg-primary-blue/90 hover:-translate-y-1"
                        >
                          {featCms.ctaLabel || "Read Full Story"} <ArrowRight size={18} />
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Right Side: Large Premium Image */}
                <div className="relative overflow-hidden h-[300px] lg:h-[540px] flex items-center justify-center group bg-surface-blue">
                  <AnimatePresence>
                    <motion.img
                      key={activeProject.id || currentProjectIndex}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      src={activeProject.featuredImage || activeProject.images?.[0] || "/toorji.jpg"}
                      alt={activeProject.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-110"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </div>

              {/* Carousel Navigation Pill */}
              {featuredProjects.length > 1 && (
                <div className="flex justify-center mt-10 relative z-20">
                  <div className="flex items-center gap-8 px-6 py-3 bg-white border border-surface-blue-dark/50 rounded-full shadow-[0_10px_40px_rgba(13,59,102,0.08)]">
                    <button
                      onClick={prevProject}
                      className="text-primary-blue hover:text-accent-blue transition-colors flex items-center justify-center p-1"
                      aria-label="Previous Project"
                    >
                      <ChevronLeft size={24} />
                    </button>

                    <div className="flex items-center gap-3">
                      {featuredProjects.map((proj, idx) => (
                        <button
                          key={proj.id || idx}
                          onClick={() => setCurrentProjectIndex(idx)}
                          className={`h-2 rounded-full transition-all duration-500 ${
                            idx === currentProjectIndex % safeLen
                              ? "w-8 bg-primary-blue"
                              : "w-2 bg-primary-blue/20 hover:bg-primary-blue/40"
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextProject}
                      className="text-primary-blue hover:text-accent-blue transition-colors flex items-center justify-center p-1"
                      aria-label="Next Project"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

      {/* 5. FOUNDATION MARKETPLACE — Call to action: support us by shopping */}
      {homeVis.showMarketplace && !marketplaceUnpublished && marketCms.visible !== false && (
        <section id="marketplace" className="py-14 md:py-20 bg-[#f0f4f8] scroll-mt-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-accent-blue font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-2 block">
                  {marketCms.homeEyebrow}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-blue">
                  {marketCms.homeHeading}
                </h2>
                <p className="text-primary-blue-light/70 mt-2 text-base max-w-lg">
                  {marketCms.homeDescription}
                </p>
              </div>
              <Link
                href={marketCms.homeCtaUrl || "/foundation-store"}
                className="shrink-0 inline-flex items-center gap-2 bg-[#0f172a] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#2563eb] transition-colors duration-300"
              >
                {marketCms.homeCtaLabel || "View All Stores"} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stores.length > 0 ? (
                stores.slice(0, 4).map((store, i) => (
                  <StoreCard key={store.id} store={store} index={i} variant="home" />
                ))
              ) : (
                <p className="col-span-full text-center text-primary-blue-light/50 py-12 text-sm">
                  No active stores yet. Check back soon!
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. GLOBAL RECOGNITION — Social proof & media coverage */}
      {homeVis.showRecognition && !recognitionUnpublished && recCms.visible !== false && (
        <section
          id="recognition"
          className="py-20 md:py-32 bg-gradient-to-b from-background to-[#f0f4f8] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-accent-blue font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-4 block">
                {recCms.eyebrow}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary-blue mb-6">
                {recCms.heading}
              </h2>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-accent-blue/30" />
                <div className="w-2 h-2 rotate-45 bg-accent-blue/50" />
                <div className="h-px w-12 bg-accent-blue/30" />
              </div>
              <p className="mt-6 text-primary-blue-light/80 text-lg leading-relaxed">
                {recCms.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-[1400px] mx-auto items-start">
              {recItems.map((item) => {
                if (item.type === "tweet" && item.tweetId) {
                  return (
                    <div
                      key={item.id}
                      className="w-full flex justify-center bg-[#f8fafc] rounded-2xl md:rounded-[2rem] shadow-[0_8px_30px_rgba(13,59,102,0.06)] border border-surface-blue-dark/50 overflow-hidden"
                    >
                      <div className="w-full max-w-[500px] my-auto scale-90 sm:scale-100 origin-center" data-theme="light">
                        <Tweet id={item.tweetId} />
                      </div>
                    </div>
                  );
                }

                if (item.type === "instagram" && item.embedUrl) {
                  return (
                    <div
                      key={item.id}
                      className="w-full flex justify-center bg-[#f8fafc] rounded-2xl md:rounded-[2rem] py-6 md:p-4 shadow-[0_8px_30px_rgba(13,59,102,0.06)] border border-surface-blue-dark/50 overflow-hidden"
                    >
                      <iframe
                        src={item.embedUrl}
                        frameBorder="0"
                        scrolling="no"
                        className="w-full max-w-[400px] h-[550px] border-none my-auto"
                      />
                    </div>
                  );
                }

                if (item.type === "video" && item.mediaUrl) {
                  return (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl md:rounded-[2rem] p-3 md:p-4 bg-white shadow-[0_8px_30px_rgba(13,59,102,0.06)] border border-surface-blue-dark/50"
                    >
                      <div className="relative overflow-hidden rounded-xl md:rounded-[1.5rem] bg-black aspect-[4/3]">
                        <video src={item.mediaUrl} controls className="w-full h-full object-contain" />
                      </div>
                      {item.caption && (
                        <p className="mt-3 px-2 text-xs text-primary-blue-light/70 font-medium">
                          {item.caption}
                        </p>
                      )}
                    </div>
                  );
                }

                if (!item.mediaUrl) return null;

                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl md:rounded-[2rem] p-3 md:p-4 bg-white shadow-[0_8px_30px_rgba(13,59,102,0.06)] hover:shadow-[0_20px_40px_rgba(13,59,102,0.12)] transition-all duration-500 border border-surface-blue-dark/50 cursor-zoom-in"
                    onClick={() => setPreviewImage(item.mediaUrl)}
                  >
                    <div className="relative overflow-hidden rounded-xl md:rounded-[1.5rem] bg-[#f8fafc] flex items-center justify-center aspect-[4/3]">
                      <img
                        src={item.mediaUrl}
                        alt={item.caption || item.title}
                        className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 p-2 md:p-4 mix-blend-darken"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>
                    {item.externalUrl && (
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 inline-flex items-center gap-1 px-2 text-xs font-semibold text-accent-blue hover:underline"
                      >
                        Read Coverage <ArrowRight size={12} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. SPONSORS & PARTNERS — Authority close */}
      {homeVis.showSponsors && !sponsorsUnpublished && sponsorsCms.visible !== false && (
        <section id="sponsors" className="py-14 md:py-20 bg-white scroll-mt-24 border-t border-gray-100">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-10 md:mb-16">
              <span className="text-accent-blue font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-2 block">
                {sponsorsCms.eyebrow}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-blue">
                {sponsorsCms.heading}
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 lg:gap-24 opacity-70 hover:opacity-100 transition-opacity duration-500">
              {sponsorItems.map((partner) => {
                const logoContent = (
                  <div className="w-32 md:w-48 h-20 relative grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-105">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                );

                return partner.websiteUrl ? (
                  <a
                    key={partner.id}
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={partner.shortDescription || partner.name}
                  >
                    {logoContent}
                  </a>
                ) : (
                  <div key={partner.id} title={partner.shortDescription || partner.name}>
                    {logoContent}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-xl sm:rounded-2xl shadow-2xl bg-white"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm"
              aria-label="Close preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
