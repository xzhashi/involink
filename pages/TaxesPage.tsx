
import React, { useState, useEffect, useCallback } from 'react';
import { Tax } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { fetchUserTaxes, saveTax, deleteTax } from '../services/supabaseClient.ts';
import Button from '../components/common/Button.tsx';
import Input from '../components/common/Input.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { PencilIcon } from '../components/icons/PencilIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { XMarkIcon } from '../components/icons/XMarkIcon.tsx';
import { ScaleIcon } from '../components/icons/ScaleIcon.tsx';

const TaxesPage: React.FC = () => {
    const { user } = useAuth();
    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTax, setCurrentTax] = useState<Partial<Tax> | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const loadTaxes = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchUserTaxes();
            setTaxes(data);
        } catch (e: any) {
            setError(e.message || "Failed to load taxes.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadTaxes();
    }, [loadTaxes]);

    const handleOpenModal = (tax: Partial<Tax> | null = null) => {
        if (tax) {
            setCurrentTax(tax);
            setIsEditing(true);
        } else {
            setCurrentTax({ name: '', rate: 0 });
            setIsEditing(false);
        }
        setShowModal(true);
        setError(null);
    };

    const handleSaveTax = async () => {
        if (!currentTax || !currentTax.name) {
             setError("Tax name is required.");
            return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            await saveTax(currentTax);
            setShowModal(false);
            loadTaxes();
        } catch (e: any) {
            setError(e.message || "Failed to save tax.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDeleteTax = async (taxId: string) => {
        if (!window.confirm("Are you sure you want to delete this tax? It will be removed from all invoices it was applied to.")) return;
        setIsProcessing(true);
        setError(null);
        try {
            await deleteTax(taxId);
            loadTaxes();
        } catch (e: any) {
            setError(e.message || "Failed to delete tax.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!currentTax) return;
        const { name, value } = e.target;
        setCurrentTax({ ...currentTax, [name]: name === 'rate' ? parseFloat(value) || 0 : value });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-neutral-darkest">Tax Settings</h1>
                <Button onClick={() => handleOpenModal()} leftIcon={<PlusIcon className="w-5 h-5"/>}>
                    Add New Tax
                </Button>
            </div>
            
            {loading && <p>Loading taxes...</p>}
            {error && !showModal && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            
            {!loading && taxes.length === 0 && (
                <div className="text-center py-12 bg-white shadow-md rounded-lg">
                    <ScaleIcon className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-lg font-medium text-neutral-darkest">No Taxes Saved</h3>
                    <p className="mt-1 text-sm text-neutral-DEFAULT">Add tax rates like VAT or GST to apply them to your invoices.</p>
                </div>
            )}

            {!loading && taxes.length > 0 && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <ul className="divide-y divide-neutral-light">
                        {taxes.map(tax => (
                            <li key={tax.id} className="px-4 py-4 sm:px-6 hover:bg-neutral-lightest">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-primary-dark">{tax.name}</p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                                        <span className="font-semibold text-neutral-700">{tax.rate.toFixed(2)}%</span>
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(tax)}><PencilIcon className="w-4 h-4"/></Button>
                                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteTax(tax.id)}><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {showModal && currentTax && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">{isEditing ? 'Edit Tax' : 'Add New Tax'}</h3>
                            <button onClick={() => setShowModal(false)}><XMarkIcon className="w-6 h-6 text-slate-500 hover:text-slate-800"/></button>
                        </div>
                        {error && showModal && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-3 text-sm">{error}</p>}
                        <div className="space-y-4">
                            <Input label="Tax Name (e.g., VAT, GST)" name="name" value={currentTax.name || ''} onChange={handleInputChange} required />
                            <Input label="Rate (%)" name="rate" type="number" step="0.01" value={currentTax.rate?.toString() || '0'} onChange={handleInputChange} />
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button variant="ghost" onClick={() => setShowModal(false)} disabled={isProcessing}>Cancel</Button>
                            <Button onClick={handleSaveTax} disabled={isProcessing}>{isProcessing ? 'Saving...' : 'Save Tax'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaxesPage;
