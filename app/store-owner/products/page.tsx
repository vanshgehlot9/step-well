"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getStoresByOwner, getProductsByStore, deleteProduct, getCategories } from "@/lib/firebase-services";
import { Store, Product, Category } from "@/lib/types";
import { ProductModal } from "@/components/product-modal";
import { deleteImageFromCloudinary } from "@/lib/cloudinary-services";

export default function StoreOwnerProducts() {
  const { user, loading: authLoading } = useAuth();
  const [myStore, setMyStore] = useState<Store | null>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchData = async () => {
      if (!user) return;
      try {
        const stores = await getStoresByOwner(user.uid);
        if (stores.length > 0) {
          const store = stores[0];
          setMyStore(store);
          const [products, cats] = await Promise.all([
            getProductsByStore(store.id),
            getCategories()
          ]);
          setMyProducts(products);
          setCategories(cats);
        } else {
          setErrorMsg("No store found.");
        }
      } catch (err: any) {
        console.error("Failed to fetch products data:", err);
        setErrorMsg(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setLoading(false);
      } else {
        fetchData();
      }
    }
  }, [user, authLoading]);

  if (authLoading || loading) return <div className="py-20 text-center">Loading products...</div>;
  if (!user) return <div className="py-20 text-center">Please log in.</div>;
  if (errorMsg) return <div className="py-20 text-center text-red-500">Error: {errorMsg}</div>;
  if (!myStore) return <div className="py-20 text-center">No store found for your account.</div>;

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-primary-blue font-bold mb-2">Products</h1>
          <p className="text-primary-blue-light/70 font-medium">Manage your store's inventory and listings</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-accent-blue text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-accent-blue/20 hover:bg-accent-blue/90 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-surface-blue-dark shadow-[0_10px_40px_rgba(13,59,102,0.05)] overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-surface-blue-dark flex justify-between items-center">
          <h2 className="font-serif text-xl font-bold text-primary-blue">All Products</h2>
          <div className="text-sm text-primary-blue-light/70 font-medium bg-surface-blue px-3 py-1 rounded-full">{myProducts.length} items</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-blue/30 text-primary-blue-light/70 text-xs uppercase tracking-widest border-b border-surface-blue-dark">
                <th className="p-6 font-bold w-2/5">Product</th>
                <th className="p-6 font-bold">Price</th>
                <th className="p-6 font-bold">Stock</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.length === 0 ? (
                <tr>
                    <td colSpan={5} className="p-12 text-center text-primary-blue-light/70">
                        No products added yet. Click "Add New Product" to get started!
                    </td>
                </tr>
              ) : (
                  myProducts.map(product => (
                    <tr key={product.id} className="border-b border-surface-blue-dark last:border-none hover:bg-surface-blue/20 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-surface-blue-dark shadow-sm">
                            <img src={product.images[0] || "/placeholder-logo.jpg"} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-primary-blue text-sm mb-1">{product.name}</div>
                            <div className="text-xs text-primary-blue-light/60 font-medium">{categories.find(c => c.id === product.categoryId)?.name || product.categoryId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 font-medium text-primary-blue text-sm">
                        ₹{product.price.toLocaleString('en-IN')}
                      </td>
                      <td className="p-6">
                        <div className="text-sm font-medium text-primary-blue">{product.inventory} units</div>
                      </td>
                      <td className="p-6">
                        {product.inventory > 0 ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Active</span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
                        )}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                            className="w-9 h-9 rounded-full bg-surface-blue flex items-center justify-center text-primary-blue hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this product?")) {
                                if (product.images && product.images.length > 0) {
                                  await Promise.all(product.images.map(img => deleteImageFromCloudinary(img).catch(console.error)));
                                }
                                await deleteProduct(product.id);
                                fetchData();
                              }
                            }}
                            className="w-9 h-9 rounded-full bg-surface-blue flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {myStore && (
        <ProductModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            stores={[myStore]}
            product={editingProduct}
            categories={categories}
            onSaved={fetchData}
        />
      )}
    </div>
  );
}
