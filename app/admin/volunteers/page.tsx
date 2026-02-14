"use client";

import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { Users, Search, Mail, Phone, MapPin, Calendar } from "lucide-react";

interface Volunteer {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    availability: string;
    skills: string;
    message: string;
    createdAt: number;
}

export default function AdminVolunteersPage() {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchVolunteers();
    }, []);

    async function fetchVolunteers() {
        setLoading(true);
        try {
            const snapshot = await get(ref(db, "volunteers"));
            const data: Volunteer[] = [];
            snapshot.forEach((child) => {
                data.push({ id: child.key!, ...(child.val() as any) });
            });
            // Client-side sort
            data.sort((a: any, b: any) => b.createdAt - a.createdAt);
            setVolunteers(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }

    const filtered = volunteers.filter(
        (v) =>
            v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availabilityColors: Record<string, string> = {
        weekends: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        weekdays: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        flexible: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Volunteers</h1>
                <p className="text-white/40 text-sm">
                    {volunteers.length} registered volunteers
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                    type="text"
                    placeholder="Search by name, email, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 focus:border-accent-blue outline-none text-sm"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mx-auto" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center bg-white/[0.02] rounded-2xl border border-white/[0.06]">
                    <Users size={32} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No volunteers found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {filtered.map((vol) => (
                        <div
                            key={vol.id}
                            className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-5 hover:bg-white/[0.03] transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-base font-bold text-white/80">
                                        {vol.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-white/40">
                                        <span className="flex items-center gap-1">
                                            <Mail size={12} /> {vol.email}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Phone size={12} /> {vol.phone}
                                        </span>
                                    </div>
                                </div>
                                <span
                                    className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${availabilityColors[vol.availability] || "bg-white/5 text-white/40"}`}
                                >
                                    {vol.availability}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-white/30">
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} /> {vol.city}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} />{" "}
                                    {vol.createdAt
                                        ? new Date(vol.createdAt).toLocaleDateString(
                                            "en-IN",
                                            { day: "2-digit", month: "short", year: "numeric" }
                                        )
                                        : "—"}
                                </span>
                            </div>

                            {vol.skills && (
                                <p className="text-xs text-white/30 mt-2">
                                    <span className="text-white/50 font-medium">Skills:</span>{" "}
                                    {vol.skills}
                                </p>
                            )}
                            {vol.message && (
                                <p className="text-xs text-white/30 mt-1 italic">
                                    "{vol.message}"
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
