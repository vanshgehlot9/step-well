"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Instagram } from "lucide-react";
import { usePublicCMS } from "@/lib/use-cms";
import { TeamCMS } from "@/lib/cms-types";
import { DEFAULT_TEAM_CMS } from "@/lib/cms-defaults";

export default function TeamPage() {
  const { data, unpublished } = usePublicCMS<TeamCMS>("team");

  if (unpublished || !data) {
    return (
      <div className="bg-[#F0F9FF] min-h-screen pt-[120px] px-6 text-center text-[#0D3B66]">
        <h1 className="text-2xl font-serif font-bold">Our Team</h1>
        <p className="text-sm text-[#4A6080] mt-2">This section is currently unpublished.</p>
      </div>
    );
  }

  const cms = data || DEFAULT_TEAM_CMS;
  const visibleMembers = [...(cms.members || [])]
    .filter((m) => m.visible)
    .sort((a, b) => a.order - b.order);

  const founders = visibleMembers.filter((m) => m.group === "founder");
  const coreTeam = visibleMembers.filter((m) => m.group === "core");

  return (
    <div className="bg-[#F0F9FF] min-h-screen pt-[80px] md:pt-[90px]">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-sm text-[#0D3B66]/60 hover:text-[#0D3B66] mb-10 transition-colors"
        >
          <ArrowLeft size={14} /> Back to About
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="text-[#B88445] text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">
            {cms.eyebrow}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0D3B66] mb-3">{cms.heading}</h1>
          <p className="text-[#4A6080] text-sm md:text-base max-w-xl leading-relaxed">
            {cms.description}
          </p>
        </motion.div>

        {/* Founders */}
        {founders.length > 0 && (
          <div className="mb-14">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0EA5E9] mb-6">
              {cms.foundersHeading}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {founders.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white border border-[#E0F2FE] rounded-3xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {f.photo ? (
                    <div className="h-52 w-full overflow-hidden bg-slate-100">
                      <img src={f.photo} alt={f.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className="h-40 flex items-center justify-center text-5xl font-bold text-white"
                      style={{ backgroundColor: f.accentColor || "#0D3B66" }}
                    >
                      {f.initials}
                    </div>
                  )}
                  <div className="h-1 bg-gradient-to-r from-[#D7C2A3] via-[#B88445] to-[#D7C2A3]" />
                  <div className="p-6">
                    <h3 className="text-base font-bold text-[#0D3B66] mb-0.5">{f.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88445] mb-3">
                      {f.designation}
                    </p>
                    <p className="text-[#4A6080] text-sm leading-relaxed">{f.biography}</p>
                    {(f.socialLinks?.instagram || f.socialLinks?.linkedin) && (
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#F0F9FF]">
                        {f.socialLinks.instagram && (
                          <a
                            href={f.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0D3B66]/60 hover:text-[#0EA5E9]"
                          >
                            <Instagram size={15} />
                          </a>
                        )}
                        {f.socialLinks.linkedin && (
                          <a
                            href={f.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0D3B66]/60 hover:text-[#0EA5E9]"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Core Team */}
        {coreTeam.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0EA5E9] mb-6">
              {cms.coreTeamHeading}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {coreTeam.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="bg-white border border-[#E0F2FE] rounded-2xl p-5 text-center hover:shadow-md hover:border-[#0EA5E9]/30 transition-all"
                >
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-14 h-14 rounded-full object-cover mx-auto mb-3 border border-[#E0F2FE]"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3"
                      style={{ backgroundColor: member.accentColor || "#0D3B66" }}
                    >
                      {member.initials}
                    </div>
                  )}
                  <p className="text-sm font-bold text-[#0D3B66] leading-tight">{member.name}</p>
                  <p className="text-[10px] text-[#4A6080] mt-1 leading-snug">{member.designation}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Join CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 bg-[#0D3B66] rounded-3xl px-8 py-10 text-center"
        >
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{cms.joinHeading}</h3>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">{cms.joinDescription}</p>
          <Link
            href={cms.joinCtaUrl || "/get-involved"}
            className="inline-flex items-center gap-2 bg-[#D7C2A3] hover:bg-[#B88445] text-[#0D3B66] hover:text-white font-bold text-sm px-8 py-3.5 rounded-full transition-all"
          >
            {cms.joinCtaLabel}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
