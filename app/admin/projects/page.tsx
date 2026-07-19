"use client";

import { useState, useEffect } from "react";
import { Building2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { getProjects, deleteProject } from "@/lib/firebase-services";
import { Project } from "@/lib/types";
import { ProjectModal } from "@/components/project-modal";

const statusColors: Record<string, string> = {
    planning: "bg-amber-100 text-amber-700 border-amber-200",
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCompletedOnly, setShowCompletedOnly] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await getProjects();
            setProjects(data as Project[]);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const visibleProjects = projects.filter((project) => (showCompletedOnly ? project.status === "completed" : true));

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this project?")) {
            await deleteProject(id);
            fetchProjects();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-primary-blue mb-1">Projects</h1>
                    <p className="text-primary-blue-light/70 text-sm font-medium">Manage restoration projects and tracking.</p>
                </div>
                <button 
                  onClick={handleAdd}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue text-primary-blue font-bold text-sm hover:bg-accent-blue/90 transition-all shadow-sm"
                >
                    <Plus size={16} /> Add Project
                </button>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-primary-blue-light/70 font-medium cursor-pointer">
                <input type="checkbox" checked={showCompletedOnly} onChange={(event) => setShowCompletedOnly(event.target.checked)} className="accent-accent-blue" />
                Show completed projects only
            </label>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {loading ? (
                    <div className="col-span-1 lg:col-span-2 text-center text-primary-blue py-12">Loading projects...</div>
                ) : visibleProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-3xl border border-surface-blue-dark shadow-sm overflow-hidden">
                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-serif text-xl font-bold text-primary-blue">{project.name}</h3>
                                    <p className="text-sm font-medium text-primary-blue-light/70 flex items-center gap-1 mt-1"><MapPin size={14} /> {project.location}</p>
                                </div>
                                <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[project.status]}`}>{project.status}</span>
                            </div>

                            <p className="text-sm text-primary-blue-light/70">{project.description}</p>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-primary-blue-light/80 uppercase tracking-widest">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-surface-blue overflow-hidden border border-surface-blue-dark">
                                    <div className="h-full rounded-full bg-accent-blue" style={{ width: `${project.progress}%` }} />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2 justify-between">
                                <button 
                                  onClick={() => handleEdit(project)}
                                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-blue border border-surface-blue-dark text-primary-blue text-sm font-medium hover:border-accent-blue hover:text-accent-blue transition-all"
                                >
                                    <Pencil size={14} /> Edit Notes
                                </button>
                                <button 
                                  onClick={() => handleDelete(project.id)}
                                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 font-medium text-sm hover:bg-red-100 hover:border-red-300 transition-all"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}


            </div>

            <ProjectModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              project={editingProject} 
              onSaved={fetchProjects} 
            />
        </div>
    );
}
