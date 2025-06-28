// supabase/functions/create-razorpay-order/index.ts
// @deno-types="npm:@types/node"
declare var Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkUserAuth } from "../_shared/authHelpers.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  const { user, errorResponse } = await checkUserAuth(req);
  if (errorResponse) {
    return errorResponse;
  }
  if (!user) {
    return new Response(JSON.stringify({ error: "User authentication failed." }), {
        status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const { planId, amount, currency } = await req.json();

  if (!planId || !amount || !currency) {
    return new Response(JSON.stringify({ error: "Missing planId, amount, or currency" }), {
      status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
  const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

  if (!razorpayKeyId || !razorpayKeySecret) {
    return new Response(JSON.stringify({ error: "Razorpay credentials are not configured on the server." }), {
      status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  
  // Amount should be in the smallest currency unit (e.g., paise for INR)
  const amountInPaise = Math.round(parseFloat(amount) * 100);

  const options = {
    amount: amountInPaise,
    currency: currency,
    receipt: `receipt_plan_${planId}_${Date.now()}`,
    notes: {
      planId: planId,
      userId: user?.id,
    },
  };

  try {
    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: JSON.stringify(options),
    });

    const order = await response.json();

    if (!response.ok) {
        console.error("Razorpay API Error:", order);
        throw new Error(order.error?.description || "Failed to create Razorpay order.");
    }
    
    return new Response(JSON.stringify({ order, razorpayKeyId }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});