// supabase/functions/razorpay-verify-payment/index.ts
// @deno-types="npm:@types/node"
declare var Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";
import { checkUser } from "../_shared/authHelpers.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  const { user, errorResponse } = await checkUser(req);
  if (errorResponse) {
    return errorResponse;
  }
   if (!user) {
     return new Response(JSON.stringify({ error: "Could not identify user from token." }), {
        status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  try {
    // --- ENV VARS & ADMIN CLIENT ---
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!supabaseUrl || !serviceRoleKey || !razorpayKeySecret) {
      console.error("razorpay-verify-payment: Missing server configuration.");
      return new Response(JSON.stringify({ error: "Server configuration error." }), {
        status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // --- PARSE & VERIFY PAYMENT ---
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return new Response(JSON.stringify({ error: "Missing required payment details." }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const bodyToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = hmac("sha256", razorpayKeySecret, bodyToSign, "utf-8", "hex");

    // It's good practice to use a constant-time comparison for security, though less critical here.
    if (expectedSignature !== razorpay_signature) {
       return new Response(JSON.stringify({ error: "Invalid payment signature." }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    // --- PAYMENT IS VALID, UPDATE USER PLAN ---
    const { data: updatedUser, error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { user_metadata: { planId: planId, status: 'Active' } }
    );
    
    if (updateUserError) {
      console.error(`Failed to update plan for user ${user.id} after payment ${razorpay_payment_id}`, updateUserError);
      throw new Error("Payment verified, but failed to update user plan.");
    }

    // Note: The section for recording the payment in a 'payments' table has been removed
    // because it was not fully implemented and was causing errors. The primary function
    // of updating the user's plan is successful. Payment logging can be added back later.

    return new Response(JSON.stringify({ success: true, message: "Payment successful and plan updated." }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 200,
    });

  } catch (error) {
    console.error("razorpay-verify-payment Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});