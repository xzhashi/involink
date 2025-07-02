
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
      billing_cycle: 'monthly',
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
      billing_cycle: currentPlan.billing_cycle || 'monthly',
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
      // The addPlanContext expects Omit<PlanData, 'created_at' | 'updated_at'>, so we remove those fields.
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
    } else if (name === 'sort_order' || name === 'invoice_limit') { 
        const numVal = parseInt(value, 10);
        processedValue = isNaN(numVal) || numVal < 0 ? 0 : numVal;
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

  const handleUnlimitedInvoicesToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentPlan) return;
    const isUnlimited = e.target.checked;
    setCurrentPlan({
      ...currentPlan,
      invoice_limit: isUnlimited ? null : 0, // Reset to 0 when unchecked
    });
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-3">
        <h1 className="text-3xl font-bold text-neutral-darkest">Plan Management</h1>
        <Button variant="primary" onClick={openModalForNew} leftIcon={<PlusIcon className="w-5 h-5"/>}>
          Add New Plan
        </Button>
      </div>
      
      {viewError && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{viewError}</p>}
      {plansContextError && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{plansContextError}</p>}


      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-neutral-dark">
            <thead className="text-xs text-neutral-DEFAULT uppercase bg-neutral-lightest">
              <tr>
                <th scope="col" className="px-6 py-3">Order</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Price</th>
                <th scope="col" className="px-6 py-3">Billing Cycle</th>
                <th scope="col" className="px-6 py-3">Invoice Limit</th>
                <th scope="col" className="px-6 py-3">Has Branding</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contextPlans.map(plan => (
                <tr key={plan.id} className="bg-white border-b hover:bg-neutral-lightest">
                  <td className="px-6 py-4">{plan.sort_order}</td>
                  <td className="px-6 py-4 font-medium text-neutral-darkest">{plan.name}</td>
                  <td className="px-6 py-4">${plan.price}{plan.price_suffix}</td>
                  <td className="px-6 py-4 capitalize">{plan.billing_cycle}</td>
                  <td className="px-6 py-4">{plan.invoice_limit === null ? 'Unlimited' : plan.invoice_limit}</td>
                  <td className="px-6 py-4">{plan.has_branding ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 space-x-2">
                    <Button variant="ghost" size="sm" className="text-primary-DEFAULT !px-2" onClick={() => openModalForEdit(plan)} title={`Edit plan ${plan.name}`}>
                      <PencilIcon className="w-4 h-4"/>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 !px-2" onClick={() => requestDeletePlan(plan)} title={`Delete plan ${plan.name}`}>
                      <TrashIcon className="w-4 h-4"/>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {plansContextLoading && contextPlans.length > 0 && <p className="text-center py-4">Loading plans...</p>}
          {!plansContextLoading && contextPlans.length === 0 && !plansContextError && <p className="text-center py-4">No plans found. Add one to get started.</p>}
        </div>
      </div>
      
       {showModal && currentPlan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[70] backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-darkest">{isEditing ? 'Edit Plan' : 'Add New Plan'}</h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-light" disabled={isProcessing}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            {modalError && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-3 text-sm">{modalError}</p>}
            <div className="overflow-y-auto pr-2 space-y-4 flex-grow thin-scrollbar">
              <Input 
                label="Plan ID (cannot be changed after creation)"
                name="id"
                value={currentPlan.id || ''}
                onChange={handleModalInputChange}
                required
                disabled={isProcessing || isEditing}
                className={isEditing ? 'bg-slate-100 cursor-not-allowed' : ''}
              />
              <Input label="Plan Name" name="name" value={currentPlan.name || ''} onChange={handleModalInputChange} required disabled={isProcessing} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (e.g., 15)" name="price" type="text" value={currentPlan.price || ''} onChange={handleModalInputChange} required disabled={isProcessing} />
                <Input label="Price Suffix (e.g., /mo)" name="price_suffix" value={currentPlan.price_suffix || ''} onChange={handleModalInputChange} disabled={isProcessing} />
              </div>
               <Select
                label="Billing Cycle"
                name="billing_cycle"
                value={currentPlan.billing_cycle || 'monthly'}
                onChange={handleModalInputChange}
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'annually', label: 'Annually' },
                ]}
                disabled={isProcessing}
              />
              <div>
                <Input 
                  label="Invoice Limit"
                  name="invoice_limit"
                  type="number"
                  value={currentPlan.invoice_limit === null ? '' : (currentPlan.invoice_limit ?? 0).toString()}
                  onChange={handleModalInputChange}
                  placeholder={currentPlan.invoice_limit === null ? 'Unlimited' : "e.g., 3"}
                  required
                  disabled={isProcessing || currentPlan.invoice_limit === null}
                  wrapperClassName={`transition-opacity ${currentPlan.invoice_limit === null ? 'opacity-50' : ''}`}
                />
                <div className="flex items-center -mt-2 mb-2">
                  <input
                    id="invoice_limit_unlimited"
                    type="checkbox"
                    checked={currentPlan.invoice_limit === null}
                    onChange={handleUnlimitedInvoicesToggle}
                    className="h-4 w-4 text-primary-DEFAULT focus:ring-primary-dark border-gray-300 rounded"
                    disabled={isProcessing}
                  />
                  <label htmlFor="invoice_limit_unlimited" className="ml-2 block text-sm text-neutral-dark">
                    Unlimited Invoices
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Features</label>
                {currentPlan.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input wrapperClassName="flex-grow !mb-0" className="!mb-0" name={`feature-${index}`} value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} disabled={isProcessing} />
                    <Button variant="ghost" size="sm" className="text-red-500 !px-2" onClick={() => removeFeature(index)} disabled={isProcessing}>
                      <TrashIcon className="w-4 h-4"/>
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={addFeature} leftIcon={<PlusIcon className="w-4 h-4"/>} disabled={isProcessing}>Add Feature</Button>
              </div>
              <Input label="CTA Text (e.g., Choose Plan)" name="cta_text" value={currentPlan.cta_text || ''} onChange={handleModalInputChange} required disabled={isProcessing} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Sort Order" name="sort_order" type="number" value={(currentPlan.sort_order ?? 0).toString()} onChange={handleModalInputChange} disabled={isProcessing} />
                <Select label="Variant" name="variant" value={currentPlan.variant || 'secondary'} onChange={handleModalInputChange} options={[{value: 'primary', label: 'Primary'}, {value: 'secondary', label: 'Secondary'}]} disabled={isProcessing} />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="has_branding" name="has_branding" checked={currentPlan.has_branding || false} onChange={handleModalInputChange} className="h-4 w-4 text-primary-DEFAULT focus:ring-primary-dark border-gray-300 rounded" disabled={isProcessing} />
                <label htmlFor="has_branding" className="ml-2 block text-sm text-neutral-dark">Has "Powered by" Branding?</label>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setShowModal(false)} disabled={isProcessing}>Cancel</Button>
              <Button variant="primary" onClick={handleSavePlan} disabled={isProcessing}>
                {isProcessing ? 'Saving...' : 'Save Plan'}
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
                Are you sure you want to delete the plan <span className="font-medium">{planToDelete.name}</span>? This action cannot be undone.
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
