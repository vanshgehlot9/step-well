"use client";

import { Calendar, Mail, MapPin, Phone, Search, Users, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { getVolunteers, updateVolunteerStatus } from "@/lib/firebase-services";
import { Volunteer } from "@/lib/types";

const statusColors: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminVolunteersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVolunteers = async () => {
        setLoading(true);
        try {
            const data = await getVolunteers();
            setVolunteers(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error("Error fetching volunteers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVolunteers();
    }, []);

    const handleStatusChange = async (id: string, newStatus: Volunteer['status']) => {
        try {
            await updateVolunteerStatus(id, newStatus);
            setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const filtered = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return volunteers.filter((volunteer) => volunteer.fullName.toLowerCase().includes(search) || volunteer.email.toLowerCase().includes(search) || volunteer.address.toLowerCase().includes(search));
    }, [searchTerm, volunteers]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-3xl font-bold text-primary-blue mb-1">Volunteers</h1>
                <p className="text-primary-blue-light/70 text-sm font-medium">Manage volunteer applications and status.</p>
            </div>

            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-blue-light/50" />
                <input
                    type="text"
                    placeholder="Search by name, email, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-surface-blue-dark text-primary-blue placeholder:text-primary-blue-light/50 focus:border-accent-blue outline-none text-sm shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {loading ? (
                    <div className="col-span-1 lg:col-span-2 text-center py-12 text-primary-blue">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-blue-light/50" />
                        Loading volunteers...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-1 lg:col-span-2 text-center py-12 text-primary-blue-light/70 font-medium">
                        No volunteers found matching your search.
                    </div>
                ) : filtered.map((volunteer) => (
                    <div key={volunteer.id} className="bg-white rounded-2xl border border-surface-blue-dark shadow-sm p-6 hover:shadow-md transition-all relative">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-serif text-xl font-bold text-primary-blue">{volunteer.fullName}</h3>
                                <div className="flex flex-wrap gap-3 mt-1.5 text-xs font-medium text-primary-blue-light/70">
                                    <span className="flex items-center gap-1"><Mail size={14} /> {volunteer.email}</span>
                                    {volunteer.phone && <span className="flex items-center gap-1"><Phone size={14} /> {volunteer.phone}</span>}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${statusColors[volunteer.status]}`}>{volunteer.status}</span>
                                <select 
                                    value={volunteer.status}
                                    onChange={(e) => handleStatusChange(volunteer.id, e.target.value as Volunteer['status'])}
                                    className="bg-surface-blue border border-surface-blue-dark rounded-md px-2 py-1 text-xs font-medium text-primary-blue outline-none focus:border-accent-blue shadow-sm"
                                >
                                    <option value="PENDING" className="bg-white">Pending</option>
                                    <option value="APPROVED" className="bg-white">Approve</option>
                                    <option value="REJECTED" className="bg-white">Reject</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs font-medium text-primary-blue-light/50 mb-3 border-b border-surface-blue-dark pb-3">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {volunteer.address}</span>
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(volunteer.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        
                        <div className="space-y-1.5 text-primary-blue-light/70 text-sm">
                            <p><span className="text-primary-blue font-bold uppercase tracking-widest text-[10px]">Availability:</span> {volunteer.availability}</p>
                            <p><span className="text-primary-blue font-bold uppercase tracking-widest text-[10px]">Experience:</span> {volunteer.experience}</p>
                            {volunteer.notes && <p className="italic mt-3 text-primary-blue-light/60 bg-surface-blue/50 p-3 rounded-xl">"{volunteer.notes}"</p>}
                        </div>
                    </div>
                ))}

                <div className="p-12 text-center bg-white rounded-2xl border border-surface-blue-dark shadow-sm h-fit lg:col-span-1">
                    <Users size={32} className="text-primary-blue-light/30 mx-auto mb-3" />
                    <p className="text-primary-blue-light/70 font-medium text-sm">Volunteer records are fetched from Firestore.</p>
                </div>
            </div>
        </div>
    );
}
