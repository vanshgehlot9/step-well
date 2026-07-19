"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Droplets, Landmark, Users, HeartHandshake, Droplet, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

const WHO_WE_ARE = [
  {
    title: "Our Purpose",
    body: "Stepwell Renovation Foundation is a non-profit dedicated to the preservation, cleanliness, and promotion of India's historic stepwells and traditional water heritage.",
  },
  {
    title: "Our Commitment",
    body: "Inspired by the extraordinary work of Caron Rawnsley, whose decade-long efforts revived awareness of Jodhpur's stepwells, we reconnect communities with their cultural and environmental significance.",
  },
  {
    title: "Dedicated Care",
    body: "Our team of skilled professionals and passionate volunteers work tirelessly to restore stepwells from neglect, bringing life back to these architectural marvels of water engineering.",
  },
  {
    title: "Roots of the Foundation",
    body: "The Foundation was established by R.K. Padmaja Rathore, Ravindra Vishnoi, and Vijendra — individuals united by a commitment to preserving traditional water systems and India's architectural heritage.",
  },
  {
    title: "Know More",
    body: "We invite you to explore our initiatives, restoration projects, and the lasting impact we are making on heritage stepwells across Rajasthan and beyond.",
  },
];

const MISSION_CARDS = [
  { title: "Stepwell Conservation",         icon: Droplets,      desc: "To preserve and restore Rajasthan's ancient stepwells through skilled, community-led conservation." },
  { title: "Heritage Awareness",            icon: Landmark,      desc: "To promote heritage awareness and educate communities on the cultural value of water architecture." },
  { title: "Community Participation",       icon: Users,         desc: "To engage local communities and volunteers in hands-on stewardship of shared cultural spaces." },
  { title: "Youth & Volunteer Engagement",  icon: HeartHandshake,desc: "To inspire youth through volunteering, creating the next generation of heritage guardians." },
  { title: "Water Conservation",            icon: Droplet,       desc: "To revive traditional water systems and raise awareness of sustainable water practices." },
  { title: "Restoration Projects",          icon: Sparkles,      desc: "To execute high-quality restoration projects with documented outcomes and community impact." },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen pt-[80px] md:pt-[90px]">

      {/* ── SECTION 1: Who We Are ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 md:px-10 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Section label */}
            <div className="flex items-center gap-2 mb-3">
              <Landmark size={18} className="text-[#D7C2A3]" />
              <span className="text-[#B88445] font-bold text-sm tracking-widest uppercase">Who We Are</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#0D3B66] leading-snug mb-8">
              We Are Stepwells Renovater
            </h1>

            <div className="space-y-6">
              {WHO_WE_ARE.map(({ title, body }) => (
                <div key={title} className="flex items-start gap-3">
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

          {/* Right: two stacked images */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg">
              <Image src="/toorji.jpg" alt="Toorji Ka Jhalra stepwell" fill className="object-cover" sizes="600px" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B66]/50 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-white text-sm font-semibold">Toorji Ka Jhalra</p>
                <p className="text-white/60 text-xs">Jodhpur, Rajasthan</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-40 rounded-2xl overflow-hidden shadow-md">
                <Image src="/mahamandirhero.jpeg" alt="Mahamandir restoration" fill className="object-cover" sizes="300px" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B66]/50 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-white text-xs font-semibold">Mahamandir Bawri</p>
                </div>
              </div>
              <div className="relative h-40 rounded-2xl overflow-hidden shadow-md">
                <Image src="/story.jpeg" alt="Volunteer restoration" fill className="object-cover" sizes="300px" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B66]/50 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-white text-xs font-semibold">Community Work</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: Our Mission ────────────────────────────────────────── */}
      <section className="bg-[#0D3B66] py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5 md:px-10">

          {/* Label */}
          <div className="flex items-center gap-2 mb-4">
            <Landmark size={18} className="text-[#D7C2A3]" />
            <span className="text-[#D7C2A3] font-bold text-sm tracking-widest uppercase">Our Mission</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white leading-snug mb-4 max-w-2xl">
            We Are Guided By Heritage, Community &amp; Purpose
          </h2>
          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-3xl mb-12">
            Our mission is to preserve and revive India's traditional water heritage through community participation, environmental stewardship, and sustainable conservation. We reconnect people with their cultural roots by restoring the stepwells that once formed the heart of every community.
          </p>

          {/* Mission cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MISSION_CARDS.slice(0, 4).map(({ title, icon: Icon, desc }, i) => (
              <motion.div
                key={title}
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
                <p className="text-white/55 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {MISSION_CARDS.slice(4).map(({ title, icon: Icon, desc }, i) => (
              <motion.div
                key={title}
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
                <p className="text-white/55 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Our Vision ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Landmark size={18} className="text-[#D7C2A3]" />
              <span className="text-[#B88445] font-bold text-sm tracking-widest uppercase">Our Vision</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0D3B66] leading-snug mb-6">
              To Give Every Stepwell A Future As Great As Its Past
            </h2>
            <p className="text-[#4A6080] text-sm md:text-base leading-relaxed mb-4">
              Our vision is a Rajasthan where every ancient stepwell is restored, celebrated, and maintained as a living cultural landmark — not just a relic of the past but a source of community pride and sustainable water wisdom.
            </p>
            <p className="text-[#4A6080] text-sm leading-relaxed">
              We strive to be a comprehensive resource, providing education on heritage conservation, connecting compassionate individuals with restoration efforts, and working with local governments to protect these irreplaceable structures for generations to come.
            </p>

            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 bg-[#0D3B66] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#0EA5E9] transition-colors mt-8"
            >
              Join the Movement <ArrowRight size={15} />
            </Link>
          </motion.div>

          {/* Right: hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative h-80 md:h-96 rounded-3xl overflow-hidden shadow-xl"
          >
            <Image src="/hero1.png" alt="Stepwell heritage" fill className="object-cover" sizes="600px" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B66]/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white font-bold text-base">"Preserving water. Preserving culture. Preserving identity."</p>
              <p className="text-white/55 text-xs mt-1">— Stepwells Renovater Foundation</p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
