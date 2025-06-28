
// @deno-types="npm:@types/node"
declare var Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkAdminRole } from "../_shared/authHelpers.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  const { user: adminUser, errorResponse: authError } = await checkAdminRole(req);
  if (authError) {
    return authError; // This handles OPTIONS, auth errors, and returns a pre-formatted Response
  }
  if (!adminUser) {
     console.error("admin-list-users: Admin authorization passed but adminUser object is null.");
     return new Response(JSON.stringify({ error: "Internal server error during authorization." }), {
        status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) { 
    console.error("admin-list-users: Missing server config.");
    return new Response(JSON.stringify({ error: "Server configuration error." }), {
      status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Fetch all users. For production apps with many users, implement pagination in the client.
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000, 
    });

    if (error) {
      console.error("admin-list-users: Error listing users with Supabase admin API:", error);
      throw error;
    }

    return new Response(JSON.stringify({ users }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }, status: 200,
    });
  } catch (error) {
    console.error("admin-list-users: Error:", error.message);
    let errorMessage = "Failed to list users.";
    let errorStatus = 500;
    if (error.message) {
        errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: errorStatus,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});
