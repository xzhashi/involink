
import { AdminDashboardStats, AdminUser, PlanData, Payment, ContactSubmission } from '../types.ts';
import { supabase } from './supabaseClient.ts'; 

// --- Helper to get start and end of current month for DB queries ---
const getMonthDateRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
  return { startOfMonth, endOfMonth };
};

const handleInvokeError = (error: any, context: string): string => {
  if (error.message.includes("Failed to fetch") || error.message.includes("network error")) {
      return `A network error occurred while trying to ${context}. This is often a CORS issue. Please check your Supabase project's Edge Function CORS settings and ensure environment variables are correctly set.`;
  }
  const detailedError = error?.context?.error || error?.context?.json?.error;
  return typeof detailedError === 'string' ? detailedError : (error.message || `An unknown error occurred while trying to ${context}.`);
};


// --- Admin Dashboard Stats ---
export const fetchAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  let totalUsers = 0;
  let activeSubscriptions = 0;

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
  
  let invoicesGeneratedThisMonth = 0;
  try {
    const { startOfMonth, endOfMonth } = getMonthDateRange();
    const { count, error: invoiceError } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth);

    if (invoiceError) throw invoiceError;
    invoicesGeneratedThisMonth = count || 0;
  } catch (invoiceError) {
     // Silently fail on invoice fetch
  }

  return {
    totalUsers,
    activeSubscriptions,
    monthlyRevenue: 0, // Placeholder
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
  
  if (error) throw new Error(handleInvokeError(error, "list users"));
  if (!data || !Array.isArray(data.users)) throw new Error("Invalid response from user listing service.");
  return data.users as AdminUser[];
};

export const inviteUserAdmin = async (email: string, planId: string): Promise<{ user: AdminUser | null, error: string | null }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { user: null, error: "Admin not authenticated."};

  const { data, error } = await supabase.functions.invoke('admin-invite-user', {
    body: { email, planId },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error) return { user: null, error: handleInvokeError(error, 'invite user') };
  return { user: data.user, error: null };
};

export const updateUserAdmin = async (userId: string, updates: { planId?: string; status?: string; role?: string }): Promise<{ user: AdminUser | null, error: string | null }> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { user: null, error: "Admin not authenticated." };

    const { data, error } = await supabase.functions.invoke('admin-update-user', {
        body: { userId, updates },
        headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) return { user: null, error: handleInvokeError(error, 'update user') };
    return { user: data.user, error: null };
};

export const deleteUserAdmin = async (userId: string): Promise<{ success: boolean, error: string | null }> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: "Admin not authenticated." };

    const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId },
        headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) return { success: false, error: handleInvokeError(error, 'delete user') };
    return { success: data.success, error: null };
};


// --- Plan Management ---
export const fetchAllPlansAdmin = async (): Promise<PlanData[]> => {
    const { data, error } = await supabase.from('plans_table').select('*');
    if (error) throw new Error(error.message);
    return data || [];
};

export const createPlanAdmin = async (plan: Omit<PlanData, 'created_at' | 'updated_at'>): Promise<{ plan: PlanData | null, error: string | null }> => {
    const { data, error } = await supabase.from('plans_table').insert(plan).select().single();
    return { plan: data, error: error?.message || null };
};

export const updatePlanAdmin = async (plan: PlanData): Promise<{ plan: PlanData | null, error: string | null }> => {
    const { data, error } = await supabase.from('plans_table').update(plan).eq('id', plan.id).select().single();
    return { plan: data, error: error?.message || null };
};

export const deletePlanAdmin = async (planId: string): Promise<{ success: boolean, error: string | null }> => {
    const { error } = await supabase.from('plans_table').delete().eq('id', planId);
    return { success: !error, error: error?.message || null };
};

// --- Payment & Integration Management ---
export const fetchPaymentsAdmin = async (): Promise<Payment[]> => {
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const fetchRazorpaySettings = async (): Promise<{ keyId: string | null; isSecretSet: boolean; error: string | null; }> => {
    const { data, error } = await supabase.from('app_config').select('key, value').in('key', ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']);
    if (error) return { keyId: null, isSecretSet: false, error: error.message };
    const keyId = data.find(c => c.key === 'RAZORPAY_KEY_ID')?.value || null;
    const isSecretSet = !!data.find(c => c.key === 'RAZORPAY_KEY_SECRET')?.value;
    return { keyId, isSecretSet, error: null };
};

export const updateRazorpaySettings = async (keyId: string, keySecret: string): Promise<{ success: boolean; error: string | null; }> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: "Admin not authenticated." };
    const { data, error } = await supabase.functions.invoke('admin-update-payment-keys', {
        body: { keyId, keySecret },
        headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) return { success: false, error: handleInvokeError(error, 'update payment keys') };
    return { success: data.success, error: null };
};

// --- Contact Submissions ---
export const fetchContactSubmissionsAdmin = async (): Promise<ContactSubmission[]> => {
    const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const updateContactSubmissionAdmin = async (id: string, updates: Partial<ContactSubmission>): Promise<{ submission: ContactSubmission | null, error: string | null }> => {
    const { data, error } = await supabase.from('contact_submissions').update(updates).eq('id', id).select().single();
    return { submission: data, error: error?.message || null };
};

export const deleteContactSubmissionAdmin = async (id: string): Promise<{ success: boolean, error: string | null }> => {
    const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
    return { success: !error, error: error?.message || null };
};
