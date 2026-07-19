"use client";

import { useState, useEffect } from "react";
import { Store as StoreIcon, MapPin, AlignLeft, ShieldCheck, Mail, User } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getStoresByOwner } from "@/lib/firebase-services";
import { Store } from "@/lib/types";

export default function StoreOwnerSettings() {
  const { user, loading: authLoading } = useAuth();
  const [myStore, setMyStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
      if (!user) return;
      try {
        const stores = await getStoresByOwner(user.uid);
        if (stores.length > 0) {
          setMyStore(stores[0]);
        } else {
          setErrorMsg("No store found.");
        }
      } catch (err: any) {
        console.error("Failed to fetch store data:", err);
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

  if (authLoading || loading) return <div className="py-20 text-center">Loading settings...</div>;
  if (!user) return <div className="py-20 text-center">Please log in.</div>;
  if (errorMsg) return <div className="py-20 text-center text-red-500">Error: {errorMsg}</div>;
  if (!myStore) return <div className="py-20 text-center">No store found for your account.</div>;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-primary-blue font-bold mb-2">Store Settings</h1>
        <p className="text-primary-blue-light/70 font-medium">View and manage your store profile</p>
      </div>

      <div className="bg-white rounded-3xl border border-surface-blue-dark shadow-[0_10px_40px_rgba(13,59,102,0.05)] overflow-hidden">
        
        {/* Banner */}
        <div className="h-48 w-full bg-surface-blue relative">
            <img src={myStore.banner || "/placeholder-banner.jpg"} alt="Banner" className="w-full h-full object-cover" />
            
            {/* Logo */}
            <div className="absolute -bottom-10 left-8 w-24 h-24 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-lg">
                <img src={myStore.logo || "/placeholder-logo.jpg"} alt="Logo" className="w-full h-full object-cover" />
            </div>
        </div>

        <div className="p-8 pt-16">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="font-serif text-2xl font-bold text-primary-blue">{myStore.name}</h2>
                    <p className="text-sm font-medium text-primary-blue-light/70 bg-surface-blue px-3 py-1 rounded-full inline-block mt-2">
                        stepwellsrenovaterfoundation.org/store/{myStore.slug}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        myStore.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                        myStore.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                        'bg-red-100 text-red-700'
                    }`}>
                        {myStore.status}
                    </span>
                    <span className="text-xs text-primary-blue-light/50 font-medium">
                        Store ID: {myStore.id}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-surface-blue-dark pt-8">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-primary-blue-light/50 uppercase tracking-widest mb-3">Store Details</h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-accent-blue mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-primary-blue-light/70 font-bold uppercase tracking-wider">Location</p>
                                    <p className="text-primary-blue font-medium">{myStore.location}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <AlignLeft className="w-5 h-5 text-accent-blue mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-primary-blue-light/70 font-bold uppercase tracking-wider">Description</p>
                                    <p className="text-primary-blue font-medium text-sm leading-relaxed">{myStore.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-primary-blue-light/50 uppercase tracking-widest mb-3">Account Information</h3>
                        
                        <div className="space-y-4 bg-surface-blue/30 p-5 rounded-2xl border border-surface-blue-dark">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-primary-blue-light/70 shrink-0" />
                                <span className="text-primary-blue font-medium">{user.displayName || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-primary-blue-light/70 shrink-0" />
                                <span className="text-primary-blue font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 pt-3 border-t border-surface-blue-dark">
                                <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                                <span className="text-xs text-green-600 font-bold uppercase tracking-wider">Verified Vendor Access</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
