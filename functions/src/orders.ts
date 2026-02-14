import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, verifyAdmin, generateReceipt } from "./utils";
import * as admin from "firebase-admin";

/**
 * Create a shop order with manual payment (UPI / bank transfer).
 * Called from frontend with { items, shippingAddress }
 */
export const createShopOrder = onCall(
    { region: "asia-south1" },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Must be logged in to order.");
        }

        const { items, shippingAddress } = request.data;

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new HttpsError("invalid-argument", "Cart is empty.");
        }

        if (!shippingAddress || !shippingAddress.name || !shippingAddress.address) {
            throw new HttpsError(
                "invalid-argument",
                "Shipping address is required."
            );
        }

        // Validate items and calculate total from Firestore (prevents price tampering)
        let totalAmount = 0;
        const validatedItems: any[] = [];

        for (const item of items) {
            const productDoc = await db
                .ref(`products/${item.productId}`)
                .get();

            if (!productDoc.exists()) {
                throw new HttpsError(
                    "not-found",
                    `Product ${item.productId} not found.`
                );
            }

            const product = productDoc.val()!;

            if (product.stock < item.quantity) {
                throw new HttpsError(
                    "failed-precondition",
                    `Insufficient stock for ${product.name}. Available: ${product.stock}`
                );
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

        const orderRef = generateReceipt("ORD");

        // Fetch payment details from settings
        const settingsDoc = await db.ref("settings/general").get();
        const settings = settingsDoc.exists() ? settingsDoc.val()! : {};

        const paymentDetails = {
            upiId: settings.upiId || "stepwells@upi",
            bankName: settings.bankName || "State Bank of India",
            accountNumber: settings.accountNumber || "XXXXXXXXXXXX",
            ifscCode: settings.ifscCode || "SBIN0XXXXXX",
            accountHolder: settings.accountHolder || "Stepwells Renovater Foundation",
        };

        // Create order
        const newOrderRef = db.ref("orders").push();
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
        const updates: any = {};
        for (const item of validatedItems) {
            updates[`products/${item.productId}/stock`] = admin.database.ServerValue.increment(-item.quantity);
        }
        await db.ref().update(updates);

        return {
            orderId: newOrderRef.key,
            orderRef,
            totalAmount,
            paymentDetails,
        };
    }
);

/**
 * Update order status (admin only).
 * Called with { orderId, status, upiReference? }
 */
export const updateOrderStatus = onCall(
    { region: "asia-south1" },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Must be logged in.");
        }

        const isAdminUser = await verifyAdmin(request.auth.uid);
        if (!isAdminUser) {
            throw new HttpsError("permission-denied", "Admin access required.");
        }

        const { orderId, status, upiReference } = request.data;

        if (!orderId || !status) {
            throw new HttpsError(
                "invalid-argument",
                "Order ID and status are required."
            );
        }

        const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            throw new HttpsError(
                "invalid-argument",
                `Invalid status. Must be one of: ${validStatuses.join(", ")}`
            );
        }

        const orderRef = db.ref(`orders/${orderId}`);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists()) {
            throw new HttpsError("not-found", "Order not found.");
        }

        const updateData: any = {
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
            const orderData = orderDoc.val()!;
            const updates: any = {};
            for (const item of orderData.items) {
                updates[`products/${item.productId}/stock`] = admin.database.ServerValue.increment(item.quantity);
            }
            // Add order update to the multi-path update
            Object.keys(updateData).forEach(key => {
                updates[`orders/${orderId}/${key}`] = updateData[key];
            });
            await db.ref().update(updates);
        } else {
            await orderRef.update(updateData);
        }

        return { success: true, orderId, status };
    }
);
