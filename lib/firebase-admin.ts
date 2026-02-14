import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

function getAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    // Use service account JSON from env var
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccount) {
        return initializeApp({
            credential: cert(JSON.parse(serviceAccount)),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // Ensure this env var is available or passed
        });
    }

    // Fallback: use default credentials (works in Cloud Functions / GCP)
    return initializeApp({
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // Ensure this is set
    });
}

const adminApp = getAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getDatabase(adminApp);

export default adminApp;
