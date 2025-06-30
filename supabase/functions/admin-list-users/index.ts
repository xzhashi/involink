
// supabase/functions/admin-list-users/index.ts
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
    return authError; // Handles OPTIONS, auth errors, and returns a pre-formatted Response
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
    // Note: listUsers is paginated. For simplicity here, we fetch up to 1000 users.
    // For production with more users, pagination logic would need to be added.
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000, 
    });

    if (error) {
      console.error("admin-list-users: Error listing users with Supabase admin API:", error);
      throw error;
    }
    
    // The raw_user_meta_data is what we need for the frontend 'AdminUser' type.
    // The listUsers response already includes it in the user object as user_metadata.
    const formattedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        // The frontend expects `raw_user_meta_data`, so we map it from `user_metadata`
        raw_user_meta_data: user.user_metadata,
        user_metadata: user.user_metadata,
    }));


    return new Response(JSON.stringify({ users: formattedUsers }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }, status: 200,
    });
  } catch (error) {
    console.error("admin-list-users: Error:", error.message);
    return new Response(JSON.stringify({ error: error.message || "Failed to list users." }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});
