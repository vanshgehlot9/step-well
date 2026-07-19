"use client";

import { useState, useEffect } from "react";
import { getStores, getProducts, getOrders, getDonations } from "@/lib/firebase-services";
import { Store, Product } from "@/lib/types";
import { ArrowUpRight, Building2, Heart, ShoppingBag, TrendingUp, Users, CheckCircle2, Store as StoreIcon } from "lucide-react";

export default function AdminDashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [storesData, productsData, ordersData, donationsData] = await Promise.all([
          getStores(),
          getProducts(),
          getOrders(),
          getDonations()
        ]);
        
        setStores(storesData);
        setProducts(productsData);
        
        const revenue = ordersData.reduce((acc, order) => acc + (order.paymentStatus === 'COMPLETED' ? order.total : 0), 0);
        setTotalRevenue(revenue);
        
        const donations = donationsData.reduce((acc, donation) => acc + (donation.paymentStatus === 'COMPLETED' ? donation.amount : 0), 0);
        setTotalDonations(donations);
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeStores = stores.length;
  const totalProducts = products.length;

  const statCards = [
    { label: "Total Marketplace Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: "Generated from sales", icon: TrendingUp, bg: "bg-surface-blue" },
    { label: "Active Foundation Stores", value: activeStores.toString(), sub: "Verified Partners", icon: StoreIcon, bg: "bg-surface-blue" },
    { label: "Total Heritage Products", value: totalProducts.toString(), sub: "Listed Across Stores", icon: ShoppingBag, bg: "bg-surface-blue" },
    { label: "Conservation Donations", value: `₹${totalDonations.toLocaleString('en-IN')}`, sub: "Direct Contributions", icon: Heart, bg: "bg-surface-blue" },
  ];

  if (loading) return <div className="p-8 text-center text-primary-blue">Loading dashboard...</div>;

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-accent-blue font-bold mb-2">Platform Administration</p>
        <h1 className="font-serif text-3xl md:text-4xl text-primary-blue font-bold mb-2">Marketplace Overview</h1>
        <p className="text-primary-blue-light/70 text-sm font-medium">Manage stores, approve vendors, and track conservation impact.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className={`p-6 rounded-2xl ${card.bg} border border-surface-blue-dark relative overflow-hidden group hover:shadow-md transition-all duration-300`}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-white shadow-sm border border-surface-blue-dark">
                <card.icon size={20} className="text-primary-blue" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-primary-blue mb-1">{card.value}</p>
            <p className="text-sm font-medium text-primary-blue-light/80">{card.label}</p>
            <p className="text-[10px] uppercase tracking-widest text-accent-blue mt-2 font-bold">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="w-full bg-white rounded-3xl border border-surface-blue-dark shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-surface-blue-dark flex items-center justify-between bg-surface-blue/30">
          <h2 className="font-serif text-xl font-bold text-primary-blue">Registered Stores</h2>
        </div>
        <div className="divide-y divide-surface-blue-dark">
          {stores.map((store) => (
            <div key={store.id} className="px-8 py-6 flex items-center justify-between gap-4 hover:bg-surface-blue/20 transition-colors">
              <div className="flex items-center gap-4">
                <img src={store.logo} alt="" className="w-12 h-12 rounded-lg object-cover border border-surface-blue-dark shadow-sm" />
                <div>
                  <p className="font-bold text-primary-blue">{store.name}</p>
                  <p className="text-xs text-primary-blue-light/70">{store.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-primary-blue">{products.filter(p => p.storeId === store.id).length} Products</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
