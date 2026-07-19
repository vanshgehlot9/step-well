"use client";

import { useState, useEffect } from "react";
import { Package, Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { getProducts, getCategories, deleteProduct, getStores } from "@/lib/firebase-services";
import { Product, Category, Store } from "@/lib/types";
import { ProductModal } from "@/components/product-modal";

export default function AdminProductsPage() {
    const [showOnlyActive, setShowOnlyActive] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData, storesData] = await Promise.all([
                getProducts(),
                getCategories(),
                getStores()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
            setStores(storesData);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const visibleProducts = products.filter((product) => (showOnlyActive ? product.inventory > 0 : true));
    
    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-primary-blue mb-1">Products</h1>
                    <p className="text-primary-blue-light/70 text-sm font-medium">Manage storefront inventory and products.</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue text-primary-blue font-bold text-sm hover:bg-accent-blue/90 transition-all shadow-sm"
                >
                    <Plus size={16} /> Add Product
                </button>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-primary-blue-light/70 font-medium cursor-pointer">
                <input type="checkbox" checked={showOnlyActive} onChange={(event) => setShowOnlyActive(event.target.checked)} className="accent-accent-blue" />
                Show active products only
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-primary-blue">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-blue-light/50" />
                        Loading products...
                    </div>
                ) : visibleProducts.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-dashed border-surface-blue-dark bg-white p-5 flex items-center justify-center text-center text-primary-blue-light/70 min-h-[180px]">
                        <div className="space-y-2">
                            <Package size={28} className="mx-auto text-primary-blue-light/30" />
                            <p className="text-sm font-medium">No products found.</p>
                        </div>
                    </div>
                ) : visibleProducts.map((product) => (
                    <div key={product.name} className="rounded-2xl border border-surface-blue-dark bg-white shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-primary-blue-light/50 mb-2">{getCategoryName(product.categoryId)}</p>
                                <h3 className="font-serif text-xl font-bold text-primary-blue">{product.name}</h3>
                            </div>
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${product.inventory > 0 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-surface-blue text-primary-blue-light/50 border-surface-blue-dark"}`}>
                                {product.inventory > 0 ? "Active" : "Out of Stock"}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl bg-white p-3 text-primary-blue font-bold border border-surface-blue-dark shadow-sm">
                                <p className="text-[10px] uppercase font-bold tracking-wider text-primary-blue-light/70 mb-1">Price</p>
                                ₹{product.price.toLocaleString("en-IN")}
                            </div>
                            <div className="rounded-xl bg-white p-3 text-primary-blue font-bold border border-surface-blue-dark shadow-sm">
                                <p className="text-[10px] uppercase font-bold tracking-wider text-primary-blue-light/70 mb-1">Stock</p>
                                {product.inventory} units
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            <button 
                                onClick={() => handleEdit(product)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-blue border border-surface-blue-dark text-primary-blue text-sm font-medium hover:border-accent-blue hover:text-accent-blue transition-all"
                            >
                                <Pencil size={14} /> Edit
                            </button>
                            <button 
                                onClick={() => handleDelete(product.id)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium hover:bg-red-100 hover:border-red-300 transition-all"
                            >
                                <Trash2 size={14} /> Remove
                            </button>
                        </div>
                    </div>
                ))}


            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                categories={categories}
                stores={stores}
                onSaved={loadData}
            />
        </div>
    );
}

