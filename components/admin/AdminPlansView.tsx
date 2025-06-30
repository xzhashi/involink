



import React, { useState } from 'react';
import Button from '../common/Button.tsx';
import Input from '../common/Input.tsx';
import Textarea from '../common/Textarea.tsx';
import { PlanData } from '../../types.ts';
import { usePlans } from '../../contexts/PlanContext.tsx'; 
import { XMarkIcon } from '../icons/XMarkIcon.tsx';
import { PlusIcon } from '../icons/PlusIcon.tsx';
import { PencilIcon } from '../icons/PencilIcon.tsx';
import { TrashIcon } from '../icons/TrashIcon.tsx';
import Select from '../common/Select.tsx';

const AdminPlansView: React.FC = () => {
  const { 
    plans: contextPlans, 
    addPlanContext, 
    updatePlanContext, 
    deletePlanContext, 
    loading: plansContextLoading, 
    error: plansContextError 
  } = usePlans();

  const [showModal, setShowModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<PlanData> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  const [viewError, setViewError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<PlanData | null>(null);


  const openModalForNew = () => {
    setCurrentPlan({ 
      id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // Client-side generated ID for new plans
      name: '', 
      price: '0', 
      price_suffix: '/mo', 
      features: ['New Feature'], 
      cta_text: 'Choose Plan',
      has_branding: false,
      invoice_limit: 0,
      sort_order: (contextPlans.length > 0 ? Math.max(...contextPlans.map(p => p.sort_order || 0)) : 0) + 1, 
      variant: 'secondary' 
    });
    setIsEditing(false);
    setShowModal(true);
    setModalError(null);
  };

  const openModalForEdit = (plan: PlanData) => {
    setCurrentPlan({...plan, features: [...plan.features]}); // Ensure features array is a new copy
    setIsEditing(true);
    setShowModal(true);
    setModalError(null);
  };

  const handleSavePlan = async () => {
    if (!currentPlan || !currentPlan.name || currentPlan.price === undefined || currentPlan.id === undefined) {
      setModalError("Plan ID, name, and price are required.");
      return;
    }
    setModalError(null);
    setIsProcessing(true);
    
    const planToSave: PlanData = {
      id: currentPlan.id,
      name: currentPlan.name || 'Unnamed Plan',
      price: currentPlan.price || '0',
      price_suffix: currentPlan.price_suffix || (currentPlan.price === '0' ? '' : '/mo'), 
      features: currentPlan.features || [],
      cta_text: currentPlan.cta_text || 'Choose Plan',
      invoice_limit: currentPlan.invoice_limit === null ? null : Number(currentPlan.invoice_limit ?? 0),
      is_current: currentPlan.is_current || false, // is_current is client-side display logic
      has_branding: currentPlan.has_branding || false,
      sort_order: typeof currentPlan.sort_order === 'number' ? currentPlan.sort_order : 0,
      variant: currentPlan.variant || 'secondary',
      // created_at and updated_at are handled by Supabase
    };

    let result;
    if (isEditing) {
      result = await updatePlanContext(planToSave);
    } else {
      // For adding, Omit Supabase-generated fields like created_at, updated_at if type requires.
      // The current addPlanContext expects Omit<PlanData, 'created_at' | 'updated_at'> & { id?: string }
      const { created_at, updated_at, ...planForAdd } = planToSave;
      result = await addPlanContext(planForAdd);
    }

    if (result.success) {
      setShowModal(false);
      setCurrentPlan(null);
    } else {
      setModalError(result.error || "Failed to save plan. Check console for details.");
    }
    setIsProcessing(false);
  };

  const requestDeletePlan = (plan: PlanData) => {
    setPlanToDelete(plan);
    setShowDeleteConfirm(true);
    setViewError(null);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    setIsProcessing(true);
    setViewError(null);
    const result = await deletePlanContext(planToDelete.id);
    if (!result.success) {
      setViewError(result.error || "Failed to delete plan.");
    }
    setShowDeleteConfirm(false);
    setPlanToDelete(null);
    setIsProcessing(false);
  };

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (!currentPlan) return;

    let processedValue: string | number | boolean | null = value;
    if (type === 'checkbox') {
        processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'sort_order') { 
        processedValue = parseInt(value, 10); 
        if (isNaN(processedValue as number)) processedValue = 0;
    } else if (name === 'invoice_limit') {
        if (value.trim().toLowerCase() === 'null' || value.trim() === '') {
            processedValue = null;
        } else {
            const numVal = parseInt(value, 10);
            // Revert to old value if input is not a non-negative number
            processedValue = isNaN(numVal) || numVal < 0 ? currentPlan.invoice_limit : numVal;
        }
    }
    setCurrentPlan({ ...currentPlan, [name]: processedValue });
  };
  
  const handleFeatureChange = (index: number, value: string) => {
    if (!currentPlan || !currentPlan.features) return;
    const newFeatures = [...currentPlan.features];
    newFeatures[index] = value;
    setCurrentPlan({ ...currentPlan, features: newFeatures });
  };

  const addFeature = () => {
    if (!currentPlan) return;
    setCurrentPlan({ ...currentPlan, features: [...(currentPlan.features || []), ''] });
  };

  const removeFeature = (index: number) => {
     if (!currentPlan || !currentPlan.features) return;
     const newFeatures = currentPlan.features.filter((_, i) => i !== index);
     setCurrentPlan({ ...currentPlan, features: newFeatures });
  };

  if (plansContextLoading && contextPlans.length === 0) { 
    return (
        <div className="animate-pulse">
            <div className="flex justify-between items-center mb-8">
                <div className="h-9 bg-slate-200 rounded w-1/3"></div>
                <div className="h-10 bg-slate-200 rounded w-36"></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 border-b border-slate-200">
                        <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                        <div className="h-5 bg-slate-200 rounded w-1/6"></div>
                        <div className="h-5 bg-slate-200 rounded w-1/6"></div>
                        <div className="flex-grow h-5 bg-slate-200 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-darkest">Plan Management</h1>
        <Button variant="primary" onClick={openModalForNew} leftIcon={<PlusIcon className="w-5 h-5"/>} disabled={isProcessing || plansContextLoading}>
          Add New Plan
        </Button>
      </div>

      {plansContextError && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">Error loading plans: {plansContextError}</p>}
      {viewError && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{viewError}</p>}
      {isProcessing && !showModal && <p className="text-blue-500 italic p-2">Processing request...</p>}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        {contextPlans.length === 0 && !plansContextLoading ? (
          <p className="text-neutral-DEFAULT">No plans found in the database. Add a new plan to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-neutral-dark">
              <thead className="text-xs text-neutral-DEFAULT uppercase bg-neutral-lightest">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Price</th>
                  <th scope="col" className="px-6 py-3">Features Count</th>
                  <th scope="col" className="px-6 py-3">Branding</th>
                  <th scope="col" className="px-6 py-3">Inv. Limit</th>
                  <th scope="col" className="px-6 py-3">Order</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contextPlans.map(plan => (
                  <tr key={plan.id} className="bg-white border-b hover:bg-neutral-lightest">
                    <td className="px-6 py-4 font-medium text-neutral-darkest">{plan.name}</td>
                    <td className="px-6 py-4">${plan.price}{plan.price_suffix}</td> 
                    <td className="px-6 py-4">{plan.features.length}</td>
                    <td className="px-6 py-4">{plan.has_branding ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4">{plan.invoice_limit === null ? 'Unlimited' : plan.invoice_limit}</td>
                    <td className="px-6 py-4">{plan.sort_order}</td>
                    <td className="px-6 py-4 space-x-2">
                      <Button variant="ghost" size="sm" className="text-primary-DEFAULT !px-2" onClick={() => openModalForEdit(plan)} title="Edit Plan" disabled={isProcessing}>
                        <PencilIcon className="w-4 h-4"/>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 !px-2" onClick={() => requestDeletePlan(plan)} title="Delete Plan" disabled={isProcessing}>
                        <TrashIcon className="w-4 h-4"/>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && currentPlan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[70] backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-darkest">{isEditing ? 'Edit Plan' : 'Add New Plan'}</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-neutral-500 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-light"
                aria-label="Close modal"
                disabled={isProcessing}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            {modalError && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-3 text-sm">{modalError}</p>}
            
            <div className="overflow-y-auto pr-2 space-y-4 flex-grow thin-scrollbar">
                <Input label="Plan ID (unique, no spaces)" name="id" value={currentPlan.id || ''} onChange={handleModalInputChange} disabled={isEditing || isProcessing} />
                <Input label="Plan Name" name="name" value={currentPlan.name || ''} onChange={handleModalInputChange} required disabled={isProcessing} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Price (e.g., 0, 15)" name="price" type="text" value={currentPlan.price || '0'} onChange={handleModalInputChange} required disabled={isProcessing} />
                    <Input label="Price Suffix (e.g., /mo)" name="price_suffix" value={currentPlan.price_suffix || ''} onChange={handleModalInputChange} disabled={isProcessing} /> 
                </div>
                 <Input label="Invoice Limit (type 'null' for unlimited)" name="invoice_limit" type="text" value={currentPlan.invoice_limit === null ? 'null' : String(currentPlan.invoice_limit)} onChange={handleModalInputChange} disabled={isProcessing} />
                <Input label="CTA Button Text" name="cta_text" value={currentPlan.cta_text || 'Choose Plan'} onChange={handleModalInputChange} disabled={isProcessing} /> 
                
                <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Features</label>
                    {currentPlan.features?.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                        <Input 
                            value={feature} 
                            onChange={(e) => handleFeatureChange(index, e.target.value)} 
                            placeholder={`Feature ${index + 1}`}
                            wrapperClassName="flex-grow !mb-0"
                            className="!mb-0"
                            disabled={isProcessing}
                        />
                        <Button variant="ghost" size="sm" onClick={() => removeFeature(index)} className="!text-red-500 !p-1.5" title="Remove feature" disabled={isProcessing}>
                            <TrashIcon className="w-4 h-4"/>
                        </Button>
                        </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={addFeature} leftIcon={<PlusIcon className="w-4 h-4"/>} disabled={isProcessing}>Add Feature</Button>
                </div>

                <div className="flex items-center space-x-2 mt-1">
                    <input 
                        type="checkbox" 
                        id="has_branding" 
                        name="has_branding" 
                        checked={currentPlan.has_branding || false} 
                        onChange={handleModalInputChange}
                        className="h-4 w-4 text-primary-DEFAULT border-slate-300 rounded focus:ring-primary-DEFAULT"
                        disabled={isProcessing}
                    />
                    <label htmlFor="has_branding" className="text-sm text-neutral-dark">Show "Powered by" Branding</label> 
                </div>
                <Input label="Sort Order (for display)" name="sort_order" type="number" value={String(currentPlan.sort_order || 0)} onChange={handleModalInputChange} disabled={isProcessing} /> 
                 <Select
                    label="Styling Variant (for Pricing Page)"
                    name="variant"
                    value={currentPlan.variant || 'secondary'}
                    onChange={handleModalInputChange}
                    options={[
                        { value: 'primary', label: 'Primary (Highlight)' },
                        { value: 'secondary', label: 'Secondary (Standard)' },
                    ]}
                    disabled={isProcessing}
                 />
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setShowModal(false)} disabled={isProcessing}>Cancel</Button>
              <Button variant="primary" onClick={handleSavePlan} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : (isEditing ? 'Save Changes' : 'Create Plan')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && planToDelete && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[80] backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold text-neutral-darkest mb-4">Confirm Deletion</h3>
            <p className="text-sm text-neutral-DEFAULT mb-6">
                Are you sure you want to delete the plan <span className="font-medium">{planToDelete.name}</span>? This will remove it from the database.
            </p>
            <div className="flex justify-end space-x-3">
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={isProcessing}>Cancel</Button>
                <Button variant="danger" onClick={confirmDeletePlan} disabled={isProcessing}>
                  {isProcessing ? 'Deleting...' : 'Delete Plan'}
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlansView;