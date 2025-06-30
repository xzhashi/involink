import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
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
  addPlanContext: (plan: Omit<PlanData, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<{ success: boolean; error?: string | null }>;
  updatePlanContext: (plan: PlanData) => Promise<{ success: boolean; error?: string | null }>;
  deletePlanContext: (planId: string) => Promise<{ success: boolean; error?: string | null }>;
  loading: boolean;
  error: string | null;

  // For current user's plan state
  currentUserPlan: PlanData | null;
  isLimitReached: boolean;
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
  const [isLimitReached, setIsLimitReached] = useState(false);
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

  // Effect to check if the user has reached their invoice limit for the month
  useEffect(() => {
    const checkLimit = async () => {
      if (!user || !currentUserPlan || currentUserPlan.invoice_limit === null) {
        setIsLimitReached(false);
        return;
      }
      
      const { startOfMonth, endOfMonth } = getMonthDateRange();
      const { count, error: countError } = await supabase
        .from('invoices')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

      if (countError) {
        setIsLimitReached(false); // Default to not-reached on error
        return;
      }
      
      setIsLimitReached((count || 0) >= currentUserPlan.invoice_limit);
    };

    if (!authLoading) {
      checkLimit();
    }
  }, [user, currentUserPlan, authLoading]);

  // Function for a user to change their own plan
  const changePlan = async (planId: string, paymentData?: any) => {
    if (!user) {
        setError("Cannot change plan, no user is logged in.");
        return;
    };
    setProcessing(true);
    setError(null);

    try {
      // If payment data is provided, verify it first.
      if (paymentData) {
        await verifyPayment({ ...paymentData, planId });
      }

      // If verification is successful (or not needed), update the user's plan
      const { error: updateError } = await supabase.auth.updateUser({
        data: { planId: planId, status: 'Active' }
      });
      
      if (updateError) {
        throw updateError;
      }
      // The onAuthStateChange listener in AuthContext will trigger a user update,
      // which in turn will update currentUserPlan via the useEffect above.
    } catch(err: any) {
       setError(err.message || "An error occurred while updating your plan.");
    } finally {
       setProcessing(false);
    }
  };


  const getPlans = () => {
    return [...plans].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  };

  const addPlanContext = async (plan: Omit<PlanData, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => {
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
    isLimitReached,
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