

import React, { useState, ChangeEvent } from 'react';
import { InvoiceData, InvoiceItem } from '../../types.ts';
import Input from '../../components/common/Input.tsx';
import Textarea from '../../components/common/Textarea.tsx';
import Button from '../../components/common/Button.tsx';
import InvoiceItemRow from './InvoiceItemRow.tsx';
import { PlusIcon } from '../../components/icons/PlusIcon.tsx';
import Select from '../../components/common/Select.tsx';
import { DEFAULT_CURRENCY } from '../../constants.ts';
import PaymentTools from './PaymentTools.tsx'; 
import { ChevronDownIcon } from '../../components/icons/ChevronDownIcon.tsx'; 
import { ChevronUpIcon } from '../../components/icons/ChevronUpIcon.tsx'; 
import { UploadIcon } from '../../components/icons/UploadIcon.tsx'; 
import { LinkIcon } from '../../components/icons/LinkIcon.tsx'; 
import { PaletteIcon } from '../../components/icons/PaletteIcon.tsx'; 
import { CURRENCY_OPTIONS } from '../../currencies.ts';


interface InvoiceFormProps {
  invoice: InvoiceData;
  invoiceTotal: number;
  onInvoiceChange: <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => void;
  onCompanyDetailsChange: (party: 'sender' | 'recipient', key: string, value: string) => void;
  onItemChange: (itemId: string, key: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId:string) => void;
  onDiscountChange: (type: 'percentage' | 'fixed', value: number) => void;
  onUpiDetailsGenerated: (link: string, qrDataUrl: string) => void;
  temporaryLogoUrl: string | null; 
  onTemporaryLogoChange: (logoDataUrl: string | null) => void; 
  onOpenTemplateModal: () => void; // New prop to open template modal
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode; initialOpen?: boolean; isCollapsible?: boolean }> = ({ title, children, initialOpen = true, isCollapsible = true }) => { 
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div className="bg-white rounded-lg shadow">
      <button 
        className="flex justify-between items-center w-full p-6 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`section-content-${title.replace(/\s+/g, '-')}`}
        disabled={!isCollapsible} 
      >
        <h2 className="text-xl font-semibold text-neutral-darkest">{title}</h2>
        {isCollapsible && (isOpen ? <ChevronUpIcon className="w-5 h-5 text-neutral-DEFAULT" /> : <ChevronDownIcon className="w-5 h-5 text-neutral-DEFAULT" />)}
      </button>
      {isOpen && (
        <div id={`section-content-${title.replace(/\s+/g, '-')}`} className="p-6 pt-0">
          {isCollapsible && <div className="border-t pt-4 -mt-2 mb-2"></div>}
          {children}
        </div>
      )}
    </div>
  );
};


