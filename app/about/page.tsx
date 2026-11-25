"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Droplets, Landmark, Users, HeartHandshake, Droplet, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { usePublicCMS } from "@/lib/use-cms";
import { AboutFoundationCMS } from "@/lib/cms-types";
import { DEFAULT_ABOUT_CMS } from "@/lib/cms-defaults";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  Droplets,
  Landmark,
  Users,
  HeartHandshake,
  Droplet,
  Sparkles,
};

export default function AboutPage() {
  const { data, unpublished } = usePublicCMS<AboutFoundationCMS>("aboutFoundation");

  if (unpublished || !data) {
    return (
      <div className="bg-white min-h-screen pt-[120px] px-6 text-center text-[#0D3B66]">
        <h1 className="text-2xl font-serif font-bold">About Foundation</h1>
        <p className="text-sm text-[#4A6080] mt-2">This section is currently unpublished.</p>
      </div>
    );
  }

  const cms = data || DEFAULT_ABOUT_CMS;

  return (
    <div className="bg-white min-h-screen pt-[80px] md:pt-[90px]">
      {/* SECTION 1: Who We Are */}
      <section className="max-w-6xl mx-auto px-5 md:px-10 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Landmark size={18} className="text-[#D7C2A3]" />
              <span className="text-[#B88445] font-bold text-sm tracking-widest uppercase">
                {cms.pageEyebrow}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#0D3B66] leading-snug mb-8">
              {cms.pageHeading}
            </h1>

            <div className="space-y-6">
              {cms.whoWeAreItems.map(({ id, title, body }) => (
                <div key={id} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-[#0EA5E9] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-[#B88445] mb-1">{title}</h3>
                    <p className="text-[#4A6080] text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-10">
              <Link
                href="/get-involved"
                className="inline-flex items-center gap-2 bg-[#0D3B66] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#0EA5E9] transition-colors"
              >
                Join the Movement <ArrowRight size={15} />
              </Link>
              <Link
                href="/team"
                className="inline-flex items-center gap-2 border border-[#D7C2A3] text-[#0D3B66] text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#D7C2A3]/15 transition-colors"
              >
                Meet Our Team <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>

          {/* Right: stacked images */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={cms.galleryPrimaryImage || "/toorji.jpg"}
                alt={cms.galleryPrimaryTitle || "Toorji Ka Jhalra stepwell"}
                fill
                className="object-cover"
                sizes="600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B66]/50 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-white text-sm font-semibold">{cms.galleryPrimaryTitle}</p>
                <p className="text-white/60 text-xs">{cms.galleryPrimarySubtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-40 rounded-2xl overflow-hidden shadow-md">
                <Image
                  src={cms.gallerySecondaryLeftImage || "/mahamandirhero.jpeg"}
                  alt={cms.gallerySecondaryLeftTitle || "Mahamandir restoration"}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B66]/50 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-white text-xs font-semibold">{cms.gallerySecondaryLeftTitle}</p>
                </div>
              </div>
              <div className="relative h-40 rounded-2xl overflow-hidden shadow-md">
                <Image
                  src={cms.gallerySecondaryRightImage || "/story.jpeg"}
                  alt={cms.gallerySecondaryRightTitle || "Volunteer restoration"}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B66]/50 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-white text-xs font-semibold">{cms.gallerySecondaryRightTitle}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Our Mission */}
      <section className="bg-[#0D3B66] py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5 md:px-10">
          <div className="flex items-center gap-2 mb-4">
            <Landmark size={18} className="text-[#D7C2A3]" />
            <span className="text-[#D7C2A3] font-bold text-sm tracking-widest uppercase">
              {cms.missionEyebrow}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white leading-snug mb-4 max-w-2xl">
            {cms.missionHeading}
          </h2>
          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-3xl mb-12">
            {cms.missionDescription}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cms.missionCards.slice(0, 4).map(({ id, title, iconName, description }, i) => {
              const Icon = ICON_MAP[iconName] || Droplets;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-white/10 border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-[#D7C2A3] flex items-center justify-center mb-5 shadow-md">
                    <Icon size={24} className="text-[#0D3B66]" strokeWidth={2} />
                  </div>
                  <h4 className="text-white font-bold text-sm mb-2">{title}</h4>
                  <p className="text-white/55 text-xs leading-relaxed">{description}</p>
                </motion.div>
              );
            })}
          </div>

          {cms.missionCards.length > 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {cms.missionCards.slice(4).map(({ id, title, iconName, description }, i) => {
                const Icon = ICON_MAP[iconName] || Sparkles;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="bg-white/10 border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#D7C2A3] flex items-center justify-center mb-5 shadow-md">
                      <Icon size={24} className="text-[#0D3B66]" strokeWidth={2} />
                    </div>
                    <h4 className="text-white font-bold text-sm mb-2">{title}</h4>
                    <p className="text-white/55 text-xs leading-relaxed">{description}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: Our Vision */}
      <section className="max-w-6xl mx-auto px-5 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Landmark size={18} className="text-[#D7C2A3]" />
              <span className="text-[#B88445] font-bold text-sm tracking-widest uppercase">
                {cms.visionEyebrow}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0D3B66] leading-snug mb-6">
              {cms.visionHeading}
            </h2>
            <p className="text-[#4A6080] text-sm md:text-base leading-relaxed mb-4">
              {cms.visionParagraph1}
            </p>
            <p className="text-[#4A6080] text-sm leading-relaxed">{cms.visionParagraph2}</p>

            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 bg-[#0D3B66] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#0EA5E9] transition-colors mt-8"
            >
              Join the Movement <ArrowRight size={15} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative h-80 md:h-96 rounded-3xl overflow-hidden shadow-xl"
          >
            <Image
              src={cms.visionImage || "/hero1.png"}
              alt="Stepwell heritage"
              fill
              className="object-cover"
              sizes="600px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B66]/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white font-bold text-base">&ldquo;{cms.visionQuote}&rdquo;</p>
              <p className="text-white/55 text-xs mt-1">— {cms.visionQuoteAuthor}</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
