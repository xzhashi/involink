import React, { useState, useMemo } from 'react';
import { Product } from '../../types.ts';
import Input from '../../components/common/Input.tsx';
import Button from '../../components/common/Button.tsx';
import { XMarkIcon } from '../../components/icons/XMarkIcon.tsx';

interface ProductSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    onSelectProduct: (product: Product) => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({ isOpen, onClose, products, onSelectProduct }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-neutral-darkest">Select a Product or Service</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    wrapperClassName="mb-4"
                />

                <div className="overflow-y-auto flex-grow thin-scrollbar -mr-3 pr-3">
                    {filteredProducts.length > 0 ? (
                        <ul className="divide-y divide-slate-200">
                            {filteredProducts.map(product => (
                                <li 
                                    key={product.id} 
                                    onClick={() => onSelectProduct(product)}
                                    className="p-3 hover:bg-slate-100 cursor-pointer rounded-md transition-colors"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-primary">{product.name}</p>
                                            <p className="text-sm text-slate-500">{product.description}</p>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">${product.unit_price.toFixed(2)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-slate-500 py-8">No products found.</p>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t flex justify-end">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </div>
    );
};

export default ProductSelectionModal;