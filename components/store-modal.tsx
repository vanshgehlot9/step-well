import { useState, useEffect } from "react";
import { Store } from "@/lib/types";
import { addStore, updateStore, getUserProfile } from "@/lib/firebase-services";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary-services";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store?: Store | null;
  onSaved: () => void;
}

export function StoreModal({ isOpen, onClose, store, onSaved }: StoreModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState(store?.name || "");
  const [location, setLocation] = useState(store?.location || "");
  const [status, setStatus] = useState(store?.status || "PENDING");
  const [description, setDescription] = useState(store?.description || "");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(store?.logo && store.logo !== "/placeholder-logo.jpg" ? store.logo : null);

  useEffect(() => {
    if (isOpen) {
      setName(store?.name || "");
      setLocation(store?.location || "");
      setStatus(store?.status || "PENDING");
      setDescription(store?.description || "");
      setImagePreview(store?.logo && store.logo !== "/placeholder-logo.jpg" ? store.logo : null);
      setImageFile(null);
      setError(null);
    }
  }, [store, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name || !location || !description) {
        throw new Error("Please fill in all required fields.");
      }

      let logoUrl = store?.logo || "/placeholder-logo.jpg";

      if (imageFile) {
        const url = await uploadImageToCloudinary(imageFile);
        if (url) {
          if (store?.logo && store.logo !== "/placeholder-logo.jpg") {
            await deleteImageFromCloudinary(store.logo);
          }
          logoUrl = url;
        } else {
          throw new Error("Failed to upload image.");
        }
      }

      const storeData = {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        location,
        status: status as 'ACTIVE' | 'PENDING' | 'INACTIVE',
        description,
        logo: logoUrl,
        banner: store?.banner || "/placeholder-banner.jpg",
        ownerId: store?.ownerId || "admin",
        rating: store?.rating || 0,
      };

      if (store) {
        await updateStore(store.id, storeData);
        
        // Trigger email notification if approved
        if (store.status === 'PENDING' && status === 'ACTIVE') {
          try {
            const userProfile = await getUserProfile(store.ownerId);
            if (userProfile && userProfile.email) {
              await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: userProfile.email,
                  subject: "Your Store Partner Account is Approved!",
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
                      <h2 style="color: #2563eb;">Welcome to Stepwells Renovater!</h2>
                      <p>Hello,</p>
                      <p>Great news! Your store <strong>${store.name}</strong> has been approved by our curatorial team.</p>
                      <p>You can now log in to your Vendor Dashboard and start uploading your heritage products.</p>
                      <br/>
                      <a href="https://stepwellsrenovaterfoundation.org/store-owner/dashboard" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
                      <br/><br/>
                      <p>Best regards,<br/>The Stepwells Renovater Team</p>
                    </div>
                  `
                })
              });
            }
          } catch (emailErr) {
            console.error("Failed to send approval email:", emailErr);
          }
        }
      } else {
        await addStore(storeData);
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
            {store ? "Edit Business" : "Add New Business"}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Image Upload */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-blue-light/70 mb-2">
                  Store Logo
                </label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-surface-blue border-2 border-dashed border-surface-blue-dark flex items-center justify-center overflow-hidden relative shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-primary-blue-light/30" />
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer bg-white border border-surface-blue-dark px-4 py-2 rounded-lg text-sm font-bold text-primary-blue hover:border-accent-blue transition-colors inline-flex items-center gap-2 shadow-sm">
                      <Upload className="w-4 h-4" />
                      Choose Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="hidden" 
                      />
                    </label>
                    <p className="text-xs font-medium text-primary-blue-light/50 mt-2">
                      JPEG, PNG or WEBP. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-blue-light/70">Business Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue focus:outline-none focus:border-accent-blue transition-colors shadow-sm placeholder:text-primary-blue-light/50 font-medium"
                  placeholder="e.g. Handloom Crafts"
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

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-blue-light/70">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'PENDING' | 'INACTIVE')}
                  className="w-full bg-white border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue font-medium focus:outline-none focus:border-accent-blue transition-colors shadow-sm"
                >
                  <option value="PENDING" className="bg-white">Pending</option>
                  <option value="ACTIVE" className="bg-white">Active</option>
                  <option value="INACTIVE" className="bg-white">Suspended (Inactive)</option>
                </select>
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-blue-light/70">Description *</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue font-medium focus:outline-none focus:border-accent-blue transition-colors resize-none shadow-sm placeholder:text-primary-blue-light/50"
                  placeholder="Describe the business..."
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Business"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
