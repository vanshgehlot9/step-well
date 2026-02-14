"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, ShieldCheck, ScrollText } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ref, push, set, serverTimestamp } from "firebase/database";
import { db } from "@/lib/firebase";

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    city: z.string().min(2, "City is required"),
    availability: z.enum(["weekends", "weekdays", "flexible"]),
    skills: z.string().optional(),
    message: z.string().optional(),
    termsAccepted: z.boolean().refine((val) => val === true, {
        message: "You must agree to the Terms & Conditions",
    }),
});

type FormData = z.infer<typeof formSchema>;

const TERMS = [
    "Participation is completely voluntary and unpaid.",
    "Volunteers must be physically fit and responsible for their own health and safety.",
    "Volunteers must follow instructions given by coordinators at all times.",
    "Personal belongings are the sole responsibility of the volunteer.",
    "Risk & Liability Disclaimer: Volunteers participate at their own risk. The organization, its trustees, coordinators, and associated authorities shall not be responsible or liable for any injury, accident, illness, disability, death, loss, or damage to volunteers or their personal property during or after the activity.",
    "Volunteers must respect the heritage site and avoid any damage, littering, or misuse of the property.",
    "Photos and videos taken during activities may be used for documentation and awareness purposes.",
    "Any misconduct, unsafe behavior, or violation of rules may result in immediate removal from the activity.",
    "The organization reserves the right to modify or cancel the activity due to safety, weather, or administrative reasons.",
    "By participating, volunteers confirm that they have read, understood, and agreed to these terms and conditions."
];

