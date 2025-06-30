// supabase/functions/admin-update-user/index.ts
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
     console.error("admin-update-user: Admin authorization passed but adminUser object is null.");
     return new Response(JSON.stringify({ error: "Internal server error during authorization." }), {
        status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) { 
    console.error("admin-update-user: Missing server config.");
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
    const { userId, updates } = await req.json();
    
    if (!userId || !updates || typeof updates !== 'object') {
      return new Response(JSON.stringify({ error: "User ID and a valid updates object are required." }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }
    
    const metadataToUpdate: { [key: string]: any } = {};
    if (updates.planId !== undefined) metadataToUpdate.planId = updates.planId;
    if (updates.status !== undefined) metadataToUpdate.status = updates.status;
    if (updates.role !== undefined && ['admin', 'user'].includes(updates.role)) {
        if (adminUser.id === userId && updates.role === 'user') {
            console.warn(`Admin ${adminUser.email} attempted self-demotion. This is blocked for safety.`);
            return new Response(JSON.stringify({ error: "Cannot demote your own admin account." }), { 
                status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS }
            });
        }
        metadataToUpdate.role = updates.role;
    }

    if (Object.keys(metadataToUpdate).length === 0) {
        return new Response(JSON.stringify({ error: "No valid user_metadata updates provided." }), { 
            status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS }
        });
    }

    const { data: { user: updatedUser }, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: metadataToUpdate } 
    );

    if (error) {
      console.error("admin-update-user: Error updating user with Supabase admin API:", error);
      throw error;
    }

    return new Response(JSON.stringify({ user: updatedUser }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }, status: 200,
    });
  } catch (error) {
    console.error("admin-update-user: Error:", error.message);
    let errorMessage = "Failed to update user.";
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
