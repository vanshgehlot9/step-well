import { useState, useEffect } from "react";
import { Project } from "@/lib/types";
import { addProject, updateProject } from "@/lib/firebase-services";
import { X, Loader2 } from "lucide-react";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSaved: () => void;
}

export function ProjectModal({ isOpen, onClose, project, onSaved }: ProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState(project?.name || "");
  const [location, setLocation] = useState(project?.location || "");
  const [status, setStatus] = useState(project?.status || "planning");
  const [progress, setProgress] = useState(project?.progress || 0);
  const [description, setDescription] = useState(project?.description || "");

  useEffect(() => {
    if (isOpen) {
      setName(project?.name || "");
      setLocation(project?.location || "");
      setStatus(project?.status || "planning");
      setProgress(project?.progress || 0);
      setDescription(project?.description || "");
      setError(null);
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name || !location || !description) {
        throw new Error("Please fill in all required fields.");
      }

      const projectData = {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        location,
        status: status as 'planning' | 'active' | 'completed',
        progress: Number(progress),
        description,
        images: project?.images || [],
      };

      if (project) {
        await updateProject(project.id, projectData);
      } else {
        await addProject({ ...projectData, createdAt: new Date().toISOString() });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-surface-blue-dark rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-primary-blue-light/50 hover:text-primary-blue transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-10">
          <h2 className="font-serif text-2xl font-bold text-primary-blue mb-8">
            {project ? "Edit Project" : "Add New Project"}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-blue-light/70">Project Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue focus:outline-none focus:border-accent-blue transition-colors shadow-sm placeholder:text-primary-blue-light/50 font-medium"
                  placeholder="e.g. Mahamandir Bawri"
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-blue-light/70">Location *</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue focus:outline-none focus:border-accent-blue transition-colors shadow-sm placeholder:text-primary-blue-light/50 font-medium"
                  placeholder="e.g. Jodhpur, Rajasthan"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-blue-light/70">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'planning' | 'active' | 'completed')}
                  className="w-full bg-white border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue focus:outline-none focus:border-accent-blue transition-colors shadow-sm font-medium"
                >
                  <option value="planning" className="bg-white">Planning</option>
                  <option value="active" className="bg-white">Active</option>
                  <option value="completed" className="bg-white">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-blue-light/70">Progress (%)</label>
                <input 
                  type="number" 
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full bg-white border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue focus:outline-none focus:border-accent-blue transition-colors shadow-sm font-medium"
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-blue-light/70">Description *</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue focus:outline-none focus:border-accent-blue transition-colors resize-none shadow-sm placeholder:text-primary-blue-light/50 font-medium"
                  placeholder="Describe the project..."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-surface-blue-dark flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-bold text-primary-blue-light/70 hover:text-primary-blue hover:bg-surface-blue transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl font-bold bg-accent-blue text-primary-blue shadow-lg hover:bg-accent-blue/90 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center min-w-[140px]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
