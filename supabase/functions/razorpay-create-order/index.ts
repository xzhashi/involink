// supabase/functions/razorpay-create-order/index.ts
// @deno-types="npm:@types/node"
declare var Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("razorpay-create-order: Missing Razorpay environment variables.");
      throw new Error("Server payment configuration error.");
    }

    const { planId, amount, currency } = await req.json();
    if (!planId || !amount || !currency) {
      return new Response(JSON.stringify({ error: "Missing planId, amount, or currency." }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const receiptId = `receipt_plan_${planId}_${Date.now()}`;
    const orderOptions = {
      amount: amount, // Amount in the smallest currency unit (e.g., paise)
      currency: currency, // e.g., 'INR'
      receipt: receiptId,
      notes: {
        plan_id: planId,
        user_id: user.id, // Add authenticated user's ID
      }
    };

    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: JSON.stringify(orderOptions),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Razorpay API Error:", errorBody);
        throw new Error(errorBody.error?.description || "Failed to create Razorpay order.");
    }

    const order = await response.json();

    return new Response(JSON.stringify({ order: order, keyId: razorpayKeyId }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 200,
    });

  } catch (error) {
    console.error("razorpay-create-order Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});