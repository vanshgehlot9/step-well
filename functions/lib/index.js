"use strict";
// Cloud Functions v2 — Entry Point
// All functions are exported from here for Firebase to discover
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAdminRole = exports.setAdminRole = exports.updateOrderStatus = exports.createShopOrder = exports.razorpayWebhook = exports.verifyRazorpayPayment = exports.createRazorpayOrder = void 0;
var donations_1 = require("./donations");
Object.defineProperty(exports, "createRazorpayOrder", { enumerable: true, get: function () { return donations_1.createRazorpayOrder; } });
Object.defineProperty(exports, "verifyRazorpayPayment", { enumerable: true, get: function () { return donations_1.verifyRazorpayPayment; } });
Object.defineProperty(exports, "razorpayWebhook", { enumerable: true, get: function () { return donations_1.razorpayWebhook; } });
var orders_1 = require("./orders");
Object.defineProperty(exports, "createShopOrder", { enumerable: true, get: function () { return orders_1.createShopOrder; } });
Object.defineProperty(exports, "updateOrderStatus", { enumerable: true, get: function () { return orders_1.updateOrderStatus; } });
var admin_1 = require("./admin");
Object.defineProperty(exports, "setAdminRole", { enumerable: true, get: function () { return admin_1.setAdminRole; } });
Object.defineProperty(exports, "removeAdminRole", { enumerable: true, get: function () { return admin_1.removeAdminRole; } });
//# sourceMappingURL=index.js.map