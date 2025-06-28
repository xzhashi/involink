// supabase/functions/verify-razorpay-payment/index.ts
// @deno-types="npm:@types/node"
declare var Deno: any;
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        planId,
    } = await req.json();

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
        return new Response(JSON.stringify({ error: "Server configuration error: Missing Razorpay secret." }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }

    try {
        // Step 1: Verify the signature
        const encoder = new TextEncoder();
        const data = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(keySecret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
        const signatureArray = Array.from(new Uint8Array(signatureBuffer));
        const generated_signature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (generated_signature !== razorpay_signature) {
            return new Response(JSON.stringify({ success: false, error: "Invalid payment signature." }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
        }
        
        // Step 2: Signature is valid. Update the user's plan in Supabase.
        const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

        const { data: updatedUser, error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
            user!.id,
            {
                user_metadata: {
                    ...user!.user_metadata, // Preserve existing metadata
                    planId: planId,
                    status: 'Active', // Ensure user is active after purchase
                }
            }
        );

        if (updateUserError) {
            throw new Error(`Payment verified, but failed to update user plan: ${updateUserError.message}`);
        }

        // Optional: Save payment details to a `payments` table for record-keeping
        // await supabaseAdmin.from('payments').insert({ ... });

        return new Response(JSON.stringify({ success: true, message: "Payment successful and plan updated." }), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });

    } catch (error) {
        console.error("Verification Error:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
});