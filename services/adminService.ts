

import { AdminDashboardStats, AdminUser, PlanData } from '../types.ts';
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
      return new Error(`A network error occurred while trying to ${context}. This is often a CORS issue. Please check the following in your Supabase project:
1. Go to 'Edge Functions' -> select the function -> 'Settings' -> 'CORS headers' and ensure 'Access-Control-Allow-Origin' is set to '*' or your app's domain.
2. If using a custom domain, verify that the 'SUPABASE_URL' environment variable for the function is set to your custom domain URL, not the default '.supabase.co' URL.`);
  }
  const contextError = (error as any).context?.message;
  return new Error(`Failed to ${context}: ${contextError || error.message}.`);
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
  const { data, error } = await supabase.functions.invoke('admin-list-users');
  
  if (error) {
    throw handleInvokeError(error, "list users");
  }

  if (!data || !Array.isArray(data.users)) {
    throw new Error("Received an invalid response from the user listing service.");
  }
  
  return data.users as AdminUser[];
};


export const inviteUserAdmin = async (email: string, planId: string): Promise<{ user: AdminUser | null; error: string | null }> => {
  const { data, error } = await supabase.functions.invoke('admin-invite-user', {
    body: { email, planId }
  });

  if (error) {
    return { user: null, error: handleInvokeError(error, "invite user").message };
  }
  return { user: data?.user || null, error: data?.error || null };
};

export const updateUserAdmin = async (userId: string, updates: Partial<AdminUser['raw_user_meta_data']>) : Promise<{ user: AdminUser | null; error: string | null }> => {
  const { data, error } = await supabase.functions.invoke('admin-update-user', {
    body: { userId, updates }
  });
  if (error) {
    return { user: null, error: handleInvokeError(error, "update user").message };
  }
  return { user: data?.user || null, error: data?.error || null };
};

export const deleteUserAdmin = async (userId: string): Promise<{ success: boolean; error: string | null }> => {
  const { data, error } = await supabase.functions.invoke('admin-delete-user', {
    body: { userId }
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