const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  invoiceTotal,
  onInvoiceChange,
  onCompanyDetailsChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onDiscountChange,
  onUpiDetailsGenerated,
  temporaryLogoUrl,
  onTemporaryLogoChange,
  onOpenTemplateModal, // Destructure new prop
}) => {
  const [logoUrlInput, setLogoUrlInput] = useState('');

  const handleGenericChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, key: keyof InvoiceData) => {
    onInvoiceChange(key, e.target.value);
  };
  
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof InvoiceData) => {
    const value = parseFloat(e.target.value);
    onInvoiceChange(key, isNaN(value) ? 0 : value);
  };
  
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, party: 'sender' | 'recipient', key: string) => {
    onCompanyDetailsChange(party, key, e.target.value);
  };

  const handleLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        event.target.value = ''; 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onTemporaryLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseLogoUrl = () => {
    if (logoUrlInput.trim()) {
      if (!logoUrlInput.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/i)) {
          return;
      }
      onTemporaryLogoChange(logoUrlInput);
    }
  };

  const currentEffectiveLogo = temporaryLogoUrl || invoice.sender.logoUrl;


  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <Button 
            onClick={onOpenTemplateModal} 
            variant="secondary" 
            className="w-full"
            leftIcon={<PaletteIcon className="w-5 h-5"/>}
        >
            Change Design / Template
        </Button>
      </div>

      <SectionCard title="Invoice Details" initialOpen={true} isCollapsible={true}>
        <Input label="Invoice Number" id="invoiceId" value={invoice.id} onChange={(e) => handleGenericChange(e, 'id')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Issue Date" id="invoiceDate" type="date" value={invoice.date} onChange={(e) => handleGenericChange(e, 'date')} />
          <Input label="Due Date" id="invoiceDueDate" type="date" value={invoice.dueDate} onChange={(e) => handleGenericChange(e, 'dueDate')} />
        </div>
        <Select 
            label="Currency" 
            id="currency" 
            value={invoice.currency || DEFAULT_CURRENCY} 
            onChange={(e) => handleGenericChange(e, 'currency')}
            options={CURRENCY_OPTIONS}
        />
      </SectionCard>
      
      <SectionCard title="Logo Options" initialOpen={false} isCollapsible={true}>
        <div className="space-y-3">
          <div>
            <label htmlFor="logoUpload" className="block text-sm font-medium text-neutral-dark mb-1">Upload Logo</label>
            <div className="flex items-center space-x-2">
              <input 
                type="file" 
                id="logoUpload" 
                accept="image/png, image/jpeg, image/gif, image/svg+xml"
                onChange={handleLogoFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-lightest file:text-primary-dark hover:file:bg-primary-light/30"
              />
            </div>
            <p className="text-xs text-neutral-DEFAULT mt-1">Max 2MB. PNG, JPG, GIF, SVG.</p>
          </div>
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-neutral-dark mb-1">Or Paste Image URL</label>
            <div className="flex items-center space-x-2">
                <Input 
                    id="logoUrl" 
                    type="url" 
                    value={logoUrlInput} 
                    onChange={(e) => setLogoUrlInput(e.target.value)} 
                    placeholder="https://example.com/logo.png" 
                    wrapperClassName="flex-grow !mb-0"
                    className="!mb-0"
                />
                <Button onClick={handleUseLogoUrl} variant="ghost" size="sm" leftIcon={<LinkIcon className="w-4 h-4"/>}>Use URL</Button>
            </div>
          </div>

          {currentEffectiveLogo && (
            <div className="mt-3">
              <p className="text-sm font-medium text-neutral-dark mb-1">Current Logo Preview:</p>
              <img src={currentEffectiveLogo} alt="Current Logo" className="max-h-20 max-w-full border border-neutral-light rounded p-1"/>
              <Button 
                onClick={() => onTemporaryLogoChange(null)} 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:bg-red-50 mt-2"
              >
                Clear Custom Logo (use default)
              </Button>
            </div>
          )}
          {!currentEffectiveLogo && <p className="text-xs text-neutral-DEFAULT mt-2">No logo selected. Will use default from Sender details if available, or no logo.</p>}
        </div>
      </SectionCard>

      <SectionCard title="Your Company (Sender)" initialOpen={false} isCollapsible={true}>
        <Input label="Company Name" id="senderName" value={invoice.sender.name} onChange={(e) => handleCompanyChange(e, 'sender', 'name')} />
        <Textarea label="Address" id="senderAddress" value={invoice.sender.address} onChange={(e) => handleCompanyChange(e, 'sender', 'address')} />
        <Input label="Email" id="senderEmail" type="email" value={invoice.sender.email || ''} onChange={(e) => handleCompanyChange(e, 'sender', 'email')} />
        <Input label="Phone" id="senderPhone" type="tel" value={invoice.sender.phone || ''} onChange={(e) => handleCompanyChange(e, 'sender', 'phone')} />
        <Input label="Default Logo URL (Optional)" id="senderLogoUrl" value={invoice.sender.logoUrl || ''} onChange={(e) => handleCompanyChange(e, 'sender', 'logoUrl')} placeholder="https://example.com/default-logo.png" />
      </SectionCard>

      <SectionCard title="Client Company (Recipient)" initialOpen={false} isCollapsible={true}>
        <Input label="Company Name" id="recipientName" value={invoice.recipient.name} onChange={(e) => handleCompanyChange(e, 'recipient', 'name')} />
        <Textarea label="Address" id="recipientAddress" value={invoice.recipient.address} onChange={(e) => handleCompanyChange(e, 'recipient', 'address')} />
        <Input label="Email" id="recipientEmail" type="email" value={invoice.recipient.email || ''} onChange={(e) => handleCompanyChange(e, 'recipient', 'email')} />
        <Input label="Phone" id="recipientPhone" type="tel" value={invoice.recipient.phone || ''} onChange={(e) => handleCompanyChange(e, 'recipient', 'phone')} />
      </SectionCard>

      <SectionCard title="Invoice Items" initialOpen={true} isCollapsible={true}>
        {invoice.items.map((item, index) => (
          <InvoiceItemRow
            key={item.id}
            item={item}
            index={index}
            currency={invoice.currency || DEFAULT_CURRENCY}
            onItemChange={onItemChange}
            onRemoveItem={onRemoveItem}
          />
        ))}
        <Button onClick={onAddItem} variant="ghost" leftIcon={<PlusIcon className="w-4 h-4" />}>Add Item</Button>
      </SectionCard>
      
      <SectionCard title="Summary" initialOpen={false} isCollapsible={true}>
        <Input label="Tax Rate (%)" id="taxRate" type="number" value={invoice.taxRate.toString()} onChange={(e) => handleNumericChange(e, 'taxRate')} placeholder="e.g. 10 for 10%" />
        <div className="grid grid-cols-3 gap-2 items-end">
            <Select 
                label="Discount Type"
                id="discountType"
                value={invoice.discount.type}
                onChange={(e) => onDiscountChange(e.target.value as 'percentage' | 'fixed', invoice.discount.value)}
                options={[
                    { value: 'percentage', label: 'Percentage (%)' },
                    { value: 'fixed', label: 'Fixed Amount' },
                ]}
                wrapperClassName="col-span-1"
            />
            <Input 
                label="Discount Value" 
                id="discountValue" 
                type="number" 
                value={invoice.discount.value.toString()} 
                onChange={(e) => onDiscountChange(invoice.discount.type, parseFloat(e.target.value) || 0)} 
                placeholder="e.g. 5 or 50"
                wrapperClassName="col-span-2"
            />
        </div>
      </SectionCard>

      <SectionCard title="Notes & Terms" initialOpen={false} isCollapsible={true}>
        <Textarea label="Notes" id="notes" value={invoice.notes || ''} onChange={(e) => handleGenericChange(e, 'notes')} />
        <Textarea label="Terms & Conditions" id="terms" value={invoice.terms || ''} onChange={(e) => handleGenericChange(e, 'terms')} className="mt-4" />
      </SectionCard>

      <SectionCard title="Custom Payment Link" initialOpen={false} isCollapsible={true}>
        <Input 
            label="Manual Payment Link (Optional)" 
            id="manualPaymentLink" 
            value={invoice.manualPaymentLink || ''} 
            onChange={(e) => handleGenericChange(e, 'manualPaymentLink')}
            placeholder="e.g., https://paypal.me/yourname or Stripe link"
            type="url"
        />
        <p className="text-xs text-neutral-DEFAULT mt-1">
            If you provide a link here, a "Pay Online" button will appear on the invoice.
        </p>
      </SectionCard>

      <SectionCard title="Payment Tools (UPI/QR)" isCollapsible={true} initialOpen={false}>
        <PaymentTools 
          invoiceTotal={invoiceTotal}
          invoiceId={invoice.id}
          defaultPayeeName={invoice.sender.name}
          invoiceCurrency={invoice.currency || DEFAULT_CURRENCY}
          upiId={invoice.upiId || ''}
          onUpiIdChange={(value) => onInvoiceChange('upiId', value)}
          onUpiDetailsGenerated={onUpiDetailsGenerated} 
        />
      </SectionCard>

    </div>
  );
};

export default InvoiceForm;