"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const FOUNDERS = [
  {
    name: "R.K. Padmaja Rathore",
    role: "Co-Founder",
    bio: "A passionate heritage conservationist with deep roots in Rajasthan, Padmaja has led community outreach and awareness initiatives for over a decade.",
    initials: "PR",
    color: "#0D3B66",
  },
  {
    name: "Ravindra Vishnoi",
    role: "Co-Founder",
    bio: "Ravindra brings expertise in traditional water systems and has coordinated restoration projects across multiple stepwells in Jodhpur.",
    initials: "RV",
    color: "#1A5493",
  },
  {
    name: "Vijendra",
    role: "Co-Founder",
    bio: "Vijendra leads volunteer mobilisation and site operations, ensuring every restoration project is executed with care, precision, and community involvement.",
    initials: "VJ",
    color: "#0369A1",
  },
];

const TEAM = [
  { name: "Caron Rawnsley",   role: "Patron & Advisor",        initials: "CR", color: "#B88445" },
  { name: "Meena Sharma",     role: "Documentation Lead",      initials: "MS", color: "#0EA5E9" },
  { name: "Suresh Bhati",     role: "Site Coordinator",        initials: "SB", color: "#0D3B66" },
  { name: "Priya Joshi",      role: "Community Outreach",      initials: "PJ", color: "#1A5493" },
  { name: "Ankit Rathore",    role: "Restoration Architect",   initials: "AR", color: "#0369A1" },
  { name: "Lalita Vishnoi",   role: "Heritage Researcher",     initials: "LV", color: "#0284C7" },
];

export default function TeamPage() {
  return (
    <div className="bg-[#F0F9FF] min-h-screen pt-[80px] md:pt-[90px]">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16">

        {/* Back link */}
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-sm text-[#0D3B66]/60 hover:text-[#0D3B66] mb-10 transition-colors"
        >
          <ArrowLeft size={14} /> Back to About
        </Link>

        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="text-[#B88445] text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">
            The People Behind the Work
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0D3B66] mb-3">Our Team</h1>
          <p className="text-[#4A6080] text-sm md:text-base max-w-xl leading-relaxed">
            Committed to preserving India's traditional water heritage for future generations.
          </p>
        </motion.div>

        {/* ── Founders ─────────────────────────────────────────────────── */}
        <div className="mb-14">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0EA5E9] mb-6">Founding Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FOUNDERS.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white border border-[#E0F2FE] rounded-3xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Avatar area */}
                <div
                  className="h-40 flex items-center justify-center text-5xl font-bold text-white"
                  style={{ backgroundColor: f.color }}
                >
                  {f.initials}
                </div>
                {/* Gold stripe */}
                <div className="h-1 bg-gradient-to-r from-[#D7C2A3] via-[#B88445] to-[#D7C2A3]" />
                <div className="p-6">
                  <h3 className="text-base font-bold text-[#0D3B66] mb-0.5">{f.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88445] mb-3">{f.role}</p>
                  <p className="text-[#4A6080] text-sm leading-relaxed">{f.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Team Members ─────────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0EA5E9] mb-6">Core Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-white border border-[#E0F2FE] rounded-2xl p-5 text-center hover:shadow-md hover:border-[#0EA5E9]/30 transition-all"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                </div>
                <p className="text-sm font-bold text-[#0D3B66] leading-tight">{member.name}</p>
                <p className="text-[10px] text-[#4A6080] mt-1 leading-snug">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Join CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 bg-[#0D3B66] rounded-3xl px-8 py-10 text-center"
        >
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Want to join our team?</h3>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
            We're always looking for passionate conservationists, architects, and community leaders.
          </p>
          <Link
            href="/get-involved"
            className="inline-flex items-center gap-2 bg-[#D7C2A3] hover:bg-[#B88445] text-[#0D3B66] hover:text-white font-bold text-sm px-8 py-3.5 rounded-full transition-all"
          >
            Apply as a Volunteer
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
