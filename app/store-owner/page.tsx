"use client";

import { useState, useEffect } from "react";
import { Package, IndianRupee, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getStoresByOwner, getProductsByStore } from "@/lib/firebase-services";
import { Store, Product } from "@/lib/types";

export default function StoreOwnerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [myStore, setMyStore] = useState<Store | null>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const stores = await getStoresByOwner(user.uid);
        if (stores.length > 0) {
          const store = stores[0];
          setMyStore(store);
          const products = await getProductsByStore(store.id);
          setMyProducts(products);
        } else {
          setErrorMsg("Query returned 0 stores for user: " + user.uid);
        }
      } catch (err: any) {
        console.error("Failed to fetch store dashboard data:", err);
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
        fetchDashboardData();
      }
    }
  }, [user, authLoading]);

  if (authLoading || loading) return <div className="py-20 text-center">Loading dashboard...</div>;
  if (!user) return <div className="py-20 text-center">Please log in to view your dashboard.</div>;
  if (errorMsg) return <div className="py-20 text-center text-red-500">Error: {errorMsg}</div>;
  if (!myStore) return <div className="py-20 text-center">No store found for your account ({user.uid}).</div>;

  // Calculate stats
  const activeProducts = myProducts.filter(p => p.inventory > 0).length;

  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="font-serif text-3xl text-primary-blue font-bold mb-2">Vendor Dashboard</h1>
        <p className="text-primary-blue-light/70 font-medium">Welcome back, {myStore.name}</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-surface-blue-dark shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">+0%</span>
          </div>
          <div className="text-primary-blue-light/70 text-sm font-medium mb-1">Total Revenue</div>
          <div className="font-serif text-2xl font-bold text-primary-blue">₹0</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-surface-blue-dark shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-primary-blue-light/70 text-sm font-medium mb-1">Active Products</div>
          <div className="font-serif text-2xl font-bold text-primary-blue">{activeProducts}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-blue-dark shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-primary-blue-light/70 text-sm font-medium mb-1">Store Views</div>
          <div className="font-serif text-2xl font-bold text-primary-blue">0</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-blue-dark shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-primary-blue-light/70 text-sm font-medium mb-1">Conservation Impact</div>
          <div className="font-serif text-2xl font-bold text-primary-blue">₹0 <span className="text-sm font-normal">Donated</span></div>
        </div>
      </div>
    </div>
  );
}
