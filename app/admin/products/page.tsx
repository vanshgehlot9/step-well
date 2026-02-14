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
import { Plus, Pencil, Trash2, X, Package, Upload, Save } from "lucide-react";

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    images: string[];
    stock: number;
    category: string;
    active: boolean;
    createdAt: number;
}

const CATEGORIES = ["Apparel", "Art", "Tools", "Lifestyle", "Stationery", "Other"];

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        description: "",
        images: [] as string[],
        stock: 0,
        category: "Apparel",
        active: true,
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        try {
            const snapshot = await get(ref(db, "products"));
            const data: Product[] = [];
            snapshot.forEach((child) => {
                data.push({ id: child.key!, ...(child.val() as any) });
            });
            // Sort client-side
            data.sort((a: any, b: any) => b.createdAt - a.createdAt);
            setProducts(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }

    function openForm(product?: Product) {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                price: product.price,
                description: product.description,
                images: product.images || [],
                stock: product.stock,
                category: product.category,
                active: product.active,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
                price: 0,
                description: "",
                images: [],
                stock: 0,
                category: "Apparel",
                active: true,
            });
        }
        setImageFile(null);
        setShowForm(true);
    }

    async function handleSave() {
        if (!formData.name || formData.price <= 0) {
            alert("Name and price are required.");
            return;
        }

        setSaving(true);
        try {
            let imageUrl = formData.images[0] || "";

            // Upload image if selected
            if (imageFile) {
                const imageRef = storageRef(
                    storage,
                    `products/${Date.now()}_${imageFile.name}`
                );
                await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(imageRef);
            }

            const productData = {
                name: formData.name,
                price: formData.price,
                description: formData.description,
                images: imageUrl ? [imageUrl, ...formData.images.filter((img) => img !== imageUrl)] : formData.images,
                stock: formData.stock,
                category: formData.category,
                active: formData.active,
            };

            if (editingProduct) {
                await update(ref(db, `products/${editingProduct.id}`), {
                    ...productData,
                    updatedAt: serverTimestamp(),
                });
            } else {
                const newRef = push(ref(db, "products"));
                await update(newRef, {
                    ...productData,
                    createdAt: serverTimestamp(),
                });
            }

            setShowForm(false);
            await fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(productId: string) {
        if (!confirm("Delete this product? This cannot be undone.")) return;
        try {
            await remove(ref(db, `products/${productId}`));
            await fetchProducts();
        } catch (error) {
            console.error("Error deleting:", error);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Products</h1>
                    <p className="text-white/40 text-sm">
                        {products.length} items in store
                    </p>
                </div>
                <button
                    onClick={() => openForm()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue text-black font-bold text-sm uppercase tracking-wider hover:bg-accent-blue/90 transition-all shadow-lg shadow-accent-blue/20"
                >
                    <Plus size={16} /> Add Product
                </button>
            </div>

            {/* Product Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#12121a] rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">
                                {editingProduct ? "Edit Product" : "Add Product"}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-white/30 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 focus:border-accent-blue outline-none text-sm"
                                    placeholder="Heritage Tote"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                        Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                price: Number(e.target.value),
                                            })
                                        }
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:border-accent-blue outline-none text-sm"
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                        Stock
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                stock: Number(e.target.value),
                                            })
                                        }
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:border-accent-blue outline-none text-sm"
                                        min={0}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 outline-none text-sm"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 focus:border-accent-blue outline-none text-sm resize-none"
                                    placeholder="Product description..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                    Product Image
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-dashed border-white/10 text-white/40 hover:border-accent-blue/30 cursor-pointer transition-colors text-sm">
                                        <Upload size={16} />
                                        {imageFile ? imageFile.name : "Choose file..."}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setImageFile(e.target.files?.[0] || null)
                                            }
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                {formData.images[0] && !imageFile && (
                                    <img
                                        src={formData.images[0]}
                                        alt="Current"
                                        className="w-20 h-20 rounded-lg object-cover mt-2 border border-white/10"
                                    />
                                )}
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) =>
                                        setFormData({ ...formData, active: e.target.checked })
                                    }
                                    className="w-4 h-4 rounded accent-accent-blue"
                                />
                                <span className="text-sm text-white/60">Active (visible in shop)</span>
                            </label>
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
                                    <>
                                        <Save size={16} />{" "}
                                        {editingProduct ? "Update" : "Create"}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-6 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 text-sm hover:bg-white/[0.08] transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            {loading ? (
                <div className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mx-auto" />
                </div>
            ) : products.length === 0 ? (
                <div className="p-12 text-center bg-white/[0.02] rounded-2xl border border-white/[0.06]">
                    <Package size={32} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No products yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden group"
                        >
                            {product.images?.[0] && (
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            )}
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-wider text-accent-blue font-bold">
                                            {product.category}
                                        </span>
                                        <h3 className="text-base font-bold text-white/80 mt-0.5">
                                            {product.name}
                                        </h3>
                                    </div>
                                    {!product.active && (
                                        <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                            Hidden
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-white/30 line-clamp-2 mb-3">
                                    {product.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-lg font-bold text-white/80">
                                            ₹{product.price?.toLocaleString("en-IN")}
                                        </span>
                                        <span className="text-xs text-white/30 ml-2">
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openForm(product)}
                                            className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-accent-blue hover:bg-accent-blue/10 transition-all"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
