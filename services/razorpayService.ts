
import { supabase } from './supabaseClient.ts';

const handleInvokeError = (error: any, context: string): Error => {
  if (error.message.includes("Failed to fetch") || error.message.includes("network error")) {
      return new Error(`A network error occurred while trying to ${context}. This is often a CORS issue. Please check your Supabase project's Edge Function CORS settings and ensure environment variables are correctly set.`);
  }
  // Try to get the specific error message from the function's JSON response body
  const detailedError = error?.context?.error;
  
  // If a detailed error message exists in the response, use it.
  // Otherwise, fall back to the generic error message from the client library.
  const message = typeof detailedError === 'string' ? detailedError : (error.message || `An unknown error occurred while trying to ${context}.`);
  
  return new Error(message);
};

export const createOrder = async (planId: string, amount: number, currency: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("User is not authenticated. Cannot create order.");
    }

    // Razorpay amount needs to be in the smallest currency unit (e.g., paise for INR)
    const amountInPaisa = Math.round(amount * 100);

    const { data, error } = await supabase.functions.invoke('razorpay-create-order', {
        body: { planId, amount: amountInPaisa, currency },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
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
     const { data: { session } } = await supabase.auth.getSession();
     if (!session?.access_token) {
        throw new Error("User is not authenticated. Cannot verify payment.");
     }

     const { data, error } = await supabase.functions.invoke('razorpay-verify-payment', {
        body: paymentData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
    });

    if (error) {
       throw handleInvokeError(error, 'verify payment');
    }

    return data;
}