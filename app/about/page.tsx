"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
    return (
        <div className="bg-surface-blue min-h-screen text-primary-blue selection:bg-accent-blue selection:text-white">
            {/* Hero Section - Keeping image but lighter feel */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1596484552834-8a45e8bc80f1?q=80&w=2971&auto=format&fit=crop"
                        alt="Old Blue City Jodhpur"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-blue via-transparent to-black/30" />
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-primary-blue font-sans text-xs tracking-[0.2em] uppercase font-bold mb-8 inline-block shadow-sm">
                            The Origin
                        </span>
                        <h1 className="font-serif text-5xl md:text-8xl lg:text-9xl font-light tracking-tight leading-none mb-8 text-white drop-shadow-lg">
                            THE <span className="font-semibold">STORY</span>
                        </h1>
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-4 md:px-6 -mt-16 md:-mt-32 relative z-20">
                {/* Caron's Story - Editorial Paper Layout */}
                <div className="bg-white rounded-t-3xl shadow-xl p-8 md:p-16 lg:p-24 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-20">
                    <div className="space-y-10 order-2 lg:order-1">
                        <h2 className="text-4xl md:text-5xl font-serif font-light leading-tight text-primary-blue">
                            "They called me <br />
                            <span className="text-accent-blue font-serif italic font-medium">The Mad Foreigner.</span>"
                        </h2>

                        <div className="space-y-6 text-lg text-primary-blue-light font-normal leading-relaxed">
                            <p>
                                When I first arrived in Jodhpur, I was struck by the sheer beauty of the Blue City. But as I explored deeper, I found something heartbreaking: ancient stepwells, once the lifeblood of the desert, choked with plastic, sludge, and decay.
                            </p>
                            <p>
                                People told me, "It's not your job." They laughed when I jumped into the filthy water with bare hands. But I couldn't walk away. The stones were speaking to me.
                            </p>
                            <p className="text-primary-blue font-medium">
                                What started as a solo mission has now grown into the <strong>Stepwells Renovater</strong> movement. We are not just cleaning stones; we are restoring pride.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-surface-blue-dark flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-blue-dark">
                                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2673&auto=format&fit=crop" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="font-serif italic text-primary-blue font-medium text-lg leading-none">
                                    Caron Rawnsley
                                </p>
                                <p className="text-xs text-primary-blue-light/60 uppercase tracking-widest mt-1">Founder</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative order-1 lg:order-2 h-full min-h-[500px]">
                        <div className="absolute inset-0 top-10 left-10 border-[1px] border-surface-blue-dark rounded-lg z-0" />
                        <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1590664095641-7fa0542df2e2?q=80&w=2787&auto=format&fit=crop"
                                alt="Restoration work"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Values - Clean Grid */}
                <div className="mb-32 max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif font-light mb-4 text-primary-blue">Our Code</h2>
                        <p className="text-primary-blue-light/60">The principles that guide every stone we lift.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                num: "01",
                                title: "Preservation",
                                desc: "Protecting the architectural legacy of our ancestors for future generations."
                            },
                            {
                                num: "02",
                                title: "Community",
                                desc: "Empowering locals to take ownership of their neighborhood heritage."
                            },
                            {
                                num: "03",
                                title: "Water Security",
                                desc: "Reviving traditional water harvesting systems to fight scarcity."
                            }
                        ].map((item, i) => (
                            <div key={i} className="group p-10 bg-white shadow-sm border border-surface-blue-dark hover:shadow-xl hover:border-accent-blue/20 rounded-2xl transition-all duration-300">
                                <span className="inline-block px-3 py-1 bg-surface-blue text-primary-blue-light/60 font-mono text-xs rounded-full mb-6 group-hover:bg-accent-blue/10 group-hover:text-accent-blue transition-colors">
                                    {item.num}
                                </span>
                                <h3 className="font-serif text-2xl font-medium mb-4 text-primary-blue group-hover:text-accent-blue transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-primary-blue-light/60 leading-relaxed group-hover:text-primary-blue-light">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team - The Guardians */}
                <div className="pb-32">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-surface-blue-dark pb-8">
                        <div>
                            <span className="text-accent-blue font-sans text-xs tracking-[0.2em] uppercase font-bold mb-2 block">
                                The Team
                            </span>
                            <h2 className="text-4xl md:text-6xl font-serif font-light text-primary-blue">The Guardians</h2>
                        </div>
                        <p className="text-primary-blue-light/60 max-w-md text-right md:text-left">
                            And over 5,000+ volunteers who have dirtied their hands to clean our history.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2187&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3000&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=2681&auto=format&fit=crop"
                        ].map((src, i) => (
                            <div key={i} className="group relative">
                                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-surface-blue mb-4">
                                    <img
                                        src={src}
                                        alt="Volunteer"
                                        className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                                    />
                                </div>
                                <h3 className="font-serif text-lg text-primary-blue font-medium group-hover:text-accent-blue transition-colors">Volunteer Name</h3>
                                <p className="text-xs text-primary-blue-light/50 uppercase tracking-widest mt-1">Restoration Lead</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
