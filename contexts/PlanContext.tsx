
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { PlanData } from '../types.ts';
import { useAuth } from './AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { 
  fetchAllPlansAdmin, 
  createPlanAdmin, 
  updatePlanAdmin, 
  deletePlanAdmin 
} from '../services/adminService.ts';
import { verifyPayment } from '../services/razorpayService.ts';

interface PlanContextType {
  // For Admin plan management
  plans: PlanData[];
  getPlans: () => PlanData[]; 
  addPlanContext: (plan: Omit<PlanData, 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string | null }>;
  updatePlanContext: (plan: PlanData) => Promise<{ success: boolean; error?: string | null }>;
  deletePlanContext: (planId: string) => Promise<{ success: boolean; error?: string | null }>;
  loading: boolean;
  error: string | null;

  // For current user's plan state
  currentUserPlan: PlanData | null;
  isInvoiceLimitReached: boolean;
  isClientLimitReached: boolean;
  isProductLimitReached: boolean;
  changePlan: (planId: string, paymentData?: any) => Promise<void>;
  processing: boolean;
}

const getMonthDateRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
  return { startOfMonth, endOfMonth };
};

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  
  // Admin-related state
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User-specific plan state
  const [currentUserPlan, setCurrentUserPlan] = useState<PlanData | null>(null);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [processing, setProcessing] = useState(false); // For plan change processing

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPlans = await fetchAllPlansAdmin();
      setPlans(fetchedPlans.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
    } catch (e: any) {
      const errorMessage = e?.message || "Failed to fetch plans.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);
  
  // Effect to set the current user's plan based on their metadata
  useEffect(() => {
    if (user && plans.length > 0) {
      const planId = user.user_metadata?.planId || 'free_tier';
      const foundPlan = plans.find(p => p.id === planId) || plans.find(p => p.id === 'free_tier') || null;
      setCurrentUserPlan(foundPlan);
    } else {
      setCurrentUserPlan(null);
    }
  }, [user, plans]);

  // Effect to check if the user has reached their limits
  useEffect(() => {
    const checkLimits = async () => {
      if (!user) return;
      
      const { startOfMonth, endOfMonth } = getMonthDateRange();
      
      const [invoiceRes, clientRes, productRes] = await Promise.all([
         supabase
            .from('invoices')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth)
            .lte('created_at', endOfMonth),
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      setInvoiceCount(invoiceRes.count || 0);
      setClientCount(clientRes.count || 0);
      setProductCount(productRes.count || 0);
    };

    if (!authLoading && user) {
      checkLimits();
    }
  }, [user, authLoading]);

  const isInvoiceLimitReached = useMemo(() => {
    if (!currentUserPlan || currentUserPlan.invoice_limit === null) return false;
    return invoiceCount >= currentUserPlan.invoice_limit;
  }, [currentUserPlan, invoiceCount]);

  const isClientLimitReached = useMemo(() => {
    if (!currentUserPlan || currentUserPlan.client_limit === null) return false;
    return clientCount >= currentUserPlan.client_limit;
  }, [currentUserPlan, clientCount]);

  const isProductLimitReached = useMemo(() => {
    if (!currentUserPlan || currentUserPlan.product_limit === null) return false;
    return productCount >= currentUserPlan.product_limit;
  }, [currentUserPlan, productCount]);

  // Function for a user to change their own plan
  const changePlan = async (planId: string, paymentData?: any) => {
    if (!user) {
        setError("Cannot change plan, no user is logged in.");
        return;
    };
    setProcessing(true);
    setError(null);

    try {
        const targetPlan = plans.find(p => p.id === planId);
        if (!targetPlan) throw new Error("Selected plan not found.");

        // For paid plans, verify payment on the backend. 
        // The backend function is responsible for updating the user's plan.
        if (paymentData && targetPlan.price !== '0') {
            const verificationResult = await verifyPayment({ ...paymentData, planId });
            if (!verificationResult || !verificationResult.success) {
                throw new Error(verificationResult?.message || "Payment verification failed on the server.");
            }
        }
        
        // After successful backend verification OR for free plans,
        // we trigger a client-side update. This call ensures that the
        // local user session is updated with the new `planId`, which then
        // triggers the onAuthStateChange listener in AuthContext, refreshing the UI.
        const { error: updateError } = await supabase.auth.updateUser({
            data: { planId: planId, status: 'Active' }
        });

        if (updateError) {
            // This could happen if the user's session expired between steps.
            throw new Error(`Failed to sync plan on client: ${updateError.message}`);
        }

    } catch(err: any) {
       setError(err.message || "An error occurred while updating your plan.");
       // Re-throw the error so the calling component (e.g., PricingPage) knows about it
       throw err;
    } finally {
       setProcessing(false);
    }
  };


  const getPlans = () => {
    return [...plans].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  };

  const addPlanContext = async (plan: Omit<PlanData, 'created_at' | 'updated_at'>) => {
    setLoading(true); 
    setError(null);
    const { plan: newPlan, error: apiError } = await createPlanAdmin(plan);
    setLoading(false);
    if (newPlan) {
      setPlans(prevPlans => [...prevPlans, newPlan].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
      return { success: true };
    }
    const errorMessage = apiError || "Failed to add plan.";
    setError(errorMessage);
    return { success: false, error: errorMessage };
  };

  const updatePlanContext = async (updatedPlan: PlanData) => {
    setLoading(true);
    setError(null);
    const { plan: newPlanData, error: apiError } = await updatePlanAdmin(updatedPlan);
    setLoading(false);
    if (newPlanData) {
      setPlans(prevPlans =>
        prevPlans.map(p => (p.id === newPlanData.id ? newPlanData : p)).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      );
      return { success: true };
    }
    const errorMessage = apiError || "Failed to update plan.";
    setError(errorMessage);
    return { success: false, error: errorMessage };
  };

  const deletePlanContext = async (planId: string) => {
    setLoading(true);
    setError(null);
    const { success, error: apiError } = await deletePlanAdmin(planId);
    setLoading(false);
    if (success) {
      setPlans(prevPlans => prevPlans.filter(p => p.id !== planId));
      return { success: true };
    }
    const errorMessage = apiError || "Failed to delete plan.";
    setError(errorMessage);
    return { success: false, error: errorMessage };
  };

  const value: PlanContextType = {
    plans: getPlans(), 
    getPlans,
    addPlanContext,
    updatePlanContext,
    deletePlanContext,
    loading: loading || authLoading, // Combine loading states
    error,
    // User-specific values
    currentUserPlan,
    isInvoiceLimitReached,
    isClientLimitReached,
    isProductLimitReached,
    changePlan,
    processing,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

export const usePlans = (): PlanContextType => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlans must be used within a PlanProvider');
  }
  return context;
};
