
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { PlanData } from '../types';
// import { PLANS_DATA as INITIAL_PLANS_DATA } from '../constants'; // No longer direct initial source
import { 
  fetchAllPlansAdmin, 
  createPlanAdmin, 
  updatePlanAdmin, 
  deletePlanAdmin 
} from '../services/adminService'; // Import admin service functions

interface PlanContextType {
  plans: PlanData[];
  getPlans: () => PlanData[]; 
  addPlanContext: (plan: Omit<PlanData, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => Promise<{ success: boolean; error?: string | null }>;
  updatePlanContext: (plan: PlanData) => Promise<{ success: boolean; error?: string | null }>;
  deletePlanContext: (planId: string) => Promise<{ success: boolean; error?: string | null }>;
  loading: boolean;
  error: string | null;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPlans = await fetchAllPlansAdmin();
      setPlans(fetchedPlans.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
    } catch (e: any) {
      let detailedErrorMessage = "Unknown error fetching plans.";
      if (e) {
        detailedErrorMessage = e.message || JSON.stringify(e); // Fallback to stringifying if no message
        if (e.details) detailedErrorMessage += ` Details: ${e.details}`;
        if (e.hint) detailedErrorMessage += ` Hint: ${e.hint}`;
      }
      setError(`Failed to load plans: ${detailedErrorMessage}`);
      console.error("PlanContext: Error loading plans object:", e); // Log the full object for debugging
      console.error("PlanContext: Detailed error loading plans:", detailedErrorMessage); // Log the detailed message
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

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

  const value = {
    plans: getPlans(), 
    getPlans,
    addPlanContext,
    updatePlanContext,
    deletePlanContext,
    loading,
    error,
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
