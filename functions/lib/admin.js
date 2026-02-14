"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAdminRole = exports.setAdminRole = void 0;
const https_1 = require("firebase-functions/v2/https");
const utils_1 = require("./utils");
const admin = __importStar(require("firebase-admin"));
/**
 * Set admin role via custom claims.
 * Can only be called by existing admins, or as a first-time bootstrap
 * (if no admins exist yet).
 */
exports.setAdminRole = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be logged in.");
    }
    const { targetUid, targetEmail } = request.data;
    // Determine target user
    let targetUser;
    if (targetUid) {
        targetUser = await utils_1.authAdmin.getUser(targetUid);
    }
    else if (targetEmail) {
        targetUser = await utils_1.authAdmin.getUserByEmail(targetEmail);
    }
    else {
        throw new https_1.HttpsError("invalid-argument", "Must provide targetUid or targetEmail.");
    }
    // Check if caller is admin
    const callerIsAdmin = await (0, utils_1.verifyAdmin)(request.auth.uid);
    if (!callerIsAdmin) {
        // Allow bootstrap: if no admins exist, let the first user make themselves admin
        const adminsRef = utils_1.db.ref("users");
        const adminsSnapshot = await adminsRef
            .orderByChild("role")
            .equalTo("admin")
            .limitToFirst(1)
            .get();
        if (adminsSnapshot.exists()) {
            throw new https_1.HttpsError("permission-denied", "Only admins can assign admin roles.");
        }
        // Bootstrap mode: only allow setting yourself as admin
        if (targetUser.uid !== request.auth.uid) {
            throw new https_1.HttpsError("permission-denied", "Bootstrap mode: you can only make yourself admin.");
        }
    }
    // Set custom claims
    await utils_1.authAdmin.setCustomUserClaims(targetUser.uid, {
        admin: true,
    });
    // Update user record in Realtime Database
    await utils_1.db.ref(`users/${targetUid}`).update({
        role: "admin",
        updatedAt: admin.database.ServerValue.TIMESTAMP,
    });
    return {
        success: true,
        message: `User ${targetUser.email} is now an admin.`,
    };
});
/**
 * Remove admin role from a user.
 */
exports.removeAdminRole = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be logged in.");
    }
    const isAdminUser = await (0, utils_1.verifyAdmin)(request.auth.uid);
    if (!isAdminUser) {
        throw new https_1.HttpsError("permission-denied", "Admin access required.");
    }
    const { targetUid } = request.data;
    if (!targetUid) {
        throw new https_1.HttpsError("invalid-argument", "Must provide targetUid.");
    }
    // Prevent removing your own admin role
    if (targetUid === request.auth.uid) {
        throw new https_1.HttpsError("failed-precondition", "You cannot remove your own admin role.");
    }
    await utils_1.authAdmin.setCustomUserClaims(targetUid, { admin: false });
    await utils_1.db.ref(`users/${targetUid}`).update({
        role: "customer",
        updatedAt: admin.database.ServerValue.TIMESTAMP,
    });
    return { success: true };
});
//# sourceMappingURL=admin.js.map