import { onCall, HttpsError } from "firebase-functions/v2/https";
import { verifyAdmin, authAdmin, db } from "./utils";
import * as admin from "firebase-admin";

/**
 * Set admin role via custom claims.
 * Can only be called by existing admins, or as a first-time bootstrap
 * (if no admins exist yet).
 */
export const setAdminRole = onCall(
    { region: "asia-south1" },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Must be logged in.");
        }

        const { targetUid, targetEmail } = request.data;

        // Determine target user
        let targetUser;
        if (targetUid) {
            targetUser = await authAdmin.getUser(targetUid);
        } else if (targetEmail) {
            targetUser = await authAdmin.getUserByEmail(targetEmail);
        } else {
            throw new HttpsError(
                "invalid-argument",
                "Must provide targetUid or targetEmail."
            );
        }

        // Check if caller is admin
        const callerIsAdmin = await verifyAdmin(request.auth.uid);

        if (!callerIsAdmin) {
            // Allow bootstrap: if no admins exist, let the first user make themselves admin
            const adminsRef = db.ref("users");
            const adminsSnapshot = await adminsRef
                .orderByChild("role")
                .equalTo("admin")
                .limitToFirst(1)
                .get();

            if (adminsSnapshot.exists()) {
                throw new HttpsError(
                    "permission-denied",
                    "Only admins can assign admin roles."
                );
            }

            // Bootstrap mode: only allow setting yourself as admin
            if (targetUser.uid !== request.auth.uid) {
                throw new HttpsError(
                    "permission-denied",
                    "Bootstrap mode: you can only make yourself admin."
                );
            }
        }

        // Set custom claims
        await authAdmin.setCustomUserClaims(targetUser.uid, {
            admin: true,
        });

        // Update user record in Realtime Database
        await db.ref(`users/${targetUid}`).update({
            role: "admin",
            updatedAt: admin.database.ServerValue.TIMESTAMP,
        });

        return {
            success: true,
            message: `User ${targetUser.email} is now an admin.`,
        };
    }
);

/**
 * Remove admin role from a user.
 */
export const removeAdminRole = onCall(
    { region: "asia-south1" },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Must be logged in.");
        }

        const isAdminUser = await verifyAdmin(request.auth.uid);
        if (!isAdminUser) {
            throw new HttpsError("permission-denied", "Admin access required.");
        }

        const { targetUid } = request.data;

        if (!targetUid) {
            throw new HttpsError("invalid-argument", "Must provide targetUid.");
        }

        // Prevent removing your own admin role
        if (targetUid === request.auth.uid) {
            throw new HttpsError(
                "failed-precondition",
                "You cannot remove your own admin role."
            );
        }

        await authAdmin.setCustomUserClaims(targetUid, { admin: false });

        await db.ref(`users/${targetUid}`).update({
            role: "customer",
            updatedAt: admin.database.ServerValue.TIMESTAMP,
        });

        return { success: true };
    }
);
