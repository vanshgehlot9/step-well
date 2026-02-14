import * as admin from "firebase-admin";

// Initialize Firebase Admin (auto-initializes in Cloud Functions environment)
if (admin.apps.length === 0) {
    admin.initializeApp();
}

export const db = admin.database();
export const authAdmin = admin.auth();

/**
 * Verify the caller is an admin via custom claims.
 */
export async function verifyAdmin(uid: string): Promise<boolean> {
    const user = await authAdmin.getUser(uid);
    return user.customClaims?.admin === true;
}

/**
 * Generate a unique receipt/reference string.
 */
export function generateReceipt(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
}
