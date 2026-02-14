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
exports.updateOrderStatus = exports.createShopOrder = void 0;
const https_1 = require("firebase-functions/v2/https");
const utils_1 = require("./utils");
const admin = __importStar(require("firebase-admin"));
/**
 * Create a shop order with manual payment (UPI / bank transfer).
 * Called from frontend with { items, shippingAddress }
 */
exports.createShopOrder = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be logged in to order.");
    }
    const { items, shippingAddress } = request.data;
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new https_1.HttpsError("invalid-argument", "Cart is empty.");
    }
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.address) {
        throw new https_1.HttpsError("invalid-argument", "Shipping address is required.");
    }
    // Validate items and calculate total from Firestore (prevents price tampering)
    let totalAmount = 0;
    const validatedItems = [];
    for (const item of items) {
        const productDoc = await utils_1.db
            .ref(`products/${item.productId}`)
            .get();
        if (!productDoc.exists()) {
            throw new https_1.HttpsError("not-found", `Product ${item.productId} not found.`);
        }
        const product = productDoc.val();
        if (product.stock < item.quantity) {
            throw new https_1.HttpsError("failed-precondition", `Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }
        validatedItems.push({
            productId: item.productId,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            image: product.images?.[0] || "",
        });
        totalAmount += product.price * item.quantity;
    }
    const orderRef = (0, utils_1.generateReceipt)("ORD");
    // Fetch payment details from settings
    const settingsDoc = await utils_1.db.ref("settings/general").get();
    const settings = settingsDoc.exists() ? settingsDoc.val() : {};
    const paymentDetails = {
        upiId: settings.upiId || "stepwells@upi",
        bankName: settings.bankName || "State Bank of India",
        accountNumber: settings.accountNumber || "XXXXXXXXXXXX",
        ifscCode: settings.ifscCode || "SBIN0XXXXXX",
        accountHolder: settings.accountHolder || "Stepwells Renovater Foundation",
    };
    // Create order
    const newOrderRef = utils_1.db.ref("orders").push();
    await newOrderRef.set({
        userId: request.auth.uid,
        orderRef,
        items: validatedItems,
        totalAmount,
        status: "pending",
        paymentMethod: "manual",
        upiReference: null,
        shippingAddress,
        createdAt: admin.database.ServerValue.TIMESTAMP,
    });
    // Decrement stock for each item using multi-path update
    const updates = {};
    for (const item of validatedItems) {
        updates[`products/${item.productId}/stock`] = admin.database.ServerValue.increment(-item.quantity);
    }
    await utils_1.db.ref().update(updates);
    return {
        orderId: newOrderRef.key,
        orderRef,
        totalAmount,
        paymentDetails,
    };
});
/**
 * Update order status (admin only).
 * Called with { orderId, status, upiReference? }
 */
exports.updateOrderStatus = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be logged in.");
    }
    const isAdminUser = await (0, utils_1.verifyAdmin)(request.auth.uid);
    if (!isAdminUser) {
        throw new https_1.HttpsError("permission-denied", "Admin access required.");
    }
    const { orderId, status, upiReference } = request.data;
    if (!orderId || !status) {
        throw new https_1.HttpsError("invalid-argument", "Order ID and status are required.");
    }
    const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
        throw new https_1.HttpsError("invalid-argument", `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }
    const orderRef = utils_1.db.ref(`orders/${orderId}`);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists()) {
        throw new https_1.HttpsError("not-found", "Order not found.");
    }
    const updateData = {
        status,
        updatedAt: admin.database.ServerValue.TIMESTAMP,
    };
    if (upiReference) {
        updateData.upiReference = upiReference;
    }
    if (status === "paid") {
        updateData.paidAt = admin.database.ServerValue.TIMESTAMP;
    }
    if (status === "shipped") {
        updateData.shippedAt = admin.database.ServerValue.TIMESTAMP;
    }
    if (status === "delivered") {
        updateData.deliveredAt = admin.database.ServerValue.TIMESTAMP;
    }
    // If cancelled, restore stock
    if (status === "cancelled") {
        const orderData = orderDoc.val();
        const updates = {};
        for (const item of orderData.items) {
            updates[`products/${item.productId}/stock`] = admin.database.ServerValue.increment(item.quantity);
        }
        // Add order update to the multi-path update
        Object.keys(updateData).forEach(key => {
            updates[`orders/${orderId}/${key}`] = updateData[key];
        });
        await utils_1.db.ref().update(updates);
    }
    else {
        await orderRef.update(updateData);
    }
    return { success: true, orderId, status };
});
//# sourceMappingURL=orders.js.map