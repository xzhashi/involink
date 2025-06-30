// supabase/functions/_shared/authHelpers.ts
import { createClient, SupabaseClient, User as SupabaseAuthUser } from "@supabase/supabase-js";

interface UserMetadata {
  role?: 'admin' | 'user';
  [key: string]: any;
}

export interface AuthenticatedUser extends SupabaseAuthUser {
  id: string; 
  email?: string | undefined; 
  user_metadata: UserMetadata;
}

export async function checkAdminRole(req: Request): Promise<{ user: AuthenticatedUser | null, errorResponse: Response | null }> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Crucial: Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return { user: null, errorResponse: new Response('ok', { headers: corsHeaders }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Auth helper: CRITICAL - Missing Supabase URL or Anon Key environment variables.");
    return { 
      user: null, 
      errorResponse: new Response(JSON.stringify({ error: "Server configuration error." }), { 
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } 
      }) 
    };
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("Auth helper: Missing or malformed Authorization header.");
    return { 
      user: null, 
      errorResponse: new Response(JSON.stringify({ error: "Missing or malformed Authorization header." }), { 
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } 
      }) 
    };
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

  if (userError || !user) {
    console.warn("Auth helper: FAILED token validation.", userError);
    return { 
      user: null, 
      errorResponse: new Response(JSON.stringify({ error: "Invalid token or user not found." }), { 
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } 
      }) 
    };
  }

  console.log(`Auth helper: User successfully authenticated: ${user.email || user.id}`);
  const metadata = user.user_metadata as UserMetadata;
  console.log(`Auth helper: Checking metadata for admin role. Found metadata:`, metadata);

  if (metadata?.role !== 'admin') {
    console.warn(`Auth helper: AUTHORIZATION FAILED. User ${user.email || user.id} does not have admin role. Role is: '${metadata?.role || 'not set'}'`);
    return { 
      user: null, 
      errorResponse: new Response(JSON.stringify({ error: "Forbidden: Admin role required." }), { 
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } 
      }) 
    };
  }

  console.log(`Auth helper: AUTHORIZATION SUCCESS. User ${user.email || user.id} is an admin.`);
  return { user: user as AuthenticatedUser, errorResponse: null }; 
}