export default function GetInvolvedPage() {
    const [submitted, setSubmitted] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            availability: "weekends",
        }
    });

    const termsAccepted = watch("termsAccepted");

    const onSubmit = async (data: FormData) => {
        try {
            const newRef = push(ref(db, "volunteers"));
            await set(newRef, {
                name: data.name,
                email: data.email,
                phone: data.phone,
                city: data.city,
                availability: data.availability,
                skills: data.skills || "",
                message: data.message || "",
                createdAt: serverTimestamp(),
            });
            setSubmitted(true);
            reset();
        } catch (error) {
            console.error("Error submitting volunteer form:", error);
            alert("Failed to submit. Please try again.");
        }
    };

    return (
        <div className="bg-black min-h-screen selection:bg-accent-blue selection:text-white relative overflow-hidden">
            {/* Background Texture & Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-blue/20 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-12 md:pb-24 relative z-10">
                <div className="flex flex-col items-center justify-center">

                    {/* Header */}
                    <div className="text-center mb-8 md:mb-12 space-y-4 md:space-y-6 max-w-2xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="text-accent-blue/80 font-sans text-[10px] tracking-[0.3em] uppercase font-bold border border-accent-blue/20 px-3 py-1 rounded-sm inline-block mb-3 md:mb-4">
                                Volunteer Now
                            </span>
                            <h1 className="font-serif text-3xl md:text-6xl font-light text-white leading-tight">
                                Join the <span className="font-semibold italic text-accent-blue">Registry.</span>
                            </h1>
                            <p className="text-sm md:text-lg text-white/50 font-light leading-relaxed mt-3 md:mt-4 max-w-lg mx-auto">
                                Stepwells Renovater is built on the hands and hearts of volunteers. Sign up below to join our next restoration drive.
                            </p>
                        </motion.div>
                    </div>

                    {/* The Application Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="w-full max-w-3xl"
                    >
                        <div className="bg-white/[0.02] backdrop-blur-md rounded-3xl md:rounded-[2.5rem] p-5 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
                            {/* Decorative Glow */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />

                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="text-center py-16 md:py-24 px-4 md:px-8"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                                            className="w-20 h-20 md:w-24 md:h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border border-green-500/20"
                                        >
                                            <ShieldCheck size={40} strokeWidth={1.5} />
                                        </motion.div>
                                        <h3 className="text-2xl md:text-4xl font-serif font-light text-white mb-3 md:mb-4">Welcome, Guardian.</h3>
                                        <p className="text-white/60 text-sm md:text-lg mb-6 md:mb-8 max-w-md mx-auto">
                                            Your pledge has been recorded. We will contact you via WhatsApp for the next deployment.
                                        </p>
                                        <Button
                                            onClick={() => setSubmitted(false)}
                                            variant="ghost"
                                            className="text-white/50 hover:text-white hover:bg-white/5"
                                        >
                                            Register Another Volunteer
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8 relative z-10">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-8 border-b border-white/10 pb-4 md:pb-6">
                                            <h3 className="text-sm md:text-xl font-sans font-bold tracking-widest uppercase text-white flex items-center gap-3">
                                                <span className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
                                                Application Form
                                            </h3>
                                            <span className="text-white/30 text-[10px] tracking-wider uppercase font-bold border border-white/10 px-2 py-1 rounded w-fit">Est. 2017</span>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                                            <div className="space-y-2 group">
                                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-focus-within:text-accent-blue transition-colors">Full Name</label>
                                                <input {...register("name")} className="w-full pb-2 text-base md:text-lg border-b border-white/10 focus:border-accent-blue outline-none bg-transparent transition-all placeholder:text-white/10 text-white" placeholder="Caron Rawnsley" />
                                                {errors.name && <span className="text-xs text-red-400 mt-1 block">{errors.name.message}</span>}
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-focus-within:text-accent-blue transition-colors">City of Residence</label>
                                                <input {...register("city")} className="w-full pb-2 text-base md:text-lg border-b border-white/10 focus:border-accent-blue outline-none bg-transparent transition-all placeholder:text-white/10 text-white" placeholder="Jodhpur, Rajasthan" />
                                                {errors.city && <span className="text-xs text-red-400 mt-1 block">{errors.city.message}</span>}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                                            <div className="space-y-2 group">
                                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-focus-within:text-accent-blue transition-colors">Email Address</label>
                                                <input {...register("email")} className="w-full pb-2 text-base md:text-lg border-b border-white/10 focus:border-accent-blue outline-none bg-transparent transition-all placeholder:text-white/10 text-white" placeholder="guardian@email.com" />
                                                {errors.email && <span className="text-xs text-red-400 mt-1 block">{errors.email.message}</span>}
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-focus-within:text-accent-blue transition-colors">Phone (WhatsApp)</label>
                                                <input {...register("phone")} className="w-full pb-2 text-base md:text-lg border-b border-white/10 focus:border-accent-blue outline-none bg-transparent transition-all placeholder:text-white/10 text-white" placeholder="+91 98765 43210" />
                                                {errors.phone && <span className="text-xs text-red-400 mt-1 block">{errors.phone.message}</span>}
                                            </div>
                                        </div>

                                        <div className="space-y-3 md:space-y-4">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Availability</label>
                                            <div className="grid grid-cols-3 gap-2 md:gap-3">
                                                {['weekends', 'weekdays', 'flexible'].map((opt) => (
                                                    <label key={opt} className="cursor-pointer group relative">
                                                        <input type="radio" value={opt} {...register("availability")} className="peer sr-only" />
                                                        <div className="text-center py-3.5 md:py-3 px-2 rounded-xl md:rounded-lg border border-white/10 bg-white/[0.02] text-white/60 peer-checked:bg-accent-blue peer-checked:text-black peer-checked:border-accent-blue peer-checked:font-bold hover:bg-white/5 active:scale-95 transition-all text-sm capitalize">
                                                            {opt}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Terms & Conditions Box */}
                                        <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-white/10">
                                            <div className="flex items-center gap-2 text-white/80 mb-2">
                                                <ScrollText size={16} className="text-accent-blue" />
                                                <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider">Terms & Conditions</h4>
                                            </div>

                                            <div className="h-36 md:h-48 overflow-y-auto pr-2 bg-black/40 rounded-xl border border-white/10 p-3 md:p-4 text-[11px] md:text-xs text-white/60 leading-relaxed font-mono space-y-3 md:space-y-4 custom-scrollbar">
                                                <p className="text-accent-blue/80 font-bold mb-2">Stepwells & Water Heritage Conservation Activities</p>
                                                <ol className="list-decimal pl-4 space-y-2 marker:text-white/30">
                                                    {TERMS.map((term, i) => (
                                                        <li key={i}>{term}</li>
                                                    ))}
                                                </ol>
                                            </div>

                                            <label className="flex items-start gap-3 md:gap-4 cursor-pointer group p-3 rounded-xl hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors">
                                                <div className="relative flex items-center mt-0.5">
                                                    <input
                                                        type="checkbox"
                                                        {...register("termsAccepted")}
                                                        className="peer sr-only"
                                                    />
                                                    <div className="w-6 h-6 md:w-5 md:h-5 border-2 border-white/30 rounded-lg md:rounded flex items-center justify-center peer-checked:bg-accent-blue peer-checked:border-accent-blue transition-all active:scale-90">
                                                        {termsAccepted && <Check size={14} className="text-black" strokeWidth={3} />}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-white/80 group-hover:text-white transition-colors select-none">
                                                        I have read, understood, and agree to the Terms & Conditions above.
                                                    </p>
                                                    {errors.termsAccepted && (
                                                        <p className="text-xs text-red-400 mt-1 font-medium animate-pulse">
                                                            * {errors.termsAccepted.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </label>
                                        </div>

                                        <div className="pt-2 md:pt-4">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full relative overflow-hidden py-5 md:py-7 text-base md:text-lg bg-gradient-to-r from-accent-blue to-sky-400 hover:from-blue-500 hover:to-sky-300 text-white font-bold uppercase tracking-wider rounded-2xl transition-all shadow-[0_8px_32px_rgba(14,165,233,0.35)] hover:shadow-[0_12px_40px_rgba(14,165,233,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? (
                                                    <span className="flex items-center justify-center gap-3">
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-3">
                                                        Submit Application <ArrowRight size={20} />
                                                    </span>
                                                )}
                                                <div className="absolute inset-0 bg-white/10 opacity-0 active:opacity-100 transition-opacity" />
                                            </button>
                                            <p className="text-center text-[10px] tracking-widest uppercase text-white/30 mt-4 md:mt-6">
                                                Official Stepwells Renovater Registry
                                            </p>
                                        </div>
                                    </form>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
