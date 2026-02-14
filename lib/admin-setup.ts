import { ref, update, serverTimestamp, get, child } from "firebase/database";
import { db, auth } from "./firebase";

/**
 * Manual admin setup - use in browser console
 * Run: window.setAdminManual()
 */
export async function setAdminManual() {
    try {
        const user = auth.currentUser;
        
        if (!user) {
            console.error("❌ No user logged in");
            return;
        }

        console.log("🔄 Current user:", user.uid, user.email);
        
        // First, check current role
        const userRef = ref(db);
        const snapshot = await get(child(userRef, `users/${user.uid}`));
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("📋 Current user data:", userData);
        }

        // Update role to admin
        console.log("⏳ Updating role to admin...");
        const adminRef = ref(db, `users/${user.uid}`);
        await update(adminRef, {
            role: "admin",
            updatedAt: serverTimestamp(),
        });

        console.log("✅ Role updated successfully!");
        console.log("🔄 Refreshing page in 2 seconds...");
        
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error: any) {
        console.error("❌ Error:", error.message || error);
        console.error("Error code:", error.code);
    }
}

// Make available globally in development
if (typeof window !== "undefined") {
    (window as any).setAdminManual = setAdminManual;
}
