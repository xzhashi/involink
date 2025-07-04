
import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePlans } from '../contexts/PlanContext.tsx';
import { fetchUserProducts, saveProduct, deleteProduct } from '../services/supabaseClient.ts';
import Button from '../components/common/Button.tsx';
import Input from '../components/common/Input.tsx';
import Textarea from '../components/common/Textarea.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { PencilIcon } from '../components/icons/PencilIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { XMarkIcon } from '../components/icons/XMarkIcon.tsx';
import { CubeIcon } from '../components/icons/CubeIcon.tsx';

const ProductsPage: React.FC = () => {
    const { user } = useAuth();
    const { isProductLimitReached } = usePlans();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const loadProducts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchUserProducts();
            setProducts(data);
        } catch (e: any) {
            setError(e.message || "Failed to load products.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleOpenModal = (product: Partial<Product> | null = null) => {
        if (!product && isProductLimitReached) {
            alert("You've reached your product limit for this plan. Please upgrade to add more.");
            return;
        }
        if (product) {
            setCurrentProduct(product);
            setIsEditing(true);
        } else {
            setCurrentProduct({ name: '', description: '', unit_price: 0 });
            setIsEditing(false);
        }
        setShowModal(true);
        setError(null);
    };

    const handleSaveProduct = async () => {
        if (!currentProduct || !currentProduct.name) {
            setError("Product name is required.");
            return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            await saveProduct(currentProduct);
            setShowModal(false);
            loadProducts();
        } catch (e: any) {
            setError(e.message || "Failed to save product.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDeleteProduct = async (productId: string) => {
        if (!window.confirm("Are you sure you want to delete this product? This cannot be undone.")) return;
        setIsProcessing(true);
        setError(null);
        try {
            await deleteProduct(productId);
            loadProducts();
        } catch (e: any) {
            setError(e.message || "Failed to delete product.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!currentProduct) return;
        const { name, value } = e.target;
        setCurrentProduct({ ...currentProduct, [name]: name === 'unit_price' ? parseFloat(value) || 0 : value });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-neutral-darkest">Products & Services</h1>
                <Button onClick={() => handleOpenModal()} leftIcon={<PlusIcon className="w-5 h-5"/>} disabled={isProductLimitReached && products.length > 0}>
                    {isProductLimitReached ? 'Limit Reached' : 'Add New Item'}
                </Button>
            </div>
            
            {loading && <p>Loading products...</p>}
            {error && !showModal && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            
            {!loading && products.length === 0 && (
                <div className="text-center py-12 bg-white shadow-md rounded-lg">
                    <CubeIcon className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-lg font-medium text-neutral-darkest">No Products or Services Yet</h3>
                    <p className="mt-1 text-sm text-neutral-DEFAULT">Add reusable items to speed up your invoice creation.</p>
                </div>
            )}

            {!loading && products.length > 0 && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <ul className="divide-y divide-neutral-light">
                        {products.map(product => (
                            <li key={product.id} className="px-4 py-4 sm:px-6 hover:bg-neutral-lightest">
                                <div className="flex items-center justify-between">
                                    <div className="truncate">
                                        <p className="font-semibold text-primary-dark">{product.name}</p>
                                        <p className="text-sm text-neutral-DEFAULT truncate">{product.description}</p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                                        <span className="font-semibold text-neutral-700">${product.unit_price.toFixed(2)}</span>
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(product)}><PencilIcon className="w-4 h-4"/></Button>
                                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteProduct(product.id)}><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {showModal && currentProduct && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">{isEditing ? 'Edit Item' : 'Add New Item'}</h3>
                            <button onClick={() => setShowModal(false)}><XMarkIcon className="w-6 h-6 text-slate-500 hover:text-slate-800"/></button>
                        </div>
                        {error && showModal && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-3 text-sm">{error}</p>}
                        <div className="space-y-4">
                            <Input label="Name" name="name" value={currentProduct.name || ''} onChange={handleInputChange} required />
                            <Textarea label="Description (Optional)" name="description" value={currentProduct.description || ''} onChange={handleInputChange} />
                            <Input label="Unit Price" name="unit_price" type="number" step="0.01" value={currentProduct.unit_price?.toString() || '0'} onChange={handleInputChange} />
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button variant="ghost" onClick={() => setShowModal(false)} disabled={isProcessing}>Cancel</Button>
                            <Button onClick={handleSaveProduct} disabled={isProcessing}>{isProcessing ? 'Saving...' : 'Save Item'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
