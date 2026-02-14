import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { db, generateReceipt } from "./utils";
import * as admin from "firebase-admin";

// Define secrets for Razorpay
const razorpayKeyId = defineSecret("RAZORPAY_KEY_ID");
const razorpayKeySecret = defineSecret("RAZORPAY_KEY_SECRET");

/**
 * Create a Razorpay order for a donation.
 * Called from frontend with { amount, currency, donorName, message }
 */
export const createRazorpayOrder = onCall(
    {
        region: "asia-south1",
        secrets: [razorpayKeyId, razorpayKeySecret],
    },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Must be logged in to donate.");
        }

        const { amount, currency = "INR", donorName, message } = request.data;

        if (!amount || typeof amount !== "number" || amount < 1) {
            throw new HttpsError("invalid-argument", "Amount must be at least ₹1.");
        }

        // Dynamically import Razorpay
        const Razorpay = (await import("razorpay")).default;

        const razorpay = new Razorpay({
            key_id: razorpayKeyId.value(),
            key_secret: razorpayKeySecret.value(),
        });

        const receipt = generateReceipt("DON");

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
            await db.ref("donations").push({
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
        } catch (error: any) {
            console.error("Razorpay order creation failed:", error);
            throw new HttpsError("internal", "Failed to create payment order.");
        }
    }
);

/**
 * Verify Razorpay payment after checkout.
 * Called from frontend with { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
export const verifyRazorpayPayment = onCall(
    {
        region: "asia-south1",
        secrets: [razorpayKeySecret],
    },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Must be logged in.");
        }

        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
            request.data;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            throw new HttpsError("invalid-argument", "Missing payment details.");
        }

        // Verify signature using crypto
        const crypto = await import("crypto");
        const expectedSignature = crypto
            .createHmac("sha256", razorpayKeySecret.value())
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            throw new HttpsError(
                "permission-denied",
                "Payment verification failed. Invalid signature."
            );
        }

        // Update donation status in Realtime Database
        const donationsRef = db.ref("donations");
        const snapshot = await donationsRef
            .orderByChild("razorpayOrderId")
            .equalTo(razorpayOrderId)
            .limitToFirst(1)
            .get();

        if (!snapshot.exists()) {
            throw new HttpsError("not-found", "Donation record not found.");
        }

        const donationId = Object.keys(snapshot.val())[0];
        await donationsRef.child(donationId).update({
            status: "completed",
            razorpayPaymentId,
            paidAt: admin.database.ServerValue.TIMESTAMP,
        });

        return { success: true, donationId };
    }
);

/**
 * Razorpay webhook handler for payment events.
 * Set webhook URL in Razorpay dashboard to:
 * https://<region>-<project>.cloudfunctions.net/razorpayWebhook
 */
export const razorpayWebhook = onRequest(
    {
        region: "asia-south1",
        secrets: [razorpayKeySecret],
    },
    async (req, res) => {
        if (req.method !== "POST") {
            res.status(405).send("Method Not Allowed");
            return;
        }

        const webhookSecret = razorpayKeySecret.value();
        const signature = req.headers["x-razorpay-signature"] as string;

        if (!signature) {
            res.status(400).send("Missing signature");
            return;
        }

        // Verify webhook signature
        const crypto = await import("crypto");
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

            const snapshot = await db
                .ref("donations")
                .orderByChild("razorpayOrderId")
                .equalTo(orderId)
                .limitToFirst(1)
                .get();

            if (snapshot.exists()) {
                const donationId = Object.keys(snapshot.val())[0];
                await db.ref(`donations/${donationId}`).update({
                    status: "completed",
                    razorpayPaymentId: payment.id,
                    paidAt: admin.database.ServerValue.TIMESTAMP,
                });
            }
        }

        res.status(200).json({ status: "ok" });
    }
);
