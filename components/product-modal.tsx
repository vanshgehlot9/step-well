import { useState, useRef, useEffect } from "react";
import { Product, Category, Store } from "@/lib/types";
import { addProduct, updateProduct, deleteProduct } from "@/lib/firebase-services";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary-services";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  product?: Product | null;
  categories: Category[];
  onSaved: () => void;
}

export function ProductModal({ isOpen, onClose, stores, product, categories, onSaved }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price || 0);
  const [inventory, setInventory] = useState(product?.inventory || 0);
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [storeId, setStoreId] = useState(product?.storeId || "");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.images?.[0] || null);

  useEffect(() => {
    if (isOpen) {
      setName(product?.name || "");
      setDescription(product?.description || "");
      setPrice(product?.price || 0);
      setInventory(product?.inventory || 0);
      setCategoryId(product?.categoryId || "");
      setStoreId(product?.storeId || "");
      setImagePreview(product?.images?.[0] || null);
      setImageFile(null);
      setError(null);
    }
  }, [product, isOpen]);

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
      if (!name || !description || !price || !inventory || !categoryId || !storeId) {
        throw new Error("Please fill in all fields.");
      }

      if (!product && !imageFile && !imagePreview) {
        throw new Error("Please upload an image.");
      }

      let imageUrls = product?.images || [];

      if (imageFile) {
        const url = await uploadImageToCloudinary(imageFile);
        if (url) {
          // If we had an existing image and we're replacing it, delete the old one
          if (product?.images && product.images.length > 0) {
            await Promise.all(product.images.map(img => deleteImageFromCloudinary(img)));
          }
          imageUrls = [url]; // simplified: replace image if one is uploaded
        } else {
          throw new Error("Failed to upload image.");
        }
      }

      const productData = {
        storeId,
        categoryId,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        description,
        price: Number(price),
        inventory: Number(inventory),
        images: imageUrls,
      };

      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await addProduct(productData as Omit<Product, "id" | "createdAt" | "updatedAt">);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-blue/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-primary-blue-light/50 hover:text-primary-blue transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-10">
          <h2 className="font-serif text-3xl font-bold text-primary-blue mb-8">
            {product ? "Edit Product" : "Add New Product"}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Image Upload */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-primary-blue-light/70 mb-2">
                  Product Image
                </label>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 rounded-2xl bg-surface-blue border-2 border-dashed border-surface-blue-dark flex items-center justify-center overflow-hidden relative shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-primary-blue-light/30" />
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer bg-white border border-surface-blue-dark px-4 py-2 rounded-lg text-sm font-bold text-primary-blue hover:bg-surface-blue transition-colors inline-flex items-center gap-2 shadow-sm">
                      <Upload className="w-4 h-4" />
                      Choose Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="hidden" 
                      />
                    </label>
                    <p className="text-xs text-primary-blue-light/50 mt-2">
                      JPEG, PNG or WEBP. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-primary-blue-light/70">
                  Business / Store
                </label>
                <select 
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full bg-surface-blue border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue focus:outline-none focus:border-accent-blue transition-colors appearance-none"
                >
                  <option value="" disabled>Select a store</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-primary-blue-light/70">
                  Product Name
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-blue border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue focus:outline-none focus:border-accent-blue transition-colors"
                  placeholder="e.g. Handcrafted Terra Cotta Pot"
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-primary-blue-light/70">
                  Category
                </label>
                <select 
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-surface-blue border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue focus:outline-none focus:border-accent-blue transition-colors appearance-none"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-primary-blue-light/70">
                  Price (₹)
                </label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min="0"
                  className="w-full bg-surface-blue border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue focus:outline-none focus:border-accent-blue transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-primary-blue-light/70">
                  Inventory
                </label>
                <input 
                  type="number" 
                  value={inventory}
                  onChange={(e) => setInventory(Number(e.target.value))}
                  min="0"
                  className="w-full bg-surface-blue border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue focus:outline-none focus:border-accent-blue transition-colors"
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-primary-blue-light/70">
                  Description
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-surface-blue border border-surface-blue-dark rounded-xl px-4 py-3 text-primary-blue focus:outline-none focus:border-accent-blue transition-colors resize-none"
                  placeholder="Describe the product..."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-surface-blue-dark flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-bold text-primary-blue hover:bg-surface-blue transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl font-bold bg-primary-blue text-white shadow-lg shadow-primary-blue/20 hover:bg-primary-blue/90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
