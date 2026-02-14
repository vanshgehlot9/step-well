"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Hero from "@/components/hero";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MediaArchive from "@/components/media-archive";
import { ArrowRight, Droplets, Users, MapPin, CalendarDays } from "lucide-react";
import { motion, useInView } from "framer-motion";

// Animated Counter Hook
function useCounter(end: number, duration: number = 2000, startWhen: boolean = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startWhen) return;
    let startTime: number | null = null;
    let raf: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(eased * end));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, startWhen]);
  return count;
}

// Stats Component
const Stats = () => {
  const stats = [
    { label: "Stepwells Cleaned", value: 25, suffix: "+", icon: Droplets, color: "from-sky-400 to-blue-500" },
    { label: "Volunteers Engaged", value: 150, suffix: "+", icon: Users, color: "from-emerald-400 to-teal-500" },
    { label: "Cities Reached", value: 3, suffix: "", icon: MapPin, color: "from-amber-400 to-orange-500" },
    { label: "Years Active", value: 8, suffix: "+", icon: CalendarDays, color: "from-violet-400 to-purple-500" },
  ];

  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  // Mobile stat card
  const MobileStatCard = ({ stat, index }: { stat: typeof stats[number]; index: number }) => {
    const count = useCounter(stat.value, 1800, isInView);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
        className="flex items-center gap-4 bg-white/[0.06] backdrop-blur-sm border border-white/[0.1] rounded-2xl p-4 active:bg-white/[0.1] transition-colors"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0 shadow-lg`}>
          <stat.icon size={22} className="text-white" />
        </div>
        <div>
          <h3 className="text-3xl font-bold font-serif text-white leading-none">
            {count}{stat.suffix}
          </h3>
          <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-semibold mt-1">{stat.label}</p>
        </div>
      </motion.div>
    );
  };

  // Desktop stat card
  const DesktopStatCard = ({ stat, index }: { stat: typeof stats[number]; index: number }) => {
    const count = useCounter(stat.value, 2000, isInView);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: index * 0.12, duration: 0.6 }}
        className="group text-center space-y-3 p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
      >
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <stat.icon size={26} className="text-white" />
        </div>
        <h3 className="text-5xl font-bold font-serif">{count}{stat.suffix}</h3>
        <p className="text-sm uppercase tracking-[0.2em] text-white/50 font-semibold">{stat.label}</p>
      </motion.div>
    );
  };

  return (
    <section ref={sectionRef} className="bg-primary-blue py-10 md:py-16 text-white relative overflow-hidden">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 bg-stepwell-pattern opacity-5" />

      {/* Desktop Grid — 4 columns */}
      <div className="hidden md:grid container mx-auto px-4 grid-cols-4 gap-6 max-w-5xl text-center relative z-10">
        {stats.map((stat, index) => (
          <DesktopStatCard key={index} stat={stat} index={index} />
        ))}
      </div>

      {/* Mobile — 2x2 Grid */}
      <div className="md:hidden relative z-10 px-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <MobileStatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Project Card Component (Inline for now)
const ProjectCard = ({ title, image, description, slug }: { title: string; image: string; description: string; slug: string }) => (
  <Link href={`/projects/${slug}`}>
    <div className="group relative overflow-hidden rounded-xl shadow-lg aspect-[4/5] md:aspect-video cursor-pointer">
      <img
        src={image}
        alt={title}
        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/90 via-primary-blue/40 to-transparent flex flex-col justify-end p-6">
        <h3 className="text-2xl font-serif font-bold text-white mb-2">{title}</h3>
        <p className="text-white/80 text-sm mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center text-accent-blue font-medium uppercase text-xs tracking-widest gap-2 group-hover:text-white transition-colors">
          See in Details <ArrowRight size={14} />
        </div>
      </div>
    </div>
  </Link>
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Hero />

      <Stats />

      {/* Mission Teaser */}
      <section className="py-12 md:py-24 bg-surface-blue">
        <div className="container mx-auto px-4 md:px-6">

          {/* Mobile Layout */}
          <div className="md:hidden flex flex-col gap-6">
            {/* Image with overlay heading */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/story.jpeg"
                alt="Stepwell cleanup activity"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/80 via-primary-blue/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h2 className="text-3xl font-serif font-bold text-white leading-tight">
                  More Than Just <span className="text-accent-blue-light">Cleaning Water</span>
                </h2>
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-4 px-1">
              <p className="text-base text-primary-blue-light/80 leading-relaxed">
                Stepwells (Bawaris/Jhalaras) are not just water bodies; they are architectural marvels and community hubs of Rajasthan. For decades, they have been neglected, turned into garbage dumps.
              </p>
              <p className="text-base text-primary-blue-light/80 leading-relaxed">
                Led by <strong>Caron Rawnsley</strong>, we are a people&apos;s movement to reclaim these spaces. We clean, we restore, and we breathe life back into Jodhpur&apos;s heritage—one bucket of trash at a time.
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
                More Than Just <br /><span className="text-accent-blue">Cleaning Water</span>
              </h2>
              <p className="text-lg text-primary-blue-light/80 leading-relaxed">
                Stepwells (Bawaris/Jhalaras) are not just water bodies; they are architectural marvels and community hubs of Rajasthan. For decades, they have been neglected, turned into garbage dumps.
              </p>
              <p className="text-lg text-primary-blue-light/80 leading-relaxed">
                Led by <strong>Caron Rawnsley</strong>, we are a people&apos;s movement to reclaim these spaces. We clean, we restore, and we breathe life back into Jodhpur&apos;s heritage—one bucket of trash at a time.
              </p>
              <Link href="/about">
                <Button variant="outline" className="mt-4 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white">
                  Read Our Story
                </Button>
              </Link>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-300">
              <img
                src="/story.jpeg"
                alt="Stepwell cleanup activity"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-primary-blue/10 mix-blend-multiply" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-12 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6 md:mb-12">
            <div className="space-y-1 md:space-y-2">
              <h2 className="text-2xl md:text-5xl font-serif font-bold text-primary-blue">Featured Restorations</h2>
              <p className="text-sm md:text-base text-primary-blue-light/60">Witness the change we&apos;ve made together.</p>
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectCard
              title="Toorji Ka Jhalra"
              image="/toorji.jpg"
              slug="toorji-ka-jhalra"
              description="Once buried under trash, now Jodhpur's most vibrant urban space. A testament to what's possible."
            />
            <ProjectCard
              title="Mahamandir Bawri"
              image="/mahamandirhero.jpeg"
              slug="mahamandir-bawri"
              description="A hidden gem restored to its former glory. The water is now clean enough for aquatic life."
            />
            <ProjectCard
              title="Trivedi Sukhdev Ji Ka Jhalra"
              image="/sukhdev.PNG"
              slug="trivedi-sukhdev-ji-ka-jhalra"
              description="A historic stepwell reclaimed from neglect, its intricate stonework and sacred waters revived for the community."
            />
          </div>

          {/* Mobile Horizontal Swipeable Carousel */}
          <div className="md:hidden -mx-4">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
              {[
                { title: "Toorji Ka Jhalra", image: "/toorji.jpg", slug: "toorji-ka-jhalra", description: "Once buried under trash, now Jodhpur's most vibrant urban space." },
                { title: "Mahamandir Bawri", image: "/mahamandirhero.jpeg", slug: "mahamandir-bawri", description: "A hidden gem restored to its former glory." },
                { title: "Trivedi Sukhdev Ji Ka Jhalra", image: "/sukhdev.PNG", slug: "trivedi-sukhdev-ji-ka-jhalra", description: "A historic stepwell reclaimed from neglect." },
              ].map((project, index) => (
                <Link key={index} href={`/projects/${project.slug}`} className="flex-shrink-0 w-[85vw] snap-center">
                  <div className="relative overflow-hidden rounded-2xl shadow-lg aspect-[3/4]">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-xl font-serif font-bold text-white mb-1">{project.title}</h3>
                      <p className="text-white/70 text-sm mb-3 line-clamp-2">{project.description}</p>
                      <span className="inline-flex items-center gap-1.5 text-accent-blue text-xs font-bold uppercase tracking-widest">
                        Explore <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Media Archive - Living Wall */}
      <MediaArchive />

      {/* Foundation Store - Museum Retail Wing (Light Editorial Theme) */}
      <section className="py-16 md:py-32 bg-surface-blue relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">

          {/* Museum Label */}
          <div className="flex flex-col items-center mb-8 md:mb-16 space-y-3 md:space-y-4 text-center">
            <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-primary-blue font-sans text-xs tracking-[0.2em] uppercase font-bold shadow-sm border border-surface-blue-dark">
              Foundation Store
            </span>

            <h2 className="text-[14vw] md:text-[8rem] leading-[0.8] font-serif font-light text-primary-blue tracking-tighter opacity-90 select-none drop-shadow-sm">
              SHOP NOW
            </h2>

            <p className="font-serif italic text-primary-blue-light/60 text-base md:text-xl tracking-wide max-w-md mx-auto mt-4 md:mt-6">
              Every object restores history.
            </p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid w-full max-w-[1254px] mx-auto md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                name: "Heritage Tote",
                desc: "Carry the legacy of 1740s stone carving.",
                price: "₹1,200",
                image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2787&auto=format&fit=crop"
              },
              {
                name: "Blue City Print",
                desc: "A fragment of the sky, captured on archival paper.",
                price: "₹3,500",
                image: "https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?q=80&w=2828&auto=format&fit=crop"
              },
              {
                name: "Stonemason's Kit",
                desc: "Tools of restoration, reimagined for modern hands.",
                price: "₹5,800",
                image: "https://images.unsplash.com/photo-1590664095641-7fa0542df2e2?q=80&w=2787&auto=format&fit=crop"
              },
              {
                name: "Aquifer Bottle",
                desc: "Pure vessel. Keeps water cool, keeps history alive.",
                price: "₹950",
                image: "https://images.unsplash.com/photo-1602143407151-a111ef24b07a?q=80&w=2787&auto=format&fit=crop"
              }
            ].map((item, index) => (
              <Link key={index} href="/shop">
                <div className="group relative h-[433px] rounded-[22px] bg-white border border-surface-blue-dark shadow-sm overflow-hidden transition-all duration-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-blue/10">

                  {/* Image Container */}
                  <div className="h-2/3 w-full overflow-hidden p-4 relative">
                    <div className="w-full h-full rounded-lg overflow-hidden relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 saturate-[0.85] group-hover:saturate-100"
                      />
                      <div className="absolute inset-0 bg-primary-blue/10 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-500" />
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 bg-white">
                    <div className="flex justify-between items-end border-b border-surface-blue-dark pb-3 mb-2">
                      <h3 className="text-primary-blue font-serif text-xl font-medium tracking-wide group-hover:text-accent-blue transition-colors">{item.name}</h3>
                      <span className="text-primary-blue-light/60 font-sans text-sm font-medium">{item.price}</span>
                    </div>

                    <p className="text-primary-blue-light/50 font-sans text-sm line-clamp-2 leading-relaxed h-10">
                      {item.desc}
                    </p>

                    <div className="pt-2 flex items-center text-accent-blue text-xs font-bold tracking-[0.15em] uppercase opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                      View Object <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Horizontal Swipeable Products */}
          <div className="md:hidden -mx-4">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
              {[
                {
                  name: "Heritage Tote",
                  desc: "Carry the legacy of 1740s stone carving.",
                  price: "₹1,200",
                  image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2787&auto=format&fit=crop"
                },
                {
                  name: "Blue City Print",
                  desc: "A fragment of the sky, captured on archival paper.",
                  price: "₹3,500",
                  image: "https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?q=80&w=2828&auto=format&fit=crop"
                },
                {
                  name: "Stonemason's Kit",
                  desc: "Tools of restoration, reimagined for modern hands.",
                  price: "₹5,800",
                  image: "https://images.unsplash.com/photo-1590664095641-7fa0542df2e2?q=80&w=2787&auto=format&fit=crop"
                },
                {
                  name: "Aquifer Bottle",
                  desc: "Pure vessel. Keeps water cool, keeps history alive.",
                  price: "₹950",
                  image: "https://images.unsplash.com/photo-1602143407151-a111ef24b07a?q=80&w=2787&auto=format&fit=crop"
                }
              ].map((item, index) => (
                <Link key={index} href="/shop" className="flex-shrink-0 w-[72vw] snap-center">
                  <div className="relative rounded-2xl bg-white border border-surface-blue-dark shadow-sm overflow-hidden">
                    <div className="aspect-square w-full overflow-hidden p-3">
                      <div className="w-full h-full rounded-xl overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-4 pt-0 space-y-1">
                      <div className="flex justify-between items-center">
                        <h3 className="text-primary-blue font-serif text-lg font-medium">{item.name}</h3>
                        <span className="text-primary-blue-light/60 font-sans text-sm font-medium">{item.price}</span>
                      </div>
                      <p className="text-primary-blue-light/50 font-sans text-xs line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                      <div className="pt-1 flex items-center text-accent-blue text-xs font-bold tracking-[0.1em] uppercase">
                        View Object →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
