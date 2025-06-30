// supabase/functions/admin-invite-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";
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
     console.error("admin-invite-user: Admin authorization passed but adminUser object is null.");
     return new Response(JSON.stringify({ error: "Internal server error during authorization." }), {
        status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) { 
    console.error("admin-invite-user: Missing server config.");
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
    const { email, planId } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required to invite a user." }), {
        status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true, // Sends a confirmation email. User sets password via this.
      user_metadata: {
        planId: planId || 'free_tier',
        status: 'Invited',
        role: 'user', // Default role for new users
      },
    });

    if (error) {
      console.error("admin-invite-user: Error creating user with Supabase admin API:", error);
      throw error;
    }

    return new Response(JSON.stringify({ user }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }, status: 200,
    });
  } catch (error) {
    console.error("admin-invite-user: Error:", error.message);
    let errorMessage = "Failed to invite user.";
    let errorStatus = 500;
    if (error instanceof SyntaxError) { // JSON parsing error
        errorMessage = "Invalid request body: Could not parse JSON.";
        errorStatus = 400;
    } else if (error.message) {
        if (error.message.includes("User already exists")) {
            errorMessage = "User with this email already exists.";
            errorStatus = 409; // Conflict
        } else {
            errorMessage = error.message;
        }
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: errorStatus,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});
