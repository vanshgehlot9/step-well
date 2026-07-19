"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Hero from "@/components/hero";
import Link from "next/link";
import Script from "next/script";
import { Tweet } from 'react-tweet';
import { Button } from "@/components/ui/button";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getStores } from "@/lib/firebase-services";
import { Store } from "@/lib/types";
import { StoreCard } from "@/components/store-card";


const featuredProjects = [
  {
    title: "Toorji Ka Jhalra:\nFrom Neglect to Revival",
    description: "Once buried beneath years of debris and neglect, Toorji Ka Jhalra has become one of Jodhpur's most celebrated heritage spaces.\n\nThrough community participation and dedicated cleanliness efforts, the historic stepwell has re-emerged as a symbol of cultural pride and water heritage conservation.",
    location: "Jodhpur, Rajasthan",
    category: "Stepwell Restoration",
    status: "Revived",
    image: "/toorji.jpg",
    slug: "toorji-ka-jhalra"
  },
  {
    title: "Mahamandir Bawri:\nA Hidden Gem Restored",
    description: "A hidden gem restored to its former glory. The water is now clean enough for aquatic life.\n\nThrough meticulous cleaning and structural reinforcement, the bawri now stands as a testament to what community-led conservation can achieve.",
    location: "Jodhpur, Rajasthan",
    category: "Stepwell Restoration",
    status: "Active",
    image: "/mahamandirhero.jpeg",
    slug: "mahamandir-bawri"
  },
  {
    title: "Trivedi Sukhdev Ji Ka Jhalra:\nReclaiming History",
    description: "A historic stepwell reclaimed from neglect, its intricate stonework and sacred waters revived for the community.\n\nThe restoration process involved careful removal of silt and debris, bringing life back to this architectural marvel.",
    location: "Jodhpur, Rajasthan",
    category: "Heritage Conservation",
    status: "Ongoing",
    image: "/sukhdev.PNG",
    slug: "trivedi-sukhdev-ji-ka-jhalra"
  }
];
export default function Home() {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    async function fetchStores() {
      try {
        const data = await getStores();
        setStores(data.filter(s => s.status === 'ACTIVE'));
      } catch (err) {
        console.error("Failed to load stores:", err);
      }
    }
    fetchStores();
  }, []);

  const nextProject = useCallback(() => setCurrentProjectIndex((prev) => (prev + 1) % featuredProjects.length), []);
  const prevProject = useCallback(() => setCurrentProjectIndex((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length), []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextProject();
    }, 8000);
    return () => clearInterval(timer);
  }, [nextProject]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 1. HERO — First impression & hook */}
      <Hero />

      {/* 2. MISSION — Who we are & our story */}
      <section id="mission" className="py-12 md:py-24 bg-surface-blue scroll-mt-32">
        <div className="container mx-auto px-4 md:px-6">

          {/* Mobile Layout */}
          <div className="md:hidden flex flex-col gap-6">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <img src="/story.jpeg" alt="Stepwell cleanup activity" className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/80 via-primary-blue/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h2 className="text-3xl font-serif font-bold text-white leading-tight">
                  Saving A <span className="text-accent-blue-light">Disappearing Legacy</span>
                </h2>
              </div>
            </div>
            <div className="space-y-4 px-1">
              <p className="text-base text-primary-blue-light/80 leading-relaxed">
                Stepwell Renovation Foundation is a non-profit organization dedicated to the preservation, cleanliness, and promotion of India's historic stepwells and traditional water heritage.
              </p>
              <p className="text-base text-primary-blue-light/80 leading-relaxed">
                Inspired by the extraordinary work of Caron Rawnsley, the Foundation works to reconnect communities with their cultural and environmental significance through awareness, public participation, and sustainable conservation practices.
              </p>
              <p className="text-base text-primary-blue-light/80 leading-relaxed">
                Established by R.K. Padmaja Rathore, Ravindra Vishnoi, and Vijendra, who share a commitment to preserving traditional water systems and India's architectural heritage.
              </p>
              <Link href="/about">
                <Button variant="outline" className="mt-2 w-full border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white rounded-full py-5">
                  Read Our Story
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-blue">
                Saving A <br /><span className="text-accent-blue">Disappearing Legacy</span>
              </h2>
              <p className="text-lg text-primary-blue-light/80 leading-relaxed">
                Stepwell Renovation Foundation is a non-profit organization dedicated to the preservation, cleanliness, and promotion of India's historic stepwells and traditional water heritage.
              </p>
              <p className="text-lg text-primary-blue-light/80 leading-relaxed">
                Inspired by the extraordinary work of Caron Rawnsley, whose decade-long efforts revived public awareness of Jodhpur's historic stepwells, the Foundation works to reconnect communities with their cultural and environmental significance.
              </p>
              <p className="text-lg text-primary-blue-light/80 leading-relaxed">
                Established by R.K. Padmaja Rathore, Ravindra Vishnoi, and Vijendra, who share a commitment to preserving traditional water systems and India's architectural heritage.
              </p>
              <Link href="/about">
                <Button variant="outline" className="mt-4 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white px-8 py-6 rounded-full font-serif text-lg">
                  Read Our Story
                </Button>
              </Link>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-300">
              <img src="/story.jpeg" alt="Stepwell cleanup activity" className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-primary-blue/10 mix-blend-multiply" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. IMPACT STATS — Build instant credibility with numbers */}
      <section className="bg-[#0D3B66] py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10+", label: "Stepwells Restored", icon: "🏛️" },
              { value: "5000+", label: "Volunteers Engaged", icon: "🤝" },
              { value: "3", label: "Cities Impacted", icon: "📍" },
              { value: "100%", label: "Community Led", icon: "💙" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-3xl mb-1">{stat.icon}</span>
                <span className="font-serif text-4xl md:text-5xl font-bold text-white">{stat.value}</span>
                <span className="text-white/60 text-sm md:text-base font-medium tracking-wide">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PROJECTS — Proof of work */}
      <section id="projects" className="py-10 md:py-16 bg-white scroll-mt-32 overflow-hidden relative">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
          <div className="text-center mb-10">
            <span className="text-accent-blue font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 block">Our Work</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-blue">Featured Restorations</h2>
          </div>
          <div className="w-full rounded-[20px] md:rounded-[28px] bg-white border border-surface-blue-dark overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-[0_20px_60px_rgba(13,59,102,0.08)] relative">
            
            {/* Left Side: Story Details */}
            <div className="relative z-10 border-b lg:border-b-0 lg:border-r border-surface-blue-dark h-[480px] lg:h-[540px]">
              
              <AnimatePresence>
                <motion.div
                  key={currentProjectIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 p-7 md:p-10 flex flex-col justify-center"
                >
                  <span className="text-accent-blue font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 block">
                    FEATURED RESTORATION
                  </span>

                  <h3 className="font-serif text-[clamp(1.5rem,3vw,2.6rem)] text-primary-blue font-bold leading-[1.1] mb-4 whitespace-pre-line">
                    {featuredProjects[currentProjectIndex].title}
                  </h3>
                  
                  <div className="space-y-2 text-primary-blue-light/80 text-[0.9rem] md:text-[1rem] leading-[1.65] mb-6 whitespace-pre-line">
                    {featuredProjects[currentProjectIndex].description}
                  </div>
                  
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-4 border-y border-surface-blue-dark py-4 mb-6">
                    <div>
                      <div className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-accent-blue mb-1 font-bold">Location</div>
                      <div className="text-primary-blue font-medium text-sm">{featuredProjects[currentProjectIndex].location}</div>
                    </div>
                    <div>
                      <div className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-accent-blue mb-1 font-bold">Category</div>
                      <div className="text-primary-blue font-medium text-sm">{featuredProjects[currentProjectIndex].category}</div>
                    </div>
                    <div>
                      <div className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-accent-blue mb-1 font-bold">Status</div>
                      <div className="text-primary-blue font-medium text-sm">{featuredProjects[currentProjectIndex].status}</div>
                    </div>
                  </div>

                  <div>
                    <Link 
                      href={`/projects/${featuredProjects[currentProjectIndex].slug}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-blue px-8 py-4 text-[1rem] font-medium text-white shadow-lg transition-all duration-300 hover:bg-primary-blue/90 hover:-translate-y-1"
                    >
                      Read Full Story <ArrowRight size={18} />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Side: Large Premium Image */}
            <div className="relative overflow-hidden h-[300px] lg:h-[540px] flex items-center justify-center group bg-surface-blue">
              <AnimatePresence>
                <motion.img
                  key={currentProjectIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  src={featuredProjects[currentProjectIndex].image}
                  alt={featuredProjects[currentProjectIndex].title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-110"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>

          </div>

          {/* Carousel Navigation Pill (Dayos Style) */}
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
                {featuredProjects.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentProjectIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      idx === currentProjectIndex ? "w-8 bg-primary-blue" : "w-2 bg-primary-blue/20 hover:bg-primary-blue/40"
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

        </div>
      </section>

      {/* 5. FOUNDATION MARKETPLACE — Call to action: support us by shopping */}
      <section id="marketplace" className="py-14 md:py-20 bg-[#f0f4f8] scroll-mt-24">
        <div className="container mx-auto px-4 md:px-8">

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-accent-blue font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-2 block">
                Local Artisans
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-blue">
                Foundation Marketplace
              </h2>
              <p className="text-primary-blue-light/70 mt-2 text-base max-w-lg">
                Every purchase supports heritage conservation. Shop from verified local artisans and make a difference.
              </p>
            </div>
            <Link
              href="/foundation-store"
              className="shrink-0 inline-flex items-center gap-2 bg-[#0f172a] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#2563eb] transition-colors duration-300"
            >
              View All Stores <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Store grid — show first 4 stores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stores.length > 0
              ? stores.slice(0, 4).map((store, i) => (
                  <StoreCard key={store.id} store={store} index={i} variant="home" />
                ))
              : (
                <p className="col-span-full text-center text-primary-blue-light/50 py-12 text-sm">
                  No active stores yet. Check back soon!
                </p>
              )
            }
          </div>

        </div>
      </section>

      {/* 6. GLOBAL RECOGNITION — Social proof & media coverage */}
      <section id="recognition" className="py-20 md:py-32 bg-gradient-to-b from-background to-[#f0f4f8] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-accent-blue font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-4 block">
              Appreciation & Media
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary-blue mb-6">
              Global Recognition
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-accent-blue/30" />
              <div className="w-2 h-2 rotate-45 bg-accent-blue/50" />
              <div className="h-px w-12 bg-accent-blue/30" />
            </div>
            <p className="mt-6 text-primary-blue-light/80 text-lg leading-relaxed">
              Discover how our community-led initiatives are making waves and inspiring change across the world.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-[1400px] mx-auto items-start">
            {/* News Item 1 */}
            <div 
              className="group relative rounded-2xl md:rounded-[2rem] p-3 md:p-4 bg-white shadow-[0_8px_30px_rgba(13,59,102,0.06)] hover:shadow-[0_20px_40px_rgba(13,59,102,0.12)] transition-all duration-500 border border-surface-blue-dark/50 cursor-zoom-in"
              onClick={() => setPreviewImage("/media/news1.jpeg")}
            >
              <div className="relative overflow-hidden rounded-xl md:rounded-[1.5rem] bg-[#f8fafc] flex items-center justify-center aspect-[4/3]">
                <img 
                  src="/media/news1.jpeg" 
                  alt="Press coverage detailing the community initiative" 
                  className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 p-2 md:p-4 mix-blend-darken" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>

            {/* News Item 2 */}
            <div 
              className="group relative rounded-2xl md:rounded-[2rem] p-3 md:p-4 bg-white shadow-[0_8px_30px_rgba(13,59,102,0.06)] hover:shadow-[0_20px_40px_rgba(13,59,102,0.12)] transition-all duration-500 border border-surface-blue-dark/50 cursor-zoom-in"
              onClick={() => setPreviewImage("/media/news2.jpg")}
            >
              <div className="relative overflow-hidden rounded-xl md:rounded-[1.5rem] bg-[#f8fafc] flex items-center justify-center aspect-[4/3]">
                <img 
                  src="/media/news2.jpg" 
                  alt="Newspaper clipping regarding the stepwell restoration" 
                  className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 p-2 md:p-4 mix-blend-darken" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>

            {/* News Item 3: Deputy CM */}
            <div 
              className="group relative rounded-2xl md:rounded-[2rem] p-3 md:p-4 bg-white shadow-[0_8px_30px_rgba(13,59,102,0.06)] hover:shadow-[0_20px_40px_rgba(13,59,102,0.12)] transition-all duration-500 border border-surface-blue-dark/50 cursor-zoom-in"
              onClick={() => setPreviewImage("/media/deputycm.jpeg")}
            >
              <div className="relative overflow-hidden rounded-xl md:rounded-[1.5rem] bg-[#f8fafc] flex items-center justify-center aspect-[4/3]">
                <img 
                  src="/media/deputycm.jpeg" 
                  alt="Meeting with Deputy CM of Rajasthan" 
                  className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 p-2 md:p-4 mix-blend-darken" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>

            {/* News Item 4: Tweet */}
            <div className="w-full flex justify-center bg-[#f8fafc] rounded-2xl md:rounded-[2rem] shadow-[0_8px_30px_rgba(13,59,102,0.06)] border border-surface-blue-dark/50 overflow-hidden">
              <div className="w-full max-w-[500px] my-auto scale-90 sm:scale-100 origin-center" data-theme="light">
                <Tweet id="2075545878652412085" />
              </div>
            </div>

            {/* News Item 5: Instagram */}
            <div className="w-full flex justify-center bg-[#f8fafc] rounded-2xl md:rounded-[2rem] py-6 md:p-4 shadow-[0_8px_30px_rgba(13,59,102,0.06)] border border-surface-blue-dark/50 overflow-hidden">
              <iframe 
                src="https://www.instagram.com/reel/DaNREiUBxqv/embed" 
                frameBorder="0" 
                scrolling="no" 
                className="w-full max-w-[400px] h-[550px] border-none my-auto"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SPONSORS & PARTNERS — Authority close */}
      <section id="sponsors" className="py-14 md:py-20 bg-white scroll-mt-24 border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-accent-blue font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-2 block">
              Supported By
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-blue">
              Our Sponsors & Partners
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 lg:gap-24 opacity-70 hover:opacity-100 transition-opacity duration-500">
            <div className="w-32 md:w-48 h-20 relative grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-105">
              <img src="/sponser/bagheera.png" alt="Bagheera" className="w-full h-full object-contain" />
            </div>
            <div className="w-32 md:w-48 h-20 relative grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-105">
              <img src="/sponser/imaginarystudio.png" alt="Imaginary Studio" className="w-full h-full object-contain" />
            </div>
            <div className="w-32 md:w-48 h-20 relative grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-105">
              <img src="/sponser/uptantra.png" alt="Uptantra" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </section>

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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
