"use client";

import Link from "next/link";
import { Instagram, Mail, MapPin, Phone, ArrowUpRight, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV_COLS = [
  {
    heading: "Foundation",
    links: [
      { label: "About Us",     href: "/about"        },
      { label: "Our Projects", href: "/#projects"    },
      { label: "Our Team",     href: "/team"         },
    ],
  },
  {
    heading: "Get Involved",
    links: [
      { label: "Volunteer",    href: "/get-involved"  },
      { label: "Donate",       href: "/donate"        },
      { label: "Become a Partner", href: "/partner"   },
      { label: "Foundation Store Partner", href: "/store-partner" },
      { label: "Shop",         href: "/shop"          },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/store-owner")) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#070f1c] text-white">

      {/* ══════════════════════════════════════════════════════════════════
          CTA STRIP
      ══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        {/* Background accent glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-6 md:px-10 py-12 md:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-10">

            {/* Headline */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#0ea5e9] mb-4">
                Join the Movement
              </p>
              <h2 className="font-serif font-light text-3xl sm:text-4xl md:text-5xl leading-[1.1] text-white">
                Every hand that cleans a stone
                <br className="hidden sm:block" />
                <em className="not-italic text-[#38bdf8]/75"> writes history.</em>
              </h2>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/get-involved"
                className="group inline-flex items-center justify-center gap-2.5 bg-white text-[#070f1c] text-xs font-bold tracking-[0.18em] uppercase px-8 py-4 rounded-full hover:bg-[#0ea5e9] hover:text-white transition-all duration-300 shadow-[0_4px_24px_rgba(14,165,233,0.18)]"
              >
                Become a Guardian
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link
                href="/donate"
                className="group inline-flex items-center justify-center gap-2.5 border border-white/20 text-white/80 text-xs font-bold tracking-[0.18em] uppercase px-8 py-4 rounded-full hover:border-white/50 hover:text-white transition-all duration-300"
              >
                Donate
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN FOOTER BODY
      ══════════════════════════════════════════════════════════════════ */}
      <div className="container mx-auto px-6 md:px-10 pt-12 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr] gap-10 lg:gap-8">

          {/* ── Col 1: Brand ──────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-white/10 group-hover:ring-white/30 transition-all">
                <img src="/logo.jpeg" alt="Stepwells Renovater Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-serif text-[1.15rem] font-bold text-white tracking-tight">
                Stepwells<span className="text-[#0ea5e9]">Renovater</span>
              </span>
            </Link>

            <p className="text-white/40 text-[13px] leading-relaxed max-w-[240px]">
              Reviving Rajasthan&apos;s ancient water heritage, one stepwell at a time. A people&apos;s movement to preserve history and fight water scarcity.
            </p>

            {/* Social icons */}
            <div className="flex gap-2">
              <a
                href="https://instagram.com/stepwells_renovater"
                target="_blank" rel="noopener noreferrer"
                aria-label="Follow on Instagram"
                className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/35 hover:text-white hover:border-[#0ea5e9]/60 hover:bg-[#0ea5e9]/10 transition-all duration-250"
              >
                <Instagram size={15} />
              </a>
              <a
                href="mailto:support@stepwellsrenovaterfoundation.org"
                aria-label="Email us"
                className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/35 hover:text-white hover:border-[#0ea5e9]/60 hover:bg-[#0ea5e9]/10 transition-all duration-250"
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* ── Cols 2 & 3: Navigation ────────────────────────────────── */}
          {NAV_COLS.map((col) => (
            <div key={col.heading}>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.28em] text-white/22 mb-5">
                {col.heading}
              </p>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-white/48 hover:text-white text-[13.5px] transition-colors duration-200"
                    >
                      <span className="block w-0 h-px bg-[#0ea5e9] group-hover:w-3 transition-all duration-300 ease-out" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* ── Col 4: Contact ────────────────────────────────────────── */}
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.28em] text-white/22 mb-5">
              Reach Us
            </p>

            <div className="space-y-5">
              {/* Location */}
              <a
                href="https://maps.google.com/?q=Toorji+Ka+Jhalra+Jodhpur"
                target="_blank" rel="noopener noreferrer"
                className="group flex items-start gap-3"
              >
                <div className="mt-0.5 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0 group-hover:border-[#0ea5e9]/40 group-hover:bg-[#0ea5e9]/08 transition-all">
                  <MapPin size={13} className="text-[#0ea5e9]/65" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25 mb-0.5">Location</p>
                  <p className="text-white/55 text-[12.5px] leading-snug group-hover:text-white/80 transition-colors">
                    Near Toorji Ka Jhalra,<br />Jodhpur, Rajasthan 342001
                  </p>
                </div>
              </a>

              {/* Phone */}
              <a href="tel:+919571179677" className="group flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0 group-hover:border-[#0ea5e9]/40 group-hover:bg-[#0ea5e9]/08 transition-all">
                  <Phone size={13} className="text-[#0ea5e9]/65" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25 mb-0.5">Phone</p>
                  <p className="text-white/55 text-[12.5px] group-hover:text-white/80 transition-colors">+91 95711 79677</p>
                </div>
              </a>

              {/* Email */}
              <a href="mailto:support@stepwellsrenovaterfoundation.org" className="group flex items-start gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0 group-hover:border-[#0ea5e9]/40 group-hover:bg-[#0ea5e9]/08 transition-all">
                  <Mail size={13} className="text-[#0ea5e9]/65" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25 mb-0.5">Email</p>
                  <p className="text-white/55 text-[12.5px] leading-snug group-hover:text-white/80 transition-colors break-all">
                    support@stepwellsrenovater<wbr />foundation.org
                  </p>
                </div>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM BAR
      ══════════════════════════════════════════════════════════════════ */}
      <div className="border-t border-white/[0.05]">
        <div className="container mx-auto px-6 md:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">

          <p className="text-[11px] text-white/22 tracking-wide">
            © {year} Stepwells Renovater Foundation. All rights reserved.
          </p>

          {/* Shivkara Digital credit */}
          <a
            href="https://shivkaradigital.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-[11px] text-white/22 hover:text-white/50 transition-colors duration-300"
          >
            Crafted by
            <span className="font-semibold text-[#0ea5e9]/50 group-hover:text-[#0ea5e9] transition-colors">
              Shivkara Digital
            </span>
            <ExternalLink size={10} className="opacity-40 group-hover:opacity-80 transition-opacity" />
          </a>

        </div>
      </div>

    </footer>
  );
}
