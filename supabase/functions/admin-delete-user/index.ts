// supabase/functions/admin-delete-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { checkAdminRole, AuthenticatedUser } from "../_shared/authHelpers.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  const { user: adminUser, errorResponse: authError } = await checkAdminRole(req);
  if (authError) {
    return authError;
  }
   if (!adminUser) {
     console.error("admin-delete-user: Admin authorization passed but adminUser object is null.");
     return new Response(JSON.stringify({ error: "Internal server error during authorization." }), {
        status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) { 
    console.error("admin-delete-user: Missing server config.");
    return new Response(JSON.stringify({ error: "Server configuration error." }), {
      status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    if (req.body === null) {
        return new Response(JSON.stringify({ error: "Request body is missing." }), { 
            status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS }
        });
    }
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required for deletion." }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    // Critical Safety Check: Prevent current admin from deleting themselves.
    if (adminUser.id === userId) {
        console.warn(`Admin ${adminUser.email} attempted self-deletion. Denied.`);
        return new Response(JSON.stringify({ error: "Cannot delete your own admin account." }), { 
            status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS }
        });
    }

    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error("admin-delete-user: Error deleting user with Supabase admin API:", error);
      if (error.message.toLowerCase().includes("user not found")) {
        return new Response(JSON.stringify({ error: "User not found." }), { 
            status: 404, headers: { "Content-Type": "application/json", ...CORS_HEADERS }
        });
      }
      throw error;
    }

    return new Response(JSON.stringify({ success: true, user: data?.user }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }, status: 200,
    });
  } catch (error) {
    console.error("admin-delete-user: Error:", error.message);
    let errorMessage = "Failed to delete user.";
    let errorStatus = 500;
    if (error instanceof SyntaxError) { 
        errorMessage = "Invalid request body: Could not parse JSON.";
        errorStatus = 400;
    } else if (error.message) {
        errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: errorStatus,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});
