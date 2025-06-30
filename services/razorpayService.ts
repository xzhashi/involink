import { supabase } from './supabaseClient.ts';

const handleInvokeError = (error: any, context: string): Error => {
  // This helps diagnose network/CORS issues which are common in development.
  if (error.message.includes("Failed to fetch") || error.message.includes("network error")) {
      return new Error(`A network error occurred while trying to ${context}. This is often a CORS issue. Please check your Supabase project's Edge Function CORS settings and ensure environment variables are correctly set.`);
  }
  const contextError = (error as any).context?.message;
  return new Error(contextError || error.message || `Failed to ${context}.`);
};

export const createOrder = async (planId: string, amount: number, currency: string) => {
    // Razorpay amount needs to be in the smallest currency unit (e.g., paise for INR)
    const amountInPaisa = Math.round(amount * 100);

    const { data, error } = await supabase.functions.invoke('razorpay-create-order', {
        body: { planId, amount: amountInPaisa, currency },
    });

    if (error) {
        throw handleInvokeError(error, 'create payment order');
    }
    
    // The Edge Function response should include the public Razorpay Key ID
    const keyId = data.keyId;
    if (!keyId) {
        throw new Error("Missing Razorpay Key ID from server. Please configure environment variables for the Edge Function.");
    }
    if (!data.order || !data.order.id) {
         throw new Error("Server returned an invalid order response.");
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
       throw handleInvokeError(error, 'verify payment');
    }

    return data;
}