
import { AdminDashboardStats, AdminUser, PlanData } from '../types';
import { supabase } from './supabaseClient'; 

// --- Helper to get start and end of current month for DB queries ---
const getMonthDateRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
  return { startOfMonth, endOfMonth };
};


// --- Admin Dashboard Stats ---
export const fetchAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  let totalUsers = 0;
  let activeSubscriptions = 0;

  // Try to fetch users for stats - will now use the database function
  try {
    const users = await fetchAllUsersAdmin(); 
    totalUsers = users.length;
    activeSubscriptions = users.filter(u => 
      (u.raw_user_meta_data?.status === 'Active' || u.user_metadata?.status === 'Active') &&
      (u.raw_user_meta_data?.planId !== 'free_tier' && u.user_metadata?.planId !== 'free_tier')
    ).length;
  } catch (userError) {
    console.warn("AdminDashboardStats: Could not fetch user data for stats, counts will be 0.", userError);
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
     console.warn("AdminDashboardStats: Could not fetch invoice count. Ensure the admin role has SELECT permission on the 'invoices' table via RLS.", invoiceError);
  }


  return {
    totalUsers,
    activeSubscriptions,
    monthlyRevenue: 0, // True revenue calculation needs payment integration
    invoicesGeneratedThisMonth,
  };
};

// --- User Management ---

// ** NEW APPROACH: Use an Edge Function for listing users **
export const fetchAllUsersAdmin = async (): Promise<AdminUser[]> => {
  const { data, error } = await supabase.functions.invoke('admin-list-users');

  if (error) {
    console.error('Error invoking admin-list-users function:', error);
    const contextError = (error as any).context?.message;
    throw new Error(`Failed to list users: ${contextError || error.message}. Ensure 'admin-list-users' Edge Function is deployed and your admin user has the correct role metadata.`);
  }
  
  // The edge function returns an object { users: [] }
  return data?.users || [];
};

// ** These functions still require Edge Functions **
export const inviteUserAdmin = async (email: string, planId: string): Promise<{ user: AdminUser | null; error: string | null }> => {
  // Edge Function `admin-invite-user`
  const { data, error } = await supabase.functions.invoke('admin-invite-user', {
    body: { email, planId }
  });

  if (error) {
    console.error('Error invoking admin-invite-user function:', error);
    const contextError = (error as any).context?.message;
    return { user: null, error: `Failed to invite user: ${contextError || error.message}. Ensure 'admin-invite-user' Edge Function is deployed and configured in your self-hosted environment.` };
  }
  return { user: data?.user || null, error: data?.error || null };
};

export const updateUserAdmin = async (userId: string, updates: Partial<AdminUser['raw_user_meta_data']>) : Promise<{ user: AdminUser | null; error: string | null }> => {
  // Edge Function `admin-update-user`
  const { data, error } = await supabase.functions.invoke('admin-update-user', {
    body: { userId, updates }
  });
  if (error) {
    console.error('Error invoking admin-update-user function:', error);
    const contextError = (error as any).context?.message;
    return { user: null, error: `Failed to update user: ${contextError || error.message}. Ensure 'admin-update-user' Edge Function is deployed.` };
  }
  return { user: data?.user || null, error: data?.error || null };
};

export const deleteUserAdmin = async (userId: string): Promise<{ success: boolean; error: string | null }> => {
  // Edge Function `admin-delete-user`
  const { data, error } = await supabase.functions.invoke('admin-delete-user', {
    body: { userId }
  });
   if (error) {
    console.error('Error invoking admin-delete-user function:', error);
    const contextError = (error as any).context?.message;
    return { success: false, error: `Failed to delete user: ${contextError || error.message}. Ensure 'admin-delete-user' Edge Function is deployed.` };
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
    console.error('Error fetching plans:', error);
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
    console.error('Error creating plan:', error);
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
    console.error('Error updating plan:', error);
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
    console.error('Error deleting plan:', error);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
};
