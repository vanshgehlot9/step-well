"use client";

import { useEffect, useState } from "react";
import {
    ref,
    get,
    push,
    update,
    remove,
    serverTimestamp,
} from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Plus, Pencil, Trash2, X, Building2, Upload, Save, MapPin } from "lucide-react";

interface Project {
    id: string;
    name: string;
    location: string;
    description: string;
    status: string;
    images: string[];
    progress: number;
    createdAt: number;
}

const PROJECT_STATUSES = ["planning", "active", "completed", "paused"];

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        description: "",
        status: "planning",
        images: [] as string[],
        progress: 0,
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        setLoading(true);
        try {
            const snapshot = await get(ref(db, "projects"));
            const data: Project[] = [];
            snapshot.forEach((child) => {
                data.push({ id: child.key!, ...(child.val() as any) });
            });
            // Sort client-side
            data.sort((a: any, b: any) => b.createdAt - a.createdAt);
            setProjects(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }

    function openForm(project?: Project) {
        if (project) {
            setEditingProject(project);
            setFormData({
                name: project.name,
                location: project.location,
                description: project.description,
                status: project.status,
                images: project.images || [],
                progress: project.progress || 0,
            });
        } else {
            setEditingProject(null);
            setFormData({
                name: "",
                location: "",
                description: "",
                status: "planning",
                images: [],
                progress: 0,
            });
        }
        setImageFile(null);
        setShowForm(true);
    }

    async function handleSave() {
        if (!formData.name || !formData.location) {
            alert("Name and location are required.");
            return;
        }

        setSaving(true);
        try {
            let imageUrl = formData.images[0] || "";

            if (imageFile) {
                const imageRef = storageRef(storage, `projects/${Date.now()}_${imageFile.name}`);
                await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(imageRef);
            }

            const projectData = {
                name: formData.name,
                location: formData.location,
                description: formData.description,
                status: formData.status,
                images: imageUrl ? [imageUrl, ...formData.images.filter((img) => img !== imageUrl)] : formData.images,
                progress: formData.progress,
            };

            if (editingProject) {
                await update(ref(db, `projects/${editingProject.id}`), {
                    ...projectData,
                    updatedAt: serverTimestamp(),
                });
            } else {
                const newRef = push(ref(db, "projects"));
                await update(newRef, {
                    ...projectData,
                    createdAt: serverTimestamp(),
                });
            }

            setShowForm(false);
            await fetchProjects();
        } catch (error) {
            console.error("Error saving project:", error);
            alert("Failed to save project.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(projectId: string) {
        if (!confirm("Delete this project? This cannot be undone.")) return;
        try {
            await remove(ref(db, `projects/${projectId}`));
            await fetchProjects();
        } catch (error) {
            console.error("Error deleting:", error);
        }
    }

    const statusColors: Record<string, string> = {
        planning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        paused: "bg-white/5 text-white/40 border-white/10",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Projects</h1>
                    <p className="text-white/40 text-sm">
                        {projects.length} restoration projects
                    </p>
                </div>
                <button
                    onClick={() => openForm()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue text-black font-bold text-sm uppercase tracking-wider hover:bg-accent-blue/90 transition-all shadow-lg shadow-accent-blue/20"
                >
                    <Plus size={16} /> Add Project
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#12121a] rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">
                                {editingProject ? "Edit Project" : "Add Project"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 focus:border-accent-blue outline-none text-sm"
                                    placeholder="Mahamandir Bawri"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 focus:border-accent-blue outline-none text-sm"
                                    placeholder="Jodhpur, Rajasthan"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 outline-none text-sm"
                                    >
                                        {PROJECT_STATUSES.map((s) => (
                                            <option key={s} value={s} className="capitalize">
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                        Progress ({formData.progress}%)
                                    </label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={formData.progress}
                                        onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                                        className="w-full accent-accent-blue mt-2"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 focus:border-accent-blue outline-none text-sm resize-none"
                                    placeholder="Describe the restoration project..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Project Image</label>
                                <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-dashed border-white/10 text-white/40 hover:border-accent-blue/30 cursor-pointer transition-colors text-sm">
                                    <Upload size={16} />
                                    {imageFile ? imageFile.name : "Choose file..."}
                                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" />
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-blue text-black font-bold text-sm uppercase tracking-wider hover:bg-accent-blue/90 transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <><Save size={16} /> {editingProject ? "Update" : "Create"}</>
                                )}
                            </button>
                            <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 text-sm hover:bg-white/[0.08] transition-all">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Projects Grid */}
            {loading ? (
                <div className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mx-auto" />
                </div>
            ) : projects.length === 0 ? (
                <div className="p-12 text-center bg-white/[0.02] rounded-2xl border border-white/[0.06]">
                    <Building2 size={32} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No projects yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden"
                        >
                            {project.images?.[0] && (
                                <div className="aspect-[3/1] overflow-hidden">
                                    <img src={project.images[0]} alt={project.name} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white/80">{project.name}</h3>
                                        <p className="text-xs text-white/30 flex items-center gap-1 mt-1">
                                            <MapPin size={12} /> {project.location}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[project.status] || "bg-white/5"}`}>
                                        {project.status}
                                    </span>
                                </div>

                                <p className="text-xs text-white/40 line-clamp-2">{project.description}</p>

                                {/* Progress Bar */}
                                <div>
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="text-white/30">Progress</span>
                                        <span className="text-white/50 font-bold">{project.progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-accent-blue to-blue-500 rounded-full transition-all duration-500"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <button onClick={() => openForm(project)} className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-accent-blue hover:bg-accent-blue/10 transition-all">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(project.id)} className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
