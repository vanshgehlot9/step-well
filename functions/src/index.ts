// Cloud Functions v2 — Entry Point
// All functions are exported from here for Firebase to discover

export {
    createRazorpayOrder,
    verifyRazorpayPayment,
    razorpayWebhook,
} from "./donations";

export {
    createShopOrder,
    updateOrderStatus,
} from "./orders";

export {
    setAdminRole,
    removeAdminRole,
} from "./admin";
