import { supabase } from './supabaseClient.ts';

export const createOrder = async (planId: string, amount: number, currency: string) => {
    // Razorpay amount needs to be in the smallest currency unit (e.g., paise for INR)
    const amountInPaisa = Math.round(amount * 100);

    const { data, error } = await supabase.functions.invoke('razorpay-create-order', {
        body: { planId, amount: amountInPaisa, currency },
    });

    if (error) {
        const contextError = (error as any).context?.message;
        throw new Error(contextError || error.message || "Failed to create payment order.");
    }
    
    // The Edge Function response should include the public Razorpay Key ID
    const keyId = data.keyId;
    if (!keyId) {
        throw new Error("Missing Razorpay Key ID from server. Please configure environment variables for the Edge Function.");
    }

    return { ...data.order, key: keyId };
};

// A verification function can be added here if needed, though verification is best handled
// by the handler calling an edge function after payment success.
export const verifyPayment = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    planId: string;
}) => {
     const { data, error } = await supabase.functions.invoke('razorpay-verify-payment', {
        body: paymentData,
    });

    if (error) {
        const contextError = (error as any).context?.message;
        throw new Error(contextError || error.message || "Payment verification failed.");
    }

    return data;
}
