


import React, { useState } from 'react';
import { InvoiceItem } from '../../types.ts';
import Input from '../../components/common/Input.tsx';
import Button from '../../components/common/Button.tsx';
import { TrashIcon } from '../../components/icons/TrashIcon.tsx';
import { SparklesIcon } from '../../components/icons/SparklesIcon.tsx';

interface InvoiceItemRowProps {
  item: InvoiceItem;
  index: number;
  currency: string;
  onItemChange: (itemId: string, key: keyof InvoiceItem, value: string | number) => void;
  onRemoveItem: (itemId: string) => void;
}

const InvoiceItemRow: React.FC<InvoiceItemRowProps> = ({ item, index, currency, onItemChange, onRemoveItem }) => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onItemChange(item.id, name as keyof InvoiceItem, name === 'quantity' || name === 'unitPrice' ? parseFloat(value) || 0 : value);
  };
  
  const handleSuggest = () => {
    if (showComingSoon) return;
    setShowComingSoon(true);
    setTimeout(() => {
      setShowComingSoon(false);
    }, 2000);
  };

  const total = item.quantity * item.unitPrice;

  return (
    <div className="py-4 border-b border-neutral-light last:border-b-0">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2 items-start">
        {/* Description */}
        <div className="md:col-span-5 relative">
          <Input
            label={index === 0 ? "Description" : undefined}
            name="description"
            id={`item-description-${item.id}`}
            placeholder="Item or service description"
            value={item.description}
            onChange={handleInputChange}
            wrapperClassName="!mb-1"
            aria-label={`Description for item ${index + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSuggest}
            disabled={!item.description.trim()}
            className="!absolute right-1 top-[2px] sm:top-1.5 !p-1.5 focus:ring-offset-0"
            title="Suggest descriptions with AI (Coming Soon)"
          >
            <SparklesIcon className="w-4 h-4 text-primary"/>
          </Button>
          {showComingSoon && (
            <div className="absolute right-10 top-1.5 bg-slate-800 text-white text-xs px-2 py-1 rounded-md shadow-lg animate-fade-in-out z-20">
                Coming Soon!
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="md:col-span-2">
          <Input
            label={index === 0 ? "Qty" : undefined}
            name="quantity"
            id={`item-quantity-${item.id}`}
            type="number"
            value={item.quantity.toString()}
            onChange={handleInputChange}
            min="0"
            wrapperClassName="!mb-1"
            aria-label={`Quantity for item ${index + 1}`}
          />
        </div>

        {/* Unit Price */}
        <div className="md:col-span-2">
          <Input
            label={index === 0 ? "Unit Price" : undefined}
            name="unitPrice"
            id={`item-unitprice-${item.id}`}
            type="number"
            value={item.unitPrice.toString()}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            wrapperClassName="!mb-1"
            aria-label={`Unit price for item ${index + 1}`}
          />
        </div>

        {/* Total */}
        <div className="md:col-span-2 flex flex-col items-end">
           {index === 0 && <label className="block text-sm font-medium text-neutral-dark mb-1 self-start" htmlFor={`item-total-${item.id}`}>Total</label>}
          <p id={`item-total-${item.id}`} className="w-full text-right px-3 py-2 text-sm text-neutral-darkest bg-neutral-light rounded-md" aria-live="polite">
            {currency} {total.toFixed(2)}
          </p>
        </div>
        
        {/* Remove Button */}
        <div className="md:col-span-1 flex items-end justify-end h-full">
         {index === 0 && <label className="block text-sm font-medium text-neutral-dark mb-1 self-start md:opacity-0">Action</label>}
          <Button 
            type="button"
            variant="ghost" 
            onClick={() => onRemoveItem(item.id)} 
            className="text-red-500 hover:bg-red-100 !p-2 mt-1 md:mt-0"
            title={`Remove item ${index + 1}`}
            aria-label={`Remove item ${index + 1}`}
            >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceItemRow;