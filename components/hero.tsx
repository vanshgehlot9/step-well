"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full font-sans pt-[80px] md:pt-[90px]">

      {/* Full-bleed image container — edge to edge, fixed height, NO rounded corners */}
      <div className="relative w-full h-[300px] sm:h-[380px] md:h-[460px] lg:h-[520px] overflow-hidden">

        {/* Background Image */}
        <div className="absolute inset-0 z-0 bg-black">
          <Image
            src="/hero1.png"
            alt="Stepwell restoration volunteers working together"
            fill
            className="object-cover object-center opacity-90"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-10 md:px-16 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="max-w-[620px]"
          >
            <h1
              className="font-serif font-semibold text-white leading-[1.0] tracking-[-0.02em] drop-shadow-lg"
              style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
            >
              Restore Stepwells.
              <br />
              Revive Communities.
            </h1>

            <p className="mt-4 max-w-[440px] text-[0.9rem] md:text-[1.05rem] font-light text-white/85 leading-relaxed drop-shadow">
              Preserving heritage, restoring water, and creating lasting impact.
            </p>

            <div className="mt-6 md:mt-8 flex flex-row gap-3">
              <Link
                href="/get-involved"
                className="inline-flex items-center justify-center rounded-full border border-white/60 bg-black/30 backdrop-blur-sm px-6 md:px-7 py-2.5 md:py-3 text-[0.85rem] md:text-[0.9rem] font-medium text-white transition-all duration-300 hover:bg-white hover:text-[#0D3B66] whitespace-nowrap"
              >
                Join the Movement
              </Link>
              <Link
                href="/donate"
                className="inline-flex items-center justify-center rounded-full bg-[#0D6EFD] px-6 md:px-7 py-2.5 md:py-3 text-[0.85rem] md:text-[0.9rem] font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#0B5ED7] whitespace-nowrap"
              >
                Donate Now
              </Link>
            </div>
          </motion.div>
        </div>


      </div>
    </section>
  );
}
