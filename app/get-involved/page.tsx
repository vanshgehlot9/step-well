"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { addVolunteer } from "@/lib/firebase-services";

const BULLET_POINTS = [
  "Volunteering is completely free — no charges for participation.",
  "If things are not working out, coordinators reserve the right to ask you to leave.",
  "Do not begin any restoration work without instruction from site coordinators.",
  "Respect all heritage structures and follow all site safety guidelines at all times.",
  "Personal belongings are the volunteer's own responsibility at all times.",
];

export default function GetInvolvedPage() {
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [email, setEmail]           = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [location, setLocation]     = useState("");
  const [visited, setVisited]       = useState<"yes" | "no" | null>(null);
  const [comments, setComments]     = useState("");
  const [agreed, setAgreed]         = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName || !lastName || !email || !startDate || !location) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!agreed) {
      alert("Please agree to the terms to continue.");
      return;
    }
    setSubmitting(true);
    try {
      await addVolunteer({
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        phone: "",
        address: location,
        skills: [],
        availability: `From ${startDate}${endDate ? ` to ${endDate}` : ""}`,
        experience: visited === "yes" ? "Has visited or volunteered before" : "New volunteer",
        status: "PENDING",
        notes: comments
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Thank-you screen ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center px-5 pt-[80px] md:pt-[90px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-[#0EA5E9]" />
          </div>
          <h1 className="text-4xl font-bold text-[#0D3B66] mb-3">Application Received.</h1>
          <p className="text-[#1E293B]/70 text-base leading-relaxed mb-10">
            Thank you, <span className="font-semibold text-[#0D3B66]">{firstName}</span>. Our team will reach out to you shortly with next steps.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFirstName(""); setLastName(""); setEmail("");
              setStartDate(""); setEndDate(""); setLocation("");
              setVisited(null); setComments(""); setAgreed(false);
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1E293B]/60 hover:text-[#0D3B66] border border-[#BAE6FD] hover:border-[#0EA5E9] px-6 py-2.5 rounded-full transition-all"
          >
            Submit another application
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F0F9FF] pt-[80px] md:pt-[90px]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-0 shadow-lg rounded-3xl overflow-hidden">

          {/* ── Left: Info panel ─────────────────────────────────────────── */}
          <div className="bg-[#0D3B66] p-8 md:p-10 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-snug mb-4">
                Become A{" "}
                <span className="text-[#D7C2A3]">Volunteer</span>{" "}
                At<br />Stepwells Renovater
              </h1>
              <p className="text-white/65 text-sm leading-relaxed mb-8">
                Welcome to our volunteer section dedicated to the preservation of Rajasthan's ancient stepwells. We appreciate your interest in contributing your time and effort to restore these incredible water heritage structures for future generations.
              </p>

              {/* Bullet points */}
              <ul className="space-y-4">
                {BULLET_POINTS.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      {/* Paw-like stepwell icon — simple circle with wave */}
                      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                        <circle cx="10" cy="10" r="8" stroke="#D7C2A3" strokeWidth="1.5" />
                        <path d="M6 10 Q10 6 14 10" stroke="#D7C2A3" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                        <path d="M7 13 Q10 10 13 13" stroke="#D7C2A3" strokeWidth="1" fill="none" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-white/30 text-xs mt-8">
              Stepwells Renovater · Heritage Conservation · Jodhpur, Rajasthan
            </p>
          </div>

          {/* ── Right: Application form ───────────────────────────────────── */}
          <div className="bg-white p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0D3B66] mb-8">
              Volunteer Application
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Row 1: First Name + Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#1E293B]/70 mb-1.5">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E0F2FE] focus:border-[#0EA5E9] outline-none text-sm text-[#0D3B66] bg-[#F8FBFF] placeholder:text-[#1E293B]/25 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B]/70 mb-1.5">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E0F2FE] focus:border-[#0EA5E9] outline-none text-sm text-[#0D3B66] bg-[#F8FBFF] placeholder:text-[#1E293B]/25 transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Email + Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#1E293B]/70 mb-1.5">
                    Email ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E0F2FE] focus:border-[#0EA5E9] outline-none text-sm text-[#0D3B66] bg-[#F8FBFF] placeholder:text-[#1E293B]/25 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B]/70 mb-1.5">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E0F2FE] focus:border-[#0EA5E9] outline-none text-sm text-[#0D3B66] bg-[#F8FBFF] transition-colors"
                  />
                </div>
              </div>

              {/* Row 3: End Date + Where Are You From */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#1E293B]/70 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E0F2FE] focus:border-[#0EA5E9] outline-none text-sm text-[#0D3B66] bg-[#F8FBFF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B]/70 mb-1.5">
                    Where Are You From? <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E0F2FE] focus:border-[#0EA5E9] outline-none text-sm text-[#0D3B66] bg-[#F8FBFF] placeholder:text-[#1E293B]/25 transition-colors"
                  />
                </div>
              </div>

              {/* Visited before? */}
              <div>
                <label className="block text-sm font-medium text-[#1E293B]/70 mb-3">
                  Have you visited or volunteered with us before?
                </label>
                <div className="flex gap-3">
                  {(["yes", "no"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setVisited(opt)}
                      className={`px-7 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        visited === opt
                          ? "bg-[#0D3B66] text-white border-[#0D3B66]"
                          : "border-[#E0F2FE] text-[#1E293B]/60 hover:border-[#0D3B66]/30 bg-[#F8FBFF]"
                      }`}
                    >
                      {opt === "yes" ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-[#1E293B]/70 mb-1.5">
                  Do you have any questions / comments?
                </label>
                <textarea
                  placeholder="Enter your comments or questions"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[#E0F2FE] focus:border-[#0EA5E9] outline-none text-sm text-[#0D3B66] bg-[#F8FBFF] placeholder:text-[#1E293B]/25 transition-colors resize-none"
                />
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#0D3B66] shrink-0"
                />
                <span className="text-xs text-[#1E293B]/55 leading-relaxed">
                  Yes, I agree. I have read and understood the volunteering terms and conditions listed above.
                </span>
              </label>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-[#D7C2A3] hover:bg-[#B88445] disabled:opacity-50 text-[#0D3B66] hover:text-white font-bold text-base tracking-wide transition-all flex items-center justify-center gap-2 shadow-md shadow-[#D7C2A3]/40"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0D3B66]/30 border-t-[#0D3B66] rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
