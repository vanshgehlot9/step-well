"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function setAdminRoleServer(uid: string) {
    try {
        const userRef = adminDb.ref(`users/${uid}`);
        await userRef.update({
            role: "admin",
            updatedAt: new Date().toISOString(),
        });
        return { success: true, message: "Admin role set successfully" };
    } catch (error: any) {
        console.error("Server error:", error);
        return { success: false, error: error.message };
    }
}
