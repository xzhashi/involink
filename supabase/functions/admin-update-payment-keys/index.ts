// supabase/functions/admin-update-payment-keys/index.ts
declare const Deno: any;
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authHelpers } from "../_shared/authHelpers.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CONFIG_TABLE = 'app_config';

serve(async (req: Request) => {
  const { user: adminUser, errorResponse: authError } = await authHelpers.checkAdminRole(req);
  if (authError) {
    return authError;
  }
  if (!adminUser) {
    return new Response(JSON.stringify({ error: "Admin authorization failed." }), {
      status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Server configuration error." }), {
      status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    if (req.body === null) {
      return new Response(JSON.stringify({ error: "Request body is missing." }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
    const { keyId, keySecret } = await req.json();

    if (!keyId) {
      return new Response(JSON.stringify({ error: "Razorpay Key ID is required." }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
    
    const recordsToUpsert = [{ key: 'RAZORPAY_KEY_ID', value: keyId }];
    // Only upsert the secret if a new value was provided.
    if (keySecret) {
        recordsToUpsert.push({ key: 'RAZORPAY_KEY_SECRET', value: keySecret });
    }

    const { error } = await supabaseAdmin.from(CONFIG_TABLE).upsert(recordsToUpsert, { onConflict: 'key' });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }, status: 200,
    });
  } catch (error) {
    console.error("admin-update-payment-keys Error:", error.message);
    let errorMessage = "Failed to update payment keys.";
    if (error instanceof SyntaxError) {
        errorMessage = "Invalid request body.";
    } else if (error.message) {
        errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});
