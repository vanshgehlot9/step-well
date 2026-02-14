"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { useCart, Product } from "@/context/cart-context";
import { ShoppingBag, Check } from "lucide-react";

interface FirestoreProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    stock: number;
    active: boolean;
}

const DEFAULT_CATEGORIES = ["All", "Apparel", "Art", "Tools", "Lifestyle", "Stationery"];

export default function ShopPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [products, setProducts] = useState<FirestoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [addedToCart, setAddedToCart] = useState<string | null>(null);
    const { addItem } = useCart();

    useEffect(() => {
        async function fetchProducts() {
            try {
                // Query active products
                // RTDB only supports one orderBy, so we order by 'active' to filter, then sort by date manually
                const q = query(
                    ref(db, "products"),
                    orderByChild("active"),
                    equalTo(true)
                );
                const snapshot = await get(q);

                const data: FirestoreProduct[] = [];
                snapshot.forEach((child) => {
                    data.push({
                        id: child.key!,
                        ...(child.val() as any),
                    });
                });

                // Sort by createdAt desc
                data.sort((a: any, b: any) => b.createdAt - a.createdAt);
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const categories = DEFAULT_CATEGORIES;

    const filteredProducts =
        activeCategory === "All"
            ? products
            : products.filter((p) => p.category === activeCategory);

    const handleAddToCart = (product: FirestoreProduct) => {
        const cartProduct: Product = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || "",
        };
        addItem(cartProduct);
        setAddedToCart(product.id);
        setTimeout(() => setAddedToCart(null), 2000);
    };

    return (
        <div className="bg-surface-blue min-h-screen selection:bg-accent-blue selection:text-white relative font-sans">
            {/* Texture */}


            <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-24 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-primary-blue font-sans text-xs tracking-[0.2em] uppercase font-bold shadow-sm border border-surface-blue-dark inline-block">
                        Foundation Store
                    </span>
                    <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl font-light text-primary-blue leading-none">
                        Museum{" "}
                        <span className="italic font-medium text-primary-blue-light">
                            Artifacts
                        </span>
                    </h1>
                    <p className="text-xl text-primary-blue-light/60 font-serif italic">
                        All proceeds fund the restoration of Mahamandir Bawri.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-300 border ${activeCategory === cat
                                ? "bg-primary-blue text-white border-primary-blue shadow-lg"
                                : "bg-white text-primary-blue-light/60 border-surface-blue-dark hover:border-primary-blue/30 hover:text-primary-blue"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="py-24 flex justify-center">
                        <div className="w-10 h-10 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
                    </div>
                )}

                {/* Product Grid */}
                {!loading && (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence>
                            {filteredProducts.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="group relative bg-white rounded-[2rem] border border-surface-blue-dark shadow-sm hover:shadow-2xl hover:shadow-primary-blue/10 transition-all duration-500 overflow-hidden"
                                >
                                    {/* Image Area */}
                                    <div className="aspect-[4/5] overflow-hidden relative">
                                        <img
                                            src={item.images?.[0] || "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop"}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 saturate-[0.8] group-hover:saturate-100"
                                        />
                                        <div className="absolute inset-0 bg-primary-blue/5 mix-blend-multiply group-hover:opacity-0 transition-opacity" />
                                        {item.stock <= 0 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white font-bold uppercase tracking-wider text-sm bg-black/60 px-4 py-2 rounded-full">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-8 relative bg-white">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-accent-blue mb-1 block">
                                                    {item.category}
                                                </span>
                                                <h3 className="font-serif text-2xl text-primary-blue font-medium leading-tight">
                                                    {item.name}
                                                </h3>
                                            </div>
                                            <span className="text-lg font-sans font-medium text-primary-blue bg-surface-blue px-3 py-1 rounded-md">
                                                ₹{item.price?.toLocaleString("en-IN")}
                                            </span>
                                        </div>

                                        <p className="text-primary-blue-light/60 text-sm leading-relaxed mb-6 line-clamp-2">
                                            {item.description}
                                        </p>

                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            disabled={item.stock <= 0}
                                            className={`w-full py-4 rounded-xl border font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all duration-300 ${addedToCart === item.id
                                                ? "bg-emerald-500 text-white border-emerald-500"
                                                : item.stock <= 0
                                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                    : "border-surface-blue-dark text-primary-blue hover:bg-primary-blue hover:text-white hover:border-primary-blue group-hover:bg-primary-blue group-hover:text-white group-hover:border-primary-blue"
                                                }`}
                                        >
                                            {addedToCart === item.id ? (
                                                <>
                                                    <Check size={16} /> Added to Cart
                                                </>
                                            ) : item.stock <= 0 ? (
                                                "Out of Stock"
                                            ) : (
                                                <>
                                                    <ShoppingBag size={16} /> Add to Cart
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Empty State */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-24 text-primary-blue-light/50 font-serif italic text-xl">
                        No artifacts found in this category.
                    </div>
                )}
            </div>
        </div>
    );
}
