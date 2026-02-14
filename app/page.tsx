"use client";

import Hero from "@/components/hero";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MediaArchive from "@/components/media-archive";
import { ArrowRight, Droplets, Users } from "lucide-react";

// Simple Stats Component
const Stats = () => {
  const stats = [
    { label: "Stepwells Cleaned", value: "25+", icon: Droplets },
    { label: "Volunteers Engaged", value: "150+", icon: Users },
  ];

  return (
    <section className="bg-primary-blue py-16 text-white relative overflow-hidden">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 bg-stepwell-pattern opacity-5" />

      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl text-center relative z-10">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2 p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
            <stat.icon className="w-12 h-12 mx-auto mb-4 text-accent-blue" />
            <h3 className="text-4xl md:text-5xl font-bold font-serif">{stat.value}</h3>
            <p className="text-lg uppercase tracking-wider text-surface-blue/80">{stat.label}</p>
          </div>
        ))}
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
      <section className="py-16 md:py-24 bg-surface-blue">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-blue">
                More Than Just <br /><span className="text-accent-blue">Cleaning Water</span>
              </h2>
              <p className="text-lg text-primary-blue-light/80 leading-relaxed">
                Stepwells (Bawaris/Jhalaras) are not just water bodies; they are architectural marvels and community hubs of Rajasthan. For decades, they have been neglected, turned into garbage dumps.
              </p>
              <p className="text-lg text-primary-blue-light/80 leading-relaxed">
                Led by <strong>Caron Rawnsley</strong>, we are a people's movement to reclaim these spaces. We clean, we restore, and we breathe life back into Jodhpur's heritage—one bucket of trash at a time.
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

      {/* Featured Projects Carousel (Grid for now) */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary-blue">Featured Restorations</h2>
              <p className="text-primary-blue-light/60">Witness the change we've made together.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          <div className="mt-8 text-center md:hidden">
            {/* View All Projects link removed */}
          </div>
        </div>
      </section>

      {/* Media Archive - Living Wall */}
      <MediaArchive />

      {/* Foundation Store - Museum Retail Wing (Light Editorial Theme) */}
      <section className="py-20 md:py-32 bg-surface-blue relative overflow-hidden">
        {/* Stone Noise Texture */}


        <div className="container mx-auto px-4 md:px-6 relative z-10">

          {/* Museum Label */}
          <div className="flex flex-col items-center mb-16 space-y-4 text-center">
            <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-primary-blue font-sans text-xs tracking-[0.2em] uppercase font-bold shadow-sm border border-surface-blue-dark">
              Foundation Store
            </span>

            {/* Monumental Headline - Dark Ink on Stone */}
            <h2 className="text-[12vw] md:text-[8rem] leading-[0.8] font-serif font-light text-primary-blue tracking-tighter opacity-90 select-none drop-shadow-sm">
              SHOP NOW
            </h2>

            <p className="font-serif italic text-primary-blue-light/60 text-lg md:text-xl tracking-wide max-w-md mx-auto mt-6">
              Every object restores history.
            </p>
          </div>

          {/* Product Canvas */}
          <div className="w-full max-w-[1254px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
        </div>
      </section>
    </div>
  );
}
