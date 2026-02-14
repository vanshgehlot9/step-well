"use client";

/**
 * Simple Razorpay integration without Cloud Functions
 * This works directly from the frontend
 */

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color?: string;
    };
    handler?: (response: any) => void;
    onClose?: () => void;
}

export const openRazorpayCheckout = (options: RazorpayOptions): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!window.Razorpay) {
            reject(new Error("Razorpay SDK not loaded"));
            return;
        }

        const razorpayOptions = {
            ...options,
            handler: (response: any) => {
                if (options.handler) {
                    options.handler(response);
                }
                resolve();
            },
            modal: {
                ondismiss: () => {
                    if (options.onClose) {
                        options.onClose();
                    }
                    resolve();
                },
            },
        };

        const rzp = new window.Razorpay(razorpayOptions);
        rzp.open();
    });
};
