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
exports.razorpayWebhook = exports.verifyRazorpayPayment = exports.createRazorpayOrder = void 0;
const https_1 = require("firebase-functions/v2/https");
const https_2 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const utils_1 = require("./utils");
const admin = __importStar(require("firebase-admin"));
// Define secrets for Razorpay
const razorpayKeyId = (0, params_1.defineSecret)("RAZORPAY_KEY_ID");
const razorpayKeySecret = (0, params_1.defineSecret)("RAZORPAY_KEY_SECRET");
/**
 * Create a Razorpay order for a donation.
 * Called from frontend with { amount, currency, donorName, message }
 */
exports.createRazorpayOrder = (0, https_1.onCall)({
    region: "asia-south1",
    secrets: [razorpayKeyId, razorpayKeySecret],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be logged in to donate.");
    }
    const { amount, currency = "INR", donorName, message } = request.data;
    if (!amount || typeof amount !== "number" || amount < 1) {
        throw new https_1.HttpsError("invalid-argument", "Amount must be at least ₹1.");
    }
    // Dynamically import Razorpay
    const Razorpay = (await Promise.resolve().then(() => __importStar(require("razorpay")))).default;
    const razorpay = new Razorpay({
        key_id: razorpayKeyId.value(),
        key_secret: razorpayKeySecret.value(),
    });
    const receipt = (0, utils_1.generateReceipt)("DON");
    try {
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Razorpay expects paise
            currency,
            receipt,
            notes: {
                donorName: donorName || "Anonymous",
                userId: request.auth.uid,
            },
        });
        // Save pending donation to Realtime Database
        await utils_1.db.ref("donations").push({
            userId: request.auth.uid,
            amount,
            currency,
            status: "pending",
            razorpayOrderId: order.id,
            razorpayPaymentId: null,
            receipt,
            donorName: donorName || "Anonymous",
            message: message || "",
            createdAt: admin.database.ServerValue.TIMESTAMP,
        });
        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: razorpayKeyId.value(),
        };
    }
    catch (error) {
        console.error("Razorpay order creation failed:", error);
        throw new https_1.HttpsError("internal", "Failed to create payment order.");
    }
});
/**
 * Verify Razorpay payment after checkout.
 * Called from frontend with { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
exports.verifyRazorpayPayment = (0, https_1.onCall)({
    region: "asia-south1",
    secrets: [razorpayKeySecret],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be logged in.");
    }
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = request.data;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new https_1.HttpsError("invalid-argument", "Missing payment details.");
    }
    // Verify signature using crypto
    const crypto = await Promise.resolve().then(() => __importStar(require("crypto")));
    const expectedSignature = crypto
        .createHmac("sha256", razorpayKeySecret.value())
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");
    if (expectedSignature !== razorpaySignature) {
        throw new https_1.HttpsError("permission-denied", "Payment verification failed. Invalid signature.");
    }
    // Update donation status in Realtime Database
    const donationsRef = utils_1.db.ref("donations");
    const snapshot = await donationsRef
        .orderByChild("razorpayOrderId")
        .equalTo(razorpayOrderId)
        .limitToFirst(1)
        .get();
    if (!snapshot.exists()) {
        throw new https_1.HttpsError("not-found", "Donation record not found.");
    }
    const donationId = Object.keys(snapshot.val())[0];
    await donationsRef.child(donationId).update({
        status: "completed",
        razorpayPaymentId,
        paidAt: admin.database.ServerValue.TIMESTAMP,
    });
    return { success: true, donationId };
});
/**
 * Razorpay webhook handler for payment events.
 * Set webhook URL in Razorpay dashboard to:
 * https://<region>-<project>.cloudfunctions.net/razorpayWebhook
 */
exports.razorpayWebhook = (0, https_2.onRequest)({
    region: "asia-south1",
    secrets: [razorpayKeySecret],
}, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    const webhookSecret = razorpayKeySecret.value();
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
        res.status(400).send("Missing signature");
        return;
    }
    // Verify webhook signature
    const crypto = await Promise.resolve().then(() => __importStar(require("crypto")));
    const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");
    if (expectedSignature !== signature) {
        res.status(401).send("Invalid signature");
        return;
    }
    const event = req.body;
    if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        const snapshot = await utils_1.db
            .ref("donations")
            .orderByChild("razorpayOrderId")
            .equalTo(orderId)
            .limitToFirst(1)
            .get();
        if (snapshot.exists()) {
            const donationId = Object.keys(snapshot.val())[0];
            await utils_1.db.ref(`donations/${donationId}`).update({
                status: "completed",
                razorpayPaymentId: payment.id,
                paidAt: admin.database.ServerValue.TIMESTAMP,
            });
        }
    }
    res.status(200).json({ status: "ok" });
});
//# sourceMappingURL=donations.js.map