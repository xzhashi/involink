


import { AdminDashboardStats, AdminUser, PlanData, Payment } from '../types.ts';
import { supabase } from './supabaseClient.ts'; 

// --- Helper to get start and end of current month for DB queries ---
const getMonthDateRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
  return { startOfMonth, endOfMonth };
};

const handleInvokeError = (error: any, context: string): Error => {
  if (error.message.includes("Failed to fetch") || error.message.includes("network error")) {
      return new Error(`A network error occurred while trying to ${context}. This is often a CORS issue. Please check your Supabase project's Edge Function CORS settings and ensure environment variables are correctly set.`);
  }
  // Try to get the specific error message from the function's JSON response body
  const detailedError = error?.context?.error;
  
  // If a detailed error message exists in the response, use it.
  // Otherwise, fall back to the generic error message from the client library.
  const message = typeof detailedError === 'string' ? detailedError : (error.message || `An unknown error occurred while trying to ${context}.`);
  
  return new Error(message);
};


// --- Admin Dashboard Stats ---
export const fetchAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  let totalUsers = 0;
  let activeSubscriptions = 0;

  // Try to fetch users for stats
  try {
    const users = await fetchAllUsersAdmin(); 
    totalUsers = users.length;
    activeSubscriptions = users.filter(u => 
      (u.raw_user_meta_data?.status === 'Active' || u.user_metadata?.status === 'Active') &&
      (u.raw_user_meta_data?.planId !== 'free_tier' && u.user_metadata?.planId !== 'free_tier')
    ).length;
  } catch (userError: any) {
    // Silently fail on user fetch, stats will be 0.
  }
  
  // Fetch invoice count for the current month
  let invoicesGeneratedThisMonth = 0;
  try {
    const { startOfMonth, endOfMonth } = getMonthDateRange();
    // This assumes the admin role has RLS policy to SELECT from 'invoices' table.
    const { count, error: invoiceError } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth);

    if (invoiceError) throw invoiceError;
    invoicesGeneratedThisMonth = count || 0;
  } catch (invoiceError) {
     // Silently fail on invoice fetch, count will be 0.
  }


  return {
    totalUsers,
    activeSubscriptions,
    monthlyRevenue: 0, // True revenue calculation needs payment integration
    invoicesGeneratedThisMonth,
  };
};

// --- User Management ---

export const fetchAllUsersAdmin = async (): Promise<AdminUser[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Admin not authenticated.");

  const { data, error } = await supabase.functions.invoke('admin-list-users', {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  
  if (error) {
    throw handleInvokeError(error, "list users");
  }

  if (!data || !Array.isArray(data.users)) {
    throw new Error("Received an invalid response from the user listing service.");
  }
  
  return data.users as AdminUser[];
};


export const inviteUserAdmin = async (email: string, planId: string): Promise<{ user: AdminUser | null; error: string | null }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { user: null, error: "Admin not authenticated."};

  const { data, error } = await supabase.functions.invoke('admin-invite-user', {
    body: { email, planId },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) {
    return { user: null, error: handleInvokeError(error, "invite user").message };
  }
  return { user: data?.user || null, error: data?.error || null };
};

export const updateUserAdmin = async (userId: string, updates: Partial<AdminUser['raw_user_meta_data']>) : Promise<{ user: AdminUser | null; error: string | null }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { user: null, error: "Admin not authenticated."};

  const { data, error } = await supabase.functions.invoke('admin-update-user', {
    body: { userId, updates },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error) {
    return { user: null, error: handleInvokeError(error, "update user").message };
  }
  return { user: data?.user || null, error: data?.error || null };
};

export const deleteUserAdmin = async (userId: string): Promise<{ success: boolean; error: string | null }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Admin not authenticated."};

  const { data, error } = await supabase.functions.invoke('admin-delete-user', {
    body: { userId },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
   if (error) {
    return { success: false, error: handleInvokeError(error, "delete user").message };
  }
  return { success: data?.success || false, error: data?.error || null };
};


// --- Plan Management (Direct Supabase Table Interaction) ---
const PLANS_TABLE = 'plans_table'; 

export const fetchAllPlansAdmin = async (): Promise<PlanData[]> => {
  const { data, error } = await supabase
    .from(PLANS_TABLE)
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw error; 
  }
  return data || [];
};

export const createPlanAdmin = async (planData: Omit<PlanData, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<{ plan: PlanData | null; error: string | null }> => {
  const dataToInsert = { ...planData, price_suffix: planData.price_suffix || '' }; 
  if (!dataToInsert.id) dataToInsert.id = `plan_${Date.now()}`;

  const { data, error } = await supabase
    .from(PLANS_TABLE)
    .insert(dataToInsert)
    .select()
    .single();
  
  if (error) {
    return { plan: null, error: error.message };
  }
  return { plan: data, error: null };
};

export const updatePlanAdmin = async (planData: PlanData): Promise<{ plan: PlanData | null; error: string | null }> => {
  const { id, ...dataToUpdate } = planData;
  const updatePayload = { ...dataToUpdate, price_suffix: dataToUpdate.price_suffix || '', updated_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from(PLANS_TABLE)
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    return { plan: null, error: error.message };
  }
  return { plan: data, error: null };
};

export const deletePlanAdmin = async (planId: string): Promise<{ success: boolean; error: string | null }> => {
  const { error } = await supabase
    .from(PLANS_TABLE)
    .delete()
    .eq('id', planId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
};

// --- Payment Management ---
export const fetchPaymentsAdmin = async (): Promise<Payment[]> => {
  // Admin functions should use the service role to bypass RLS
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching payments:", error);
    throw new Error(error.message || "Could not fetch payment records.");
  }
  return data || [];
};

// --- Integration Settings ---

export const fetchRazorpaySettings = async (): Promise<{ keyId: string | null; isSecretSet: boolean; error: string | null }> => {
  const { data: keyIdData, error: keyIdError } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'RAZORPAY_KEY_ID')
    .single();

  if (keyIdError && keyIdError.code !== 'PGRST116') { // Ignore "not found" error
    return { keyId: null, isSecretSet: false, error: "Failed to fetch Razorpay Key ID. Ensure the 'app_config' table exists and has correct RLS policies for admin reads. " + keyIdError.message };
  }

  const { data: secretData, error: secretError } = await supabase
    .from('app_config')
    .select('key')
    .eq('key', 'RAZORPAY_KEY_SECRET')
    .single();
  
  if (secretError && secretError.code !== 'PGRST116') {
    // don't block on this error, just report it
    console.error("Failed to check for Razorpay Key Secret:", secretError.message);
  }

  return {
    keyId: keyIdData?.value || null,
    isSecretSet: !!secretData,
    error: null,
  };
};

export const updateRazorpaySettings = async (keyId: string, keySecret: string): Promise<{ success: boolean; error: string | null }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Admin not authenticated." };

  // Only pass the secret if it's a new value, not an empty string
  const body: { keyId: string; keySecret?: string } = { keyId };
  if (keySecret) {
    body.keySecret = keySecret;
  }

  const { data, error } = await supabase.functions.invoke('admin-update-payment-keys', {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) {
    return { success: false, error: handleInvokeError(error, "update payment keys").message };
  }
  return { success: data?.success || false, error: data?.error || null };
};