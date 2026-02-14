"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    updateProfile,
} from "firebase/auth";
import { ref, set, get, child, serverTimestamp, onValue } from "firebase/database";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        email: string,
        password: string,
        displayName: string
    ) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    // Check role in Realtime Database
                    const userRef = ref(db);
                    const userSnapshot = await get(child(userRef, `users/${firebaseUser.uid}`));

                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.val();
                        const isAdminUser = userData.role === "admin";
                        console.log("User role:", userData.role, "isAdmin:", isAdminUser);
                        setIsAdmin(isAdminUser);

                        // Set up real-time listener for role changes
                        const userRoleRef = ref(db, `users/${firebaseUser.uid}`);
                        const unsubscribeRole = onValue(userRoleRef, (snapshot) => {
                            if (snapshot.exists()) {
                                const roleData = snapshot.val();
                                const isAdminRole = roleData.role === "admin";
                                console.log("Role updated:", roleData.role, "isAdmin:", isAdminRole);
                                setIsAdmin(isAdminRole);
                            }
                        });

                        // Clean up role listener on unmount
                        return () => unsubscribeRole();
                    } else {
                        // Create user doc if it doesn't exist
                        console.log("User document not found, creating...");
                        await set(child(userRef, `users/${firebaseUser.uid}`), {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || "",
                            photoURL: firebaseUser.photoURL || "",
                            role: "customer",
                            createdAt: serverTimestamp(),
                        });
                        setIsAdmin(false);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (
        email: string,
        password: string,
        displayName: string
    ) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });

        // Create user doc
        await set(ref(db, "users/" + cred.user.uid), {
            uid: cred.user.uid,
            email: cred.user.email,
            displayName,
            photoURL: "",
            role: "customer",
            createdAt: serverTimestamp(),
        });
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, isAdmin, signIn, signUp, signInWithGoogle, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
