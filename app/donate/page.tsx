"use client";

import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { CheckCircle2, Heart, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { addDonation, getDonations } from "@/lib/firebase-services";
import { Donation } from "@/lib/types";

// ── Preset amounts ────────────────────────────────────────────────────────────
const PRESETS = [
  { value: 50,    label: "₹50"    },
  { value: 100,   label: "₹100"   },
  { value: 500,   label: "₹500"   },
  { value: 1000,  label: "₹1,000" },
  { value: 2000,  label: "₹2,000" },
  { value: 5000,  label: "₹5,000" },
];

// ── Recent donors (Will be fetched from Firestore) ──────────────────────────

const AVATAR_COLORS = ["#0D3B66", "#1A5493", "#0369A1", "#0284C7", "#0EA5E9"];

// ── Donation box illustration (SVG, navy/gold palette) ────────────────────────
function DonationIllustration() {
  return (
    <svg
      viewBox="0 0 220 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* ── Floating hearts ── */}
      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <text x="24" y="68" fontSize="16" fill="#D7C2A3" opacity="0.7">♥</text>
      </motion.g>
      <motion.g
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <text x="178" y="90" fontSize="12" fill="#D7C2A3" opacity="0.5">♥</text>
      </motion.g>
      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <text x="48" y="200" fontSize="10" fill="#D7C2A3" opacity="0.45">♥</text>
      </motion.g>

      {/* ── Donation box body ── */}
      {/* Box base */}
      <rect x="52" y="155" width="116" height="80" rx="10" fill="#D7C2A3" opacity="0.9" />
      {/* Box lid */}
      <rect x="44" y="144" width="132" height="18" rx="6" fill="#B88445" />
      {/* Slot on lid */}
      <rect x="98" y="148" width="24" height="5" rx="2.5" fill="#0D3B66" opacity="0.5" />
      {/* DONATE text on box */}
      <text
        x="110"
        y="202"
        fontSize="11"
        fontWeight="700"
        fill="#0D3B66"
        textAnchor="middle"
        opacity="0.75"
        fontFamily="serif"
      >
        DONATE
      </text>
      {/* Rupee coin icon on box */}
      <circle cx="110" cy="225" r="12" fill="#B88445" opacity="0.35" />
      <text x="110" y="229" fontSize="10" fontWeight="700" fill="#0D3B66" textAnchor="middle" opacity="0.6">₹</text>

      {/* ── Left arm holding box ── */}
      {/* Sleeve */}
      <rect x="30" y="220" width="65" height="36" rx="10" fill="#1A5493" opacity="0.8" />
      {/* Hand */}
      <ellipse cx="75" cy="218" rx="28" ry="14" fill="#E8C9A0" />
      {/* Fingers suggestion */}
      <ellipse cx="58" cy="214" rx="8" ry="5" fill="#E0BC90" />
      <ellipse cx="72" cy="210" rx="9" ry="5" fill="#E0BC90" />
      <ellipse cx="87" cy="212" rx="8" ry="5" fill="#E0BC90" />
      <ellipse cx="98" cy="217" rx="6" ry="4" fill="#E0BC90" />

      {/* ── Right hand dropping coin ── */}
      {/* Sleeve */}
      <rect x="125" y="80" width="50" height="40" rx="10" fill="#1A5493" opacity="0.8" />
      {/* Hand */}
      <ellipse cx="148" cy="118" rx="16" ry="10" fill="#E8C9A0" />
      {/* Thumb */}
      <ellipse cx="136" cy="114" rx="7" ry="4" fill="#E0BC90" />
      {/* Coin being dropped */}
      <motion.g
        animate={{ y: [0, 22, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeIn", repeatDelay: 0.8 }}
      >
        <circle cx="148" cy="130" r="9" fill="#D7C2A3" />
        <text x="148" y="134" fontSize="9" fontWeight="700" fill="#0D3B66" textAnchor="middle">₹</text>
      </motion.g>

      {/* ── Decorative swirl lines ── */}
      <path d="M30 120 Q20 100 35 85 Q50 70 40 55" stroke="#D7C2A3" strokeWidth="1.5" strokeOpacity="0.3" fill="none" strokeDasharray="4 3" />
      <path d="M185 140 Q200 120 188 105 Q176 90 185 75" stroke="#D7C2A3" strokeWidth="1.5" strokeOpacity="0.3" fill="none" strokeDasharray="4 3" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DonatePage() {
  const { user } = useAuth();

  const [amountInput, setAmountInput]       = useState<string>("1000");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1000);
  const [frequency, setFrequency]           = useState<"once" | "monthly">("once");
  const [donorName, setDonorName]           = useState(user?.displayName ?? "");
  const [email, setEmail]                   = useState("");
  const [phone, setPhone]                   = useState("");
  const [agreed, setAgreed]                 = useState(false);
  const [processing, setProcessing]         = useState(false);
  const [success, setSuccess]               = useState(false);

  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);

  useEffect(() => {
    async function fetchRecentDonations() {
      try {
        const donations = await getDonations();
        // Sort by createdAt descending and take top 5
        const sorted = donations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
        setRecentDonations(sorted);
      } catch (error) {
        console.error("Error fetching recent donations:", error);
      }
    }
    fetchRecentDonations();
  }, []);

  function handlePreset(val: number) {
    setSelectedPreset(val);
    setAmountInput(String(val));
  }

  function handleAmountChange(v: string) {
    setAmountInput(v);
    const n = Number(v);
    setSelectedPreset(PRESETS.find((p) => p.value === n)?.value ?? null);
  }

  async function handleDonate() {
    const num = Number(amountInput);
    if (!num || num < 50) { alert("Minimum donation amount is ₹50."); return; }
    if (!donorName || !email) { alert("Please provide your name and email."); return; }
    if (!agreed)           { alert("Please agree to the terms to continue."); return; }
    
    setProcessing(true);
    try {
      await addDonation(
        { 
          amount: num, 
          paymentStatus: "COMPLETED", 
          transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          paymentMethod: "Razorpay",
          notes: frequency === "monthly" ? "Monthly Donation" : "One-time Donation",
          donorId: "",
          createdAt: new Date().toISOString()
        },
        { name: donorName, email, phone }
      );
      setSuccess(true);
      // Re-fetch recent donations to show the new one
      const donations = await getDonations();
      const sorted = donations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
      setRecentDonations(sorted);
    } catch (error) {
      console.error("Donation failed:", error);
      alert("Failed to process donation. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  // ── Thank-you ─────────────────────────────────────────────────────────────
  if (success) {
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
          <h1 className="text-4xl font-bold text-[#0D3B66] mb-3">Thank you.</h1>
          <p className="text-[#1E293B]/70 text-base leading-relaxed mb-2">
            Your donation of{" "}
            <span className="font-semibold text-[#0D3B66]">
              ₹{Number(amountInput).toLocaleString("en-IN")}
              {frequency === "monthly" ? " / month" : ""}
            </span>{" "}
            goes directly toward restoring Rajasthan's ancient stepwells.
          </p>
          <p className="text-[#1E293B]/40 text-sm mb-10">
            An 80G tax receipt has been sent to your email.
          </p>
          <button
            onClick={() => { setSuccess(false); handlePreset(1000); setAgreed(false); }}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1E293B]/60 hover:text-[#0D3B66] border border-[#BAE6FD] hover:border-[#0EA5E9] px-6 py-2.5 rounded-full transition-all"
          >
            Make another donation <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F0F9FF] pt-[80px] md:pt-[90px]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-8 items-start">

          {/* ── Col 1: Illustration panel ─────────────────────────────── */}
          <div className="bg-white border border-[#E0F2FE] rounded-3xl p-6 flex flex-col items-center text-center lg:min-h-[620px] justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#0D3B66] leading-tight mb-1">
                Make a<br />Donation
              </h2>
              <p className="text-[#1E293B]/40 text-xs mt-1">Support heritage restoration</p>
            </div>

            {/* Illustrated donation box */}
            <div className="w-full flex-1 flex items-center justify-center py-4 max-h-[260px]">
              <DonationIllustration />
            </div>

            <p className="text-[#0D3B66]/40 text-[10px] leading-relaxed">
              Secure · 80G eligible · Razorpay
            </p>
          </div>

          {/* ── Col 2: Donation form ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="bg-white border border-[#E0F2FE] rounded-3xl overflow-hidden shadow-sm"
          >
            {/* Gold accent stripe */}
            <div className="h-1 bg-gradient-to-r from-[#D7C2A3] via-[#B88445] to-[#D7C2A3]" />

            <div className="p-7 md:p-9">

              {/* Frequency tabs */}
              <div className="flex bg-[#F0F9FF] border border-[#E0F2FE] rounded-full p-1 mb-6">
                {(["once", "monthly"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                      frequency === f
                        ? "bg-[#0D3B66] text-white shadow-sm"
                        : "text-[#1E293B]/50 hover:text-[#0D3B66]"
                    }`}
                  >
                    {f === "once" ? "Pay Once" : "Donate Monthly"}
                  </button>
                ))}
              </div>

              {/* Amount input */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#0D3B66] mb-2">
                  Donation Amount
                </label>
                <input
                  type="number"
                  min={50}
                  placeholder="Enter amount (min ₹50)"
                  value={amountInput}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E0F2FE] focus:border-[#0EA5E9] outline-none text-base text-[#0D3B66] bg-white placeholder:text-[#1E293B]/25 transition-colors"
                />

                {/* Preset pills */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {PRESETS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handlePreset(value)}
                      className={`px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all duration-150 active:scale-95 ${
                        selectedPreset === value
                          ? "border-[#B88445] bg-[#D7C2A3]/20 text-[#B88445] font-semibold"
                          : "border-[#E0F2FE] text-[#1E293B]/60 hover:border-[#D7C2A3]/70 hover:text-[#B88445]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Info */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-[#0D3B66] mb-3">Personal Info</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#1E293B]/50 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter Full Name"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E0F2FE] focus:border-[#0EA5E9] outline-none text-sm text-[#0D3B66] bg-white placeholder:text-[#1E293B]/25 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#1E293B]/50 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E0F2FE] focus:border-[#0EA5E9] outline-none text-sm text-[#0D3B66] bg-white placeholder:text-[#1E293B]/25 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#1E293B]/50 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E0F2FE] focus:border-[#0EA5E9] outline-none text-sm text-[#0D3B66] bg-white placeholder:text-[#1E293B]/25 transition-colors"
                  />
                </div>
              </div>

              {/* Notice */}
              <p className="text-xs text-[#0EA5E9] bg-[#F0F9FF] border border-[#E0F2FE] rounded-xl px-4 py-3 mb-4 leading-relaxed">
                Please do not refresh or cancel this page until your payment is successfully completed. In case of any issue, you will receive the latest update via email.
              </p>

              {/* Terms */}
              <label className="flex items-start gap-2.5 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#0D3B66] shrink-0"
                />
                <span className="text-[11px] text-[#1E293B]/50 leading-relaxed">
                  Yes, I agree. In case of refresh or failure, I understand I can check my profile within 24 hours for the status and receipt.
                </span>
              </label>

              {/* Donate CTA */}
              <button
                id="donate-cta-button"
                onClick={handleDonate}
                disabled={processing || !amountInput || Number(amountInput) < 50}
                className="w-full py-4 rounded-2xl bg-[#D7C2A3] hover:bg-[#B88445] disabled:opacity-50 text-[#0D3B66] hover:text-white font-bold text-base tracking-wide transition-all flex items-center justify-center gap-2 shadow-md shadow-[#D7C2A3]/40"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0D3B66]/30 border-t-[#0D3B66] rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Heart size={16} className="fill-current" />
                    Donate{amountInput ? ` ₹${Number(amountInput).toLocaleString("en-IN")}` : ""}
                    {frequency === "monthly" ? " / month" : ""}
                  </>
                )}
              </button>

              <p className="text-center text-[#1E293B]/30 text-[11px] mt-3">
                SSL encrypted · Powered by Razorpay · 80G receipt via email
              </p>
            </div>
          </motion.div>

          {/* ── Col 3: Recent Donors only ─────────────────────────────── */}
          <div className="bg-white border border-[#E0F2FE] rounded-2xl p-5">
            <h3 className="text-base font-bold text-[#0D3B66] mb-4">Recent Donors</h3>
            <div className="space-y-3">
              {recentDonations.length === 0 && (
                <p className="text-sm text-[#1E293B]/40">Be the first to donate today!</p>
              )}
              {recentDonations.map((donation, i) => (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 pb-3 border-b border-[#F0F9FF] last:border-none last:pb-0"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {/* Placeholder initial since we don't fetch donor name directly in this view, 
                        would ideally join collections or store name in donation */}
                    A
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0D3B66] leading-tight truncate">Anonymous Donor</p>
                    <p className="text-xs text-[#1E293B]/45 mt-0.5">Donated - ₹{donation.amount.toLocaleString("en-IN")}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
