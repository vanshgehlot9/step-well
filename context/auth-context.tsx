"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  linkWithCredential,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type AppUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "admin" | "customer" | "supporter" | "store_owner";
  providers?: string[];
};

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, password?: string, displayName?: string, role?: AppUser["role"]) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setPasswordForAccount: (newPassword: string) => Promise<void>;
  sendPasswordReset: (email?: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const providers = firebaseUser.providerData.map((p) => p.providerId);
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<AppUser, "uid" | "email" | "displayName" | "photoURL">;
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              photoURL: firebaseUser.photoURL || "",
              role: userData.role || "customer",
              providers,
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              photoURL: firebaseUser.photoURL || "",
              role: "customer",
              providers,
            });
          }
        } catch (err) {
          console.warn("Could not read user profile doc:", err);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            photoURL: firebaseUser.photoURL || "",
            role: "customer",
            providers,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password?: string) => {
    await signInWithEmailAndPassword(auth, email, password || "password123");
  };

  const signUp = async (email: string, password?: string, displayName?: string, role: AppUser["role"] = "customer") => {
    const pwd = password || "password123";
    const name = displayName || email.split("@")[0];
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
    const firebaseUser = userCredential.user;
    
    await updateProfile(firebaseUser, { displayName: name });
    
    // Create user doc in Firestore
    await setDoc(doc(db, "users", firebaseUser.uid), {
      role,
      email,
      displayName: name,
      createdAt: new Date().toISOString()
    });
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;
    
    // Check if user doc exists
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        role: "supporter",
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        createdAt: new Date().toISOString()
      });
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("No authenticated email account found.");
    }
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
  };

  const setPasswordForAccount = async (newPassword: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("No authenticated email account found.");
    }
    const credential = EmailAuthProvider.credential(currentUser.email, newPassword);
    await linkWithCredential(currentUser, credential);
    const updatedProviders = currentUser.providerData.map((p) => p.providerId);
    setUser((prev) => (prev ? { ...prev, providers: updatedProviders } : prev));
  };

  const sendPasswordReset = async (targetEmail?: string) => {
    const emailToReset = targetEmail || auth.currentUser?.email;
    if (!emailToReset) {
      throw new Error("Please enter an email address.");
    }
    await sendPasswordResetEmail(auth, emailToReset);
  };

  const updateDisplayName = async (displayName: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Not signed in.");
    }
    await updateProfile(currentUser, { displayName });
    await updateDoc(doc(db, "users", currentUser.uid), {
      displayName,
      updatedAt: new Date().toISOString(),
    });
    setUser((prev) => (prev ? { ...prev, displayName } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === "admin",
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        changePassword,
        setPasswordForAccount,
        sendPasswordReset,
        updateDisplayName,
      }}
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
