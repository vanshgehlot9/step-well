"use client";

import { useState, useEffect } from "react";
import { Package, Search, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getStoresByOwner, getProductsByStore, getOrders } from "@/lib/firebase-services";
import { Store, Product, Order, OrderItem } from "@/lib/types";

// Extended order to include store-specific items
interface StoreOrder extends Order {
  storeItems: OrderItem[];
  storeSubtotal: number;
}

export default function StoreOwnerOrders() {
  const { user, loading: authLoading } = useAuth();
  const [myStore, setMyStore] = useState<Store | null>(null);
  const [storeOrders, setStoreOrders] = useState<StoreOrder[]>([]);
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
      if (!user) return;
      try {
        const stores = await getStoresByOwner(user.uid);
        if (stores.length > 0) {
          const store = stores[0];
          setMyStore(store);
          
          const [products, allOrders] = await Promise.all([
            getProductsByStore(store.id),
            getOrders()
          ]);
          
          const pMap = new Map<string, Product>();
          products.forEach(p => pMap.set(p.id, p));
          setProductsMap(pMap);

          // Filter orders to only include items from this store
          const relevantOrders: StoreOrder[] = [];
          
          allOrders.forEach(order => {
            const storeItems = order.items.filter(item => pMap.has(item.productId));
            if (storeItems.length > 0) {
              const storeSubtotal = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              relevantOrders.push({
                ...order,
                storeItems,
                storeSubtotal
              });
            }
          });

          // Sort by latest
          relevantOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          setStoreOrders(relevantOrders);
        } else {
          setErrorMsg("No store found.");
        }
      } catch (err: any) {
        console.error("Failed to fetch orders data:", err);
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

  if (authLoading || loading) return <div className="py-20 text-center">Loading orders...</div>;
  if (!user) return <div className="py-20 text-center">Please log in.</div>;
  if (errorMsg) return <div className="py-20 text-center text-red-500">Error: {errorMsg}</div>;
  if (!myStore) return <div className="py-20 text-center">No store found for your account.</div>;

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-primary-blue font-bold mb-2">Orders</h1>
          <p className="text-primary-blue-light/70 font-medium">Manage and track your customer orders</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="pl-10 pr-4 py-3 rounded-full border border-surface-blue-dark focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue min-w-[250px] shadow-sm text-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-blue-light/50" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-surface-blue-dark shadow-[0_10px_40px_rgba(13,59,102,0.05)] overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-surface-blue-dark flex justify-between items-center">
          <h2 className="font-serif text-xl font-bold text-primary-blue">Order History</h2>
          <div className="text-sm text-primary-blue-light/70 font-medium bg-surface-blue px-3 py-1 rounded-full">{storeOrders.length} orders</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-blue/30 text-primary-blue-light/70 text-xs uppercase tracking-widest border-b border-surface-blue-dark">
                <th className="p-6 font-bold">Order ID</th>
                <th className="p-6 font-bold">Customer</th>
                <th className="p-6 font-bold">Items</th>
                <th className="p-6 font-bold">Total</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold">Date</th>
              </tr>
            </thead>
            <tbody>
              {storeOrders.length === 0 ? (
                <tr>
                    <td colSpan={6} className="p-12 text-center text-primary-blue-light/70">
                        You have no orders yet. 
                    </td>
                </tr>
              ) : (
                  storeOrders.map(order => (
                    <tr key={order.id} className="border-b border-surface-blue-dark last:border-none hover:bg-surface-blue/20 transition-colors group">
                      <td className="p-6 font-medium text-primary-blue text-sm">
                        #{order.id.slice(0, 8)}...
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-primary-blue text-sm mb-1">
                          {order.customerInfo.firstName} {order.customerInfo.lastName}
                        </div>
                        <div className="text-xs text-primary-blue-light/60 font-medium truncate max-w-[150px]">
                          {order.customerInfo.city}, {order.customerInfo.state}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-2">
                          {order.storeItems.map((item, idx) => {
                            const p = productsMap.get(item.productId);
                            return (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-surface-blue rounded overflow-hidden shrink-0">
                                  {p?.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 m-1 text-primary-blue-light/50" />}
                                </div>
                                <span className="text-xs text-primary-blue font-medium truncate max-w-[150px]">
                                  {item.quantity}x {p?.name || 'Unknown Product'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-6 font-medium text-primary-blue text-sm">
                        ₹{order.storeSubtotal.toLocaleString('en-IN')}
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                            order.status === 'PROCESSING' ? 'bg-amber-100 text-amber-700' : 
                            'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-6 text-sm text-primary-blue-light/70 font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
